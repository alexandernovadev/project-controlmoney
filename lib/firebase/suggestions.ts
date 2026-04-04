/**
 * Suggestions CRUD - Firestore
 * Paths:
 *   users/{userId}/brands/{slug}  →  { name: string }
 *   users/{userId}/stores/{slug}  →  { name: string }
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { getTransactions } from './transactions';

type SuggestionField = 'brands' | 'stores' | 'descriptions';

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-_]/g, '_');
}

function suggestionRef(userId: string, field: SuggestionField, slug: string) {
  return doc(db, 'users', userId, field, slug);
}

function suggestionsRef(userId: string, field: SuggestionField) {
  return collection(db, 'users', userId, field);
}

export async function upsertSuggestion(
  userId: string,
  field: SuggestionField,
  value: string
): Promise<void> {
  const trimmed = value.trim();
  if (!trimmed) return;
  const slug = slugify(trimmed);
  await setDoc(suggestionRef(userId, field, slug), { name: trimmed }, { merge: true });
}

function metaRef(userId: string) {
  return doc(db, 'users', userId, 'meta', 'suggestions');
}

const SEED_VERSION = 2;

export async function seedSuggestionsIfNeeded(userId: string): Promise<void> {
  const meta = await getDoc(metaRef(userId));
  if (meta.exists() && meta.data()?.version === SEED_VERSION) return;

  const transactions = await getTransactions(userId, 'expense');

  const brands = new Map<string, string>();
  const stores = new Map<string, string>();
  const descriptions = new Map<string, string>();

  for (const tx of transactions) {
    if (tx.brand) {
      const name = tx.brand.trim();
      if (name) brands.set(slugify(name), name);
    }
    const storeVal = tx.store;
    if (storeVal) {
      const name = (typeof storeVal === 'string' ? storeVal : storeVal.name).trim();
      if (name) stores.set(slugify(name), name);
    }
    if (tx.description) {
      const name = tx.description.trim();
      if (name) descriptions.set(slugify(name), name);
    }
  }

  // Firestore batch limit is 500 writes
  const allWrites: Array<{ ref: ReturnType<typeof doc>; data: { name: string } }> = [
    ...Array.from(brands.entries()).map(([slug, name]) => ({
      ref: suggestionRef(userId, 'brands', slug),
      data: { name },
    })),
    ...Array.from(stores.entries()).map(([slug, name]) => ({
      ref: suggestionRef(userId, 'stores', slug),
      data: { name },
    })),
    ...Array.from(descriptions.entries()).map(([slug, name]) => ({
      ref: suggestionRef(userId, 'descriptions', slug),
      data: { name },
    })),
  ];

  for (let i = 0; i < allWrites.length; i += 500) {
    const batch = writeBatch(db);
    allWrites.slice(i, i + 500).forEach(({ ref, data }) => batch.set(ref, data));
    await batch.commit();
  }

  await setDoc(metaRef(userId), { seededAt: new Date().toISOString(), version: SEED_VERSION });
}

export async function getAllSuggestions(
  userId: string,
  field: SuggestionField
): Promise<string[]> {
  const snap = await getDocs(suggestionsRef(userId, field));
  return snap.docs.map((d) => d.data().name as string);
}
