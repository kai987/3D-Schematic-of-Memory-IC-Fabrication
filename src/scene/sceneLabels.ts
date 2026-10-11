import * as THREE from 'three';
import type { TransportItemId } from '../data/transport.ts';

export type SceneLabelView = 'all' | 'fab' | 'probe';

interface SceneLabelOptions {
  processButtons: (HTMLButtonElement | null)[];
  transportButtons: Record<TransportItemId, HTMLButtonElement | null>;
  transportPaths: Record<TransportItemId, SVGPathElement | null>;
  transportDots: Record<TransportItemId, SVGCircleElement | null>;
  anchors: THREE.Vector3[];
  movingFoup: THREE.Object3D | undefined;
}

interface SceneLabelState {
  visible: boolean;
  stage: number;
  view: SceneLabelView;
}

export interface SceneLabels {
  resize(width: number, height: number): void;
  invalidateMeasurements(): void;
  update(camera: THREE.Camera, state: SceneLabelState): void;
  /** Number of label elements measured, counting one width/height pair as one. */
  getMeasurementCount(): number;
}

interface LabelSize { width: number; height: number }
interface LabelBox extends LabelSize { x: number; y: number }
interface ButtonLayout {
  element: HTMLButtonElement;
  display: string;
  transform?: string;
  clamped?: string;
}
interface LeaderLayout {
  path: SVGPathElement | null;
  dot: SVGCircleElement | null;
  display: string;
  pathData?: string;
  targetX?: string;
  targetY?: string;
}

const transportIds: readonly TransportItemId[] = ['oht', 'foup'];

// Inline-style and attribute reads do not measure layout. Comparing before each
// assignment also tolerates React changing an element between controller calls.
function writeStyle(element: HTMLElement | SVGElement, key: 'display' | 'visibility' | 'maxWidth' | 'transform', value: string) {
  if (element.style[key] !== value) element.style[key] = value;
}

function writeAttribute(element: Element, key: string, value: string) {
  if (element.getAttribute(key) !== value) element.setAttribute(key, value);
}

/**
 * Projects the labels without reading viewport or label dimensions each frame.
 * The caller invalidates after text/font changes and supplies viewport dimensions
 * from its resize observer. All labels are measured together on the next update.
 */
export function createSceneLabels(options: SceneLabelOptions): SceneLabels {
  const { processButtons, transportButtons, transportPaths, transportDots, anchors, movingFoup } = options;
  const sizes = new WeakMap<HTMLButtonElement, LabelSize>();
  const projected = new THREE.Vector3();
  const transportAnchor = new THREE.Vector3();
  const ohtAnchor = new THREE.Vector3(2.8, 4.6, 2);
  const placed: LabelBox[] = [];
  const buttonLayouts: ButtonLayout[] = [];
  const leaderLayouts: LeaderLayout[] = [];
  let width = 0;
  let height = 0;
  let measurementsDirty = true;
  let measurementCount = 0;

  const allButtons = () => [
    ...transportIds.map(id => transportButtons[id]),
    ...processButtons,
  ].filter((button): button is HTMLButtonElement => button != null);

  const measure = (buttons: HTMLButtonElement[]) => {
    // Complete every preparatory write before the first layout read. Invisible
    // flex boxes retain their real dimensions even when collision/view hidden.
    for (const button of buttons) {
      writeStyle(button, 'visibility', 'hidden');
      writeStyle(button, 'display', 'flex');
    }
    for (const id of transportIds) {
      const button = transportButtons[id];
      if (button) writeStyle(button, 'maxWidth', `${Math.max(80, width - 24)}px`);
    }
    for (const button of buttons) {
      const measuredWidth = button.offsetWidth;
      const measuredHeight = button.offsetHeight;
      measurementCount += 1;
      const previous = sizes.get(button);
      const transport = transportIds.some(id => transportButtons[id] === button);
      sizes.set(button, {
        width: measuredWidth || previous?.width || (transport ? 112 : 100),
        height: measuredHeight || previous?.height || 34,
      });
    }
    measurementsDirty = false;
  };

  const overlaps = (x: number, y: number, w: number, h: number) => placed.some(box =>
    Math.abs(box.y - box.height / 2 - (y - h / 2)) < (box.height + h) / 2 + 7
    && Math.abs(box.x - x) < (box.width + w) / 2 + 8);

  const applyLayouts = () => {
    // Layout computation is complete; commit all visibility/position changes in
    // one write phase, restoring temporary measurement visibility before paint.
    for (const layout of buttonLayouts) {
      writeStyle(layout.element, 'display', layout.display);
      if (layout.transform !== undefined) writeStyle(layout.element, 'transform', layout.transform);
      if (layout.clamped !== undefined) writeAttribute(layout.element, 'data-clamped', layout.clamped);
      writeStyle(layout.element, 'visibility', '');
    }
    for (const layout of leaderLayouts) {
      if (layout.path) {
        writeStyle(layout.path, 'display', layout.display);
        if (layout.pathData !== undefined) writeAttribute(layout.path, 'd', layout.pathData);
      }
      if (layout.dot) {
        writeStyle(layout.dot, 'display', layout.display);
        if (layout.targetX !== undefined) writeAttribute(layout.dot, 'cx', layout.targetX);
        if (layout.targetY !== undefined) writeAttribute(layout.dot, 'cy', layout.targetY);
      }
    }
  };

  return {
    resize(nextWidth, nextHeight) {
      const validWidth = Number.isFinite(nextWidth) ? Math.max(0, nextWidth) : 0;
      const validHeight = Number.isFinite(nextHeight) ? Math.max(0, nextHeight) : 0;
      if (width === validWidth && height === validHeight) return;
      width = validWidth;
      height = validHeight;
      measurementsDirty = true;
    },
    invalidateMeasurements() { measurementsDirty = true; },
    getMeasurementCount() { return measurementCount; },
    update(camera, state) {
      placed.length = 0;
      buttonLayouts.length = 0;
      leaderLayouts.length = 0;
      const buttons = allButtons();
      if (width >= 1 && height >= 1 && (measurementsDirty || buttons.some(button => !sizes.has(button)))) measure(buttons);

      if (!state.visible || width < 1 || height < 1) {
        for (const element of buttons) buttonLayouts.push({ element, display: 'none' });
        for (const id of transportIds) leaderLayouts.push({ path: transportPaths[id], dot: transportDots[id], display: 'none' });
        applyLayouts();
        return;
      }

      // Reserve transport labels first so they remain available during orbit,
      // zoom and narrow views. Leaders point to the actual projected anchors.
      for (const id of transportIds) {
        const label = transportButtons[id];
        if (!label) {
          leaderLayouts.push({ path: transportPaths[id], dot: transportDots[id], display: 'none' });
          continue;
        }
        const { width: w, height: h } = sizes.get(label)!;
        const mobile = width < 640;
        const safeTop = mobile ? 92 : 76;
        const safeBottom = mobile ? 96 : 84;
        const minX = w / 2 + 12;
        const maxX = Math.max(minX, width - w / 2 - 12);
        const minY = Math.min(safeTop + h, height - 16);
        const maxY = Math.max(minY, height - safeBottom);
        if (id === 'foup' && movingFoup) {
          transportAnchor.set(0, 0.67, 0);
          movingFoup.localToWorld(transportAnchor);
        } else transportAnchor.copy(ohtAnchor);
        projected.copy(transportAnchor).project(camera);
        const rawX = (projected.x + 1) / 2 * width;
        const rawY = (1 - projected.y) / 2 * height;
        const clamp = (x: number, y: number) => ({
          x: THREE.MathUtils.clamp(x, minX, maxX),
          y: THREE.MathUtils.clamp(y, minY, maxY),
        });
        let spot = clamp(rawX, rawY - 16);
        if (overlaps(spot.x, spot.y, w, h)) {
          const candidates = [[0, -44], [0, 44], [-w - 18, 0], [w + 18, 0], [0, -88], [0, 88]];
          for (const [dx, dy] of candidates) {
            const candidate = clamp(rawX + dx, rawY - 16 + dy);
            if (!overlaps(candidate.x, candidate.y, w, h)) { spot = candidate; break; }
          }
        }
        const clamped = Math.abs(spot.x - rawX) > 1 || Math.abs(spot.y - (rawY - 16)) > 1;
        buttonLayouts.push({
          element: label,
          display: 'flex',
          transform: `translate(${spot.x}px, ${spot.y}px) translate(-50%, -100%)`,
          clamped: String(clamped),
        });
        placed.push({ ...spot, width: w, height: h });
        const targetX = THREE.MathUtils.clamp(rawX, 3, width - 3);
        const targetY = THREE.MathUtils.clamp(rawY, 3, height - 3);
        leaderLayouts.push({
          path: transportPaths[id], dot: transportDots[id], display: mobile || clamped ? '' : 'none',
          pathData: `M${spot.x} ${spot.y} L${targetX} ${targetY}`,
          targetX: String(targetX), targetY: String(targetY),
        });
      }

      // Keep the selected process first among processes; hidden dimensions stay
      // cached so a label never oscillates between its real width and a fallback.
      const order = [state.stage, ...Array.from({ length: processButtons.length }, (_, id) => id).filter(id => id !== state.stage)];
      for (const id of order) {
        const label = processButtons[id];
        if (!label) continue;
        const anchor = anchors[id];
        if (!anchor) {
          buttonLayouts.push({ element: label, display: 'none' });
          continue;
        }
        projected.copy(anchor).project(camera);
        const x = (projected.x + 1) / 2 * width;
        const y = (1 - projected.y) / 2 * height;
        const phaseVisible = state.view === 'all' || (state.view === 'fab' ? id < 8 : id >= 8);
        const { width: w, height: h } = sizes.get(label)!;
        const visible = phaseVisible && projected.z >= -1 && projected.z <= 1
          && x > w / 2 && x < width - w / 2 && y > 24 && y < height - 20 && !overlaps(x, y, w, h);
        buttonLayouts.push({ element: label, display: visible ? 'flex' : 'none', transform: `translate(${x}px, ${y}px) translate(-50%, -100%)` });
        if (visible) placed.push({ x, y, width: w, height: h });
      }
      applyLayouts();
    },
  };
}
