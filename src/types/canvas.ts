export interface ClipboardImagePayload {
  data_url: string;
  width: number;
  height: number;
  has_alpha: boolean;
}

export interface WriteClipboardPayload {
  image_bytes: number[]; // Vec<u8> serialized as number array in JSON
  width: number;
  height: number;
  has_alpha: boolean;
}

export type ExportFormat = 'png' | 'jpeg';

export interface SaveDialogOptions {
  default_name: string;
  default_extension: string;
}

export interface SaveFileOptions {
  file_path: string;
  image_bytes: number[];
  format: ExportFormat;
}

export interface SaveFileResult {
  success: boolean;
  file_path: string;
  bytes_written: number;
}

export interface ViewportState {
  zoom: number; // 0.1 to 5.0 (1.0 = 100%)
  pan_x: number;
  pan_y: number;
}

export type ToolType =
  | 'select'
  | 'solid_redact'
  | 'blur'
  | 'rect'
  | 'ellipse'
  | 'arrow'
  | 'line'
  | 'pen'
  | 'highlight'
  | 'text'
  | 'step';

export type AnnotationType =
  | 'IMAGE'
  | 'RECTANGLE'
  | 'ELLIPSE'
  | 'ARROW'
  | 'LINE'
  | 'PEN'
  | 'TEXT'
  | 'STEP_COUNTER'
  | 'HIGHLIGHT'
  | 'SOLID_REDACT'
  | 'BLUR_FILTER';

export interface BaseAnnotationNode {
  id: string;
  type: AnnotationType;
  x: number;
  y: number;
  rotation?: number;
  z_index: number;
  stroke_color: string;
  stroke_width: number;
  opacity: number;
}

export interface RectAnnotationNode extends BaseAnnotationNode {
  type: 'RECTANGLE' | 'HIGHLIGHT';
  width: number;
  height: number;
  fill_color?: string;
  corner_radius?: number;
}

export interface EllipseAnnotationNode extends BaseAnnotationNode {
  type: 'ELLIPSE';
  radius_x: number;
  radius_y: number;
  fill_color?: string;
}

export interface ArrowAnnotationNode extends BaseAnnotationNode {
  type: 'ARROW' | 'LINE';
  points: [number, number, number, number]; // [x1, y1, x2, y2]
}

export interface PenAnnotationNode extends BaseAnnotationNode {
  type: 'PEN';
  points: number[]; // [x1, y1, x2, y2, ...]
}

export interface StepCounterAnnotationNode extends BaseAnnotationNode {
  type: 'STEP_COUNTER';
  step_number: number;
  radius: number;
  bg_color: string;
  text_color: string;
}

export interface TextAnnotationNode extends BaseAnnotationNode {
  type: 'TEXT';
  text: string;
  font_size: number;
  font_family: string;
  font_weight: string;
  fill_color: string;
}

export interface SolidRedactNode {
  id: string;
  type: 'SOLID_REDACT';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: 0;
  z_index: number;
  fill_color: string; // "#000000", "#1e293b", "#ffffff"
  opacity: 1.0;
  corner_radius: 0;
}

export interface BlurFilterNode {
  id: string;
  type: 'BLUR_FILTER';
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  blur_radius: number;
}

export interface ImageNode extends BaseAnnotationNode {
  type: 'IMAGE';
  data_url: string;
  width: number;
  height: number;
}

export type AnnotationNode =
  | ImageNode
  | RectAnnotationNode
  | EllipseAnnotationNode
  | ArrowAnnotationNode
  | PenAnnotationNode
  | StepCounterAnnotationNode
  | TextAnnotationNode
  | SolidRedactNode
  | BlurFilterNode;

export interface ToolProperties {
  color: string;
  strokeWidth: number;
  fontSize: number;
  solidRedactColor: string;
}
