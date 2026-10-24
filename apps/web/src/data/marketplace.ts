import type { MarketplaceListing, MarketplaceMode } from "@/types/marketplace";

export const modeMeta: Record<MarketplaceMode, { label: string; short: string; description: string }> = {
  "new-products": { label: "New Product Marketplace", short: "New Products", description: "Newly listed essentials from local sellers and businesses." },
  reuse: { label: "Reuse / Old Product Marketplace", short: "Reuse", description: "Pre-owned, refurbished, and surplus items ready for another chapter." },
  tasks: { label: "Task & Soft Skills Marketplace", short: "Tasks", description: "Practical short-term opportunities built around real problems and outcomes." },
  donations: { label: "Donation & Social Impact Network", short: "Donations", description: "Useful resources connected thoughtfully with community needs." },
};

export const localities = ["DHA Phase 6", "Gulberg", "Johar Town", "Model Town", "Wapda Town"] as const;

export const listingImages: Record<string, string> = {
  "new-1": "/marketplace/wireless-headphones.png",
  "new-2": "/marketplace/oak-work-desk.png",
  "new-3": "/marketplace/commuter-backpack.png",
  "reuse-1": "/marketplace/used-laptop.png",
  "reuse-2": "/marketplace/restored-armchair.png",
  "task-1": "/marketplace/booklet-design-task.png",
  "donation-1": "/marketplace/winter-clothing-donation.png",
  "donation-2": "/marketplace/used-laptop.png",
};

export const marketplaceListings: MarketplaceListing[] = [
  { id: "new-1", mode: "new-products", title: "Studio-grade wireless headphones", description: "Closed-back headphones with active noise cancellation and a two-year local warranty.", category: "Electronics", locality: "Gulberg", createdAt: "2026-10-22", status: "available", featured: true, visual: "audio", price: 28500, seller: "Sound & Form", stock: "In stock" },
  { id: "new-2", mode: "new-products", title: "Minimal oak work desk", description: "Solid oak writing desk designed for compact home offices.", category: "Home & Living", locality: "DHA Phase 6", createdAt: "2026-10-20", status: "limited", visual: "desk", price: 42000, seller: "Crafted Local", stock: "Only 3 left" },
  { id: "new-3", mode: "new-products", title: "Everyday commuter backpack", description: "Weather-resistant 24L backpack with a padded laptop sleeve.", category: "Fashion", locality: "Johar Town", createdAt: "2026-10-18", status: "available", visual: "bag", price: 7900, seller: "Northbound Goods", stock: "In stock" },
  { id: "new-4", mode: "new-products", title: "Ceramic pour-over set", description: "Hand-finished brewer and two cups made by a Lahore ceramic studio.", category: "Home & Living", locality: "Model Town", createdAt: "2026-10-14", status: "available", visual: "ceramic", price: 5600, seller: "Quiet Morning", stock: "In stock" },
  { id: "reuse-1", mode: "reuse", title: "ThinkPad T14 business laptop", description: "Reliable laptop with 16GB RAM, inspected battery, and original charger.", category: "Electronics", locality: "DHA Phase 6", createdAt: "2026-10-23", status: "available", featured: true, visual: "laptop", price: 118000, seller: "Areeb", condition: "Good" },
  { id: "reuse-2", mode: "reuse", title: "Restored mid-century armchair", description: "Reupholstered reading chair with a repaired solid-wood frame.", category: "Furniture", locality: "Gulberg", createdAt: "2026-10-19", status: "available", visual: "chair", price: 26000, seller: "Second Story Studio", condition: "Like new" },
  { id: "reuse-3", mode: "reuse", title: "Beginner acoustic guitar", description: "Full-size guitar with fresh strings, soft case, and a few cosmetic marks.", category: "Hobbies", locality: "Model Town", createdAt: "2026-10-16", status: "limited", visual: "guitar", price: 14500, seller: "Maham", condition: "Good" },
  { id: "reuse-4", mode: "reuse", title: "Compact study bookshelf", description: "Five-shelf unit with minor edge wear and sturdy fittings.", category: "Furniture", locality: "Wapda Town", createdAt: "2026-10-12", status: "available", visual: "shelf", price: 8500, seller: "Hamza", condition: "Fair" },
  { id: "task-1", mode: "tasks", title: "Format a community event booklet", description: "Turn supplied copy into a clean twelve-page booklet ready for print.", category: "Design", locality: "Johar Town", createdAt: "2026-10-24", status: "open", featured: true, visual: "layout", budget: 18000, skill: "Editorial design", workStyle: "Remote" },
  { id: "task-2", mode: "tasks", title: "Organize inventory spreadsheet", description: "Clean and categorize a small retailer's existing inventory workbook.", category: "Business Support", locality: "Gulberg", createdAt: "2026-10-21", status: "open", visual: "sheets", budget: 12000, skill: "Spreadsheets", workStyle: "Hybrid" },
  { id: "task-3", mode: "tasks", title: "Photograph a handmade collection", description: "Create twenty consistent product photographs for a local ceramic maker.", category: "Photography", locality: "Model Town", createdAt: "2026-10-17", status: "open", visual: "camera", budget: 22000, skill: "Product photography", workStyle: "Local" },
  { id: "task-4", mode: "tasks", title: "Fix responsive landing-page spacing", description: "Review and correct layout issues across phone and tablet breakpoints.", category: "Development", locality: "DHA Phase 6", createdAt: "2026-10-13", status: "open", visual: "code", budget: 30000, skill: "Frontend development", workStyle: "Remote" },
  { id: "donation-1", mode: "donations", title: "Children's winter clothing bundle", description: "Clean jackets and sweaters grouped by age for community distribution.", category: "Clothing", locality: "Wapda Town", createdAt: "2026-10-23", status: "available", featured: true, visual: "clothing", kind: "offer", organization: "Neighbourhood Circle", quantity: "18 items", condition: "Good", urgency: 2 },
  { id: "donation-2", mode: "donations", title: "Laptops needed for learning lab", description: "A volunteer learning space needs working laptops for evening digital classes.", category: "Education", locality: "Johar Town", createdAt: "2026-10-22", status: "open", visual: "learning", kind: "need", organization: "Open Door Learning", quantity: "6 needed", urgency: 3 },
  { id: "donation-3", mode: "donations", title: "Unused mobility walker", description: "Foldable adult walker available for someone who can make immediate use of it.", category: "Health", locality: "DHA Phase 6", createdAt: "2026-10-15", status: "available", visual: "health", kind: "offer", organization: "Individual donor", quantity: "1 item", condition: "Like new", urgency: 1 },
  { id: "donation-4", mode: "donations", title: "Books for neighbourhood reading room", description: "Seeking Urdu and English books suitable for readers aged eight to sixteen.", category: "Education", locality: "Gulberg", createdAt: "2026-10-11", status: "open", visual: "books", kind: "need", organization: "Gulberg Reading Room", quantity: "40 requested", urgency: 2 },
];

