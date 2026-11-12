# Cách hoàn tất upload bộ game V0.6 lên GitHub

## Còn thiếu gì?
Trong bản ZIP đã bàn giao có:
- `MEDIA_AGENT_WORLD_V06/assets/kenney/packed.js` (2,4 MB) — **bắt buộc** cho cảnh Kenney chạy offline.
- `MEDIA_AGENT_WORLD_V06/src/kenney-space.js` — **bắt buộc** cho bộ tải mô hình.
- `MEDIA_AGENT_WORLD_V06/src/agent-engine.js`, `assets/kenney/*.glb`, `*.png`, `assets/character-reference/Strut Walking.fbx`, `tools/`, `tests/`, `legacy/`, `preview_*.png`.

## Cách chuẩn trên laptop Windows (Git + GitHub)
1. Tải và giải nén `MEDIA_AGENT_WORLD_V06_KENNEY_3D_INTEGRATED.zip`.
2. Trong PowerShell chạy `git clone https://github.com/quang-vu-stack/Du-an.git` rồi `cd Du-an`.
3. Sao chép **toàn bộ nội dung bên trong** thư mục giải nén `MEDIA_AGENT_WORLD_V06` vào `Du-an/media-agent-world/v0.6` (chọn ghi đè `index.html` và các tài liệu V0.6 đã có nếu khớp bản ZIP mới nhất).
4. Xem thay đổi: `git status`.
5. Chạy `git add media-agent-world/v0.6`.
6. Chạy `git commit -m "assets: complete Kenney 3D offline bundle for MEDIA Agent World V0.6"`.
7. Chạy `git push origin main` (đăng nhập GitHub nếu được hỏi).

Sau khi upload, kiểm tra 2 file tại:
- `media-agent-world/v0.6/assets/kenney/packed.js`
- `media-agent-world/v0.6/src/kenney-space.js`

Không tạo thêm repo mới. Không push file chứa khóa API.
