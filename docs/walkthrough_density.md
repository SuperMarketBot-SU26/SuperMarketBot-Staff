# Cập nhật API Mật độ (Density) cho Kệ hàng

Tôi đã hoàn thành việc tích hợp API thực tế vào bản đồ để hiển thị màu sắc kệ hàng (Heatmap) dựa trên mật độ hàng hoá.

## Changes Made
- **API & Types (`shared/api`)**: Thêm kiểu `AisleDensityDto` và function `getAisleDensities` gọi endpoint `/api/v1/aisles/density`.
- **Data Hook (`features/staff/hooks`)**: Khởi tạo hook `useAisleDensities` xử lý fetching & auto-refresh trạng thái mật độ.
- **Bản đồ (`MapCanvas.tsx` & `InteractiveMap.tsx`)**: Bổ sung truyền dữ liệu `densities`. Logic render các vùng hiển thị của từng `zone` giờ lấy `densityColor` (red, yellow, green) từ API thay vì sử dụng random script cũ.
- **Màn hình (`MapScreen.tsx`)**: Sử dụng hook mới và truyền dữ liệu xuống. Khi người dùng thực hiện Pull-to-Refresh, cả dữ liệu Robot và dữ liệu Kệ hàng đều được nạp lại đồng bộ.

## Validation Results
- Dữ liệu màu sắc (`densityColor`) hiện đã được map động.
- Cấu trúc file và routing được giữ đúng chuẩn Feature-based Architecture của project Staff (Expo SDK 54).

> [!TIP]
> Bạn có thể chạy ứng dụng qua Expo và truy cập vào Bản đồ. Kéo màn hình từ trên xuống để refresh lại dữ liệu, bạn sẽ thấy kệ hàng chuyển màu tuỳ vào response từ Backend.
