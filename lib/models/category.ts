/**
 * Category models (for expenses)
 */

export type CategoryType = 'income' | 'expense';

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  userId: string;
  icon?: string;
  color?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type CategoryCreate = Omit<Category, 'id' | 'createdAt' | 'updatedAt'> & {
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryUpdate = Partial<
  Omit<Category, 'id' | 'userId' | 'createdAt'>
>;

export type CategoryOption = {
  label: string;
  value: string;
};
