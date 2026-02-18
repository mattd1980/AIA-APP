import { ItemCategory, ItemCondition } from '@prisma/client';

const VALID_CATEGORIES = new Set<string>(Object.values(ItemCategory));
const VALID_CONDITIONS = new Set<string>(Object.values(ItemCondition));

export function isValidCategory(value: string): value is ItemCategory {
  return VALID_CATEGORIES.has(value);
}

export function isValidCondition(value: string): value is ItemCondition {
  return VALID_CONDITIONS.has(value);
}

export function toCategory(value: string): ItemCategory {
  return isValidCategory(value) ? value : ('other' as ItemCategory);
}

export function toCondition(value: string): ItemCondition {
  return isValidCondition(value) ? value : ('good' as ItemCondition);
}
