# Báo cáo QA — MEDIA Agent World V0.6 Kenney 3D

**Mục tiêu:** xác thực việc nạp bộ GLB/texture gốc, giữ hệ thống game/Agent V0.5, và khả năng điều khiển cảnh Kenney.

## Đã thử

| Kiểm tra | Kết quả |
|---|---|
| Kiểm kê ZIP Kenney: 40 GLB, 40 FBX, 40 OBJ, texture, giấy phép CC0 | Đạt |
| Gỡ/đọc GLB: `room-wide`, `room-wide-variation`, `template-floor-layer`, `gate` | Đạt |
| Bảo toàn 25 Agent và FSM | Đạt |
| A*: đường tới khu họp và nghỉ cho 25 Agent | Đạt (test V0.5) |
| Nạp shader WebGL thật, tạo mesh GPU, render mô hình Kenney | Đạt trên Chromium + SwiftShader WebGL |
| `gl.getError() === 0` ngay sau chạy khởi tạo | Đạt |
| Chuyển texture giữa tím / xanh ngọc / cam | Đạt |
| Chuyển sang cảnh cũ và quay lại Kenney | Đạt |
| Triệu tập họp, đủ 25 Agent có lộ trình di chuyển | Đạt |
| Khởi tạo lại trang và nạp mô hình | Đạt |
| Page errors/console errors trong lượt kiểm thử WebGL | 0 |
| Kiểm thử trên GPU thật Windows | Chưa thử |
| Chạy FBX animation trên xương nhân vật | Chưa thực hiện |
| Kiểm thử vật lý va chạm chi tiết tường của Kenney | Chưa thực hiện |

## Phạm vi kiểm thử

- `node tests/kenney_assets.test.js`: 4 GLB (vị trí/normal/UV/index) và 3 texture, khóa lưu V0.5 không đổi.
- `node tests/engine.test.js`: migration, FSM, A*, meeting, trí nhớ, quan hệ, sổ thu chi.
- `xvfb-run -a python tests/visual_browser.py`: Playwright Chromium thật với SwiftShader WebGL, ảnh chụp ba bảng màu, UI và cuộc họp.
- Ở môi trường sandbox, trình duyệt không được phép điều hướng file/localhost vì quy định quản trị, nên bài visual test dùng `page.set_content` với bản sao các script nhúng. Điều đó xác nhận logic render WebGL, nhưng chưa xác nhận thao tác nhấp đúp `file://` trên Windows.

## Rủi ro & bước tiếp theo

1. Kiểm thử file `index.html` thực tế trong Chrome/Edge Windows sau khi giải nén; bật hardware acceleration nếu WebGL không hoạt động.
2. Chuyển `Strut Walking.fbx` sang GLB có skeleton, tích hợp skinning/animation bằng một loader phù hợp; không thể dùng loader tĩnh Kenney hiện tại.
3. Đồng bộ lưới A* với mesh va chạm xuất từ Kenney để giảm khả năng nhân viên xuyên tường do khác biệt giữa mesh 3D và hệ va chạm V0.5.
4. Tối ưu LOD/instancing, kiểm tra FPS trên laptop người dùng.