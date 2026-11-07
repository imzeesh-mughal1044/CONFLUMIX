import type { ReuseAttributeDefinition } from "@/types/reuse";

const text = (
  id: string,
  label: string,
  required = false,
): ReuseAttributeDefinition => ({ id, label, type: "text", required });

export const reuseAttributeDefinitions: Record<
  string,
  ReuseAttributeDefinition[]
> = {
  Laptops: [
    text("memory", "Memory", true),
    text("storage", "Storage", true),
    text("screen", "Screen size"),
  ],
  Furniture: [
    text("material", "Material", true),
    text("dimensions", "Dimensions"),
  ],
  "Audio Equipment and Headphones": [
    text("connectivity", "Connectivity", true),
    text("colour", "Colour"),
  ],
};
