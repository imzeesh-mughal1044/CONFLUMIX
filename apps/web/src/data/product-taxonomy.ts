export const productTaxonomy = [
  { name: "Mobiles & Tablets", subcategories: ["Smartphones", "Feature Phones", "Tablets", "Mobile Accessories"] },
  { name: "Computers & Laptops", subcategories: ["Laptops", "Desktop PCs", "Monitors", "Computer Components", "Computer Accessories"] },
  { name: "Electronics & Smart Devices", subcategories: ["TVs", "Audio Devices", "Cameras", "Smart Watches", "Smart Home Devices"] },
  { name: "Gaming", subcategories: ["Gaming Consoles", "Video Games", "Gaming PCs", "Controllers", "Gaming Accessories"] },
  { name: "Clothing & Fashion", subcategories: ["Men's Clothing", "Women's Clothing", "Kids' Clothing", "Shoes", "Bags & Accessories"] },
  { name: "Jewelry & Watches", subcategories: ["Men's Watches", "Women's Watches", "Fashion Jewelry", "Fine Jewelry", "Jewelry Accessories"] },
  { name: "Beauty & Personal Care", subcategories: ["Skincare", "Makeup", "Hair Care", "Fragrances", "Grooming", "Personal Care"] },
  { name: "Home & Living", subcategories: ["Furniture", "Home Décor", "Bedding", "Bathroom Products", "Storage & Organization"] },
  { name: "Kitchen & Dining", subcategories: ["Cookware", "Dinnerware", "Kitchen Tools", "Food Storage", "Drinkware"] },
  { name: "Home Appliances", subcategories: ["Refrigerators", "Washing Machines", "Air Conditioners", "Vacuum Cleaners", "Small Appliances"] },
  { name: "Sports & Fitness", subcategories: ["Fitness Equipment", "Exercise Accessories", "Team Sports", "Racket Sports", "Sports Accessories"] },
  { name: "Outdoor & Travel", subcategories: ["Camping Equipment", "Hiking Equipment", "Outdoor Gear", "Luggage", "Travel Accessories"] },
  { name: "Automotive & Motorbike", subcategories: ["Car Parts", "Motorcycle Parts", "Car Accessories", "Motorcycle Accessories", "Car Care", "Automotive Electronics"] },
  { name: "Baby & Kids", subcategories: ["Baby Gear", "Feeding Products", "Nursery Products", "Kids Clothing", "Baby Care"] },
  { name: "Toys & Games", subcategories: ["Educational Toys", "Dolls", "Action Figures", "Building Toys", "Board Games", "Outdoor Toys"] },
  { name: "Books & Media", subcategories: ["Books", "Educational Books", "Magazines", "Comics", "Physical Media"] },
  { name: "Stationery & Office Supplies", subcategories: ["Notebooks", "Writing Supplies", "School Supplies", "Office Supplies", "Office Equipment"] },
  { name: "Arts, Crafts & Sewing", subcategories: ["Art Supplies", "Craft Materials", "Sewing Supplies", "Fabric", "DIY Supplies"] },
  { name: "Tools & Home Improvement", subcategories: ["Hand Tools", "Power Tools", "Electrical Supplies", "Plumbing Supplies", "Hardware"] },
  { name: "Garden & Outdoor Living", subcategories: ["Gardening Tools", "Plants & Seeds", "Garden Accessories", "Outdoor Furniture", "Outdoor Décor"] },
  { name: "Pet Supplies", subcategories: ["Dog Supplies", "Cat Supplies", "Bird Supplies", "Fish & Aquarium Supplies", "Other Pet Supplies"] },
  { name: "Musical Instruments & Audio Gear", subcategories: ["Guitars", "Keyboards & Pianos", "Drums & Percussion", "Studio Equipment", "Musical Accessories"] },
  { name: "Business & Industrial", subcategories: ["Industrial Tools", "Safety Equipment", "Packaging Supplies", "Commercial Equipment", "Business Supplies"] },
] as const;

export type ProductCategory = (typeof productTaxonomy)[number]["name"];
export const productCategories = productTaxonomy.map(({ name }) => name) as ProductCategory[];
export function getProductSubcategories(category?: ProductCategory) {
  return productTaxonomy.find((item) => item.name === category)?.subcategories ?? [];
}
