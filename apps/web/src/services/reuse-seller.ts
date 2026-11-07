import { reuseCategories } from "@/data/reuse";
import { reuseAttributeDefinitions } from "@/data/reuse-attributes";
import { readFrontendSession } from "@/lib/auth";
import { readSellerSetup, saveSellerSetup } from "@/services/seller-setup";

export const reuseConfigurationEvent = "conflumix-reuse-configuration";

export function readReuseConfiguration() {
  const setup = readSellerSetup();
  return {
    categories: setup.reuseCategories.filter((value) =>
      reuseCategories.includes(value as (typeof reuseCategories)[number]),
    ),
    attributes: reuseAttributeDefinitions,
    updatedAt: setup.updatedAt,
  };
}

export function saveReuseConfiguration(categories: string[]) {
  if (!readFrontendSession())
    throw new Error("Your session expired. Sign in again before saving.");
  const valid = Array.from(new Set(categories)).filter((value) =>
    reuseCategories.includes(value as (typeof reuseCategories)[number]),
  );
  if (!valid.length) throw new Error("Configure at least one Reuse category.");
  const setup = readSellerSetup();
  saveSellerSetup({ ...setup, reuseEnabled: true, reuseCategories: valid });
  window.dispatchEvent(new Event(reuseConfigurationEvent));
  return valid;
}
