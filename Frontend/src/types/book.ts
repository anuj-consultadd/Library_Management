export interface Book {
  id: number;
  title: string;
  author: string;
  available: boolean;
}

export interface Borrow {
  id: number;
  user: number;
  book: number;
  book_title: string;
  username: string;
  borrowed_at: string;
  returned_at: string | null;
}
