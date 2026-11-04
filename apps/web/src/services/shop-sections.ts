import { readStoredListings, saveStoredListing } from "./product-listings";
import type { ShopSection, ShopSectionResult } from "@/types/shop-section";

export const shopSectionLimit = 30;
export const shopSectionNameLimit = 50;
const storageKey = "conflumix:new-product-shop-sections:v1";

function readAll(): ShopSection[] {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeAll(value: ShopSection[]) {
  localStorage.setItem(storageKey, JSON.stringify(value));
}

function normalizedName(value: string) {
  return value.trim();
}

function nameError(name: string, sections: ShopSection[], ignoredId?: string) {
  if (!name) return "Enter a section name.";
  if (name.length > shopSectionNameLimit) return `Keep the section name to ${shopSectionNameLimit} characters or fewer.`;
  if (sections.some((item) => item.id !== ignoredId && item.name.toLocaleLowerCase() === name.toLocaleLowerCase())) return "A section with this name already exists in your store.";
  return "";
}

export function readShopSections(storeId: string) {
  return readAll().filter((item) => item.storeId === storeId).sort((a, b) => a.order - b.order);
}

export function createShopSection(storeId: string, value: string): ShopSectionResult {
  const all = readAll();
  const sections = all.filter((item) => item.storeId === storeId);
  if (sections.length >= shopSectionLimit) return { ok: false, error: "You've reached the maximum of 30 shop sections. Remove an existing section before creating another." };
  const name = normalizedName(value);
  const error = nameError(name, sections);
  if (error) return { ok: false, error };
  const now = new Date().toISOString();
  const section: ShopSection = { id: `section-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 6)}`, storeId, name, order: sections.length, createdAt: now, updatedAt: now };
  writeAll([...all, section]);
  return { ok: true, section };
}

export function renameShopSection(storeId: string, sectionId: string, value: string): ShopSectionResult {
  const all = readAll();
  const sections = all.filter((item) => item.storeId === storeId);
  const current = sections.find((item) => item.id === sectionId);
  if (!current) return { ok: false, error: "This section is no longer available." };
  const name = normalizedName(value);
  const error = nameError(name, sections, sectionId);
  if (error) return { ok: false, error };
  const section = { ...current, name, updatedAt: new Date().toISOString() };
  writeAll(all.map((item) => item.id === sectionId && item.storeId === storeId ? section : item));
  return { ok: true, section };
}

export function deleteShopSection(storeId: string, sectionId: string) {
  const all = readAll();
  if (!all.some((item) => item.id === sectionId && item.storeId === storeId)) return false;
  writeAll(all.filter((item) => !(item.id === sectionId && item.storeId === storeId)));
  readStoredListings().filter((item) => item.storeId === storeId && item.sectionId === sectionId).forEach((item) => saveStoredListing({ ...item, sectionId: undefined }));
  reorderShopSections(storeId, readShopSections(storeId).map((item) => item.id));
  return true;
}

export function reorderShopSections(storeId: string, orderedIds: string[]) {
  const all = readAll();
  const owned = all.filter((item) => item.storeId === storeId);
  if (orderedIds.length !== owned.length || orderedIds.some((id) => !owned.some((item) => item.id === id))) return false;
  const now = new Date().toISOString();
  writeAll(all.map((item) => item.storeId === storeId ? { ...item, order: orderedIds.indexOf(item.id), updatedAt: now } : item));
  return true;
}

export function sectionBelongsToStore(storeId: string, sectionId?: string) {
  return !sectionId || readAll().some((item) => item.id === sectionId && item.storeId === storeId);
}
