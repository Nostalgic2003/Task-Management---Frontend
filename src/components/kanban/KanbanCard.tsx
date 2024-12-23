import { Draggable } from 'react-beautiful-dnd';
import type { Card } from '@/types/kanban';
import { Button } from "@/components/ui/button"
import { Card as UICard, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface KanbanCardProps {
  card: Card;
  index: number;
  listId: number;
  editingCardId: { listId: number; cardId: number } | null;
  cardForm: any;
  onUpdateCard: (listId: number, cardId: number, data: any) => void;
  onDeleteCard: (listId: number, cardId: number) => void;
  setEditingCardId: (value: { listId: number; cardId: number } | null) => void;
}

const KanbanCard = ({
  card,
  index,
  listId,
  editingCardId,
  cardForm,
  onUpdateCard,
  onDeleteCard,
  setEditingCardId
}: KanbanCardProps) => {
  return (
    <Draggable draggableId={card.id.toString()} index={index}>
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
                position: 'fixed',
                transform: provided.draggableProps.style?.transform,
                width: 'var(--draggable-width)'
              }
              : provided.draggableProps.style
          }
          className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
        >
          <UICard
            className="bg-white shadow-sm"
            style={{ width: snapshot.isDragging ? 'var(--draggable-width)' : 'auto' }}
          >
            <CardContent className="p-3 flex justify-between items-center">
              {editingCardId?.listId === listId &&
                editingCardId?.cardId === card.id ? (
                <form
                  onSubmit={cardForm.handleSubmit((data: any) =>
                    onUpdateCard(listId, card.id, data)
                  )}
                  className="flex gap-2 w-full"
                >
                  <Input
                    defaultValue={card.title}
                    {...cardForm.register("title")}
                    className="h-8"
                  />
                  <Button type="submit" size="sm">Save</Button>
                </form>
              ) : (
                <>
                  <span>{card.title}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          cardForm.setValue("title", card.title);
                          setEditingCardId({ listId, cardId: card.id });
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDeleteCard(listId, card.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </CardContent>
          </UICard>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
