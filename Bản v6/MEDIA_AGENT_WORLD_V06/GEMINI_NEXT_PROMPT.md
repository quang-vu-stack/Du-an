# Prompt tiếp tục cho Gemini / Codex — MEDIA Agent World V0.7

Tôi gửi cho bạn mã nguồn MEDIA Agent World V0.6 trong ZIP. Game có 25 AI Agent theo FSM, WebGL renderer tự viết, 5 phòng ban và mô hình Kenney GLB/texture thực. Đừng thay thế toàn bộ mã bằng demo khác.

**Yêu cầu:**
1. Đọc `README.md`, `QA_REPORT.md`, `src/agent-engine.js`, `src/kenney-space.js`, `index.html`.
2. Bảo toàn các khóa lưu `media_agent_world_v05_offline` và các chức năng kinh doanh/Agent.
3. Thêm hệ thống chuyển đổi `Strut Walking.fbx` thành GLB và một avatar rigged mẫu có animation clip `walk`, `idle`, `work`.
4. Xây dựng tích hợp animation nhân vật thật vào renderer. Không tuyên bố sử dụng Mixamo animation nếu chưa thực sự chạy được skeleton và skinning.
5. Đối chiếu collision A* với các tường/cửa Kenney; tạo các proxy collision chính xác hoặc điều chỉnh vị trí module sao cho Agent không xuyên vật thể.
6. Giữ lựa chọn 3 bảng màu, chuyển đổi môi trường Kenney/gốc và chế độ WebGL/Canvas dự phòng.
7. Không API trả phí, không kết nối FB/TikTok thật, không tự triển khai công khai.
8. Trả lại ZIP mã nguồn cập nhật, nêu chính xác bài kiểm thử nào chạy được và giới hạn còn lại.

Kỹ thuật hiện có: bộ `src/kenney-space.js` chỉ nạp các GLB **mesh tĩnh**; FBX Mixamo không thể trực tiếp chạy bằng bộ loader này. Có thể cân nhắc Three.js cục bộ nếu cần hỗ trợ skinned mesh/AnimationMixer, nhưng phải kiểm thử migration khỏi custom WebGL renderer để tránh hỏng UI và engine Agent.
