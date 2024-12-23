import { Plus, MoreHorizontal, PlusCircle, Tag, ListChecks, Paperclip, MessageSquare, X, Check } from 'lucide-react'
import { useParams } from 'react-router-dom'
import useKanbanStore from '../store/useKanbanStore'
import useUserStore from '@/store/userStore'
import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { DragDropContext, Droppable, Draggable, DropResult } from
  'react-beautiful-dnd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const listSchema = z.object({
  name: z.string().min(1, "List name is required"),
});

const cardSchema = z.object({
  title: z.string().min(1, "Card title is required"),
});

const labelSchema = z.object({
  name: z.string().min(1, "Label name is required"),
  color: z.string().min(1, "Color is required"),
});

const checklistSchema = z.object({
  title: z.string().min(1, "Checklist title is required"),
});

const checklistItemSchema = z.object({
  title: z.string().min(1, "Item content is required"),
});

const commentSchema = z.object({
  content: z.string().min(1, "Comment content is required"),
});

type ListFormData = z.infer<typeof listSchema>;
type CardFormData = z.infer<typeof cardSchema>;
type LabelFormData = z.infer<typeof labelSchema>;
type ChecklistFormData = z.infer<typeof checklistSchema>;
type ChecklistItemFormData = z.infer<typeof checklistItemSchema>;
type CommentFormData = z.infer<typeof commentSchema>;

const Board = () => {
  const { boardId } = useParams()
  const {
    currentBoard,
    lists,
    fetchBoard,
    fetchLists,
    createList,
    updateList,
    deleteList,
    reorderLists,
    createCard, moveCard, updateCard, reorderCards, deleteCard, attachLabel,
    detachLabel,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    createChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    createComment,
    deleteComment,
  } = useKanbanStore()


  const { user } = useUserStore()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingListId, setEditingListId] = useState<number | null>(null)
  const [isCreateCardDialogOpen, setIsCreateCardDialogOpen] = useState<number | null>(null)
  const [editingCardId, setEditingCardId] = useState<{ listId: number, cardId: number } | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState<number | null>(null);
  const [isAddingLabel, setIsAddingLabel] = useState<number | null>(null);
  const [isAddingChecklist, setIsAddingChecklist] = useState<number | null>(null);
  const [isAddingChecklistItem, setIsAddingChecklistItem] = useState<{ cardId: number, checklistId: number } | null>(null);
  const [isAddingComment, setIsAddingComment] = useState<number | null>(null);

  console.log("TEst",currentBoard)

  const form = useForm<ListFormData>({
    resolver: zodResolver(listSchema),
    defaultValues: {
      name: "",
    },
  });

  const cardForm = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      title: "",
    },
  });

  // Add these new form controls with your existing ones
  const labelForm = useForm<LabelFormData>({
    resolver: zodResolver(labelSchema),
  });

  const checklistForm = useForm<ChecklistFormData>({
    resolver: zodResolver(checklistSchema),
  });

  const checklistItemForm = useForm<ChecklistItemFormData>({
    resolver: zodResolver(checklistItemSchema),
  });

  const commentForm = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  useEffect(()=> {
    fetchBoard(boardId)
  },[])

  useEffect(() => {
    if (boardId) {
      fetchBoard(parseInt(boardId))
      fetchLists(parseInt(boardId))
    }
  }, [boardId, fetchBoard, fetchLists])

  // Add these new handlers
  const handleAddLabel = async (cardId: number, data: LabelFormData) => {
    console.log("ASDASd", cardId)
    await attachLabel(cardId, data);
    setIsAddingLabel(null);
    labelForm.reset();
  };

  const handleAddChecklist = async (cardId: number, data: ChecklistFormData) => {
    await createChecklist({ ...data, card_id: cardId });
    setIsAddingChecklist(null);
    checklistForm.reset();
  };

  const handleAddChecklistItem = async (checklistId: number, data: ChecklistItemFormData) => {
    await createChecklistItem(checklistId, data);
    setIsAddingChecklistItem(null);
    checklistItemForm.reset();
  };

  const handleAddComment = async (cardId: number, data: CommentFormData) => {
    await createComment({ ...data, card_id: cardId });
    setIsAddingComment(null);
    commentForm.reset();
  };

  const handleCreateCard = async (listId: number, data: CardFormData) => {
    if (!boardId) return
    await createCard(parseInt(boardId), listId, data)
    setIsCreateCardDialogOpen(null)
    cardForm.reset()
  }

  const handleUpdateCard = async (listId: number, cardId: number, data: CardFormData) => {
    if (!boardId) return
    await updateCard(parseInt(boardId), listId, cardId, data)
    setEditingCardId(null)
    cardForm.reset()
  }

  const handleDeleteCard = async (listId: number, cardId: number) => {
    if (!boardId) return
    if (window.confirm('Are you sure you want to delete this card?')) {
      await deleteCard(parseInt(boardId), listId, cardId)
    }
  }

  const handleCreateList = async (data: ListFormData) => {
    if (!boardId) return
    await createList(parseInt(boardId), data)
    setIsCreateDialogOpen(false)
    form.reset()
  }

  const handleUpdateList = async (listId: number, data: ListFormData) => {
    if (!boardId) return
    await updateList(parseInt(boardId), listId, data)
    setEditingListId(null)
    form.reset()
  }

  const handleDeleteList = async (listId: number) => {
    if (!boardId) return
    if (window.confirm('Are you sure you want to delete this list?')) {
      await deleteList(parseInt(boardId), listId)
    }
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !boardId) return;

    const { source, destination, type } = result;

    // Handle list reordering
    if (type === "list") {
      const items = Array.from(lists);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      const updatedLists = items.map((item, index) => ({
        ...item,
        position: index
      }));

      reorderLists(parseInt(boardId), updatedLists);
      return;
    }

    // Handle card reordering/moving
    const sourceListId = source.droppableId.replace('list-', '');
    const destinationListId = destination.droppableId.replace('list-', '');

    const sourceList = lists.find(list => list.id.toString() === sourceListId);
    const destinationList = lists.find(list => list.id.toString() === destinationListId);

    if (!sourceList || !destinationList) return;

    if (source.droppableId === destination.droppableId) {
      // Reorder within the same list
      const cards = Array.from(sourceList.cards);
      const [movedCard] = cards.splice(source.index, 1);
      cards.splice(destination.index, 0, movedCard);

      const updatedCards = cards.map((card, index) => ({
        id: card.id,
        position: index,
        board_list_id: sourceList.id
      }));

      reorderCards(parseInt(boardId), sourceList.id, updatedCards);
    } else {
      // Move to different list
      const movedCard = sourceList.cards[source.index];
      moveCard(
        parseInt(boardId),
        movedCard.id,
        sourceList.id,
        destinationList.id,
        destination.index
      );
    }
  };

  useEffect(() => {
    // Set a CSS variable for the draggable width
    const cards = document.querySelectorAll('.card');
    if (cards.length > 0) {
      const cardWidth = cards[0].getBoundingClientRect().width;
      document.documentElement.style.setProperty('--draggable-width', `${cardWidth}px`);
    }
  }, [lists]); // Re-run when lists change

  if (!currentBoard) {
    return <div>Loading...</div>
  }

  if (!currentBoard) {
    return <div>Loading...</div>
  }


  return (
    <div className="min-h-screen bg-[#1e1b4b] p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{currentBoard.name}</h1>
        <p className="text-gray-300 mt-2">{currentBoard.description}</p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="lists" direction="horizontal" type="list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex gap-4 overflow-x-auto pb-4"
            >
              {lists.map((list, index) => (
                <Draggable
                  key={list.id.toString()}
                  draggableId={`list-${list.id}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                    >
                      <Card className="min-w-[272px] bg-[#e5e4e2] backdrop-blur-sm shadow-lg">
                        <CardHeader className="p-4 pb-2">
                          {editingListId === list.id ? (
                            <form
                              onSubmit={form.handleSubmit((data) => handleUpdateList(list.id, data))}
                              className="flex gap-2"
                            >
                              <Input
                                defaultValue={list.name}
                                {...form.register("name")}
                                className="h-8"
                              />
                              <Button type="submit" size="sm">Save</Button>
                            </form>
                          ) : (
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base text-black">{list.name}</CardTitle>
                              <div className="flex gap-1">
                                <div className="flex gap-1">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-white">
                                      <DropdownMenuItem
                                        onClick={() => {
                                          form.setValue("name", list.name)
                                          setEditingListId(list.id)
                                        }}
                                      >
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-red-600"
                                        onClick={() => handleDeleteList(list.id)}
                                      >
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="p-2">
                          <Droppable droppableId={`list-${list.id}`} type="card">
                            {(provided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-2 min-h-[2px]"
                              >
                                {(list.cards || []).map((card, cardIndex) => (
                                  <Draggable
                                    key={card.id.toString()}
                                    draggableId={`card-${card.id}`}
                                    index={cardIndex}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={
                                          snapshot.isDragging
                                            ? {
                                              ...provided.draggableProps.style,
                                              left: 'auto',
                                              top: 'auto',
                                              position: 'fixed', // Use fixed positioning when dragging
                                              transform: provided.draggableProps.style?.transform,
                                              width: 'var(--draggable-width)' // Preserve width during drag
                                            }
                                            : provided.draggableProps.style
                                        }
                                        className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                                      >
                                        <Card className="bg-white shadow-sm">
                                          <CardContent className="p-3">
                                            <Dialog open={isDetailsOpen === card.id} onOpenChange={(open) => setIsDetailsOpen(open ? card.id : null)}>
                                              <DialogTrigger asChild>
                                                <div className="cursor-pointer">
                                                  {/* Labels */}
                                                  {card.labels && card.labels.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mb-2">
                                                      {card.labels.map((label) => (
                                                        <Badge
                                                          key={label.id}
                                                          style={{ backgroundColor: label.color }}
                                                          className="text-white"
                                                        >
                                                          {label.name}
                                                        </Badge>
                                                      ))}
                                                    </div>
                                                  )}

                                                  {/* Card Title */}
                                                  <div className="flex justify-between items-center">
                                                    <span>{card.title}</span>
                                                    <DropdownMenu>
                                                      {/* Your existing dropdown menu code */}
                                                    </DropdownMenu>
                                                  </div>

                                                  {/* Quick info */}
                                                  <div className="flex gap-2 mt-2 text-gray-500">
                                                    {card.checklists && card.checklists.length > 0 && (
                                                      <div className="flex items-center gap-1">
                                                        <ListChecks className="h-4 w-4" />
                                                        <span>
                                                          {card.checklists.reduce(
                                                            (acc, list) =>
                                                              acc +
                                                              (list.items?.filter((item) => item.is_completed)?.length || 0),
                                                            0
                                                          )}
                                                          /
                                                          {card.checklists.reduce(
                                                            (acc, list) => acc + (list.items?.length || 0),
                                                            0
                                                          )}
                                                        </span>
                                                      </div>
                                                    )}
                                                    {card.attachments && card.attachments.length > 0 && (
                                                      <div className="flex items-center gap-1">
                                                        <Paperclip className="h-4 w-4" />
                                                        <span>{card.attachments?.length}</span>
                                                      </div>
                                                    )}
                                                    {card.comments && card.comments.length > 0 && (
                                                      <div className="flex items-center gap-1">
                                                        <MessageSquare className="h-4 w-4" />
                                                        <span>{card.comments.length}</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              </DialogTrigger>

                                              <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                  <DialogTitle>{card.title}</DialogTitle>
                                                </DialogHeader>

                                                <div className="space-y-6">
                                                  {/* Labels Section */}
                                                  <div>
                                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                                      <Tag className="h-5 w-5" /> Labels
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                      {card.labels?.map((label) => (
                                                        <Badge
                                                          key={label.id}
                                                          style={{ backgroundColor: label.color }}
                                                          className="text-white flex items-center gap-1"
                                                        >
                                                          {label.name}
                                                          <button
                                                            onClick={() => detachLabel(card.id, label.id)}
                                                            className="ml-1"
                                                          >
                                                            <X className="h-3 w-3" />
                                                          </button>
                                                        </Badge>
                                                      ))}
                                                      <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setIsAddingLabel(card.id)}
                                                      >
                                                        <Plus className="h-4 w-4 mr-1" /> Add Label
                                                      </Button>
                                                    </div>
                                                    {isAddingLabel === card.id && (
                                                      <Form {...labelForm}>
                                                        <form
                                                          onSubmit={labelForm.handleSubmit((data) => handleAddLabel(card.id, data))}
                                                          className="space-y-4 mt-2"
                                                        >
                                                          <FormField
                                                            control={labelForm.control}
                                                            name="name"
                                                            render={({ field }) => (
                                                              <FormItem>
                                                                <FormControl>
                                                                  <Input placeholder="Label name" {...field} />
                                                                </FormControl>
                                                              </FormItem>
                                                            )}
                                                          />
                                                          <FormField
                                                            control={labelForm.control}
                                                            name="color"
                                                            render={({ field }) => (
                                                              <FormItem>
                                                                <FormControl>
                                                                  <Input type="color" {...field} />
                                                                </FormControl>
                                                              </FormItem>
                                                            )}
                                                          />
                                                          <Button type="submit">Add</Button>
                                                        </form>
                                                      </Form>
                                                    )}
                                                  </div>

                                                  {/* Checklists Section */}
                                                  <div>
                                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                                      <ListChecks className="h-5 w-5" /> Checklists
                                                    </h3>
                                                    {card.checklists?.map((checklist) => (
                                                      <div key={checklist.id} className="mt-4">
                                                        <div className="flex justify-between items-center">
                                                          <h4 className="font-medium">{checklist.title}</h4>
                                                          <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteChecklist(checklist.id)}
                                                          >
                                                            <X className="h-4 w-4" />
                                                          </Button>
                                                        </div>
                                                        <div className="space-y-2 mt-2">
                                                          {checklist.items?.map((item) => (
                                                            <div key={item.id} className="flex items-center gap-2">
                                                              <Checkbox
                                                                checked={item.is_completed}
                                                                onCheckedChange={(checked) =>
                                                                  updateChecklistItem(checklist.id, item.id, {
                                                                    is_completed: checked as boolean,
                                                                  })
                                                                }
                                                              />
                                                              <span className={item.is_completed ? "line-through text-red-500" : ""}>
                                                                {item.title}
                                                              </span>
                                                              <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteChecklistItem(checklist.id, item.id)}
                                                              >
                                                                <X className="h-4 w-4" />
                                                              </Button>
                                                            </div>
                                                          ))}
                                                          {isAddingChecklistItem?.checklistId === checklist.id ? (
                                                            <Form {...checklistItemForm}>
                                                              <form
                                                                onSubmit={checklistItemForm.handleSubmit((data) =>
                                                                  handleAddChecklistItem(checklist.id, data)
                                                                )}
                                                                className="flex gap-2"
                                                              >
                                                                <FormField
                                                                  control={checklistItemForm.control}
                                                                  name="title"
                                                                  render={({ field }) => (
                                                                    <FormItem className="flex-1">
                                                                      <FormControl>
                                                                        <Input placeholder="Item content" {...field} />
                                                                      </FormControl>
                                                                    </FormItem>
                                                                  )}
                                                                />
                                                                <Button type="submit">Add</Button>
                                                              </form>
                                                            </Form>
                                                          ) : (
                                                            <Button
                                                              variant="ghost"
                                                              size="sm"
                                                              onClick={() => setIsAddingChecklistItem({ cardId: card.id, checklistId: checklist.id })}
                                                            >
                                                              <Plus className="h-4 w-4 mr-1" /> Add Item
                                                            </Button>
                                                          )}
                                                        </div>
                                                      </div>
                                                    ))}
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={() => setIsAddingChecklist(card.id)}
                                                      className="mt-4"
                                                    >
                                                      <Plus className="h-4 w-4 mr-1" /> Add Checklist
                                                    </Button>
                                                    {isAddingChecklist === card.id && (
                                                      <Form {...checklistForm}>
                                                        <form
                                                          onSubmit={checklistForm.handleSubmit((data) => handleAddChecklist(card.id, data))}
                                                          className="space-y-4 mt-2"
                                                        >
                                                          <FormField
                                                            control={checklistForm.control}
                                                            name="title"
                                                            render={({ field }) => (
                                                              <FormItem>
                                                                <FormControl>
                                                                  <Input placeholder="Checklist title" {...field} />
                                                                </FormControl>
                                                              </FormItem>
                                                            )}
                                                          />
                                                          <Button type="submit">Add</Button>
                                                        </form>
                                                      </Form>
                                                    )}
                                                  </div>

                                                  {/* Comments Section */}
                                                  <div>
                                                    <h3 className="text-lg font-semibold flex items-center gap-2">
                                                      <MessageSquare className="h-5 w-5" /> Comments
                                                    </h3>
                                                    <div className="space-y-4 mt-4">
                                                      {card.comments?.map((comment) => (
                                                        <div key={comment.id} className="flex justify-between items-start bg-gray-50 p-3 rounded">
                                                          <div>
                                                            <p className="text-sm text-gray-500">
                                                              {new Date(comment.created_at).toLocaleString()}
                                                            </p>
                                                            <p className="text-sm font-semibold">{comment.user.name}</p>
                                                            <p className="mt-1">{comment.content}</p>
                                                          </div>
                                                          <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteComment(comment.id)}
                                                          >
                                                            <X className="h-4 w-4" />
                                                          </Button>
                                                        </div>
                                                      ))}
                                                      <Form {...commentForm}>
                                                        <form
                                                          onSubmit={commentForm.handleSubmit((data) => handleAddComment(card.id, data))}
                                                          className="space-y-4"
                                                        >
                                                          <FormField
                                                            control={commentForm.control}
                                                            name="content"
                                                            render={({ field }) => (
                                                              <FormItem>
                                                                <FormControl>
                                                                  <Textarea
                                                                    placeholder="Write a comment..."
                                                                    className="min-h-[100px]"
                                                                    {...field}
                                                                  />
                                                                </FormControl>
                                                              </FormItem>
                                                            )}
                                                          />
                                                          <Button type="submit">Add Comment</Button>
                                                        </form>
                                                      </Form>
                                                    </div>
                                                  </div>
                                                </div>
                                              </DialogContent>
                                            </Dialog>
                                          </CardContent>
                                        </Card>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}

                                {/* Add Card Button */}
                                <Dialog
                                  open={isCreateCardDialogOpen === list.id}
                                  onOpenChange={(open) =>
                                    setIsCreateCardDialogOpen(open ? list.id : null)
                                  }
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="w-full justify-start text-gray-500 hover:text-gray-700"
                                    >
                                      <PlusCircle className="h-4 w-4 mr-2" />
                                      Add Card
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-[#1e1b4b] border border-gray-600">
                                    <DialogHeader>
                                      <DialogTitle className="text-white">Add New Card</DialogTitle>
                                    </DialogHeader>
                                    <Form {...cardForm}>
                                      <form
                                        onSubmit={cardForm.handleSubmit((data) =>
                                          handleCreateCard(list.id, data)
                                        )}
                                        className="space-y-4"
                                      >
                                        <FormField
                                          control={cardForm.control}
                                          name="title"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel className="text-gray-300">Card Title</FormLabel>
                                              <FormControl>
                                                <Input
                                                  placeholder="Enter card title"
                                                  className="bg-transparent border-gray-600 text-white"
                                                  {...field}
                                                />
                                              </FormControl>
                                              <FormMessage className="text-red-400" />
                                            </FormItem>
                                          )}
                                        />
                                        <Button
                                          type="submit"
                                          className="w-full bg-white/10 hover:bg-white/20 text-white"
                                        >
                                          Add Card
                                        </Button>
                                      </form>
                                    </Form>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            )}
                          </Droppable>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}


              {/* Add List Card - Always visible */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Card className="min-w-[272px] bg-white/10 backdrop-blur-sm shadow-lg hover:bg-white/20 cursor-pointer transition-colors">
                    <CardHeader className="p-4">
                      <div className="flex items-center justify-center text-gray-300">
                        <Plus className="h-4 w-4 mr-2" />
                        <span>Add List</span>
                      </div>
                    </CardHeader>
                  </Card>
                </DialogTrigger>
                <DialogContent className="bg-[#1e1b4b] border border-gray-600">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New List</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleCreateList)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">List Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter list name"
                                className="bg-transparent border-gray-600 text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-white/10 hover:bg-white/20 text-white"
                      >
                        Create List
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

export default Board