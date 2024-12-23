import { create } from "zustand";
import {
  boardAPI,
  listAPI,
  cardAPI,
  attachmentAPI,
  checklistAPI,
  commentAPI,
  labelAPI,
  userAPI,
} from "../api/routes";
import { User } from "@/types/userType";

interface UserKanban {
  id: number;
  name: string;
  email: string;
}

interface Board {
  id: number;
  name: string;
  description: string | null;
  user_id: number;
  visibility: string;
  created_at: string;
  updated_at: string;
  owner?: User;
  lists: BoardList[];
  members: Array<User & { pivot: { role: "admin" | "member" } }>;
  createCard: (
    boardId: number,
    listId: number,
    data: { title: string }
  ) => Promise<void>;
  updateCard: (
    boardId: number,
    listId: number,
    cardId: number,
    data: { title: string }
  ) => Promise<void>;
  deleteCard: (
    boardId: number,
    listId: number,
    cardId: number
  ) => Promise<void>;
  reorderCards: (
    boardId: number,
    listId: number,
    cards: Array<{ id: number; position: number }>
  ) => Promise<void>;
  moveCard: (
    boardId: number,
    cardId: number,
    sourceListId: number,
    targetListId: number,
    position: number
  ) => Promise<void>;
}

interface BoardList {
  id: number;
  name: string;
  board_id: number;
  position: number;
  cards: Card[];
  created_at: string;
  updated_at: string;
}

interface Label {
  id: number;
  name: string;
  color: string;
}

interface ChecklistItem {
  id: number;
  content: string;
  is_completed: boolean;
  checklist_id: number;
  user:any
  title:any
}

interface Checklist {
  id: number;
  title: string;
  card_id: number;
  items: ChecklistItem[];
}

interface Attachment {
  id: number;
  filename: string;
  url: string;
  card_id: number;
}

interface Comment {
  id: number;
  content: string;
  card_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user:any
}

// Update the Card interface to include the new relations
interface Card {
  id: number;
  list_id: number;
  title: string;
  position: number;
  labels?: Label[];
  checklists?: Checklist[];
  attachments?: Attachment[];
  comments?: Comment[];
}

interface KanbanStore {
  // State
  boards: Board[];
  users: UserKanban[];
  currentBoard: Board | null;
  lists: BoardList[];
  isLoading: boolean;
  error: string | null;
  setUsers: (users: UserKanban[]) => void;
  fetchUsers: () => Promise<void>;
  createCard: (
    boardId: number,
    listId: number,
    data: { title: string }
  ) => Promise<void>;
  updateCard: (
    boardId: number,
    listId: number,
    cardId: number,
    data: { title: string }
  ) => Promise<void>;
  deleteCard: (
    boardId: number,
    listId: number,
    cardId: number
  ) => Promise<void>;
  reorderCards: (
    boardId: number,
    listId: number,
    cards: Array<{ id: number; position: number }>
  ) => Promise<void>;
  moveCard: (
    boardId: number,
    cardId: number,
    sourceListId: number,
    targetListId: number,
    position: number
  ) => Promise<void>;

  // Board Actions
  fetchBoards: () => Promise<void>;
  fetchBoard: (boardId: number) => Promise<void>;
  createBoard: (data: {
    name: string;
    description?: string;
    visibility?: string;
  }) => Promise<void>;
  updateBoard: (
    boardId: number,
    data: { name?: string; description?: string; visibility?: string }
  ) => Promise<void>;
  deleteBoard: (boardId: number) => Promise<void>;
  addBoardMember: (
    boardId: number,
    data: { user_id: number; role: "admin" | "member" }
  ) => Promise<void>;
  removeBoardMember: (boardId: number, userId: number) => Promise<void>;

  // List Actions
  fetchLists: (boardId: number) => Promise<void>;
  createList: (boardId: number, data: { name: string }) => Promise<void>;
  updateList: (
    boardId: number,
    listId: number,
    data: { name: string }
  ) => Promise<void>;
  deleteList: (boardId: number, listId: number) => Promise<void>;
  reorderLists: (
    boardId: number,
    lists: Array<{ id: number; position: number }>
  ) => Promise<void>;

  // Label Actions
  attachLabel: (
    cardId: number,
    data: { name: string; color: string }
  ) => Promise<void>;
  detachLabel: (cardId: number, labelId: number) => Promise<void>;

  // Checklist Actions
  createChecklist: (data: { title: string; card_id: number }) => Promise<void>;
  updateChecklist: (
    checklistId: number,
    data: { title: string }
  ) => Promise<void>;
  deleteChecklist: (checklistId: number) => Promise<void>;
  createChecklistItem: (
    checklistId: number,
    data: { title: string }
  ) => Promise<void>;
  updateChecklistItem: (
    checklistId: number,
    itemId: number,
    data: { content?: string; is_completed?: boolean }
  ) => Promise<void>;
  deleteChecklistItem: (checklistId: number, itemId: number) => Promise<void>;

  // Attachment Actions
  createAttachment: (data: { file: File; card_id: number }) => Promise<void>;
  deleteAttachment: (attachmentId: number) => Promise<void>;

  // Comment Actions
  createComment: (data: { content: string; card_id: number }) => Promise<void>;
  updateComment: (
    commentId: number,
    data: { content: string }
  ) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
}

const useKanbanStore = create<KanbanStore>((set, get) => ({
  // Initial state
  boards: [],
  currentBoard: null,
  lists: [],
  isLoading: false,
  error: null,
  users: [],

  setUsers: (users: UserKanban[]) => set({ users }),
  fetchUsers: async () => {
    const response = await userAPI.getUsers();
    set({ users: response.data });
  },

  // Board actions
  fetchBoards: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await boardAPI.getBoardByUserId();
      set({
        boards: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({ error: "Failed to fetch boards", isLoading: false });
    }
  },

  fetchBoard: async (boardId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await boardAPI.getBoard(boardId.toString());
      
      // Ensure lists and their cards have all necessary data
      const listsWithCards = response.data.lists.map((list: BoardList) => ({
        ...list,
        cards: list.cards.map((card: Card) => ({
          ...card,
          labels: card.labels || [],
          checklists: card.checklists || [],
          attachments: card.attachments || [],
          comments: card.comments || []
        }))
      }));

      set({
        currentBoard: {
          ...response.data,
          lists: listsWithCards
        },
        lists: listsWithCards,
        isLoading: false,
      });
    } catch (error) {
      set({ error: "Failed to fetch board", isLoading: false });
    }
  },

  createBoard: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await boardAPI.createBoard(data);
      set((state) => ({
        boards: [...state.boards, response.data],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to create board", isLoading: false });
    }
  },

  updateBoard: async (boardId, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await boardAPI.updateBoard(boardId.toString(), data);
      set((state) => ({
        boards: state.boards.map((board) =>
          board.id === boardId ? { ...board, ...response.data } : board
        ),
        currentBoard:
          state.currentBoard?.id === boardId
            ? { ...state.currentBoard, ...response.data }
            : state.currentBoard,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to update board", isLoading: false });
    }
  },

  deleteBoard: async (boardId) => {
    try {
      set({ isLoading: true, error: null });
      await boardAPI.deleteBoard(boardId.toString());
      set((state) => ({
        boards: state.boards.filter((board) => board.id !== boardId),
        currentBoard:
          state.currentBoard?.id === boardId ? null : state.currentBoard,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to delete board", isLoading: false });
    }
  },

  addBoardMember: async (boardId, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await boardAPI.addBoardMember(boardId.toString(), data);
      set((state) => ({
        boards: state.boards.map((board) =>
          board.id === boardId
            ? { ...board, members: response.data.members }
            : board
        ),
        currentBoard:
          state.currentBoard?.id === boardId
            ? { ...state.currentBoard, members: response.data.members }
            : state.currentBoard,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to add board member", isLoading: false });
    }
  },

  removeBoardMember: async (boardId, userId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await boardAPI.removeBoardMember(
        boardId.toString(),
        userId.toString()
      );
      set((state) => ({
        boards: state.boards.map((board) =>
          board.id === boardId
            ? { ...board, members: response.data.members }
            : board
        ),
        currentBoard:
          state.currentBoard?.id === boardId
            ? { ...state.currentBoard, members: response.data.members }
            : state.currentBoard,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to remove board member", isLoading: false });
    }
  },

  // List actions
  fetchLists: async (boardId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await listAPI.getLists(boardId.toString());
      
      // Ensure cards have all necessary data
      const listsWithCards = response.data.map((list: BoardList) => ({
        ...list,
        cards: (list.cards || []).map((card: Card) => ({
          ...card,
          labels: card.labels || [],
          checklists: card.checklists || [],
          attachments: card.attachments || [],
          comments: card.comments || []
        }))
      }));

      set({
        lists: listsWithCards,
        isLoading: false,
      });
    } catch (error) {
      set({ error: "Failed to fetch lists", isLoading: false });
    }
  },

  createList: async (boardId, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await listAPI.createList(boardId.toString(), data);
      set((state) => ({
        lists: [...state.lists, response.data],
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to create list", isLoading: false });
    }
  },

  updateList: async (boardId, listId, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await listAPI.updateList(
        boardId.toString(),
        listId.toString(),
        data
      );
      set((state) => ({
        lists: state.lists.map((list) =>
          list.id === listId ? { ...list, ...response.data } : list
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to update list", isLoading: false });
    }
  },

  deleteList: async (boardId, listId) => {
    try {
      set({ isLoading: true, error: null });
      await listAPI.deleteList(boardId.toString(), listId.toString());
      set((state) => ({
        lists: state.lists.filter((list) => list.id !== listId),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to delete list", isLoading: false });
    }
  },

  reorderLists: async (boardId, lists) => {
    try {
      set({ isLoading: true, error: null });
      const response = await listAPI.reorderLists(boardId.toString(), {
        lists,
      });

      // Preserve the existing cards by merging with the response data
      set((state) => ({
        lists: response.data.map((updatedList: BoardList) => {
          const existingList = state.lists.find((l) => l.id === updatedList.id);
          return {
            ...updatedList,
            cards: existingList?.cards || [], // Keep the existing cards
          };
        }),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to reorder lists", isLoading: false });
    }
  },
  createCard: async (boardId, listId, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await cardAPI.createCard(listId.toString(), data);
      
      // Initialize the new card with empty arrays for all properties
      const newCard = {
        ...response.data,
        list_id: listId, // Ensure list_id is set
        labels: [],
        checklists: [],
        attachments: [],
        comments: []
      };
  
      // Update both the lists array and currentBoard if it exists
      set((state) => {
        const updatedLists = state.lists.map((list) =>
          list.id === listId
            ? { ...list, cards: [...(list.cards || []), newCard] }
            : list
        );
  
        return {
          lists: updatedLists,
          currentBoard: state.currentBoard
            ? {
                ...state.currentBoard,
                lists: updatedLists,
              }
            : null,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: "Failed to create card", isLoading: false });
    }
  },
  updateCard: async (boardId, listId, cardId, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await cardAPI.updateCard(
        listId.toString(),
        cardId.toString(),
        data
      );
      set((state) => ({
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                cards: list.cards.map((card) =>
                  card.id === cardId ? { ...card, ...response.data } : card
                ),
              }
            : list
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to update card", isLoading: false });
    }
  },

  deleteCard: async (boardId, listId, cardId) => {
    try {
      set({ isLoading: true, error: null });
      await cardAPI.deleteCard(listId.toString(), cardId.toString());
      set((state) => ({
        lists: state.lists.map((list) =>
          list.id === listId
            ? {
                ...list,
                cards: list.cards.filter((card) => card.id !== cardId),
              }
            : list
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to delete card", isLoading: false });
    }
  },

  reorderCards: async (boardId, listId, cards) => {
    try {
      set({ isLoading: true, error: null });
      const response = await cardAPI.reorderCards(listId.toString(), { cards });
      set((state) => ({
        lists: state.lists.map((list) =>
          list.id === listId ? { ...list, cards: response.data } : list
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to reorder cards", isLoading: false });
    }
  },

  moveCard: async (boardId, cardId, sourceListId, targetListId, position) => {
    try {
      set({ isLoading: true, error: null });
      const response = await cardAPI.reorderCards(targetListId.toString(), {
        cards: [{ id: cardId, position, board_list_id: targetListId }],
      });

      set((state) => {
        // Find the card being moved to preserve its data
        const sourceList = state.lists.find((list) => list.id === sourceListId);
        const movedCard = sourceList?.cards.find((card) => card.id === cardId);

        return {
          lists: state.lists.map((list) => {
            if (list.id === sourceListId) {
              return {
                ...list,
                cards: list.cards.filter((card) => card.id !== cardId),
              };
            }
            if (list.id === targetListId) {
              // Ensure we preserve the card's data when moving it
              const updatedCards = response.data.map((card: Card) => {
                if (card.id === cardId && movedCard) {
                  return { ...movedCard, ...card };
                }
                return card;
              });
              return { ...list, cards: updatedCards };
            }
            return list;
          }),
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: "Failed to move card", isLoading: false });
    }
  },
  attachLabel: async (cardId, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await labelAPI.attachLabel(cardId.toString(), data);
      set((state) => ({
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === cardId
              ? { ...card, labels: [...(card.labels || []), {...response.data}] }
              : card
          ),
        })),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to attach label", isLoading: false });
    }
  },

  detachLabel: async (cardId, labelId) => {
    try {
      set({ isLoading: true, error: null });
      await labelAPI.detachLabel(cardId.toString(), labelId.toString());
      set((state) => ({
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === cardId
              ? {
                  ...card,
                  labels: card.labels?.filter((l) => l.id !== labelId),
                }
              : card
          ),
        })),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to detach label", isLoading: false });
    }
  },

  // Checklist Actions
  createChecklist: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await checklistAPI.createChecklist(
        data.card_id.toString(),
        {
          title: data.title,
        }
      );
      set((state) => ({
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === data.card_id
              ? {
                  ...card,
                  checklists: [...(card.checklists || []), response.data],
                }
              : card
          ),
        })),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to create checklist", isLoading: false });
    }
  },

  updateChecklist: async (checklistId, data) => {
    try {
      set({ isLoading: true, error: null });
      // Find the card that contains this checklist
      const card = get()
        .lists.flatMap((list) => list.cards)
        .find((card) => card.checklists?.some((cl) => cl.id === checklistId));

      if (!card) throw new Error("Card not found");

      const response = await checklistAPI.updateChecklist(
        card.id.toString(),
        checklistId.toString(),
        data
      );

      set((state) => ({
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((c) => ({
            ...c,
            checklists: c.checklists?.map((checklist) =>
              checklist.id === checklistId
                ? { ...checklist, ...response.data }
                : checklist
            ),
          })),
        })),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to update checklist", isLoading: false });
    }
  },

  deleteChecklist: async (checklistId) => {
    try {
      set({ isLoading: true, error: null });
      // Find the card that contains this checklist
      const card = get()
        .lists.flatMap((list) => list.cards)
        .find((card) => card.checklists?.some((cl) => cl.id === checklistId));

      if (!card) throw new Error("Card not found");

      await checklistAPI.deleteChecklist(
        card.id.toString(),
        checklistId.toString()
      );

      set((state) => ({
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((c) => ({
            ...c,
            checklists: c.checklists?.filter(
              (checklist) => checklist.id !== checklistId
            ),
          })),
        })),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to delete checklist", isLoading: false });
    }
  },

  createChecklistItem: async (checklistId, data) => {
    try {
      set({ isLoading: true, error: null });
      // Find the card that contains this checklist
      const card = get()
        .lists.flatMap((list) => list.cards)
        .find((card) => card.checklists?.some((cl) => cl.id === checklistId));

      if (!card) throw new Error("Card not found");

      const response = await checklistAPI.createItem(
        card.id.toString(),
        checklistId.toString(),
        data
      );

      set((state) => ({
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((c) => ({
            ...c,
            checklists: c.checklists?.map((checklist) =>
              checklist.id === checklistId
                ? {
                    ...checklist,
                    items: [...(checklist.items || []), response.data],
                  }
                : checklist
            ),
          })),
        })),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to create checklist item", isLoading: false });
    }
  },

  updateChecklistItem: async (checklistId, itemId, data) => {
    try {
      set({ isLoading: true, error: null });
      // Find the card that contains this checklist
      const card = get()
        .lists.flatMap((list) => list.cards)
        .find((card) => card.checklists?.some((cl) => cl.id === checklistId));

      if (!card) throw new Error("Card not found");

      const response = await checklistAPI.updateItem(
        card.id.toString(),
        checklistId.toString(),
        itemId.toString(),
        data
      );

      set((state) => ({
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((c) => ({
            ...c,
            checklists: c.checklists?.map((checklist) =>
              checklist.id === checklistId
                ? {
                    ...checklist,
                    items: checklist.items.map((item) =>
                      item.id === itemId ? { ...item, ...response.data } : item
                    ),
                  }
                : checklist
            ),
          })),
        })),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to update checklist item", isLoading: false });
    }
  },

  deleteChecklistItem: async (checklistId, itemId) => {
    try {
      set({ isLoading: true, error: null });
      // Find the card that contains this checklist
      const card = get()
        .lists.flatMap((list) => list.cards)
        .find((card) => card.checklists?.some((cl) => cl.id === checklistId));

      if (!card) throw new Error("Card not found");

      await checklistAPI.deleteItem(
        card.id.toString(),
        checklistId.toString(),
        itemId.toString()
      );

      set((state) => ({
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((c) => ({
            ...c,
            checklists: c.checklists?.map((checklist) =>
              checklist.id === checklistId
                ? {
                    ...checklist,
                    items: checklist.items.filter((item) => item.id !== itemId),
                  }
                : checklist
            ),
          })),
        })),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to delete checklist item", isLoading: false });
    }
  },

  // Attachment Actions
  createAttachment: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await attachmentAPI.createAttachment(
        data.card_id.toString(),
        data
      );
      set((state) => ({
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === data.card_id
              ? {
                  ...card,
                  attachments: [...(card.attachments || []), response.data],
                }
              : card
          ),
        })),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to create attachment", isLoading: false });
    }
  },

  deleteAttachment: async (attachmentId) => {
    try {
      set({ isLoading: true, error: null });
      // Find the card that contains this attachment
      const card = get()
        .lists.flatMap((list) => list.cards)
        .find((card) => card.attachments?.some((a) => a.id === attachmentId));

      if (!card) throw new Error("Card not found");

      await attachmentAPI.deleteAttachment(
        card.id.toString(),
        attachmentId.toString()
      );
      set((state) => ({
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((c) => ({
            ...c,
            attachments: c.attachments?.filter(
              (attachment) => attachment.id !== attachmentId
            ),
          })),
        })),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to delete attachment", isLoading: false });
    }
  },

  // Comment Actions
  createComment: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await commentAPI.createComment(
        data.card_id.toString(),
        data
      );
      set((state) => ({
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === data.card_id
              ? { ...card, comments: [...(card.comments || []), response.data] }
              : card
          ),
        })),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to create comment", isLoading: false });
    }
  },

  updateComment: async (commentId, data) => {
    try {
      set({ isLoading: true, error: null });
      // Find the card that contains this comment
      const card = get()
        .lists.flatMap((list) => list.cards)
        .find((card) => card.comments?.some((c) => c.id === commentId));

      if (!card) throw new Error("Card not found");

      const response = await commentAPI.updateComment(
        card.id.toString(),
        commentId.toString(),
        data
      );

      set((state) => ({
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((c) => ({
            ...c,
            comments: c.comments?.map((comment) =>
              comment.id === commentId
                ? { ...comment, ...response.data }
                : comment
            ),
          })),
        })),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to update comment", isLoading: false });
    }
  },

  deleteComment: async (commentId) => {
    try {
      set({ isLoading: true, error: null });
      // Find the card that contains this comment
      const card = get()
        .lists.flatMap((list) => list.cards)
        .find((card) => card.comments?.some((c) => c.id === commentId));

      if (!card) throw new Error("Card not found");

      await commentAPI.deleteComment(card.id.toString(), commentId.toString());
      set((state) => ({
        lists: state.lists.map((list) => ({
          ...list,
          cards: list.cards.map((c) => ({
            ...c,
            comments: c.comments?.filter((comment) => comment.id !== commentId),
          })),
        })),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: "Failed to delete comment", isLoading: false });
    }
  },
}));

export default useKanbanStore;
