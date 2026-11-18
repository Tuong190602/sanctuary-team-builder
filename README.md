# Sanctuary Team Builder — bản đơn giản cho nhóm bạn

## Cài đặt
1. Tạo project **mới** tại https://supabase.com/dashboard.
2. SQL Editor → New query → dán toàn bộ `schema.sql` → Run. Nếu chạy lại SQL trên project đã có chính sách trùng tên sẽ báo lỗi; chỉ cần chạy một lần.
3. Project Settings → API → sao chép Project URL và **anon** key (legacy) vào `config.js`. Nếu dùng publishable key mới, Supabase REST có thể yêu cầu thay đổi Authorization header; cách dễ nhất là dùng legacy anon key nếu project cung cấp.
4. Mở thư mục bằng VS Code, cài Live Server, mở `index.html` → Open with Live Server.
5. Public bằng GitHub Pages: đẩy toàn bộ file lên repo và chọn Settings → Pages → Deploy from branch.

## Cách dùng
- Bất kỳ ai cũng tạo thành viên mới; chọn tên để xem, thêm, sửa, xóa acc.
- Tab Chia đội → Tự động sắp xếp → đổi vị trí bằng menu ở mỗi acc → Lưu đội hình chung.
- Nút Làm mới đọc đội hình đã lưu từ Supabase.
- Thuật toán chỉ chọn tối đa một acc cho mỗi thành viên trong mỗi lượt, mỗi đội 10 người, 2 party mỗi party 1 heal, party 1 có tank, toàn đội 1–2 tank, 1–2 chanter. Ưu tiên cân bằng tổng điểm và DPS.

## Giới hạn và bảo mật
- **Không có đăng nhập đồng nghĩa ai có link cũng có thể sửa/xóa mọi dữ liệu**. Không nhập thông tin cá nhân nhạy cảm. Supabase anon key không phải mật khẩu.
- Không thể phân biệt ai thực sự là chủ acc. Không có cơ chế ngăn bạn bè vô tình sửa nhầm; việc lưu cùng lúc có thể ghi đè đội hình.
- Không có phiên Boss riêng hay lịch sử; chỉ lưu một đội hình chung mới nhất.
- Việc đổi vị trí dùng hoán đổi hai acc đã được chọn và chỉ chấp nhận nếu đội vẫn hợp lệ; chưa hỗ trợ đưa acc dự bị vào đội.
- Thuật toán heuristic có thể không tìm ra đội dù tồn tại cách chia phức tạp. Thử bấm lại hoặc điều chỉnh danh sách.
- Mỗi party có Heal, nhưng không bắt buộc party 2 có Tank hoặc Chanter nếu toàn đội đã đạt yêu cầu.
