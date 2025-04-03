# Handcraft Store - Cửa hàng đồ thủ công

Ứng dụng web hiện đại cho cửa hàng đồ thủ công với nhiều chức năng:
- Hiển thị sản phẩm đẹp mắt
- Giỏ hàng và thanh toán
- Tìm kiếm và lọc sản phẩm
- Đăng ký hội thảo
- Giao diện tiếng Việt

## Stack kỹ thuật
- Frontend: React, TypeScript, Tailwind CSS, Shadcn/UI
- Backend: Node.js, Express
- Database: PostgreSQL
- ORM: Drizzle

## Hướng dẫn triển khai lên Render

### Bước 1: Tạo tài khoản Render và chuẩn bị
1. Truy cập [Render](https://render.com) và đăng ký tài khoản
2. Kết nối tài khoản GitHub của bạn với Render
3. Đẩy mã nguồn dự án lên GitHub repository

### Bước 2: Từ Render Dashboard
1. Chọn "New" > "Blueprint"
2. Chọn repository chứa mã nguồn dự án
3. Render sẽ tự động phát hiện file `render.yaml` và cấu hình dịch vụ cùng cơ sở dữ liệu

### Hoặc Bước 2 (thủ công): Nếu không dùng Blueprint
1. Tạo PostgreSQL database mới trên Render
   - Đặt tên "handcraft-db"
   - Chọn kế hoạch phù hợp (Free tier cho phát triển)
   - Lưu lại connection string và thông tin kết nối

2. Tạo Web Service mới trên Render
   - Kết nối đến GitHub repository
   - Đặt tên "handcraft-store"
   - Chọn "Node" làm Runtime
   - Cấu hình như sau:
     - Build Command: `./scripts/build.sh`
     - Start Command: `npm start`
     - Biến môi trường:
       - `NODE_ENV`: production
       - `PORT`: 10000
       - `DATABASE_URL`: [Connection string của database đã tạo]

### Bước 3: Kiểm tra và theo dõi
1. Theo dõi quá trình triển khai trong tab "Logs"
2. Kiểm tra xem migrations và seed đã chạy thành công chưa
3. Sau khi triển khai, truy cập vào URL được cung cấp bởi Render để xem trang web đã hoạt động

## Quản lý database
- Migrations sẽ tự động chạy trong quá trình triển khai
- Dữ liệu mẫu cũng được seed tự động
- Bạn có thể kết nối trực tiếp đến database bằng công cụ như pgAdmin hoặc DBeaver sử dụng thông tin kết nối từ Render Dashboard

## Cập nhật ứng dụng
- Mỗi khi bạn đẩy code mới lên GitHub repository, Render sẽ tự động triển khai phiên bản mới
- Tất cả migrations mới sẽ được áp dụng trong quá trình build