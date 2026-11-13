# MEDIA Agent World — quản lý phiên bản

**Thư mục chuẩn để phát triển:** `media-agent-world/`. Dự án này không phải MEDIA TECH VUS/VUX.

| Phiên bản | Trạng thái | Đường dẫn |
| --- | --- | --- |
| V0.5 | Dự phòng, 25 Agent FSM | [v0.5/index.html](v0.5/index.html) |
| V0.6 | Đã có đủ 28 tệp: 3D Kenney, GLB, FBX tham khảo, packed.js, src, tests | [v0.6/](v0.6/) |
| V0.7 | Dự kiến: nhân vật có xương và animation thật | [Kế hoạch](V07_ROADMAP.md) |

**Bản V0.6 chính thức:** `v0.6/index.html` cùng các thư mục `v0.6/src` và `v0.6/assets`. Không mở riêng HTML mà thiếu 2 thư mục này.

**Nguồn nhập nguyên vẹn:** `Bản v6/MEDIA_AGENT_WORLD_V06/` — vẫn được giữ lại để đối chiếu; toàn bộ 28 file đã được tham chiếu lại vào thư mục chuẩn theo cùng blob SHA Git.

## Chạy thử trên Windows
1. Chọn **Code → Download ZIP** của repository hoặc `git clone https://github.com/quang-vu-stack/Du-an.git`.
2. Giải nén (nếu là ZIP), mở `media-agent-world/v0.6/index.html` bằng Chrome/Edge.
3. Kiểm tra Kenney 3D, 25 Agent, chuyển bảng màu, triệu tập họp.
4. Nếu muốn kiểm thử bằng Node.js: trong thư mục `media-agent-world/v0.6`, chạy `node tests/engine.test.js` và `node tests/kenney_assets.test.js`.

## Quy tắc tránh nhầm
- Mỗi lần nâng cấp tạo thư mục `v0.7/`, `v0.8/`… Không ghi đè v0.6.
- Ghi rõ trong commit: version, tính năng, kiểm thử và hạn chế.
- Trước khi chuyển phiên bản, xuất bản lưu JSON trong game.
- Không commit API key, .env hay dữ liệu riêng tư.
- Không tự động triển khai công khai, không dùng API trả phí.

**Tình trạng thực:** V0.6 hiện có nhân viên FSM mô phỏng; `Strut Walking.fbx` chưa được dùng để phát hoạt ảnh trên nhân vật thật. Bộ code WebGL Kenney loader hiện dành cho asset tĩnh; cần phát triển thêm pipeline animation.
