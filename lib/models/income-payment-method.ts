/**
 * Income payment method models (dynamic from Firebase)
 */

export type IncomePaymentType = 'cash' | 'digital';

export type IncomePaymentMethod = {
  id: string;
  label: string;
  value: string;
  type: IncomePaymentType;
  userId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type IncomePaymentMethodCreate = Omit<
  IncomePaymentMethod,
  'id' | 'createdAt' | 'updatedAt'
> & {
  createdAt?: string;
  updatedAt?: string;
};

export type IncomePaymentMethodUpdate = Partial<
  Omit<IncomePaymentMethod, 'id' | 'userId' | 'createdAt'>
>;

export type IncomePaymentMethodOption = {
  label: string;
  value: string;
};
