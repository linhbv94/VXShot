use crate::types::{ClipboardImagePayload, WriteClipboardPayload};
use arboard::{Clipboard, ImageData};
use base64::Engine;
use image::{ImageBuffer, Rgba};
use std::borrow::Cow;
use std::io::Cursor;

const MAX_DIMENSION: u32 = 8192;
const MAX_TOTAL_PIXELS: u32 = 33_200_000; // ~ 33.2 Megapixels (8K UHD)

pub fn decode_bounded_image(bytes: &[u8]) -> Result<image::DynamicImage, String> {
    if bytes.len() > 64 * 1024 * 1024 { return Err("Tệp ảnh vượt giới hạn 64MiB.".into()); }
    let mut reader = image::ImageReader::new(Cursor::new(bytes)).with_guessed_format().map_err(|e| e.to_string())?;
    let mut limits = image::Limits::default();
    limits.max_image_width = Some(MAX_DIMENSION);
    limits.max_image_height = Some(MAX_DIMENSION);
    limits.max_alloc = Some(256 * 1024 * 1024);
    reader.limits(limits);
    let img = reader.decode().map_err(|e| format!("Ảnh không hợp lệ hoặc quá lớn: {e}"))?;
    if u64::from(img.width()) * u64::from(img.height()) > u64::from(MAX_TOTAL_PIXELS) { return Err("Ảnh vượt giới hạn 33.2 megapixel.".into()); }
    Ok(img)
}

pub fn read_clipboard_image() -> Result<Option<ClipboardImagePayload>, String> {
    let mut clipboard = match Clipboard::new() {
        Ok(c) => c,
        Err(e) => {
            // Không mở được clipboard (ví dụ bị khóa)
            return Err(format!("Lỗi kết nối bộ nhớ tạm: {e}"));
        }
    };

    let image_data = match clipboard.get_image() {
        Ok(img) => img,
        Err(_) => {
            // Clipboard không có ảnh hoặc rỗng
            return Ok(None);
        }
    };

    let width = image_data.width as u32;
    let height = image_data.height as u32;

    if width == 0 || height == 0 {
        return Ok(None);
    }

    if width > MAX_DIMENSION || height > MAX_DIMENSION || (width * height > MAX_TOTAL_PIXELS) {
        return Err("Kích thước ảnh vượt quá giới hạn an toàn 8192x8192px.".to_string());
    }

    // Kiểm tra kênh Alpha (độ trong suốt)
    let bytes = &image_data.bytes;
    let mut has_alpha = false;
    for chunk in bytes.chunks_exact(4) {
        if chunk[3] < 255 {
            has_alpha = true;
            break;
        }
    }

    // Encode sang PNG in-memory
    let rgba_img: ImageBuffer<Rgba<u8>, Vec<u8>> = match ImageBuffer::from_raw(width, height, bytes.clone().into_owned()) {
        Some(buf) => buf,
        None => return Err("Không thể khởi tạo bộ đệm pixel ảnh RGBA.".to_string()),
    };

    let mut png_bytes: Vec<u8> = Vec::new();
    let mut cursor = Cursor::new(&mut png_bytes);
    if let Err(e) = rgba_img.write_to(&mut cursor, image::ImageFormat::Png) {
        return Err(format!("Lỗi mã hóa ảnh PNG: {e}"));
    }

    let b64 = base64::engine::general_purpose::STANDARD.encode(&png_bytes);
    let data_url = format!("data:image/png;base64,{b64}");

    Ok(Some(ClipboardImagePayload {
        data_url,
        width,
        height,
        has_alpha,
    }))
}

pub fn write_clipboard_image(payload: WriteClipboardPayload) -> Result<(), String> {
    let mut clipboard = match Clipboard::new() {
        Ok(c) => c,
        Err(e) => return Err(format!("Lỗi mở bộ nhớ tạm: {e}")),
    };

    // Giải mã mảng bytes thành DynamicImage RGBA
    let dynamic_img = match decode_bounded_image(&payload.image_bytes) {
        Ok(img) => img,
        Err(e) => return Err(format!("Lỗi giải mã ảnh thành phẩm: {e}")),
    };

    let rgba = dynamic_img.to_rgba8();
    let width = rgba.width() as usize;
    let height = rgba.height() as usize;
    let raw_bytes = rgba.into_raw();

    let img_data = ImageData {
        width,
        height,
        bytes: Cow::Borrowed(&raw_bytes),
    };

    if let Err(e) = clipboard.set_image(img_data) {
        return Err(format!("Lỗi ghi ảnh vào bộ nhớ tạm: {e}"));
    }

    Ok(())
}
