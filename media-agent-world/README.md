# MEDIA Agent World — 25 AI Agents (Gemini × ChatGPT)

Đây là thư mục quản lý **duy nhất** dự án MEDIA Agent World tại repo Du-an. Tách biệt với MEDIA TECH VUS/VUX.

## Phiên bản
- **V0.5**: `v0.5/index.html` — phiên bản standalone cho 25 Agent; mở trực tiếp bằng Chrome/Edge.
- **V0.6**: `v0.6/index.html` — mã giao diện đã nâng cấp Kenney 3D; cần bổ sung `assets/kenney/packed.js` và `src/kenney-space.js` để chạy phần cảnh 3D.
- Bản ZIP V0.6 đầy đủ hiện đang ở gói bàn giao ChatGPT: `MEDIA_AGENT_WORLD_V06_KENNEY_3D_INTEGRATED.zip`.

## Trạng thái đồng bộ GitHub
**Đã đồng bộ mã HTML V0.5, V0.6 và tài liệu.** Các file asset/FBX/GLB nhị phân và một số script từ ZIP vẫn **chưa** được tải lên bằng kết nối GitHub hiện tại. Để game V0.6 chạy đầy đủ từ repository, hãy bổ sung toàn bộ nội dung ZIP vào `media-agent-world/v0.6/` như hướng dẫn trong `UPLOAD_REMAINING_ASSETS.md`.

> Đừng chạy V0.6 trực tiếp trong GitHub trước khi có đủ asset. V0.5 là phương án dự phòng độc lập.

## Quy tắc tránh nhầm lẫn
- Mỗi phiên bản ở một thư mục riêng: `v0.5/`, `v0.6/`, `v0.7/`...
- Mỗi lần sửa: tạo branch/commit với mô tả cụ thể; không xóa phiên bản cũ.
- Trước khi thay đổi dữ liệu game, sao lưu JSON qua nút Xuất bản lưu.
- Không commit API key, `.env`, thông tin đăng nhập hoặc dữ liệu cá nhân.
- Không tự động deploy hoặc phát sinh API trả phí.

Giấy phép asset Kenney Modular Space Kit: CC0 1.0. File FBX từ Mixamo hoặc nguồn khác cần tuân theo điều kiện riêng nếu dùng công khai.
