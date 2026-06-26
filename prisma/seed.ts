import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Create Admin User ──────────────────────────────────────
  // Password: admin123 (bcrypt hashed)
  const adminPassword = '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu6GK'; // admin123
  
  await prisma.user.upsert({
    where: { email: 'admin@flavoursfood.in' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@flavoursfood.in',
      phone: '+91-7817878595',
      password: adminPassword,
      role: 'admin',
    },
  });
  console.log('✅ Admin user created');

  // ─── Create Categories ──────────────────────────────────────
  const categoriesData = [
    { name: 'Fries & Nachos', slug: 'fries-nachos', order: 1 },
    { name: 'Sandwiches', slug: 'sandwiches', order: 2 },
    { name: 'Combo', slug: 'combo', order: 3 },
    { name: 'Italian Pasta', slug: 'italian-pasta', order: 4 },
    { name: 'The Pizzeria', slug: 'pizzeria', order: 5 },
    { name: 'Chinese Cuisine', slug: 'chinese-cuisine', order: 6 },
    { name: 'Dilli Haat Momo', slug: 'dilli-haat-momo', order: 7 },
    { name: 'PaniPuri', slug: 'panipuri', order: 8 },
    { name: 'Chinese Combo', slug: 'chinese-combo', order: 9 },
    { name: 'Beverages', slug: 'beverages', order: 10 },
    { name: 'Tandoori Menu', slug: 'tandoori-menu', order: 11 },
    { name: 'Indian Main Course', slug: 'indian-main-course', order: 12 },
    { name: 'Misthaan Bhandaar', slug: 'misthaan-bhandaar', order: 13 },
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: cat.order },
      create: cat,
    });
    categories[cat.slug] = created.id;
  }
  console.log('✅ Categories created');

  // ─── Create Menu Items ──────────────────────────────────────
  // Helper: delete all existing menu items first for clean re-seed
  await prisma.menuItem.deleteMany({});

  const menuItems = [
    // 1. Fries & Nachos
    { name: 'French Fries', categoryId: categories['fries-nachos'], prices: '{"Normal":99,"Crinkle":149}', priceLabel: 'Normal/Crinkle', order: 1 },
    { name: 'Peri Peri Fries', categoryId: categories['fries-nachos'], prices: '{"Normal":129,"Crinkle":179}', priceLabel: 'Normal/Crinkle', order: 2 },
    { name: 'Cheesy Fries', categoryId: categories['fries-nachos'], prices: '{"Normal":149,"Crinkle":199}', priceLabel: 'Normal/Crinkle', order: 3 },
    { name: 'Peri Peri Cheesy Fries', categoryId: categories['fries-nachos'], prices: '{"Normal":159,"Crinkle":229}', priceLabel: 'Normal/Crinkle', order: 4 },
    { name: 'Chipotle Fries', categoryId: categories['fries-nachos'], prices: '{"Normal":159,"Crinkle":229}', priceLabel: 'Normal/Crinkle', order: 5 },
    { name: 'Tandoori Fries', categoryId: categories['fries-nachos'], prices: '{"Normal":159,"Crinkle":229}', priceLabel: 'Normal/Crinkle', order: 6 },
    { name: 'Cocktail Fries', categoryId: categories['fries-nachos'], prices: '{"Normal":159,"Crinkle":229}', priceLabel: 'Normal/Crinkle', order: 7 },
    { name: 'Harissa Fries', categoryId: categories['fries-nachos'], prices: '{"Normal":169,"Crinkle":249}', priceLabel: 'Normal/Crinkle', order: 8 },
    // Nachos
    { name: 'Salsa & Cheese Blend Nachos', categoryId: categories['fries-nachos'], subCategory: 'Nachos', prices: '{"Regular":179}', priceLabel: null, order: 9 },
    { name: 'Veggie Loaded Nachos', categoryId: categories['fries-nachos'], subCategory: 'Nachos', prices: '{"Regular":199}', priceLabel: null, order: 10 },
    // Add-On Dips
    { name: 'Cheese Dip', categoryId: categories['fries-nachos'], subCategory: 'Add-On Dips', prices: '{"Regular":20}', priceLabel: null, order: 11 },
    { name: 'Tandoori Dip', categoryId: categories['fries-nachos'], subCategory: 'Add-On Dips', prices: '{"Regular":20}', priceLabel: null, order: 12 },
    { name: 'Chipotle Dip', categoryId: categories['fries-nachos'], subCategory: 'Add-On Dips', prices: '{"Regular":20}', priceLabel: null, order: 13 },
    { name: 'Cocktail Dip', categoryId: categories['fries-nachos'], subCategory: 'Add-On Dips', prices: '{"Regular":20}', priceLabel: null, order: 14 },
    { name: 'Mayo Dip', categoryId: categories['fries-nachos'], subCategory: 'Add-On Dips', prices: '{"Regular":20}', priceLabel: null, order: 15 },
    { name: 'Mint Mayo', categoryId: categories['fries-nachos'], subCategory: 'Add-On Dips', prices: '{"Regular":20}', priceLabel: null, order: 16 },
    { name: 'Harissa Dip', categoryId: categories['fries-nachos'], subCategory: 'Add-On Dips', prices: '{"Regular":20}', priceLabel: null, order: 17 },

    // 2. Sandwiches
    { name: 'Cheesy Mozzarella Sandwich', categoryId: categories['sandwiches'], prices: '{"Regular":179}', priceLabel: null, order: 1 },
    { name: 'Cheese & Corn Paneer Sandwich', categoryId: categories['sandwiches'], prices: '{"Regular":199}', priceLabel: null, order: 2 },
    { name: 'Mix Veggie Paneer Sandwich', categoryId: categories['sandwiches'], prices: '{"Regular":219}', priceLabel: null, order: 3 },
    { name: 'Paneer Tikka Veggie Sandwich', categoryId: categories['sandwiches'], prices: '{"Regular":239}', priceLabel: null, order: 4 },

    // 3. Combo
    { name: 'Loaded Nachos & Harissa Fries & Peri Peri Fries', categoryId: categories['combo'], prices: '{"Regular":299}', priceLabel: null, isFeatured: true, order: 1 },

    // 4. Italian Pasta
    { name: 'Tandoori Paneer Pasta', categoryId: categories['italian-pasta'], prices: '{"Regular":169}', priceLabel: null, order: 1 },
    { name: 'Tomato Twist Red Sauce Pasta', categoryId: categories['italian-pasta'], prices: '{"Regular":169}', priceLabel: null, order: 2 },
    { name: 'Spicy Red Schezwan Pasta', categoryId: categories['italian-pasta'], prices: '{"Regular":169}', priceLabel: null, order: 3 },
    { name: 'Creamy White Sauce Pasta', categoryId: categories['italian-pasta'], prices: '{"Regular":179}', priceLabel: null, isFeatured: true, order: 4 },
    { name: 'Penne McN Cheese Pasta', categoryId: categories['italian-pasta'], prices: '{"Regular":199}', priceLabel: null, order: 5 },
    { name: 'Classic Mushroom Pasta', categoryId: categories['italian-pasta'], prices: '{"Regular":199}', priceLabel: null, order: 6 },
    // Pasta Add-Ons
    { name: 'Paneer Add-On', categoryId: categories['italian-pasta'], subCategory: 'Pasta Add-On', prices: '{"Regular":49}', priceLabel: null, order: 7 },
    { name: 'Mushroom Add-On', categoryId: categories['italian-pasta'], subCategory: 'Pasta Add-On', prices: '{"Regular":69}', priceLabel: null, order: 8 },
    { name: 'Broccoli Add-On', categoryId: categories['italian-pasta'], subCategory: 'Pasta Add-On', prices: '{"Regular":89}', priceLabel: null, order: 9 },
    { name: 'Extra Cheese Add-On', categoryId: categories['italian-pasta'], subCategory: 'Pasta Add-On', prices: '{"Regular":49}', priceLabel: null, order: 10 },

    // 5. The Pizzeria
    // Classic
    { name: 'Margherita', categoryId: categories['pizzeria'], subCategory: 'Classic', prices: '{"M":299,"L":339}', priceLabel: 'M/L', description: 'Classic Cheese Pizza', order: 1 },
    // Favourite
    { name: 'Cheese N Corn', categoryId: categories['pizzeria'], subCategory: 'Favourite', prices: '{"M":379,"L":489}', priceLabel: 'M/L', description: 'Cheese and sweet corn', order: 2 },
    { name: 'Schezwan Margherita', categoryId: categories['pizzeria'], subCategory: 'Favourite', prices: '{"M":379,"L":489}', priceLabel: 'M/L', description: 'With spicy schezwan sauce', order: 3 },
    { name: 'Tandoori Onion', categoryId: categories['pizzeria'], subCategory: 'Favourite', prices: '{"M":379,"L":489}', priceLabel: 'M/L', description: 'Cheese and Onion in tandoori sauce', order: 4 },
    // Delight
    { name: 'Veggie Feast', categoryId: categories['pizzeria'], subCategory: 'Delight', prices: '{"M":449,"L":569}', priceLabel: 'M/L', description: 'Sweet corn, Herbed Onion & Capsicum', order: 5, isFeatured: true },
    { name: 'Spiced Paneer', categoryId: categories['pizzeria'], subCategory: 'Delight', prices: '{"M":449,"L":569}', priceLabel: 'M/L', description: 'Spiced Paneer, Onion & Tomato', order: 6 },
    { name: 'Veggie Tandoori', categoryId: categories['pizzeria'], subCategory: 'Delight', prices: '{"M":449,"L":569}', priceLabel: 'M/L', description: 'Sweet corn, Capsicum & Mushroom in Tandoori Sauce', order: 7 },
    { name: 'Double Cheese', categoryId: categories['pizzeria'], subCategory: 'Delight', prices: '{"M":449,"L":569}', priceLabel: 'M/L', description: 'Extra Cheese on Cheese', order: 8 },
    // Signature
    { name: "Farmer's Pick", categoryId: categories['pizzeria'], subCategory: 'Signature', prices: '{"M":529,"L":669}', priceLabel: 'M/L', description: 'Herbed onion & Green Capsicum, Red Capsicum, Mushroom & Baby Corn', order: 9 },
    { name: 'Country Feast', categoryId: categories['pizzeria'], subCategory: 'Signature', prices: '{"M":529,"L":669}', priceLabel: 'M/L', description: 'Herbed Onion & Green Capsicum, Sweet corn, Tomato & mushroom', order: 10 },
    { name: 'Tandoori Paneer', categoryId: categories['pizzeria'], subCategory: 'Signature', prices: '{"M":529,"L":669}', priceLabel: 'M/L', description: 'Spiced Paneer, Onion, Green Capsicum & Red Peprika in Tandoori Sauce', order: 11, isFeatured: true },
    { name: 'Bold BBQ Veggies', categoryId: categories['pizzeria'], subCategory: 'Signature', prices: '{"M":529,"L":669}', priceLabel: 'M/L', description: 'BBQ Sauce Drizzle Topped With Mushroom, Onion, Green Capsicum & Red Peprika', order: 12 },
    { name: 'Peppy Paneer', categoryId: categories['pizzeria'], subCategory: 'Signature', prices: '{"M":529,"L":669}', priceLabel: 'M/L', description: 'Paneer Onion & Red Peprika', order: 13 },
    { name: 'Mexican Fiesta', categoryId: categories['pizzeria'], subCategory: 'Signature', prices: '{"M":529,"L":669}', priceLabel: 'M/L', description: 'Red & Green Capsicum, Jalapeno, Onion, Black Olives & Sweet Corn', order: 14 },
    // Supreme
    { name: 'Veggie Supreme', categoryId: categories['pizzeria'], subCategory: 'Supreme', prices: '{"M":599,"L":769}', priceLabel: 'M/L', description: 'Onion, Green Capsicum, Mushroom & Red Peprika, Black Olives & Sweet corn', order: 15 },
    { name: 'Ultimate Tandoori Veggie', categoryId: categories['pizzeria'], subCategory: 'Supreme', prices: '{"M":599,"L":769}', priceLabel: 'M/L', description: 'Green Capsicum, Onion, Mushroom, Tomato, Jalapeno, Drizzle of Mint Mayo', order: 16 },
    { name: 'Mazedar Makhni Paneer', categoryId: categories['pizzeria'], subCategory: 'Supreme', prices: '{"M":599,"L":769}', priceLabel: 'M/L', description: 'Spiced Paneer, Onion, Red Capsicum With Makhni Sauce Sprinkle', order: 17 },
    { name: 'Chilli Paneer Blaze', categoryId: categories['pizzeria'], subCategory: 'Supreme', prices: '{"M":599,"L":769}', priceLabel: 'M/L', description: 'Herbed Onion, Paneer, Green Capsicum & Tomato, Green Chilli', order: 18 },

    // 6. Chinese Cuisine
    // Noodles
    { name: 'Veg Noodles', categoryId: categories['chinese-cuisine'], subCategory: 'Noodles', prices: '{"Regular":149}', priceLabel: null, order: 1 },
    { name: 'Veg Butter Noodles', categoryId: categories['chinese-cuisine'], subCategory: 'Noodles', prices: '{"Regular":169}', priceLabel: null, order: 2 },
    { name: 'Hakka Noodles', categoryId: categories['chinese-cuisine'], subCategory: 'Noodles', prices: '{"Regular":199}', priceLabel: null, isFeatured: true, order: 3 },
    { name: 'Paneer Noodles', categoryId: categories['chinese-cuisine'], subCategory: 'Noodles', prices: '{"Regular":239}', priceLabel: null, order: 4 },
    { name: 'Singapore Noodles', categoryId: categories['chinese-cuisine'], subCategory: 'Noodles', prices: '{"Regular":199}', priceLabel: null, order: 5 },
    { name: 'Chilly Garlic Noodles', categoryId: categories['chinese-cuisine'], subCategory: 'Noodles', prices: '{"Regular":199}', priceLabel: null, order: 6 },
    { name: 'Schezwan Noodles', categoryId: categories['chinese-cuisine'], subCategory: 'Noodles', prices: '{"Regular":219}', priceLabel: null, order: 7 },
    // Soups
    { name: 'Tomato Soup', categoryId: categories['chinese-cuisine'], subCategory: 'Soups', prices: '{"Regular":179}', priceLabel: null, order: 8 },
    { name: 'Veg Soup', categoryId: categories['chinese-cuisine'], subCategory: 'Soups', prices: '{"Regular":129}', priceLabel: null, order: 9 },
    { name: 'Veg Noodles Soup', categoryId: categories['chinese-cuisine'], subCategory: 'Soups', prices: '{"Regular":149}', priceLabel: null, order: 10 },
    { name: 'Hot N Sour Soup', categoryId: categories['chinese-cuisine'], subCategory: 'Soups', prices: '{"Regular":169}', priceLabel: null, order: 11 },
    { name: 'Veg Manchow Soup', categoryId: categories['chinese-cuisine'], subCategory: 'Soups', prices: '{"Regular":179}', priceLabel: null, order: 12 },
    { name: 'Sweet Corn Soup', categoryId: categories['chinese-cuisine'], subCategory: 'Soups', prices: '{"Regular":179}', priceLabel: null, order: 13 },
    // Rolls
    { name: 'Veg Cigar Roll', categoryId: categories['chinese-cuisine'], subCategory: 'Rolls', prices: '{"Regular":149}', priceLabel: null, order: 14 },
    { name: 'KFC Cigar Roll', categoryId: categories['chinese-cuisine'], subCategory: 'Rolls', prices: '{"Regular":179}', priceLabel: null, order: 15 },
    // 65 Items
    { name: 'Paneer 65', categoryId: categories['chinese-cuisine'], subCategory: '65 Items', prices: '{"Regular":219}', priceLabel: null, order: 16 },
    { name: 'Veg 65', categoryId: categories['chinese-cuisine'], subCategory: '65 Items', prices: '{"Regular":179}', priceLabel: null, order: 17 },
    { name: 'Mushroom 65', categoryId: categories['chinese-cuisine'], subCategory: '65 Items', prices: '{"Regular":279}', priceLabel: null, order: 18 },
    { name: 'Crispy Corn', categoryId: categories['chinese-cuisine'], subCategory: '65 Items', prices: '{"Regular":239}', priceLabel: null, order: 19 },
    // Chilly Items
    { name: 'Chilly Potato', categoryId: categories['chinese-cuisine'], subCategory: 'Chilly Items', prices: '{"Dry":149,"Gravy":149}', priceLabel: 'Dry/Gravy', order: 20 },
    { name: 'Chilly Paneer', categoryId: categories['chinese-cuisine'], subCategory: 'Chilly Items', prices: '{"Dry":249,"Gravy":279}', priceLabel: 'Dry/Gravy', isFeatured: true, order: 21 },
    { name: 'Chilly Mushroom', categoryId: categories['chinese-cuisine'], subCategory: 'Chilly Items', prices: '{"Dry":289,"Gravy":309}', priceLabel: 'Dry/Gravy', order: 22 },
    { name: 'Veg Manchurian', categoryId: categories['chinese-cuisine'], subCategory: 'Chilly Items', prices: '{"Dry":199,"Gravy":219}', priceLabel: 'Dry/Gravy', order: 23 },
    { name: 'Veg Manchurian Schezwan', categoryId: categories['chinese-cuisine'], subCategory: 'Chilly Items', prices: '{"Regular":239}', priceLabel: null, order: 24 },
    // Fried Rice
    { name: 'Veg Fried Rice', categoryId: categories['chinese-cuisine'], subCategory: 'Fried Rice', prices: '{"Regular":149}', priceLabel: null, order: 25 },
    { name: 'Butter Fried Rice', categoryId: categories['chinese-cuisine'], subCategory: 'Fried Rice', prices: '{"Regular":169}', priceLabel: null, order: 26 },
    { name: 'Chilly Garlic Fried Rice', categoryId: categories['chinese-cuisine'], subCategory: 'Fried Rice', prices: '{"Regular":199}', priceLabel: null, order: 27 },
    { name: 'Singapore Fried Rice', categoryId: categories['chinese-cuisine'], subCategory: 'Fried Rice', prices: '{"Regular":239}', priceLabel: null, order: 28 },
    { name: 'Hakka Fried Rice', categoryId: categories['chinese-cuisine'], subCategory: 'Fried Rice', prices: '{"Regular":239}', priceLabel: null, order: 29 },
    { name: 'Paneer Fried Rice', categoryId: categories['chinese-cuisine'], subCategory: 'Fried Rice', prices: '{"Regular":259}', priceLabel: null, order: 30 },
    { name: 'Paneer Schezwan Fried Rice', categoryId: categories['chinese-cuisine'], subCategory: 'Fried Rice', prices: '{"Regular":279}', priceLabel: null, order: 31 },

    // 7. Dilli Haat Momo
    { name: 'Steam Momos', categoryId: categories['dilli-haat-momo'], prices: '{"Veg":139,"Paneer":159}', priceLabel: 'Veg/Paneer', order: 1 },
    { name: 'Fried Momos', categoryId: categories['dilli-haat-momo'], prices: '{"Veg":149,"Paneer":169,"Cheese & Corn":229}', priceLabel: 'Veg/Paneer/C&C', order: 2 },
    { name: 'Dragon Momos', categoryId: categories['dilli-haat-momo'], prices: '{"Veg":209,"Paneer":229}', priceLabel: 'Veg/Paneer', order: 3 },
    { name: 'Schezwan Gravy Momos', categoryId: categories['dilli-haat-momo'], prices: '{"Veg":229,"Paneer":249}', priceLabel: 'Veg/Paneer', order: 4 },
    { name: 'KFC Momos', categoryId: categories['dilli-haat-momo'], prices: '{"Veg":249,"Paneer":269,"Cheese & Corn":259}', priceLabel: 'Veg/Paneer/C&C', isFeatured: true, order: 5 },
    { name: 'Peri Peri KFC Momos', categoryId: categories['dilli-haat-momo'], prices: '{"Veg":259,"Paneer":269,"Cheese & Corn":269}', priceLabel: 'Veg/Paneer/C&C', order: 6 },
    { name: 'Tandoori Momos', categoryId: categories['dilli-haat-momo'], prices: '{"Veg":249,"Paneer":269,"Cheese & Corn":269}', priceLabel: 'Veg/Paneer/C&C', order: 7 },
    { name: 'Afgani Momos', categoryId: categories['dilli-haat-momo'], prices: '{"Veg":249,"Paneer":269,"Cheese & Corn":269}', priceLabel: 'Veg/Paneer/C&C', order: 8 },
    // Momo Combos
    { name: 'Fried Combo', categoryId: categories['dilli-haat-momo'], subCategory: 'Momo Combo', prices: '{"Regular":199}', priceLabel: null, description: 'Veg + Paneer + Cheese N Corn, 9 pcs', order: 9 },
    { name: 'KFC Combo', categoryId: categories['dilli-haat-momo'], subCategory: 'Momo Combo', prices: '{"Regular":299}', priceLabel: null, description: 'Veg + Paneer + Cheese N Corn, 9 pcs', order: 10 },

    // 8. PaniPuri
    { name: 'Indian Mexican PaniPuri', categoryId: categories['panipuri'], prices: '{"Regular":179}', priceLabel: null, order: 1 },
    { name: 'Cheese PaniPuri Shot', categoryId: categories['panipuri'], prices: '{"Regular":149}', priceLabel: null, order: 2 },
    { name: 'Pizzeria PaniPuri', categoryId: categories['panipuri'], prices: '{"Regular":199}', priceLabel: null, order: 3 },
    { name: 'Trio Combo', categoryId: categories['panipuri'], prices: '{"Regular":249}', priceLabel: null, description: 'Indian Mexican, Cheese PaniPuri Shot, Pizzeria PaniPuri', isFeatured: true, order: 4 },

    // 9. Chinese Combo
    { name: 'Veg Noodles Manchurian Combo', categoryId: categories['chinese-combo'], prices: '{"Regular":299}', priceLabel: null, order: 1 },
    { name: 'Veg Noodles Chilly Paneer Combo', categoryId: categories['chinese-combo'], prices: '{"Regular":369}', priceLabel: null, order: 2 },
    { name: 'Veg Fried Rice Manchurian Combo', categoryId: categories['chinese-combo'], prices: '{"Regular":299}', priceLabel: null, order: 3 },
    { name: 'Veg Fried Rice Chilly Paneer Combo', categoryId: categories['chinese-combo'], prices: '{"Regular":369}', priceLabel: null, order: 4 },

    // 10. Beverages
    // Hot Coffee
    { name: 'Hot Black Coffee', categoryId: categories['beverages'], subCategory: 'Hot Coffee', prices: '{"Regular":59}', priceLabel: null, order: 1 },
    { name: 'Hot Vanilla Coffee', categoryId: categories['beverages'], subCategory: 'Hot Coffee', prices: '{"Regular":79}', priceLabel: null, order: 2 },
    { name: 'Hot Butterscotch Coffee', categoryId: categories['beverages'], subCategory: 'Hot Coffee', prices: '{"Regular":79}', priceLabel: null, order: 3 },
    { name: 'Hot Hazelnut Coffee', categoryId: categories['beverages'], subCategory: 'Hot Coffee', prices: '{"Regular":79}', priceLabel: null, order: 4 },
    { name: 'Hot Coffee & Cream', categoryId: categories['beverages'], subCategory: 'Hot Coffee', prices: '{"Regular":129}', priceLabel: null, order: 5 },
    { name: 'Hot Mocha Float', categoryId: categories['beverages'], subCategory: 'Hot Coffee', prices: '{"Regular":129}', priceLabel: null, order: 6 },
    { name: 'Hot Chocolate', categoryId: categories['beverages'], subCategory: 'Hot Coffee', prices: '{"Regular":139}', priceLabel: null, order: 7 },
    // Cold Coffee
    { name: 'Cold Coffee Blast', categoryId: categories['beverages'], subCategory: 'Cold Coffee', prices: '{"Regular":149}', priceLabel: null, order: 8 },
    { name: 'Cold Coffee Mocha', categoryId: categories['beverages'], subCategory: 'Cold Coffee', prices: '{"Regular":169}', priceLabel: null, order: 9 },
    { name: 'Cold Coffee Irish', categoryId: categories['beverages'], subCategory: 'Cold Coffee', prices: '{"Regular":169}', priceLabel: null, order: 10 },
    { name: 'Cold Nutella Blast', categoryId: categories['beverages'], subCategory: 'Cold Coffee', prices: '{"Regular":199}', priceLabel: null, isFeatured: true, order: 11 },
    // Mocktails
    { name: 'Virgin Mojito', categoryId: categories['beverages'], subCategory: 'Mocktails', prices: '{"Regular":149}', priceLabel: null, isFeatured: true, order: 12 },
    { name: 'Virgin Appletini', categoryId: categories['beverages'], subCategory: 'Mocktails', prices: '{"Regular":149}', priceLabel: null, order: 13 },
    { name: 'Blue Ocean', categoryId: categories['beverages'], subCategory: 'Mocktails', prices: '{"Regular":149}', priceLabel: null, order: 14 },
    { name: 'Zeasty Heatwave', categoryId: categories['beverages'], subCategory: 'Mocktails', prices: '{"Regular":149}', priceLabel: null, order: 15 },
    { name: 'Peachy Bliss', categoryId: categories['beverages'], subCategory: 'Mocktails', prices: '{"Regular":149}', priceLabel: null, order: 16 },
    { name: 'Ruby Sunset', categoryId: categories['beverages'], subCategory: 'Mocktails', prices: '{"Regular":149}', priceLabel: null, order: 17 },
    { name: 'Midnight Magic', categoryId: categories['beverages'], subCategory: 'Mocktails', prices: '{"Regular":169}', priceLabel: null, order: 18 },
    { name: 'Fiery Mango Tango', categoryId: categories['beverages'], subCategory: 'Mocktails', prices: '{"Regular":169}', priceLabel: null, order: 19 },
    { name: 'Tropical Breeze', categoryId: categories['beverages'], subCategory: 'Mocktails', prices: '{"Regular":169}', priceLabel: null, order: 20 },
    { name: 'Guava Inferno', categoryId: categories['beverages'], subCategory: 'Mocktails', prices: '{"Regular":169}', priceLabel: null, order: 21 },
    { name: 'Melon Burst', categoryId: categories['beverages'], subCategory: 'Mocktails', prices: '{"Regular":169}', priceLabel: null, order: 22 },
    // Tea
    { name: 'Ginger Tea', categoryId: categories['beverages'], subCategory: 'Tea', prices: '{"Regular":39}', priceLabel: null, order: 23 },
    { name: 'Elaichi Tea', categoryId: categories['beverages'], subCategory: 'Tea', prices: '{"Regular":39}', priceLabel: null, order: 24 },
    { name: 'Masala Tea', categoryId: categories['beverages'], subCategory: 'Tea', prices: '{"Regular":49}', priceLabel: null, order: 25 },
    // Shakes
    { name: 'Vanilla Shake', categoryId: categories['beverages'], subCategory: 'Shakes', prices: '{"Regular":149}', priceLabel: null, order: 26 },
    { name: 'Strawberry Shake', categoryId: categories['beverages'], subCategory: 'Shakes', prices: '{"Regular":149}', priceLabel: null, order: 27 },
    { name: 'Chocolate Shake', categoryId: categories['beverages'], subCategory: 'Shakes', prices: '{"Regular":169}', priceLabel: null, order: 28 },
    { name: 'Butterscotch Shake', categoryId: categories['beverages'], subCategory: 'Shakes', prices: '{"Regular":169}', priceLabel: null, order: 29 },
    { name: 'Oreo Shake', categoryId: categories['beverages'], subCategory: 'Shakes', prices: '{"Regular":189}', priceLabel: null, isFeatured: true, order: 30 },
    { name: 'KitKat Shake', categoryId: categories['beverages'], subCategory: 'Shakes', prices: '{"Regular":189}', priceLabel: null, order: 31 },
    { name: 'Brownie Blaze Shake', categoryId: categories['beverages'], subCategory: 'Shakes', prices: '{"Regular":219}', priceLabel: null, order: 32 },
    // Others
    { name: 'Cold Drink Cans', categoryId: categories['beverages'], subCategory: 'Others', prices: '{"Regular":40}', priceLabel: null, description: 'MRP', order: 33 },
    { name: 'Red Bull', categoryId: categories['beverages'], subCategory: 'Others', prices: '{"Regular":125}', priceLabel: null, description: 'MRP', order: 34 },
    { name: 'CoolBerg', categoryId: categories['beverages'], subCategory: 'Others', prices: '{"Regular":80}', priceLabel: null, description: 'MRP', order: 35 },
    { name: 'Ice Cubes', categoryId: categories['beverages'], subCategory: 'Others', prices: '{"Regular":39}', priceLabel: null, order: 36 },
    { name: 'Sweet Lassi', categoryId: categories['beverages'], subCategory: 'Others', prices: '{"Regular":79}', priceLabel: null, order: 37 },
    { name: 'Lemon Soda', categoryId: categories['beverages'], subCategory: 'Others', prices: '{"Regular":99}', priceLabel: null, order: 38 },

    // 11. Tandoori Menu
    // Tikka's
    { name: 'Cheese Stuff Paneer Tikka', categoryId: categories['tandoori-menu'], subCategory: "Tikka's", prices: '{"Regular":379}', priceLabel: null, isFeatured: true, order: 1 },
    { name: 'Tandoori Paneer Tikka', categoryId: categories['tandoori-menu'], subCategory: "Tikka's", prices: '{"Regular":319}', priceLabel: null, order: 2 },
    { name: 'Malai Paneer Tikka', categoryId: categories['tandoori-menu'], subCategory: "Tikka's", prices: '{"Regular":349}', priceLabel: null, order: 3 },
    { name: 'Haryali Paneer Tikka', categoryId: categories['tandoori-menu'], subCategory: "Tikka's", prices: '{"Regular":329}', priceLabel: null, order: 4 },
    { name: 'Mushroom Tikka', categoryId: categories['tandoori-menu'], subCategory: "Tikka's", prices: '{"Regular":319}', priceLabel: null, order: 5 },
    { name: 'Mushroom Malai Tikka', categoryId: categories['tandoori-menu'], subCategory: "Tikka's", prices: '{"Regular":349}', priceLabel: null, order: 6 },
    { name: 'Malai Broccoli', categoryId: categories['tandoori-menu'], subCategory: "Tikka's", prices: '{"Regular":420}', priceLabel: null, order: 7 },
    // Chaap
    { name: 'Malai Chaap', categoryId: categories['tandoori-menu'], subCategory: 'Chaap', prices: '{"Regular":299}', priceLabel: null, order: 8 },
    { name: 'Afgani Chaap', categoryId: categories['tandoori-menu'], subCategory: 'Chaap', prices: '{"Regular":299}', priceLabel: null, order: 9 },
    { name: 'Masala Chaap', categoryId: categories['tandoori-menu'], subCategory: 'Chaap', prices: '{"Regular":299}', priceLabel: null, order: 10 },
    { name: 'Punjabi Chaap', categoryId: categories['tandoori-menu'], subCategory: 'Chaap', prices: '{"Regular":299}', priceLabel: null, order: 11 },
    // Kabab
    { name: 'Veg Seekh Kabab', categoryId: categories['tandoori-menu'], subCategory: 'Kabab', prices: '{"Regular":279}', priceLabel: null, order: 12 },
    { name: 'Hara Bhara Kabab', categoryId: categories['tandoori-menu'], subCategory: 'Kabab', prices: '{"Regular":349}', priceLabel: null, order: 13 },
    { name: 'Veg Lollipop', categoryId: categories['tandoori-menu'], subCategory: 'Kabab', prices: '{"Regular":249}', priceLabel: null, order: 14 },
    // Platters
    { name: 'Paneer Trio Platter', categoryId: categories['tandoori-menu'], subCategory: 'Platters', prices: '{"Regular":649}', priceLabel: null, description: 'Cheese Stuff Paneer Tikka, Tandoori Paneer Tikka, Malai Paneer Tikka', isFeatured: true, order: 15 },
    { name: 'Chaap Trio Platter', categoryId: categories['tandoori-menu'], subCategory: 'Platters', prices: '{"Regular":349}', priceLabel: null, description: 'Malai Chaap, Veg Lollipop, Punjabi Chaap', order: 16 },
    // Bread's
    { name: 'Rumali Roti', categoryId: categories['tandoori-menu'], subCategory: "Bread's", prices: '{"Regular":20}', priceLabel: null, description: 'Per pc', order: 17 },
    { name: 'Tandoori Roti', categoryId: categories['tandoori-menu'], subCategory: "Bread's", prices: '{"Regular":20}', priceLabel: null, description: 'Per pc', order: 18 },
    { name: 'Butter Rumali Roti', categoryId: categories['tandoori-menu'], subCategory: "Bread's", prices: '{"Regular":25}', priceLabel: null, description: 'Per pc', order: 19 },
    { name: 'Butter Tandoori Roti', categoryId: categories['tandoori-menu'], subCategory: "Bread's", prices: '{"Regular":25}', priceLabel: null, description: 'Per pc', order: 20 },
    { name: 'Missi Roti', categoryId: categories['tandoori-menu'], subCategory: "Bread's", prices: '{"Regular":49}', priceLabel: null, description: 'Per pc', order: 21 },
    // Naan
    { name: 'Plain Naan', categoryId: categories['tandoori-menu'], subCategory: 'Naan', prices: '{"Regular":45}', priceLabel: null, description: 'Per pc', order: 22 },
    { name: 'Butter Naan', categoryId: categories['tandoori-menu'], subCategory: 'Naan', prices: '{"Regular":49}', priceLabel: null, description: 'Per pc', order: 23 },
    { name: 'Garlic Naan', categoryId: categories['tandoori-menu'], subCategory: 'Naan', prices: '{"Regular":59}', priceLabel: null, description: 'Per pc', order: 24 },
    { name: 'Paneer Naan', categoryId: categories['tandoori-menu'], subCategory: 'Naan', prices: '{"Regular":89}', priceLabel: null, description: 'Per pc', order: 25 },
    { name: 'Stuff Naan', categoryId: categories['tandoori-menu'], subCategory: 'Naan', prices: '{"Regular":79}', priceLabel: null, description: 'Per pc', order: 26 },
    // Parantha
    { name: 'Laccha Parantha', categoryId: categories['tandoori-menu'], subCategory: 'Parantha', prices: '{"Regular":55}', priceLabel: null, description: 'Per pc', order: 27 },
    { name: 'Masala Laccha Parantha', categoryId: categories['tandoori-menu'], subCategory: 'Parantha', prices: '{"Regular":59}', priceLabel: null, description: 'Per pc', order: 28 },

    // 12. Indian Main Course
    // Veg
    { name: 'Mix Veg', categoryId: categories['indian-main-course'], subCategory: 'Veg', prices: '{"H":279,"F":339}', priceLabel: 'H/F', order: 1 },
    { name: 'Kashmiri Dum Aloo', categoryId: categories['indian-main-course'], subCategory: 'Veg', prices: '{"Regular":299}', priceLabel: null, order: 2 },
    { name: 'Matar Mushroom', categoryId: categories['indian-main-course'], subCategory: 'Veg', prices: '{"H":279,"F":359}', priceLabel: 'H/F', order: 3 },
    { name: 'Creamy Mushroom', categoryId: categories['indian-main-course'], subCategory: 'Veg', prices: '{"Regular":349}', priceLabel: null, order: 4 },
    { name: 'Aloo Jeera', categoryId: categories['indian-main-course'], subCategory: 'Veg', prices: '{"Regular":199}', priceLabel: null, order: 5 },
    // Chaap
    { name: 'Masala Chaap', categoryId: categories['indian-main-course'], subCategory: 'Chaap', prices: '{"H":240,"F":399}', priceLabel: 'H/F', order: 6 },
    { name: 'Kadhai Chaap', categoryId: categories['indian-main-course'], subCategory: 'Chaap', prices: '{"H":249,"F":399}', priceLabel: 'H/F', order: 7 },
    { name: 'Tawa Chaap', categoryId: categories['indian-main-course'], subCategory: 'Chaap', prices: '{"H":249,"F":399}', priceLabel: 'H/F', order: 8 },
    { name: 'Butter Chicken Chaap', categoryId: categories['indian-main-course'], subCategory: 'Chaap', prices: '{"H":279,"F":359}', priceLabel: 'H/F', description: 'Veg-style', isFeatured: true, order: 9 },
    // Paneer
    { name: 'Shahi Paneer', categoryId: categories['indian-main-course'], subCategory: 'Paneer', prices: '{"H":229,"F":299}', priceLabel: 'H/F', order: 10 },
    { name: 'Handi Paneer', categoryId: categories['indian-main-course'], subCategory: 'Paneer', prices: '{"H":249,"F":339}', priceLabel: 'H/F', order: 11 },
    { name: 'Kadhai Paneer', categoryId: categories['indian-main-course'], subCategory: 'Paneer', prices: '{"H":249,"F":339}', priceLabel: 'H/F', isFeatured: true, order: 12 },
    { name: 'Paneer Lababdar', categoryId: categories['indian-main-course'], subCategory: 'Paneer', prices: '{"H":269,"F":349}', priceLabel: 'H/F', order: 13 },
    { name: 'Paneer Butter Masala', categoryId: categories['indian-main-course'], subCategory: 'Paneer', prices: '{"H":249,"F":339}', priceLabel: 'H/F', isFeatured: true, order: 14 },
    { name: 'Paneer Changezi', categoryId: categories['indian-main-course'], subCategory: 'Paneer', prices: '{"H":299,"F":349}', priceLabel: 'H/F', order: 15 },
    // Raita
    { name: 'Plain Curd', categoryId: categories['indian-main-course'], subCategory: 'Raita', prices: '{"Regular":99}', priceLabel: null, order: 16 },
    { name: 'Boondi Raita', categoryId: categories['indian-main-course'], subCategory: 'Raita', prices: '{"Regular":129}', priceLabel: null, order: 17 },
    { name: 'Cucumber Raita', categoryId: categories['indian-main-course'], subCategory: 'Raita', prices: '{"Regular":149}', priceLabel: null, order: 18 },
    { name: 'Mix Veg Raita', categoryId: categories['indian-main-course'], subCategory: 'Raita', prices: '{"Regular":169}', priceLabel: null, order: 19 },
    // Salad
    { name: 'Green Salad', categoryId: categories['indian-main-course'], subCategory: 'Salad', prices: '{"Regular":129}', priceLabel: null, order: 20 },
    { name: 'Cucumber Salad', categoryId: categories['indian-main-course'], subCategory: 'Salad', prices: '{"Regular":89}', priceLabel: null, order: 21 },
    { name: 'Onion Salad', categoryId: categories['indian-main-course'], subCategory: 'Salad', prices: '{"Regular":69}', priceLabel: null, order: 22 },
    // Rice
    { name: 'Steam Rice', categoryId: categories['indian-main-course'], subCategory: 'Rice', prices: '{"Regular":149}', priceLabel: null, order: 23 },
    { name: 'Jeera Rice', categoryId: categories['indian-main-course'], subCategory: 'Rice', prices: '{"Regular":179}', priceLabel: null, order: 24 },
    { name: 'Veg Biryani', categoryId: categories['indian-main-course'], subCategory: 'Rice', prices: '{"Regular":249}', priceLabel: null, isFeatured: true, order: 25 },
    // Dal
    { name: 'Dal Makhni', categoryId: categories['indian-main-course'], subCategory: 'Dal', prices: '{"H":199,"F":259}', priceLabel: 'H/F', order: 26 },
    { name: 'Dal Tadka', categoryId: categories['indian-main-course'], subCategory: 'Dal', prices: '{"H":179,"F":249}', priceLabel: 'H/F', order: 27 },
    { name: 'Dal Handi', categoryId: categories['indian-main-course'], subCategory: 'Dal', prices: '{"H":219,"F":319}', priceLabel: 'H/F', order: 28 },
    // Special Platter
    { name: "Flavour's Special Platter", categoryId: categories['indian-main-course'], subCategory: 'Special Platter', prices: '{"Regular":849}', priceLabel: null, description: 'Mushroom Malai Tikka, Malai Broccoli, Cheese Stuff Paneer Tikka, Hara Bhara Kabab', isFeatured: true, order: 29 },

    // 13. Misthaan Bhandaar (Desserts)
    // Desserts
    { name: 'Gulaab Jamun', categoryId: categories['misthaan-bhandaar'], subCategory: 'Desserts', prices: '{"Regular":39}', priceLabel: null, order: 1 },
    { name: 'Brownie Fudge', categoryId: categories['misthaan-bhandaar'], subCategory: 'Desserts', prices: '{"Regular":119}', priceLabel: null, order: 2 },
    { name: 'Brownie Ice-Cream Fudge', categoryId: categories['misthaan-bhandaar'], subCategory: 'Desserts', prices: '{"Regular":179}', priceLabel: null, isFeatured: true, order: 3 },
    { name: 'Melting Jamun Fantasy', categoryId: categories['misthaan-bhandaar'], subCategory: 'Desserts', prices: '{"Regular":99}', priceLabel: null, order: 4 },
    { name: 'Rajasthani Sweet Toast', categoryId: categories['misthaan-bhandaar'], subCategory: 'Desserts', prices: '{"Regular":79}', priceLabel: null, order: 5 },
    { name: 'Gajar Halwa', categoryId: categories['misthaan-bhandaar'], subCategory: 'Desserts', prices: '{"Regular":149}', priceLabel: null, description: 'Seasonal', order: 6 },
    { name: 'Choco Lava', categoryId: categories['misthaan-bhandaar'], subCategory: 'Desserts', prices: '{"Regular":99}', priceLabel: null, isFeatured: true, order: 7 },
    // Ice Cream scoops
    { name: 'Vanilla Ice Cream', categoryId: categories['misthaan-bhandaar'], subCategory: 'Ice Cream', prices: '{"Regular":59}', priceLabel: null, order: 8 },
    { name: 'Strawberry Ice Cream', categoryId: categories['misthaan-bhandaar'], subCategory: 'Ice Cream', prices: '{"Regular":59}', priceLabel: null, order: 9 },
    { name: 'Chocolate Ice Cream', categoryId: categories['misthaan-bhandaar'], subCategory: 'Ice Cream', prices: '{"Regular":79}', priceLabel: null, order: 10 },
    { name: 'Butterscotch Ice Cream', categoryId: categories['misthaan-bhandaar'], subCategory: 'Ice Cream', prices: '{"Regular":79}', priceLabel: null, order: 11 },
    { name: 'Kit-Kat Ice Cream', categoryId: categories['misthaan-bhandaar'], subCategory: 'Ice Cream', prices: '{"Regular":99}', priceLabel: null, order: 12 },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item });
  }
  console.log(`✅ ${menuItems.length} menu items created`);

  // ─── Create Testimonials ────────────────────────────────────
  await prisma.testimonial.deleteMany({});
  const testimonials = [
    { name: 'Rahul Sharma', rating: 5, comment: 'Amazing food! The Tandoori Paneer Pizza is out of this world. Will definitely order again.', order: 1 },
    { name: 'Priya Verma', rating: 5, comment: 'Best momos in Muradnagar! The KFC Momos are a must-try. Great ambiance too.', order: 2 },
    { name: 'Ankit Gupta', rating: 4, comment: 'Love the variety on the menu. The Chilly Paneer and Hakka Noodles combo is perfect.', order: 3 },
    { name: 'Sneha Singh', rating: 5, comment: 'Hosted my birthday party here — everything was perfect! The staff is so friendly and the food is delicious.', order: 4 },
    { name: 'Vikram Patel', rating: 4, comment: 'The Flavour\'s Special Platter is worth every rupee. Great place for family dining.', order: 5 },
    { name: 'Neha Agarwal', rating: 5, comment: 'Creamy White Sauce Pasta and Cold Nutella Blast — my go-to comfort meal. Love this place!', order: 6 },
  ];
  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t });
  }
  console.log('✅ Testimonials created');

  // ─── Create Gallery Placeholders ────────────────────────────
  await prisma.galleryImage.deleteMany({});
  const gallery = [
    { title: 'Warm Interior', image: '/images/gallery/placeholder-1.jpg', category: 'interior', order: 1 },
    { title: 'Booth Seating', image: '/images/gallery/placeholder-2.jpg', category: 'interior', order: 2 },
    { title: 'Bar Counter', image: '/images/gallery/placeholder-3.jpg', category: 'interior', order: 3 },
    { title: 'Dining Area', image: '/images/gallery/placeholder-4.jpg', category: 'interior', order: 4 },
    { title: 'Chef Special', image: '/images/gallery/placeholder-5.jpg', category: 'food', order: 5 },
    { title: 'Pizza Making', image: '/images/gallery/placeholder-6.jpg', category: 'food', order: 6 },
    { title: 'Party Setup', image: '/images/gallery/placeholder-7.jpg', category: 'events', order: 7 },
    { title: 'Celebration', image: '/images/gallery/placeholder-8.jpg', category: 'events', order: 8 },
  ];
  for (const g of gallery) {
    await prisma.galleryImage.create({ data: g });
  }
  console.log('✅ Gallery images created');

  // ─── Create Banners ─────────────────────────────────────────
  await prisma.banner.deleteMany({});
  const banners = [
    { title: "We're available for all parties & celebrations!", subtitle: 'Book your event with Flavours Food', image: '/images/banners/party-banner.jpg', order: 1, isActive: true },
    { title: 'Unlimited choice under one roof', subtitle: 'From Fries to Tandoori — we have it all!', image: '/images/banners/variety-banner.jpg', order: 2, isActive: true },
    { title: 'Happiness is Flavours', subtitle: 'Crafted with love, served with a smile', image: '/images/banners/happiness-banner.jpg', order: 3, isActive: true },
  ];
  for (const b of banners) {
    await prisma.banner.create({ data: b });
  }
  console.log('✅ Banners created');

  // ─── Create Sample Coupons ──────────────────────────────────
  await prisma.coupon.deleteMany({});
  const coupons = [
    { code: 'WELCOME10', type: 'percentage', value: 10, minOrder: 300, maxDiscount: 100, usageLimit: 100, isActive: true },
    { code: 'FLAT50', type: 'flat', value: 50, minOrder: 250, usageLimit: 50, isActive: true },
    { code: 'FLAVOUR20', type: 'percentage', value: 20, minOrder: 500, maxDiscount: 200, usageLimit: 30, isActive: true },
  ];
  for (const c of coupons) {
    await prisma.coupon.create({ data: c });
  }
  console.log('✅ Coupons created');

  // ─── Create Site Settings ───────────────────────────────────
  await prisma.siteSetting.deleteMany({});
  const settings = [
    { key: 'restaurant_name', value: 'Flavours Food' },
    { key: 'tagline', value: 'Unlimited choice under one roof' },
    { key: 'phone', value: '+91-7817878595' },
    { key: 'email', value: 'flavoursfood2023@gmail.com' },
    { key: 'address', value: 'Pillar No. 834, Ground Floor, Near IGL CNG Pump, AsalatNagar, Muradnagar, Uttar Pradesh' },
    { key: 'opening_hours', value: '11:00 AM – 10:00 PM (Daily)' },
    { key: 'instagram', value: 'https://instagram.com/flavours.food.byakshay' },
    { key: 'whatsapp', value: '+91-7817878595' },
    { key: 'party_note', value: "We're available for all parties & celebrations" },
  ];
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log('✅ Site settings created');

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
