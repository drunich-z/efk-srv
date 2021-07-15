export interface Item {
  name: string;
  price: number;
  categoryId: number;
  description?: string;
  image?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}
