import type { AnnotationNode } from '../types/canvas';

export function translateNode(node: AnnotationNode, dx: number, dy: number): AnnotationNode {
  if ('points' in node) return { ...node, x: node.x + dx, y: node.y + dy, points: node.points.map((p, i) => p + (i % 2 ? dy : dx)) } as AnnotationNode;
  return { ...node, x: node.x + dx, y: node.y + dy };
}

export function nodeBounds(node: AnnotationNode, measure?: (text: string, size: number) => number) {
  if ('width' in node) return { x: node.x, y: node.y, width: node.width, height: node.height };
  if (node.type === 'ELLIPSE') return { x: node.x - node.radius_x, y: node.y - node.radius_y, width: node.radius_x * 2, height: node.radius_y * 2 };
  if (node.type === 'STEP_COUNTER') return { x: node.x - node.radius, y: node.y - node.radius, width: node.radius * 2, height: node.radius * 2 };
  if (node.type === 'TEXT') return { x: node.x, y: node.y, width: Math.max(...node.text.split('\n').map(t => measure ? measure(t, node.font_size) : t.length * node.font_size * 0.65), 8), height: node.text.split('\n').length * node.font_size * 1.2 };
  if ('points' in node) {
    const xs = node.points.filter((_, i) => i % 2 === 0), ys = node.points.filter((_, i) => i % 2 === 1);
    return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
  }
  throw new Error('Unsupported editor node');
}

function segmentDistance(x: number, y: number, ax: number, ay: number, bx: number, by: number) {
  const d = (bx - ax) ** 2 + (by - ay) ** 2;
  const t = d ? Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / d)) : 0;
  return Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay));
}

export function hitTest(node: AnnotationNode, x: number, y: number, tolerance: number, measure?: (text: string, size: number) => number) {
  if ('points' in node) {
    const padding = tolerance + node.stroke_width / 2;
    for (let i = 2; i < node.points.length; i += 2) if (segmentDistance(x, y, ...node.points.slice(i - 2, i + 2) as [number, number, number, number]) <= padding) return true;
    // Arrowhead occupies a wider area than its shaft.
    if (node.type === 'ARROW') return Math.hypot(x - node.points[2], y - node.points[3]) <= Math.min(Math.max(16, node.stroke_width * 4), 38) + tolerance;
    return false;
  }
  if (node.type === 'ELLIPSE') return ((x - node.x) / (Math.abs(node.radius_x) + tolerance)) ** 2 + ((y - node.y) / (Math.abs(node.radius_y) + tolerance)) ** 2 <= 1;
  if (node.type === 'STEP_COUNTER') return Math.hypot(x - node.x, y - node.y) <= node.radius + tolerance;
  const b = nodeBounds(node, measure);
  return x >= b.x - tolerance && x <= b.x + b.width + tolerance && y >= b.y - tolerance && y <= b.y + b.height + tolerance;
}

export function expansion(width: number, height: number, dx: number, dy: number, left: boolean, top: boolean) {
  const horizontal = Math.min(Math.max(0, Math.round(left ? -dx : dx)), 8192 - width);
  const vertical = Math.min(Math.max(0, Math.round(top ? -dy : dy)), 8192 - height);
  // Respect the document's 33.2 MP allocation budget.
  if ((width + horizontal) * (height + vertical) > 33_200_000) return { left: 0, top: 0, right: 0, bottom: 0 };
  return { left: left ? horizontal : 0, top: top ? vertical : 0, right: left ? 0 : horizontal, bottom: top ? 0 : vertical };
}
