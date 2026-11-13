# Kế hoạch MEDIA Agent World V0.7

## Mục tiêu
Nhân viên 3D dùng mô hình humanoid có xương thật và phát hoạt ảnh (đứng/đi/họp). Giữ nguyên game FSM, kênh Facebook/TikTok ảo, tài chính, lưu dữ liệu, Kenney 3D.

## Việc chính
1. **Lưu V0.6 làm mốc bất biến.** Nâng cấp trong `v0.7/` hoặc branch phát triển.
2. **Kiểm tra FBX `Strut Walking.fbx`.** Xác minh chứa mesh, skeleton, clip nào; không giả định rằng clip có thể áp lên 25 nhân vật khác rig.
3. **Xuất GLB hoạt ảnh qua Blender** (hoặc pipeline tương đương). Tạo 1 nhân viên mẫu hoạt động trước.
4. **Tích hợp renderer cho skinned mesh và animation** (Three.js/AnimationMixer hoặc hệ thống GPU skinning tương đương) mà không thay thế logic kinh tế/FSM.
5. **Ánh xạ trạng thái FSM** thành idle/walk/meeting/resting, đồng bộ vị trí và hướng mặt; kiểm tra tốc độ hoạt ảnh, root motion, va chạm tường/cửa.
6. **Nhân rộng lên 25 Agent** với asset dùng chung khi tương thích, tối ưu FPS.
7. **QA**: không xuất hiện lỗi console, không xuyên tường, save/load V0.6, khung hình ổn định, fallback khi không có WebGL.

## Điều kiện hoàn tất
- Một nhân viên có xương đi được giữa 2 điểm và dừng idle.
- Chuyển động khớp với vị trí FSM; cuộc họp hoạt động.
- 25 Agent đồng thời mà không hỏng UI, kênh ảo, kinh tế và bản lưu.
- Không cần API trả phí, không triển khai công khai khi chưa được yêu cầu.

**Lưu ý:** V0.6 là nền tảng hoạt động, chưa phải 25 nhân vật 3D rigged.
