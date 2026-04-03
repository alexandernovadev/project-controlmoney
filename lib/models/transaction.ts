/**
 * Transaction models
 */

export type TransactionType = "income" | "expense";

// Units of measure (expenses)
export type Unit =
  | "unidad"
  | "kg"
  | "g"
  | "L"
  | "ml"
  | "lb"
  | "oz"
  | "caja"
  | "paquete"
  | "litro"
  | "tarjeta"
  | "otro";

// Store info (expenses, optional)
export type StoreInfo = {
  name: string;
  address?: string;
  country?: string;
  lat?: number;
  lng?: number;
};

export type Transaction = {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;

  // Income
  source?: string;

  // Common (income + expense)
  paymentMethodId?: string;

  // Expense
  store?: string | StoreInfo;
  brand?: string;
  quantity?: number;
  unit?: Unit;
  unitPrice?: number;
  rating?: number;
  comment?: string;

  // Common
  categoryId?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionCreate = Omit<
  Transaction,
  "id" | "createdAt" | "updatedAt"
> & {
  createdAt?: string;
  updatedAt?: string;
};

export type TransactionUpdate = Partial<
  Omit<Transaction, "id" | "userId" | "createdAt">
>;
