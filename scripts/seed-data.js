#!/usr/bin/env node

import pkg from 'pg';
const { Client } = pkg;

// Connect to the database
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Render
});

async function seedData() {
  console.log('Seeding initial data...');
  
  try {
    await client.connect();
    console.log('Connected to database.');
    
    // Insert products
    await client.query(`
      INSERT INTO products (name, category, description, price, image_url, in_stock, featured, rating, review_count)
      VALUES 
        ('Vòng Tay Đá Mặt Trăng', 'jewelry', 'Vòng tay thủ công với đá mặt trăng tự nhiên, mang lại năng lượng và sự bình yên.', '450.000 ₫', '/images/products/moonstone-bracelet.jpg', true, true, '4.8', 24),
        ('Bình Hoa Gốm Tối Giản', 'home_decor', 'Bình hoa gốm tối giản với thiết kế hiện đại, hoàn hảo cho mọi không gian sống.', '550.000 ₫', '/images/products/minimalist-vase.jpg', true, false, '4.5', 18),
        ('Bộ Bát Gốm Thủ Công', 'ceramics', 'Bộ bát gốm thủ công với men tự nhiên, độc đáo và thân thiện với môi trường.', '780.000 ₫', '/images/products/ceramic-bowl-set.jpg', true, true, '4.9', 35),
        ('Khăn Choàng Dệt Thủ Công', 'textiles', 'Khăn choàng dệt thủ công từ sợi cotton hữu cơ, với hoa văn truyền thống.', '680.000 ₫', '/images/products/handwoven-scarf.jpg', true, false, '4.7', 22),
        ('Nhẫn Bạc Mặt Đá Ngọc Lam', 'jewelry', 'Nhẫn bạc 925 với đá ngọc lam tự nhiên, thiết kế tinh tế và độc đáo.', '520.000 ₫', '/images/products/turquoise-ring.jpg', true, true, '4.6', 19),
        ('Đèn Bàn Gốm Nghệ Thuật', 'home_decor', 'Đèn bàn gốm nghệ thuật với ánh sáng ấm áp, tạo không gian thư giãn.', '890.000 ₫', '/images/products/ceramic-lamp.jpg', true, false, '4.4', 15),
        ('Bình Trà Gốm Men Ngọc', 'ceramics', 'Bình trà gốm với men ngọc tự nhiên, hoàn hảo cho những buổi thưởng trà.', '620.000 ₫', '/images/products/celadon-teapot.jpg', true, true, '4.8', 27),
        ('Gối Thêu Tay Hoa Sen', 'textiles', 'Gối thêu tay với hoa văn hoa sen truyền thống, làm từ vải lanh tự nhiên.', '380.000 ₫', '/images/products/embroidered-cushion.jpg', true, false, '4.5', 21)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Products seeded successfully.');

    // Insert workshops
    await client.query(`
      INSERT INTO workshops (title, category, description, price, image_url, date, spots_available)
      VALUES 
        ('Hội Thảo Làm Bát Gốm', 'ceramics', 'Học cách làm bát gốm thủ công từ nghệ nhân gốm với hơn 20 năm kinh nghiệm.', '650.000 ₫', '/images/workshops/pottery-workshop.jpg', '2025-10-15 09:00:00+00', 8),
        ('Khóa Học Làm Trang Sức Bạc', 'jewelry', 'Khám phá nghệ thuật làm trang sức bạc và tạo ra sản phẩm trang sức đầu tiên của bạn.', '750.000 ₫', '/images/workshops/silver-jewelry-workshop.jpg', '2025-10-20 14:00:00+00', 6),
        ('Hội Thảo Dệt Thổ Cẩm', 'textiles', 'Tìm hiểu về các kỹ thuật dệt thổ cẩm truyền thống và tạo ra tác phẩm của riêng bạn.', '580.000 ₫', '/images/workshops/weaving-workshop.jpg', '2025-10-25 10:00:00+00', 10)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Workshops seeded successfully.');

    // Insert some reviews
    await client.query(`
      INSERT INTO reviews (product_id, name, rating, comment, location)
      VALUES 
        (1, 'Nguyễn Minh Tâm', 5, 'Vòng tay thật đẹp, chất lượng tuyệt vời!', 'Hà Nội'),
        (1, 'Trần Thanh Hà', 4, 'Đáng đồng tiền, nhưng đóng gói có thể cải thiện thêm.', 'TP. Hồ Chí Minh'),
        (3, 'Phạm Anh Tuấn', 5, 'Bộ bát gốm hoàn hảo cho bữa ăn gia đình.', 'Đà Nẵng'),
        (3, 'Lê Thị Mai', 5, 'Chất lượng tuyệt vời, tôi rất hài lòng.', 'Cần Thơ'),
        (5, 'Hoàng Văn Nam', 4, 'Nhẫn đẹp nhưng hơi rộng với tôi.', 'Hải Phòng')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Reviews seeded successfully.');

    console.log('All data has been seeded successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedData();