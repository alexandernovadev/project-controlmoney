/**
 * Categories CRUD - Firestore
 * Path: users/{userId}/categories/{categoryId}
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
  Category,
  CategoryCreate,
  CategoryUpdate,
  CategoryOption,
} from '@/lib/models';

const toCategory = (id: string, data: Record<string, unknown>): Category => {
  const toDate = (v: unknown) =>
    v && typeof v === 'object' && 'toDate' in v
      ? (v as Timestamp).toDate().toISOString()
      : String(v);
  return {
    id,
    name: String(data.name ?? ''),
    type: (data.type as Category['type']) ?? 'expense',
    userId: String(data.userId ?? ''),
    icon: data.icon ? String(data.icon) : undefined,
    color: data.color ? String(data.color) : undefined,
    order: Number(data.order ?? 0),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
};

export function categoriesRef(userId: string) {
  return collection(db, 'users', userId, 'categories');
}

export function categoryRef(userId: string, categoryId: string) {
  return doc(db, 'users', userId, 'categories', categoryId);
}

export async function createCategory(
  userId: string,
  data: CategoryCreate
): Promise<Category> {
  const now = new Date().toISOString();
  const payload = {
    ...data,
    userId,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await addDoc(categoriesRef(userId), payload);
  const cat = await getCategory(userId, ref.id);
  if (!cat) throw new Error('Failed to fetch created category');
  return cat;
}

export async function getCategory(
  userId: string,
  categoryId: string
): Promise<Category | null> {
  const snap = await getDoc(categoryRef(userId, categoryId));
  if (!snap.exists()) return null;
  return toCategory(snap.id, snap.data());
}

export async function getCategories(userId: string): Promise<Category[]> {
  const q = query(categoriesRef(userId), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toCategory(d.id, d.data()));
}

export async function updateCategory(
  userId: string,
  categoryId: string,
  data: CategoryUpdate
): Promise<void> {
  const ref = categoryRef(userId, categoryId);
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCategory(
  userId: string,
  categoryId: string
): Promise<void> {
  await deleteDoc(categoryRef(userId, categoryId));
}

export function subscribeCategories(
  userId: string,
  onData: (categories: Category[]) => void
): Unsubscribe {
  const q = query(categoriesRef(userId), orderBy('order', 'asc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => toCategory(d.id, d.data()));
    onData(items);
  });
}

export function toCategoryOptions(categories: Category[]): CategoryOption[] {
  return categories.map((c) => ({ label: c.name, value: c.id }));
}
