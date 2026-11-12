# Bản V6 — manifest gói ZIP người dùng gửi

- Tệp gốc: `Bản v6.zip`
- Tên đề xuất trên GitHub: `MEDIA_AGENT_WORLD_V06_KENNEY_3D_INTEGRATED.zip`
- Kích thước: **8.432.810 bytes**
- SHA-256: `7b9fa2d3f5d2acab5714cbed7c1f5017b1e539ff4f007008dc4cd4bb8bcea390`
- Có **28 file**, chứa thư mục gốc `MEDIA_AGENT_WORLD_V06/`.
- So sánh ngày 12/11/2026: **trùng hoàn toàn** với bản ZIP V0.6 đã bàn giao trước đó.

## Các nội dung quan trọng trong ZIP
- `index.html` — game 3D
- `src/agent-engine.js`, `src/kenney-space.js` — logic AI và mô hình
- `assets/kenney/packed.js`, 4 mô hình GLB và texture PNG
- `assets/character-reference/Strut Walking.fbx`
- `tests/`, `tools/`, `legacy/`, README và báo cáo QA

## Trạng thái GitHub
- Đã lưu mã HTML V0.5, V0.6 và tài liệu.
- **Chưa tải file ZIP và các asset nhị phân lên GitHub**. Kết nối GitHub hiện có không đọc trực tiếp file ZIP nhị phân từ thư mục làm việc.
- Để hoàn tất, tại `media-agent-world/releases/` chọn **Add file → Upload files**, chọn ZIP đã nhận và commit lên nhánh `main`. Có thể giữ tên gốc nếu muốn.
- Để phát triển game từ repo mà không cần ZIP, giải nén và tải thêm `assets/`, `src/`, `tests/`, `tools/` theo hướng dẫn `../UPLOAD_REMAINING_ASSETS.md`.

Kiểm tra SHA-256 trên Windows PowerShell: `Get-FileHash ".\\Bản v6.zip" -Algorithm SHA256`.
