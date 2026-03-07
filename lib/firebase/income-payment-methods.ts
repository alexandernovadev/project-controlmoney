/**
 * Income payment methods CRUD - Firestore
 * Path: users/{userId}/incomePaymentMethods/{methodId}
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
  orderBy,
  onSnapshot,
  type Unsubscribe,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type {
  IncomePaymentMethod,
  IncomePaymentMethodCreate,
  IncomePaymentMethodUpdate,
  IncomePaymentMethodOption,
} from '@/lib/models';

const toMethod = (
  id: string,
  data: Record<string, unknown>
): IncomePaymentMethod => {
  const toDate = (v: unknown) =>
    v && typeof v === 'object' && 'toDate' in v
      ? (v as Timestamp).toDate().toISOString()
      : String(v);
  return {
    id,
    label: String(data.label ?? ''),
    value: String(data.value ?? ''),
    type: (data.type as IncomePaymentMethod['type']) ?? 'digital',
    userId: String(data.userId ?? ''),
    order: Number(data.order ?? 0),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
};

export function incomePaymentMethodsRef(userId: string) {
  return collection(db, 'users', userId, 'incomePaymentMethods');
}

export function incomePaymentMethodRef(
  userId: string,
  methodId: string
) {
  return doc(db, 'users', userId, 'incomePaymentMethods', methodId);
}

export async function createIncomePaymentMethod(
  userId: string,
  data: IncomePaymentMethodCreate
): Promise<IncomePaymentMethod> {
  const now = new Date().toISOString();
  const payload = {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await addDoc(incomePaymentMethodsRef(userId), payload);
  const created = await getIncomePaymentMethod(userId, ref.id);
  if (!created) throw new Error('Failed to fetch created payment method');
  return created;
}

export async function getIncomePaymentMethod(
  userId: string,
  methodId: string
): Promise<IncomePaymentMethod | null> {
  const snap = await getDoc(incomePaymentMethodRef(userId, methodId));
  if (!snap.exists()) return null;
  return toMethod(snap.id, snap.data());
}

export async function getIncomePaymentMethods(
  userId: string
): Promise<IncomePaymentMethod[]> {
  const q = query(
    incomePaymentMethodsRef(userId),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toMethod(d.id, d.data()));
}

export async function updateIncomePaymentMethod(
  userId: string,
  methodId: string,
  data: IncomePaymentMethodUpdate
): Promise<void> {
  const ref = incomePaymentMethodRef(userId, methodId);
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteIncomePaymentMethod(
  userId: string,
  methodId: string
): Promise<void> {
  await deleteDoc(incomePaymentMethodRef(userId, methodId));
}

export function subscribeIncomePaymentMethods(
  userId: string,
  onData: (methods: IncomePaymentMethod[]) => void
): Unsubscribe {
  const q = query(
    incomePaymentMethodsRef(userId),
    orderBy('order', 'asc')
  );
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => toMethod(d.id, d.data()));
    onData(items);
  });
}

export function toIncomePaymentMethodOptions(
  methods: IncomePaymentMethod[]
): IncomePaymentMethodOption[] {
  return methods.map((m) => ({ label: m.label, value: m.id }));
}
