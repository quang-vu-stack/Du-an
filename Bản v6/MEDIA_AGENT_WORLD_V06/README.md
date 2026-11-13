# MEDIA Agent World V0.6 — Kenney 3D Integration

**Nâng cấp trực tiếp trên V0.5.** Bản này sử dụng mô hình 3D thật của **Kenney Modular Space Kit v1.0** (CC0) để dựng 5 phòng ban, hành lang sàn và cổng vào; hệ thống Agent FSM, tài chính, nhiệm vụ và các tài khoản Facebook/TikTok **ảo** giữ nguyên.

## Cách chạy nhanh trên Windows

1. Tải ZIP V0.6, **giải nén toàn bộ**, không chỉ lấy `index.html`.
2. Nhấp đúp `index.html` → mở bằng Chrome hoặc Edge với WebGL được bật.
3. Chờ dòng **“Kenney 3D: BẬT”** ở góc phải dưới cảnh 3D. Có thể chọn bảng màu **Tím pastel, Xanh ngọc, Cam**.
4. Nút **“Kenney 3D: BẬT”** chuyển qua lại giữa cảnh mô-đun Kenney và cảnh V0.5.
5. Chọn nhân viên, thử **“Triệu tập họp 25 Agent”**, đổi tốc độ hoặc bật/tắt FSM Agent.
6. Muốn chơi tiếp trên máy khác: dùng **“Xuất bản lưu”** rồi **“Nhập bản lưu”** trên máy mới.

> **Không cần mạng, server, API key, tài khoản hoặc công cụ trả phí.** Tài nguyên 3D đã được nhúng dưới dạng dữ liệu cục bộ trong `assets/kenney/packed.js` để file `index.html` truy cập được ngay cả ở chế độ `file://`. Đừng xóa thư mục `src` hoặc `assets`.

## Mới ở V0.6

- Giữ nguyên renderer WebGL tự viết của V0.5 và hệ thống 25 Agent.
- Thêm **GLB loader cục bộ** (`src/kenney-space.js`) dành riêng cho static GLB trong bộ tài nguyên này.
- Tái sử dụng bốn asset mô-đun: `room-wide.glb`, `room-wide-variation.glb`, `template-floor-layer.glb`, `gate.glb`.
- Dùng mô hình chung nhiều lần, tạo năm phòng ban bằng thông số biến đổi tỉ lệ và vị trí; giữ lại 25 bàn làm việc/nhân viên từ game gốc.
- Dùng texture atlas chính cùng hai bảng màu khác nhau được người dùng cung cấp.
- Chọn bật/tắt môi trường Kenney, quay lại phong cách phòng cũ mà không ảnh hưởng dữ liệu game.
- Giữ **Canvas fallback**: khi WebGL bị chặn, game vẫn chạy bản dựng hình V0.5, nhưng không thể hiện mô hình GLB.
- **Tuyệt đối không thay đổi khóa lưu V0.5:** `media_agent_world_v05_offline`.

## Cấu trúc bộ mã

- `index.html`: game với UI V0.6.
- `src/agent-engine.js`: engine Agent V0.5 gốc, chưa thay đổi.
- `src/kenney-space.js`: đọc GLB, đẩy mesh/texture lên GPU và đặt asset vào cảnh.
- `assets/kenney/`: 4 file GLB thật + 3 texture PNG + `packed.js` để chạy offline.
- `assets/character-reference/Strut Walking.fbx`: file hoạt ảnh Mixamo được người dùng cung cấp để chuẩn bị cho vòng phát triển kế tiếp; **chưa dùng để điều khiển nhân vật trong game**.
- `legacy/v05_index.html`: file game V0.5 gốc nguyên vẹn.
- `tools/pack_kenney_assets.py`: tạo lại `packed.js` khi chỉnh các GLB/texture.
- `tests/engine.test.js`, `tests/kenney_assets.test.js`: QA Node.js.
- `tests/visual_browser.py`: QA WebGL tương tác qua Playwright + Chromium (có thể cần môi trường đồ họa Linux/Xvfb).
- `QA_REPORT.md`: kết quả và giới hạn.

## Chỉnh mô hình và cập nhật asset

Có thể mở các file `.glb` bằng Blender, xuất lại cùng tên rồi chạy:

```powershell
python tools/pack_kenney_assets.py
```

Tập tin `packed.js` được cập nhật từ các file `.glb` và `.png` trong thư mục `assets/kenney`. **Lưu ý:** bộ loader phiên bản này giới hạn ở mô hình GLB tĩnh có một mesh/primitive, attribute POSITION, NORMAL, TEXCOORD_0 và chỉ mục 16 bit. Nếu bạn xuất lại mô hình khác cấu trúc, cần cập nhật bộ loader.

## Kiểm thử

Node.js:

```powershell
node tests/engine.test.js
node tests/kenney_assets.test.js
```

Hình ảnh kiểm thử: `preview_v06_kenney.png`, `preview_v06_teal.png`, `preview_v06_amber.png`.

## Hạn chế đang tồn tại

- **Strut Walking.fbx chưa được nạp vào game:** hiện nhân viên là hình khối 3D có chuyển động mô phỏng, chưa phải mô hình có xương và animation FBX.
- Hệ thống tìm đường A* giữ từ V0.5, dựa trên các tường và nội thất cũ. Với các module Kenney mới, cần đối chiếu chính xác va chạm tường/cửa trước khi làm gameplay điều hướng sát tường.
- Agent tự chủ là hệ thống FSM + quy tắc, **không phải 25 LLM độc lập**.
- Không có hệ thống chạy ngầm khi đã đóng trình duyệt.
- Không có đăng bài thật, API trả phí hoặc triển khai công khai.
- Kiểm thử trên GPU thật của máy người dùng vẫn cần thiết; bộ QA đã thử bằng Chromium trên SwiftShader WebGL giả lập GPU.

**Giấy phép Kenney:** CC0 1.0 (xem `KENNEY_LICENSE.txt`). Các asset nhân vật Mixamo có thể thuộc điều khoản riêng, không coi là CC0.
