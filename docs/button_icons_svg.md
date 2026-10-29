# Danh Mục Biểu Tượng SVG Cho Các Nút Bấm — VXShot

> **Sản phẩm:** VXShot (Cross-platform Quick Clipboard Image Editor & Annotator)  
> **Thư viện chuẩn:** `lucide-react` (phiên bản chuẩn hóa đồng bộ VXUtilities)  
> **Thông số kỹ thuật SVG:** `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.  
> **Kích thước chuẩn:** 16px × 16px (Titlebar/Status bar), 18px × 18px (Top Tool HUD), 14px × 14px (Badges & Sub-options).

---

## 1. Nhóm Biểu Tượng Thanh Tiêu Đề (Titlebar Actions)

### 1.1. Biểu tượng Ứng dụng (App Icon: Crosshair Camera)
- **Tên Lucide:** `Crop` hoặc `Crosshair` kết hợp `Image`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 2v14a2 2 0 0 0 2 2h14"/>
  <path d="M18 22V8a2 2 0 0 0-2-2H2"/>
</svg>
```

### 1.2. Mở Tệp (Open File) & Menu Gần Đây
- **Tên Lucide:** `FolderOpen` và `ChevronDown`
- **Phím tắt:** `Cmd/Ctrl + O`
- **Mã SVG trực tiếp:**
```xml
<!-- FolderOpen (16x16) -->
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>
</svg>

<!-- ChevronDown (12x12) -->
<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m6 9 6 6 6-6"/>
</svg>
```

### 1.3. Lịch Sử Mở Gần Đây (Recent History)
- **Tên Lucide:** `History` / `Clock`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
  <path d="M3 3v5h5"/>
  <path d="M12 7v5l4 2"/>
</svg>
```

### 1.4. Bộ Điều Khiển Thu Phóng (Zoom Controls)
- **Tên Lucide:** `ZoomOut`, `ZoomIn`, `Maximize2` (Fit Window), `Scan` (100% Actual Size)
- **Phím tắt:** `Cmd/Ctrl + -`, `Cmd/Ctrl + +`, `Cmd/Ctrl + 0`, `Cmd/Ctrl + 9`
- **Mã SVG trực tiếp:**
```xml
<!-- ZoomOut (14x14) -->
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8"/>
  <line x1="21" x2="16.65" y1="21" y2="16.65"/>
  <line x1="8" x2="14" y1="11" y2="11"/>
</svg>

<!-- ZoomIn (14x14) -->
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8"/>
  <line x1="21" x2="16.65" y1="21" y2="16.65"/>
  <line x1="11" x2="11" y1="8" y2="14"/>
  <line x1="8" x2="14" y1="11" y2="11"/>
</svg>

<!-- Fit to Screen / Maximize2 (14x14) -->
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="15 3 21 3 21 9"/>
  <polyline points="9 21 3 21 3 15"/>
  <line x1="21" x2="14" y1="3" y2="10"/>
  <line x1="3" x2="10" y1="21" y2="14"/>
</svg>
```

### 1.5. Hoàn Tác & Làm Lại (Undo / Redo)
- **Tên Lucide:** `Undo2`, `Redo2`
- **Phím tắt:** `Cmd/Ctrl + Z`, `Cmd/Ctrl + Shift + Z`
- **Mã SVG trực tiếp:**
```xml
<!-- Undo2 (14x14) -->
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9 14 4 9l5-5"/>
  <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"/>
</svg>

<!-- Redo2 (14x14) -->
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m15 14 5-5-5-5"/>
  <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13"/>
</svg>
```

### 1.6. Cài Đặt (Settings)
- **Tên Lucide:** `Settings` / `SlidersHorizontal`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
  <circle cx="12" cy="12" r="3"/>
</svg>
```

---

## 2. Nhóm Biểu Tượng Bảng Công Cụ Nổi (Top Floating Tool HUD)

### 2.1. Con Trỏ Chọn & Di Chuyển (Selection Pointer)
- **Tên Lucide:** `MousePointer`
- **Phím tắt:** `V`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
  <path d="m13 13 6 6"/>
</svg>
```

### 2.2. Hình Chữ Nhật (Rectangle)
- **Tên Lucide:** `Square`
- **Phím tắt:** `R`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect width="18" height="18" x="3" y="3" rx="2"/>
</svg>
```

### 2.3. Hình Elip / Tròn (Ellipse)
- **Tên Lucide:** `Circle`
- **Phím tắt:** `O`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
</svg>
```

### 2.4. Mũi Tên Chỉ Dẫn (Arrow)
- **Tên Lucide:** `ArrowUpRight` hoặc `MoveRight`
- **Phím tắt:** `A`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M7 7h10v10"/>
  <path d="M7 17 17 7"/>
</svg>
```

### 2.5. Đường Thẳng (Line)
- **Tên Lucide:** `Minus` / `Slash`
- **Phím tắt:** `L`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M5 19 19 5"/>
</svg>
```

### 2.6. Bút Vẽ Tự Do (Pencil / Pen)
- **Tên Lucide:** `Pencil`
- **Phím tắt:** `P`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>
  <path d="m15 5 4 4"/>
</svg>
```

### 2.7. Gõ Chữ / Văn Bản (Text)
- **Tên Lucide:** `Type`
- **Phím tắt:** `T`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="4 7 4 4 20 4 20 7"/>
  <line x1="9" x2="15" y1="20" y2="20"/>
  <line x1="12" x2="12" y1="4" y2="20"/>
</svg>
```

### 2.8. Đánh Số Tự Tăng (Step Counter)
- **Tên Lucide:** `ListOrdered` hoặc `CircleDot` hoặc `Hash`
- **Phím tắt:** `S`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <path d="M10 9h2v6"/>
  <path d="M10 15h4"/>
</svg>
```

### 2.9. Tô Sáng (Highlighter)
- **Tên Lucide:** `Highlighter`
- **Phím tắt:** `H`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m9 11-6 6v3h3l6-6"/>
  <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>
</svg>
```

### 2.10. Khối Che Đặc (Solid Redact Block)
- **Tên Lucide:** `ShieldAlert` / `SquareX` / `EyeOff`
- **Khuyến nghị UX:** Dùng icon hình vuông có gạch chéo hoặc khối đặc che mắt
- **Phím tắt:** `B`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect width="18" height="18" x="3" y="3" rx="2" fill="currentColor" opacity="0.3"/>
  <path d="m3 3 18 18"/>
  <rect width="18" height="18" x="3" y="3" rx="2"/>
</svg>
```

### 2.11. Làm Mờ / Che Điểm Ảnh (Blur / Pixelate Filter)
- **Tên Lucide:** `Sparkles` / `Droplets` / `CloudFog`
- **Phím tắt:** `M`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
  <path d="M16 17H7"/>
  <path d="M17 21H9"/>
</svg>
```

---

## 3. Nhóm Biểu Tượng Hành Động Xuất (Export Action Bar)

### 3.1. Lưu Tệp Ảnh Ra Ổ Cứng (Save Image)
- **Tên Lucide:** `Download` / `Save`
- **Phím tắt:** `Cmd/Ctrl + S`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <polyline points="7 10 12 15 17 10"/>
  <line x1="12" x2="12" y1="15" y2="3"/>
</svg>
```

### 3.2. Sao Chép Thành Phẩm Vào Clipboard (Copy Result — Nút Chính Electric Cyan)
- **Tên Lucide:** `Copy` hoặc `ClipboardCheck`
- **Phím tắt:** `Cmd/Ctrl + Shift + C`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
  <path d="m9 14 2 2 4-4"/>
</svg>
```

---

## 4. Nhóm Biểu Tượng Cửa Sổ Cài Đặt (Settings Modal & Support)

### 4.1. Tách Cà Phê Ủng Hộ Tác Giả (Support Author: Coffee)
- **Tên Lucide:** `Coffee`
- **Tông màu:** Amber ấm (`text-amber-400`, `bg-amber-500/20`)
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 2v2"/>
  <path d="M14 2v2"/>
  <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h12Z"/>
  <path d="M6 2v2"/>
  <path d="M16 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/>
</svg>
```

### 4.2. Trái Tim / Tri Ân (Heart)
- **Tên Lucide:** `Heart`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
</svg>
```

### 4.3. Cập Nhật (Updates)
- **Tên Lucide:** `RefreshCw`
- **Mã SVG trực tiếp:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
  <path d="M21 3v5h-5"/>
  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
  <path d="M3 21v-5h5"/>
</svg>
```

---

## 5. Mẫu Component React Wrapper Chuẩn Hóa (`IconButton.tsx`)

```tsx
import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  tooltip?: string;
  isActive?: boolean;
  variant?: 'ghost' | 'primary' | 'secondary' | 'tool';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  label,
  tooltip,
  isActive = false,
  variant = 'ghost',
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = "relative inline-flex items-center justify-center rounded-lg transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50";
  
  const variantClasses = {
    ghost: "text-slate-300 hover:text-white hover:bg-slate-800/60 active:scale-95",
    primary: "bg-cyan-500 hover:bg-cyan-400 text-white font-semibold shadow-lg shadow-cyan-500/20 active:scale-95",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 active:scale-95",
    tool: isActive 
      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/80 shadow-sm shadow-cyan-500/30" 
      : "text-slate-300 hover:text-white hover:bg-slate-800/60 active:scale-95 border border-transparent"
  };

  const disabledClasses = disabled ? "opacity-30 cursor-not-allowed pointer-events-none" : "";

  return (
    <button
      type="button"
      title={tooltip}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      {...props}
    >
      {icon}
      {label && <span className="ml-1.5 text-xs font-medium">{label}</span>}
    </button>
  );
};
```
