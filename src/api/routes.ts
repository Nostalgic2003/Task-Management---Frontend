import type { UserLogin, UserRegister } from "../types/userType";
import api from "./config";

export const userAPI = {
  login: (data: UserLogin) => api.post("/users/login", data),
  register: (data: UserRegister) => api.post("/users", data),
  logout: () => api.post("/logout"),
  getUsers: () => api.get("/users"),
};

export const boardAPI = {
  getBoard: (boardId: string) => api.get(`/boards/${boardId}`),
  getBoardByUserId: () => api.get(`/boards`),
  createBoard: (data: any) => api.post("/boards", data),
  updateBoard: (boardId: string, data: any) =>
    api.put(`/boards/${boardId}`, data),
  deleteBoard: (boardId: string) => api.delete(`/boards/${boardId}`),
  addBoardMember: (boardId: string, data: any) =>
    api.post(`/boards/${boardId}/members`, data),
  removeBoardMember: (boardId: string, userId: string) =>
    api.delete(`/boards/${boardId}/members/${userId}`),
};

export const listAPI = {
  getLists: (boardId: string) => api.get(`/boards/${boardId}/lists`),
  createList: (boardId: string, data: any) =>
    api.post(`/boards/${boardId}/lists`, data),
  updateList: (boardId: string, listId: string, data: any) =>
    api.put(`/boards/${boardId}/lists/${listId}`, data),
  deleteList: (boardId: string, listId: string) =>
    api.delete(`/boards/${boardId}/lists/${listId}`),
  reorderLists: (boardId: string, data: any) =>
    api.post(`/boards/${boardId}/lists/reorder`, data),
};

export const cardAPI = {
  getCards: (listId: string) => api.get(`/lists/${listId}/cards`),
  createCard: (listId: string, data: any) =>
    api.post(`/lists/${listId}/cards`, data),
  updateCard: (listId: string, cardId: string, data: any) =>
    api.put(`/lists/${listId}/cards/${cardId}`, data),
  deleteCard: (listId: string, cardId: string) =>
    api.delete(`/lists/${listId}/cards/${cardId}`),
  reorderCards: (listId: string, data: any) =>
    api.post(`/lists/${listId}/cards/reorder`, data),
  addCardMember: (cardId: string, data: any) =>
    api.post(`/cards/${cardId}/members`, data),
  removeCardMember: (cardId: string, userId: string) =>
    api.delete(`/cards/${cardId}/members/${userId}`),
};

export const labelAPI = {
  attachLabel: (cardId: string, data: any) =>
    api.post(`/cards/${cardId}/labels`, data),
  detachLabel: (cardId: string, labelId: string) =>
    api.delete(`/cards/${cardId}/labels/${labelId}`),
};

export const checklistAPI = {
  createChecklist: (cardId: string, data: any) =>
    api.post(`/cards/${cardId}/checklists`, data),
  updateChecklist: (cardId: string, checklistId: string, data: any) =>
    api.put(`/cards/${cardId}/checklists/${checklistId}`, data),
  deleteChecklist: (cardId: string, checklistId: string) =>
    api.delete(`/cards/${cardId}/checklists/${checklistId}`),
  createItem: (cardId: string, checklistId: string, data: any) =>
    api.post(`/cards/${cardId}/checklists/${checklistId}/items`, data),
  updateItem: (
    cardId: string,
    checklistId: string,
    itemId: string,
    data: any
  ) =>
    api.put(`/cards/${cardId}/checklists/${checklistId}/items/${itemId}`, data),
  deleteItem: (cardId: string, checklistId: string, itemId: string) =>
    api.delete(`/cards/${cardId}/checklists/${checklistId}/items/${itemId}`),
};

export const attachmentAPI = {
  createAttachment: (cardId: string, data: any) =>
    api.post(`/cards/${cardId}/attachments`, data),
  deleteAttachment: (cardId: string, attachmentId: string) =>
    api.delete(`/cards/${cardId}/attachments/${attachmentId}`),
};

export const commentAPI = {
  createComment: (cardId: string, data: any) =>
    api.post(`/cards/${cardId}/comments`, data),
  updateComment: (cardId: string, commentId: string, data: any) =>
    api.put(`/cards/${cardId}/comments/${commentId}`, data),
  deleteComment: (cardId: string, commentId: string) =>
    api.delete(`/cards/${cardId}/comments/${commentId}`),
};
