/**
 * Transactions CRUD - Firestore
 * Path: users/{userId}/transactions/{transactionId}
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type {
  Transaction,
  TransactionCreate,
  TransactionUpdate,
} from '@/lib/models';

const toDate = (v: unknown): string =>
  v && typeof v === 'object' && 'toDate' in v
    ? (v as Timestamp).toDate().toISOString()
    : String(v ?? '');

const toTransaction = (id: string, data: Record<string, unknown>): Transaction => {
  return {
    id,
    userId: String(data.userId ?? ''),
    amount: Number(data.amount ?? 0),
    type: (data.type as Transaction['type']) ?? 'income',
    description: String(data.description ?? ''),
    source: data.source ? String(data.source) : undefined,
    paymentMethodId: data.paymentMethodId ? String(data.paymentMethodId) : undefined,
    date: toDate(data.date),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    categoryId: data.categoryId ? String(data.categoryId) : undefined,
    store: data.store as Transaction['store'],
    quantity: data.quantity != null ? Number(data.quantity) : undefined,
    unit: data.unit as Transaction['unit'],
    unitPrice: data.unitPrice != null ? Number(data.unitPrice) : undefined,
    rating: data.rating != null ? Number(data.rating) : undefined,
    comment: data.comment ? String(data.comment) : undefined,
  };
};

export function transactionsRef(userId: string) {
  return collection(db, 'users', userId, 'transactions');
}

export function transactionRef(userId: string, transactionId: string) {
  return doc(db, 'users', userId, 'transactions', transactionId);
}

function omitUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Record<string, unknown>;
}

export async function createTransaction(
  userId: string,
  data: TransactionCreate
): Promise<Transaction> {
  const now = new Date().toISOString();
  const payload = omitUndefined({
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  });
  const ref = await addDoc(transactionsRef(userId), payload);
  const tx = await getTransaction(userId, ref.id);
  if (!tx) throw new Error('Failed to fetch created transaction');
  return tx;
}

export async function getTransaction(
  userId: string,
  transactionId: string
): Promise<Transaction | null> {
  const snap = await getDoc(transactionRef(userId, transactionId));
  if (!snap.exists()) return null;
  return toTransaction(snap.id, snap.data());
}

export async function getTransactions(
  userId: string,
  type?: 'income' | 'expense'
): Promise<Transaction[]> {
  let q = query(
    transactionsRef(userId),
    orderBy('date', 'desc'),
    orderBy('createdAt', 'desc')
  );
  if (type) {
    q = query(
      transactionsRef(userId),
      where('type', '==', type),
      orderBy('date', 'desc'),
      orderBy('createdAt', 'desc')
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => toTransaction(d.id, d.data()));
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  data: TransactionUpdate
): Promise<void> {
  const ref = transactionRef(userId, transactionId);
  const payload = omitUndefined({
    ...data,
    updatedAt: new Date().toISOString(),
  });
  await updateDoc(ref, payload);
}

export async function deleteTransaction(
  userId: string,
  transactionId: string
): Promise<void> {
  await deleteDoc(transactionRef(userId, transactionId));
}

export function subscribeIncomeTransactions(
  userId: string,
  onData: (transactions: Transaction[]) => void
): Unsubscribe {
  const q = query(
    transactionsRef(userId),
    orderBy('date', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => toTransaction(d.id, d.data()))
        .filter((t) => t.type === 'income');
      onData(items);
    },
    (err) => {
      console.error('subscribeIncomeTransactions error:', err);
    }
  );
}
