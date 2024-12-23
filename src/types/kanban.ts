export interface Card {
  id: number;
  title: string;
  position: number;
  board_list_id: number;
}

export interface List {
  id: number;
  name: string;
  position: number;
  cards: Card[];
}

export interface Board {
  id: number;
  name: string;
  description: string;
}