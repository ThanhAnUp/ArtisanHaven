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

## Hướng dẫn triển khai lên Render (Phiên bản miễn phí)

### Lưu ý về Render phiên bản miễn phí
- Dịch vụ web miễn phí của Render sẽ tự động sleep sau 15 phút không hoạt động
- Khi có request mới, dịch vụ sẽ mất khoảng 30 giây để "thức dậy"
- Database miễn phí có giới hạn 256MB dung lượng lưu trữ
- Dữ liệu trong database miễn phí sẽ bị xóa sau 90 ngày

### Bước 1: Tạo tài khoản Render và chuẩn bị
1. Truy cập [Render](https://render.com) và đăng ký tài khoản
2. Kết nối tài khoản GitHub của bạn với Render
3. Đẩy mã nguồn dự án lên GitHub repository

### Bước 2: Triển khai thủ công trên Render (không yêu cầu phương thức thanh toán)
1. Tạo PostgreSQL database mới trên Render
   - Từ Dashboard, chọn "New" > "PostgreSQL"
   - Đặt tên "handcraft-db"
   - Chọn "Free" plan (không yêu cầu thẻ tín dụng)
   - Chọn region gần vị trí của bạn nhất
   - Nhấn "Create Database"
   - Sau khi tạo, lưu lại thông tin kết nối:
     - Internal Database URL (kết nối từ Render)
     - Hostname
     - Port
     - Username
     - Password
     - Database

2. Tạo Web Service mới trên Render
   - Từ Dashboard, chọn "New" > "Web Service"
   - Kết nối GitHub repository
   - Chọn repository chứa mã nguồn dự án
   - Đặt tên "handcraft-store"
   - Chọn "Node" làm Runtime
   - Chọn "Free" plan (không yêu cầu thẻ tín dụng)
   - Cấu hình như sau:
     - Build Command: `./scripts/build.sh`
     - Start Command: `npm start`
   - Trong phần "Environment", thêm các biến môi trường:
     - `NODE_ENV`: production
     - `PORT`: 10000
     - `DATABASE_URL`: (dán Internal Database URL từ bước tạo database ở trên)
   - Nhấn "Create Web Service"

### Bước 3: Kiểm tra và theo dõi quá trình triển khai
1. Sau khi tạo Web Service, Render sẽ tự động bắt đầu quá trình triển khai
2. Theo dõi quá trình triển khai trong tab "Logs":
   - Bạn sẽ thấy quá trình cài đặt dependencies: `npm install`
   - Tiếp theo là quá trình build: `npm run build`
   - Sau đó là quá trình chạy migrations: `node scripts/run-migrations.js`
   - Cuối cùng là quá trình seed data: `node scripts/seed-data.js`
3. Kiểm tra xem có lỗi nào trong quá trình triển khai không:
   - Nếu có lỗi, hãy xem xét log để tìm nguyên nhân
   - Các lỗi thường gặp: thiếu quyền thực thi cho scripts, lỗi kết nối database, lỗi trong migrations
4. Sau khi triển khai thành công:
   - Render sẽ cung cấp một URL cho ứng dụng của bạn (dạng: handcraft-store.onrender.com)
   - Truy cập URL này để kiểm tra xem trang web đã hoạt động chưa
   - Đăng nhập và thử các chức năng cơ bản để đảm bảo mọi thứ hoạt động bình thường

## Quản lý database

### Truy cập và quản lý database
- Render cung cấp một giao diện trực quan để quản lý database của bạn
- Từ Dashboard, chọn vào database "handcraft-db" để xem thông tin chi tiết
- Trong tab "Info", bạn sẽ thấy tất cả thông tin kết nối:
  - Host, Port, Database name
  - Username, Password
  - External Database URL (kết nối từ máy tính của bạn)
  - Internal Database URL (kết nối từ các dịch vụ khác trên Render)

### Kết nối với database từ máy tính của bạn
1. Cài đặt một công cụ quản lý PostgreSQL như [pgAdmin](https://www.pgadmin.org/) hoặc [DBeaver](https://dbeaver.io/)
2. Tạo kết nối mới bằng thông tin từ Render Dashboard:
   - Host: [Hostname hiển thị trên Render]
   - Port: [Port hiển thị trên Render, thường là 5432]
   - Database: [Database name hiển thị trên Render]
   - Username: [Username hiển thị trên Render]
   - Password: [Password hiển thị trên Render]
   - SSL Mode: Require (đối với Render)

### Sao lưu và khôi phục database
- Render tự động tạo backup hàng ngày cho database của bạn, nhưng chỉ trong 7 ngày gần nhất
- Để tạo backup thủ công:
  1. Từ Dashboard, chọn vào database "handcraft-db"
  2. Chọn tab "Backups"
  3. Nhấn "Create Backup"
  4. Đợi quá trình backup hoàn tất
  5. Nhấn "Download" để tải backup về máy tính của bạn

- Để khôi phục từ backup:
  1. Từ Dashboard, chọn vào database "handcraft-db"
  2. Chọn tab "Backups"
  3. Tìm backup bạn muốn khôi phục và nhấn "Restore"
  4. Đợi quá trình khôi phục hoàn tất

### Quản lý schema và migrations
- Migrations sẽ tự động chạy trong quá trình triển khai qua script build.sh
- Dữ liệu mẫu cũng được seed tự động thông qua script seed-data.js
- Nếu bạn muốn thêm bảng hoặc thay đổi cấu trúc database:
  1. Cập nhật schema trong mã nguồn (`shared/schema.ts`)
  2. Tạo migration mới trong thư mục `migrations`
  3. Cập nhật script seed nếu cần thiết
  4. Đẩy thay đổi lên GitHub để trigger quá trình triển khai mới

## Cập nhật ứng dụng
- Mỗi khi bạn đẩy code mới lên GitHub repository, Render sẽ tự động triển khai phiên bản mới
- Tất cả migrations mới sẽ được áp dụng trong quá trình build

## Đối phó với hạn chế của phiên bản miễn phí

### Vấn đề dịch vụ tự động sleep
- Dịch vụ web miễn phí của Render sẽ tự động chuyển sang trạng thái sleep sau 15 phút không hoạt động
- Để tránh điều này, bạn có thể sử dụng dịch vụ miễn phí như [UptimeRobot](https://uptimerobot.com/):
  1. Đăng ký tài khoản tại UptimeRobot (miễn phí)
  2. Sau khi đăng nhập, chọn "Add New Monitor"
  3. Chọn "HTTP(s)" làm Monitor Type
  4. Đặt Friendly Name (ví dụ: "Handcraft Store")
  5. Nhập URL của ứng dụng trên Render (dạng: handcraft-store.onrender.com)
  6. Đặt Monitoring Interval là 5 phút
  7. Nhấn "Create Monitor"
  8. UptimeRobot sẽ tự động ping ứng dụng của bạn mỗi 5 phút, giúp dịch vụ luôn hoạt động

- Hoặc sử dụng dịch vụ tương tự như:
  - [Pingdom](https://www.pingdom.com/) (có phiên bản miễn phí 14 ngày)
  - [Freshping](https://www.freshworks.com/website-monitoring/) (có phiên bản miễn phí)
  - [StatusCake](https://www.statuscake.com/) (có phiên bản miễn phí)

### Vấn đề giới hạn dung lượng database
- Database miễn phí của Render có giới hạn 256MB dung lượng lưu trữ
- Các giải pháp để đối phó với giới hạn này:
  1. **Tối ưu hóa dữ liệu**:
     - Sử dụng kiểu dữ liệu nhỏ gọn (ví dụ: VARCHAR(255) thay vì TEXT nếu có thể)
     - Đánh index phù hợp, tránh tạo quá nhiều index không cần thiết
     - Lưu trữ dữ liệu nén nếu có thể

  2. **Dọn dẹp dữ liệu định kỳ**:
     - Tạo các quy trình xóa dữ liệu cũ không cần thiết
     - Ví dụ: xóa cart_items quá 30 ngày không được sử dụng
     - Tạo cronjob hoặc chức năng xóa tự động

  3. **Sử dụng dịch vụ lưu trữ bên ngoài cho dữ liệu lớn**:
     - [Cloudinary](https://cloudinary.com/) cho hình ảnh (có phiên bản miễn phí)
     - [AWS S3](https://aws.amazon.com/s3/) cho lưu trữ file (giá rẻ, trả theo dung lượng)
     - [Firebase Storage](https://firebase.google.com/products/storage) (có phiên bản miễn phí)
     - Chỉ lưu đường dẫn đến các file trong database thay vì lưu trực tiếp nội dung file

### Vấn đề dữ liệu bị xóa sau 90 ngày
- Database miễn phí của Render sẽ bị reset sau 90 ngày không hoạt động
- Các giải pháp để đối phó với vấn đề này:

  1. **Sao lưu dữ liệu định kỳ**:
     - Tạo lịch sao lưu tự động mỗi tháng
     - Sử dụng tính năng backup của Render:
       1. Từ Dashboard, chọn database
       2. Chọn tab "Backups"
       3. Tạo backup thủ công
       4. Tải về và lưu trữ ở nơi an toàn
     - Hoặc tạo script backup riêng:
       ```bash
       # Backup script example
       pg_dump -h $HOSTNAME -U $USERNAME -d $DATABASE -F c -f backup_$(date +%Y%m%d).dump
       ```

  2. **Giữ script migration và seed data cập nhật**:
     - Đảm bảo script migration (`migrations/*.sql`) luôn phản ánh cấu trúc database hiện tại
     - Cập nhật script seed data (`scripts/seed-data.js`) với dữ liệu quan trọng
     - Lưu trữ scripts này ở một nơi an toàn ngoài repository

  3. **Duy trì hoạt động cho database**:
     - Đảm bảo ứng dụng của bạn có người truy cập thường xuyên
     - Hoặc tạo một cronjob đơn giản để thực hiện các truy vấn định kỳ đến database

### Nâng cấp lên phiên bản trả phí
- Khi ứng dụng phát triển, bạn có thể cân nhắc nâng cấp lên phiên bản trả phí của Render
- Các lợi ích của phiên bản trả phí:
  - Dịch vụ web chạy liên tục, không bị sleep sau 15 phút không hoạt động
  - Hiệu suất tốt hơn với nhiều tài nguyên (CPU, RAM) hơn
  - Nhiều vùng triển khai (regions) để chọn
  - Database không bị giới hạn thời gian (không bị xóa sau 90 ngày)
  - Dung lượng database lớn hơn
  - Backup được lưu trữ lâu hơn
  - Hỗ trợ custom domains với HTTPS
  - Hỗ trợ kỹ thuật ưu tiên

- Quá trình nâng cấp từ Free lên trả phí:
  1. Từ Dashboard, chọn dịch vụ web hoặc database bạn muốn nâng cấp
  2. Chọn tab "Settings"
  3. Tìm mục "Plan" và chọn "Change Plan"
  4. Chọn gói phù hợp với nhu cầu của bạn
  5. Nhập thông tin thanh toán
  6. Xác nhận nâng cấp

- Tham khảo bảng giá hiện tại tại: [Render Pricing](https://render.com/pricing)

## Kết luận

Bạn đã hoàn tất quá trình triển khai cửa hàng đồ thủ công lên Render! Dưới đây là tóm tắt những điểm quan trọng:

1. **Bắt đầu với phiên bản miễn phí**: Render cung cấp phiên bản miễn phí đủ tốt để bắt đầu, giúp bạn có thể triển khai ứng dụng mà không cần phải trả phí ngay lập tức.

2. **Hiểu rõ các hạn chế**: Phiên bản miễn phí có một số hạn chế như dịch vụ tự động sleep, giới hạn dung lượng database và thời hạn sử dụng database. Hãy áp dụng các giải pháp đã đề xuất để đối phó với những hạn chế này.

3. **Quy trình triển khai đơn giản**: Render giúp quá trình triển khai trở nên đơn giản với quy trình tự động hóa. Scripts build.sh, migrations và seed-data đã được cấu hình sẵn để quá trình triển khai diễn ra suôn sẻ.

4. **Backup dữ liệu định kỳ**: Luôn đảm bảo bạn có bản sao lưu dữ liệu của mình, đặc biệt là khi sử dụng phiên bản miễn phí.

5. **Mở rộng khi cần thiết**: Khi ứng dụng của bạn phát triển, hãy cân nhắc nâng cấp lên phiên bản trả phí để có thêm tài nguyên và tính năng.

Chúc bạn thành công với cửa hàng đồ thủ công của mình!