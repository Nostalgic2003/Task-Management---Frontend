import { Draggable, Droppable } from 'react-beautiful-dnd';
import type { List } from '@/types/kanban';
import KanbanCard from './KanbanCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, PlusCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

interface KanbanListProps {
  list: List;
  index: number;
  editingListId: number | null;
  isCreateCardDialogOpen: number | null;
  editingCardId: { listId: number; cardId: number } | null;
  form: any;
  cardForm: any;
  onEditList: (listId: number) => void;
  onDeleteList: (listId: number) => void;
  onUpdateList: (listId: number, data: any) => void;
  onCreateCard: (listId: number, data: any) => void;
  onUpdateCard: (listId: number, cardId: number, data: any) => void;
  onDeleteCard: (listId: number, cardId: number) => void;
  setEditingCardId: (value: { listId: number; cardId: number } | null) => void;
  setIsCreateCardDialogOpen: (value: number | null) => void;
}

const KanbanList = ({
  list,
  index,
  editingListId,
  isCreateCardDialogOpen,
  editingCardId,
  form,
  cardForm,
  onEditList,
  onDeleteList,
  onUpdateList,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  setEditingCardId,
  setIsCreateCardDialogOpen
}: KanbanListProps) => {
  return (
    <Draggable draggableId={list.id.toString()} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
        >
          <Card className="min-w-[272px] bg-[#e5e4e2] backdrop-blur-sm shadow-lg">
            <CardHeader className="p-4 pb-2" {...provided.dragHandleProps}>
              {editingListId === list.id ? (
                <form
                  onSubmit={form.handleSubmit((data: any) => onUpdateList(list.id, data))}
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
                            form.setValue("name", list.name);
                            onEditList(list.id);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => onDeleteList(list.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="p-2">
              <Droppable droppableId={list.id.toString()} type="card">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2 min-h-[2px]"
                  >
                    {(list.cards || []).map((card, cardIndex) => (
                      <KanbanCard
                        key={card.id}
                        card={card}
                        index={cardIndex}
                        listId={list.id}
                        editingCardId={editingCardId}
                        cardForm={cardForm}
                        onUpdateCard={onUpdateCard}
                        onDeleteCard={onDeleteCard}
                        setEditingCardId={setEditingCardId}
                      />
                    ))}
                    {provided.placeholder}

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
                            onSubmit={cardForm.handleSubmit((data: any) =>
                              onCreateCard(list.id, data)
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
  );
};

export default KanbanList;
