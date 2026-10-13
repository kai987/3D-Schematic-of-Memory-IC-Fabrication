import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { optimizeStaticMeshes } from './optimizeStaticMeshes.ts';
import type { StaticBatchStats } from './optimizeStaticMeshes.ts';
import type { ModelProfile } from '../data/modelProfiles.ts';

export const STATION_POSITIONS: [number, number, number][] = [
  [-10, 0, -4], [-5, 0, -4], [0, 0, -4], [5, 0, -4], [10, 0, -4],
  [-7.5, 0, 4], [-2.5, 0, 4], [2.5, 0, 4], [7.5, 0, 4],
];

export interface FabModel {
  profile: ModelProfile;
  group: THREE.Group;
  stations: THREE.Group[];
  labelAnchors: THREE.Vector3[];
  carrier: THREE.Group;
  rail: THREE.Group;
  highlights: THREE.Mesh[];
  movingParts: { object: THREE.Object3D; kind: 'spin' | 'scan' | 'arm'; stage: number }[];
  railPoints: THREE.Vector3[];
  batching: StaticBatchStats;
  dispose: () => void;
}

/** Public-information process categories, with equipment and samples shown schematically. */
export function buildFab({ optimizeStatic = true, profile = 'micron' }: { optimizeStatic?: boolean; profile?: ModelProfile } = {}): FabModel {
  const nand = profile === 'kioxia';
  const facility = nand ? 'キオクシア四日市工場' : 'Fab15';
  const group = new THREE.Group();
  group.name = nand ? 'キオクシア四日市 — BiCS FLASH™・公開資料学習モデル' : 'Fab15 — ウェーハ製造工程分類・公開資料学習モデル';
  group.userData.profile = profile;
  group.userData.memoryTechnology = nand ? 'BiCS FLASH™・3次元NANDフラッシュメモリ（模式表現）' : 'DRAM（模式表現）';
  group.userData.modelPurpose = `${facility}公開資料に基づく工程分類の学習用モデル`;
  group.userData.representation = '装置外観・寸法・配置は模式表現';
  group.userData.classificationNumberMeaning = '工程IDは分類番号であり、実際の製造順序を示さない';
  group.userData.scope = 'ウェーハ製造工程の分類。切断・組立・封止・製品最終試験は含まない';
  const geometries = new Map<string, THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const mat = (color: THREE.ColorRepresentation, metalness = 0.15, roughness = 0.45, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, metalness, roughness, ...extra });
    materials.add(m);
    return m;
  };
  const palette = {
    white: mat('#edf2f4', 0.22, 0.32), light: mat('#d8e2e7', 0.28, 0.4),
    side: mat('#c1ccd3', 0.32, 0.45), steel: mat('#9daeb9', 0.82, 0.23),
    bright: mat('#d3dee3', 0.9, 0.2), dark: mat('#243b4b', 0.5, 0.33),
    rubber: mat('#243340', 0.02, 0.8), floor: mat('#d8e5eb', 0.16, 0.33),
    grout: mat('#bacdd8', 0.06, 0.6), yellow: mat('#dab64a', 0.55, 0.3),
    teal: mat('#009fab', 0.4, 0.3), silicon: mat('#344963', 0.72, 0.16),
    gold: mat('#bc9254', 0.75, 0.28), ceramic: mat('#ece9d9', 0.12, 0.62),
    glass: mat('#81c6d7', 0.13, 0.1, { transparent: true, opacity: 0.26, depthWrite: false, side: THREE.DoubleSide }),
    tintedGlass: mat('#34798b', 0.25, 0.14, { transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide }),
    screen: mat('#054f69', 0.16, 0.25, { emissive: '#00869d', emissiveIntensity: 0.45 }),
    pixel: mat('#83e1e3', 0.08, 0.32, { emissive: '#69d5df', emissiveIntensity: 0.4 }),
    lamp: mat('#f2ffff', 0.02, 0.2, { emissive: '#cdeeff', emissiveIntensity: 1.2 }),
    green: mat('#35c994', 0.2, 0.3, { emissive: '#21a86c', emissiveIntensity: 0.7 }),
    amber: mat('#eac463', 0.18, 0.4, { emissive: '#d99c2b', emissiveIntensity: 0.22 }),
    red: mat('#dd7e6e', 0.18, 0.4), fluid: mat('#6cd4d4', 0.12, 0.22, { transparent: true, opacity: 0.7 }),
  };
  const cached = <T extends THREE.BufferGeometry>(key: string, make: () => T) => {
    if (!geometries.has(key)) geometries.set(key, make());
    return geometries.get(key)!;
  };
  const mesh = (parent: THREE.Object3D, geo: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) => {
    const m = new THREE.Mesh(geo, material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const box = (parent: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, material = palette.white, round = true) => {
    const radius = Math.min(w, h, d, 0.22) * 0.22;
    return mesh(parent, cached(`b:${w}:${h}:${d}:${round}`, () => round ? new RoundedBoxGeometry(w, h, d, 2, radius) : new THREE.BoxGeometry(w, h, d)), material, x, y, z);
  };
  const cylinder = (parent: THREE.Object3D, radius: number, height: number, x: number, y: number, z: number, material = palette.steel, top = radius) =>
    mesh(parent, cached(`c:${radius}:${top}:${height}`, () => new THREE.CylinderGeometry(top, radius, height, 24)), material, x, y, z);
  const ring = (parent: THREE.Object3D, radius: number, tube: number, x: number, y: number, z: number, material = palette.bright) => {
    const m = mesh(parent, cached(`t:${radius}:${tube}`, () => new THREE.TorusGeometry(radius, tube, 8, 32)), material, x, y, z);
    m.rotation.x = Math.PI / 2;
    return m;
  };
  const rod = (parent: THREE.Object3D, a: THREE.Vector3, b: THREE.Vector3, radius: number, material = palette.steel) => {
    const delta = b.clone().sub(a);
    const m = cylinder(parent, radius, delta.length(), 0, 0, 0, material);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    return m;
  };
  const pipe = (parent: THREE.Object3D, points: [number, number, number][], radius = 0.045, material = palette.steel) => {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)), false, 'centripetal');
    const g = new THREE.TubeGeometry(curve, points.length * 6, radius, 8, false);
    geometries.set(`pipe:${geometries.size}`, g);
    return mesh(parent, g, material, 0, 0, 0);
  };
  const repeated = (parent: THREE.Object3D, geo: THREE.BufferGeometry, material: THREE.Material, positions: [number, number, number][], rotation?: THREE.Euler) => {
    const m = new THREE.InstancedMesh(geo, material, positions.length);
    const dummy = new THREE.Object3D();
    positions.forEach((p, i) => {
      dummy.position.set(...p);
      dummy.rotation.copy(rotation || new THREE.Euler());
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const fasteners = (parent: THREE.Object3D, x: number, y: number, z: number, w: number, h: number) => {
    const ps: [number, number, number][] = [];
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) ps.push([x + sx * (w / 2 - 0.09), y + sy * (h / 2 - 0.09), z]);
    repeated(parent, cached('bolt', () => new THREE.CylinderGeometry(0.027, 0.027, 0.017, 6)), palette.steel, ps, new THREE.Euler(Math.PI / 2, 0, 0));
  };
  const vent = (parent: THREE.Object3D, x: number, y: number, z: number, w = 0.55, h = 0.32) => {
    box(parent, w + 0.06, h + 0.06, 0.018, x, y, z, palette.side);
    const ps: [number, number, number][] = [];
    for (let i = 0; i < 6; i++) ps.push([x, y - h / 2 + (i + 0.5) * h / 6, z + 0.017]);
    repeated(parent, cached(`vent:${w}`, () => new THREE.BoxGeometry(w, 0.018, 0.009)), palette.dark, ps);
  };
  const monitor = (parent: THREE.Object3D, x: number, y: number, z: number, scale = 1, tilted = false) => {
    const screen = new THREE.Group();
    screen.position.set(x, y, z);
    screen.scale.setScalar(scale);
    if (tilted) screen.rotation.x = -0.22;
    parent.add(screen);
    box(screen, 0.58, 0.43, 0.08, 0, 0, 0, palette.dark);
    box(screen, 0.47, 0.31, 0.013, 0, 0.012, 0.049, palette.screen, false);
    box(screen, 0.1, 0.018, 0.012, -0.14, 0.108, 0.06, palette.pixel, false);
    const ps: [number, number, number][] = [];
    for (let i = 0; i < 5; i++) ps.push([-0.14 + i * 0.066, -0.02 + Math.sin(i * 1.1) * 0.035, 0.06]);
    repeated(screen, cached('screen-pixel', () => new THREE.BoxGeometry(0.044, 0.075, 0.007)), palette.pixel, ps);
    return screen;
  };
  const statusTower = (parent: THREE.Object3D, x: number, y: number, z: number) => {
    cylinder(parent, 0.027, 0.23, x, y + 0.115, z, palette.steel);
    cylinder(parent, 0.064, 0.045, x, y + 0.22, z, palette.dark);
    cylinder(parent, 0.053, 0.09, x, y + 0.29, z, palette.red);
    cylinder(parent, 0.053, 0.09, x, y + 0.39, z, palette.amber);
    cylinder(parent, 0.053, 0.09, x, y + 0.49, z, palette.green);
    cylinder(parent, 0.064, 0.045, x, y + 0.55, z, palette.dark);
  };
  const cabinet = (parent: THREE.Object3D, x: number, z: number, w = 1.25, h = 2.25, d = 1.5, detail = true) => {
    box(parent, w, h, d, x, 0.17 + h / 2, z, palette.white);
    box(parent, w + 0.06, 0.12, d + 0.04, x, 0.16, z, palette.dark);
    box(parent, w - 0.035, 0.1, d - 0.025, x, h + 0.18, z, palette.light);
    const front = z + d / 2 + 0.013;
    box(parent, w - 0.1, h - 0.17, 0.022, x, h / 2 + 0.18, front, palette.light);
    box(parent, 0.018, h - 0.28, 0.012, x + w * 0.19, h / 2 + 0.18, front + 0.018, palette.side, false);
    box(parent, 0.032, 0.23, 0.04, x + w * 0.27, h / 2 + 0.22, front + 0.04, palette.steel);
    box(parent, 0.23, 0.058, 0.014, x - w * 0.22, h - 0.08, front + 0.022, palette.dark, false);
    if (detail) {
      vent(parent, x - w * 0.13, 0.49, front + 0.026, Math.min(w * 0.62, 0.75), 0.28);
      fasteners(parent, x, h / 2 + 0.18, front + 0.035, w - 0.1, h - 0.17);
    }
    return front;
  };
  const wafer = (parent: THREE.Object3D, x: number, y: number, z: number, r = 0.43, patterned = true) => {
    const g = new THREE.Group();
    g.position.set(x, y, z);
    parent.add(g);
    cylinder(g, r, 0.026, 0, 0, 0, palette.silicon);
    ring(g, r - 0.015, 0.009, 0, 0.016, 0, palette.bright);
    if (patterned) {
      const ps: [number, number, number][] = [];
      for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) {
        if (a * a + b * b < 10.8) ps.push([a * r * 0.23, 0.018, b * r * 0.23]);
      }
      repeated(g, cached(`die:${r}`, () => new THREE.BoxGeometry(r * 0.195, 0.008, r * 0.195)), palette.teal, ps);
    }
    return g;
  };
  const foup = (parent: THREE.Object3D, x: number, y: number, z: number, translucent = true) => {
    const g = new THREE.Group();
    g.name = 'FOUP容器';
    g.userData.transportItem = 'foup';
    g.position.set(x, y, z);
    parent.add(g);
    box(g, 0.63, 0.1, 0.67, 0, 0.06, 0, palette.dark);
    box(g, 0.59, 0.68, 0.59, 0, 0.44, 0, translucent ? palette.tintedGlass : palette.light);
    box(g, 0.53, 0.58, 0.055, 0, 0.43, 0.31, palette.side);
    box(g, 0.29, 0.33, 0.014, 0, 0.45, 0.345, palette.dark);
    box(g, 0.14, 0.05, 0.015, 0, 0.53, 0.355, palette.light, false);
    box(g, 0.27, 0.09, 0.14, 0, 0.83, 0, palette.dark);
    const ps: [number, number, number][] = [];
    for (let i = 0; i < 8; i++) ps.push([0, 0.18 + i * 0.064, 0]);
    repeated(g, cached('foup-wafer', () => new THREE.CylinderGeometry(0.248, 0.248, 0.012, 24)), palette.silicon, ps);
    return g;
  };
  const loadport = (parent: THREE.Object3D, x: number, z: number, withFoup = true) => {
    box(parent, 0.78, 0.72, 0.56, x, 0.54, z, palette.light);
    box(parent, 0.86, 0.055, 0.78, x, 0.93, z + 0.05, palette.steel);
    box(parent, 0.73, 0.18, 0.035, x, 0.58, z + 0.3, palette.dark);
    if (withFoup) foup(parent, x, 0.97, z + 0.045);
    fasteners(parent, x, 0.5, z + 0.3, 0.74, 0.58);
  };
  const movingParts: FabModel['movingParts'] = [];
  const robot = (parent: THREE.Object3D, x: number, y: number, z: number, stage: number, scale = 1) => {
    const arm = new THREE.Group();
    arm.position.set(x, y, z);
    arm.scale.setScalar(scale);
    parent.add(arm);
    cylinder(arm, 0.17, 0.15, 0, 0.075, 0, palette.dark);
    cylinder(arm, 0.135, 0.14, 0, 0.2, 0, palette.bright);
    box(arm, 0.15, 0.07, 0.61, 0, 0.31, 0.25, palette.steel);
    cylinder(arm, 0.09, 0.075, 0, 0.35, 0.5, palette.dark);
    box(arm, 0.12, 0.055, 0.5, 0.15, 0.42, 0.59, palette.bright).rotation.y = 0.7;
    box(arm, 0.27, 0.024, 0.27, 0.29, 0.46, 0.74, palette.ceramic);
    wafer(arm, 0.29, 0.49, 0.74, 0.23, false);
    movingParts.push({ object: arm, kind: 'arm', stage });
    return arm;
  };
  const chamber = (parent: THREE.Object3D, x: number, z: number, r = 0.57, h = 1.35, glass = false) => {
    cylinder(parent, r + 0.06, 0.15, x, 0.24, z, palette.dark);
    cylinder(parent, r, h, x, 0.33 + h / 2, z, glass ? palette.tintedGlass : palette.steel);
    ring(parent, r, 0.043, x, 0.42, z);
    ring(parent, r, 0.043, x, h + 0.23, z);
    cylinder(parent, r + 0.04, 0.14, x, h + 0.39, z, palette.bright);
    cylinder(parent, r * 0.75, 0.06, x, h + 0.49, z, palette.light);
    cylinder(parent, r * 0.26, 0.19, x, h + 0.6, z, palette.dark);
    const ps: [number, number, number][] = [];
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      ps.push([x + Math.cos(a) * r * 0.87, h + 0.475, z + Math.sin(a) * r * 0.87]);
    }
    repeated(parent, cached('flange-bolt', () => new THREE.CylinderGeometry(0.031, 0.031, 0.04, 6)), palette.dark, ps);
    return h + 0.7;
  };
  const glassFrame = (parent: THREE.Object3D, x: number, y: number, z: number, w: number, h: number, d: number) => {
    box(parent, w, h, 0.023, x, y, z + d / 2, palette.glass, false);
    box(parent, 0.023, h, d, x - w / 2, y, z, palette.glass, false);
    box(parent, 0.023, h, d, x + w / 2, y, z, palette.glass, false);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(parent, 0.055, h + 0.07, 0.055, x + sx * w / 2, y, z + sz * d / 2, palette.steel);
    box(parent, w + 0.07, 0.07, d + 0.07, x, y + h / 2, z, palette.light);
    box(parent, w + 0.07, 0.06, d + 0.07, x, y - h / 2, z, palette.steel);
  };

  // These enlarged samples explain BiCS FLASH principles. They are separate
  // from the generic equipment and do not depict a product layer count,
  // material recipe, dimension, or the inside of an installed production tool.
  const nandSample = (parent: THREE.Object3D, x: number, y: number, z: number, kind: 'stack' | 'holes' | 'channels') => {
    const sample = new THREE.Group();
    sample.position.set(x, y, z);
    sample.name = kind === 'stack' ? '多層膜スタック・拡大模式標本' : kind === 'holes' ? '垂直開孔・拡大模式標本' : '垂直チャネル・ワードライン・拡大模式標本';
    sample.userData.role = 'nand-schematic';
    sample.userData.schematicFeature = kind;
    sample.userData.representation = '学習用の拡大模式標本。実際の層数・寸法・材料・装置内構造は再現しない';
    sample.userData.sourceUrls = ['https://www.kioxia.com/ja-jp/rd/technology/bics-flash.html'];
    parent.add(sample);
    const width = 1.04, depth = 0.78, pitch = 0.09, pairs = 6;
    const contacts: [number, number, number][] = [];
    for (const cx of [-0.29, 0, 0.29]) for (const cz of [-0.19, 0.19]) contacts.push([cx, 0, cz]);
    const plate = cached(`nand-plate:${kind === 'stack' ? 'solid' : 'holes'}`, () => {
      if (kind === 'stack') return new THREE.BoxGeometry(width, 0.031, depth);
      const shape = new THREE.Shape();
      shape.moveTo(-width / 2, -depth / 2); shape.lineTo(width / 2, -depth / 2);
      shape.lineTo(width / 2, depth / 2); shape.lineTo(-width / 2, depth / 2); shape.closePath();
      for (const [cx, , cz] of contacts) {
        const hole = new THREE.Path();
        hole.absarc(cx, cz, 0.065, 0, Math.PI * 2, true);
        shape.holes.push(hole);
      }
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.031, bevelEnabled: false, steps: 1, curveSegments: 12 });
      geometry.rotateX(-Math.PI / 2);
      return geometry;
    });
    const dielectric: [number, number, number][] = [], gates: [number, number, number][] = [];
    for (let i = 0; i < pairs; i++) {
      dielectric.push([0, i * pitch + 0.046, 0]);
      gates.push([0, i * pitch, 0]);
      // The exposed edge makes the stacked horizontal electrodes readable.
      box(sample, 0.14 + i * 0.016, 0.022, 0.12, -0.53 - i * 0.008, i * pitch + 0.005, 0.25, palette.gold, false);
    }
    repeated(sample, plate, palette.light, dielectric).name = '絶縁層・省略模式';
    repeated(sample, plate, palette.gold, gates).name = '水平電極層・省略模式';
    box(sample, width + 0.1, 0.045, depth + 0.1, 0, -0.05, 0, palette.silicon, false);
    if (kind === 'channels') {
      const height = pairs * pitch + 0.08;
      const channelPositions = contacts.map(([cx, , cz]) => [cx, height / 2 - 0.015, cz] as [number, number, number]);
      repeated(sample, cached('nand-charge-storage', () => new THREE.CylinderGeometry(0.046, 0.046, height, 16)), palette.tintedGlass, channelPositions).name = '電荷蓄積膜・柱状模式';
      repeated(sample, cached('nand-channel', () => new THREE.CylinderGeometry(0.023, 0.023, height + 0.075, 16)), palette.teal, channelPositions).name = '垂直チャネル・柱状模式';
      for (const [cx, , cz] of contacts) ring(sample, 0.06, 0.009, cx, height - 0.001, cz, palette.bright);
    }
    return sample;
  };

  // The tiled plinth is separate from the tools so that the layout reads clearly.
  const floor = box(group, 27, 0.24, 14.8, 0, -0.17, 0, palette.floor);
  floor.name = '学習用クリーンルーム床・模式寸法';
  floor.userData.representation = `装置配置を説明するための模式床。${facility}の実配置・実寸を示さない`;
  const tileXs: [number, number, number][] = [];
  const tileZs: [number, number, number][] = [];
  for (let x = -12; x <= 12; x += 2) tileXs.push([x, -0.041, 0]);
  for (let z = -6; z <= 6; z += 2) tileZs.push([0, -0.04, z]);
  repeated(group, cached('floor-x', () => new THREE.BoxGeometry(0.015, 0.005, 14.5)), palette.grout, tileXs);
  repeated(group, cached('floor-z', () => new THREE.BoxGeometry(26.6, 0.005, 0.015)), palette.grout, tileZs);
  box(group, 26.7, 0.05, 0.12, 0, -0.02, -7.2, palette.light);
  box(group, 26.7, 0.05, 0.12, 0, -0.02, 7.2, palette.light);
  box(group, 26.6, 2.8, 0.024, 0, 1.45, -7.05, palette.glass, false);
  for (let x = -12; x <= 12; x += 4) {
    box(group, 0.095, 3.05, 0.13, x, 1.49, -7.07, palette.light);
    if (x < 12) box(group, 2.6, 0.06, 0.07, x + 1.45, 2.5, -7, palette.lamp);
  }
  box(group, 26.5, 0.08, 0.1, 0, 2.92, -7.07, palette.steel);
  box(group, 26.5, 0.08, 0.1, 0, 0.15, -7.07, palette.steel);

  const japaneseNames = nand
    ? ['搬入・ウェーハ搬送', '洗浄', '多層膜形成', '露光', '高アスペクト比加工', 'メモリセル・ワードライン形成', 'CMP', 'CBA・ウェーハ接合', 'ウェーハ検査']
    : ['搬入・ウェーハ供給', '洗浄', '成膜', '露光', 'エッチング', 'イオン注入・熱処理', 'CMP', '計測', 'ウェーハ電気検査'];
  const stations = STATION_POSITIONS.map((position, i) => {
    const station = new THREE.Group();
    station.name = `${String(i + 1).padStart(2, '0')} ${japaneseNames[i]}`;
    station.position.set(...position);
    group.add(station);
    return station;
  });
  const highlights = stations.map((station, stage) => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.93, -1.8); shape.lineTo(1.93, -1.8); shape.lineTo(1.93, 1.96); shape.lineTo(-1.93, 1.96); shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-1.87, -1.74); hole.lineTo(-1.87, 1.9); hole.lineTo(1.87, 1.9); hole.lineTo(1.87, -1.74); hole.closePath();
    shape.holes.push(hole);
    const geometry = new THREE.ShapeGeometry(shape);
    geometries.set(`highlight:${geometries.size}`, geometry);
    const material = new THREE.MeshBasicMaterial({ color: '#00afbc', transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false });
    materials.add(material);
    const m = mesh(station, geometry, material, 0, 0.016, 0);
    m.name = `selection-${stage}`;
    m.userData.role = 'selection';
    m.rotation.x = -Math.PI / 2;
    m.visible = false;
    m.castShadow = false;
    return m;
  });

  // 01 — Load station: two FOUP docks, a visible EFEM handling enclosure.
  {
    const s = stations[0];
    cabinet(s, -1.25, -0.12, 0.65, 2.3, 1.3);
    box(s, 2.02, 0.78, 1.45, 0.14, 0.59, -0.1, palette.white);
    glassFrame(s, 0.14, 1.63, -0.1, 2.02, 1.34, 1.45);
    robot(s, -0.13, 1.08, -0.43, 0, 1.1);
    for (const x of [-0.46, 0.52]) loadport(s, x, 1.13);
    monitor(s, -1.25, 1.68, 0.68, 0.73);
    statusTower(s, -1.25, 2.5, -0.2);
    box(s, 1.47, 0.12, 0.36, 0.15, 2.44, -0.15, palette.light);
    pipe(s, [[-1.5, 0.35, -0.7], [-1.5, 2.4, -0.7], [-0.9, 2.65, -0.7]], 0.04);
  }
  // 02 — Wet bench: transparent bath covers, chemistry loops, travelling lift.
  {
    const s = stations[1];
    box(s, 3.32, 1.04, 1.7, 0, 0.69, -0.12, palette.white);
    box(s, 3.4, 0.09, 1.8, 0, 1.25, -0.12, palette.steel);
    for (const x of [-1.04, 0, 1.04]) {
      box(s, 0.89, 0.31, 1.32, x, 1.32, -0.12, palette.dark);
      box(s, 0.79, 0.055, 1.19, x, 1.49, -0.12, palette.fluid, false);
      glassFrame(s, x, 1.87, -0.12, 0.93, 0.75, 1.47);
      box(s, 0.94, 0.82, 0.035, x, 0.67, 0.755, palette.light);
      vent(s, x, 0.52, 0.78, 0.53, 0.3);
      pipe(s, [[x - 0.31, 1.52, -0.65], [x - 0.31, 1.83, -0.65], [x + 0.28, 1.87, -0.65], [x + 0.28, 1.54, -0.65]], 0.026, palette.bright);
    }
    box(s, 3.05, 0.1, 0.13, 0, 2.45, -0.58, palette.dark);
    const lift = new THREE.Group(); lift.position.set(0, 1.65, -0.34); s.add(lift);
    rod(lift, new THREE.Vector3(0, 0.1, 0), new THREE.Vector3(0, 0.77, 0), 0.035);
    box(lift, 0.63, 0.25, 0.58, 0, 0.05, 0, palette.steel);
    const racks: [number, number, number][] = [];
    for (let i = 0; i < 5; i++) racks.push([-0.23 + i * 0.115, 0.17, 0]);
    repeated(lift, cached('wet-wafer', () => new THREE.CylinderGeometry(0.25, 0.25, 0.017, 24)), palette.silicon, racks, new THREE.Euler(0, 0, Math.PI / 2));
    movingParts.push({ object: lift, kind: 'scan', stage: 1 });
    monitor(s, 1.22, 1.02, 0.85, 0.68);
    statusTower(s, 1.42, 2.31, -0.6);
  }
  // 03 — Cluster deposition: a radial transfer chamber and separate process pods.
  {
    const s = stations[2];
    cylinder(s, 0.67, 1.45, 0, 1.03, -0.1, palette.light);
    cylinder(s, 0.65, 0.11, 0, 1.83, -0.1, palette.steel);
    for (const [x, z] of [[-1.13, -0.62], [1.13, -0.62], [-0.9, 0.73], [0.9, 0.73]]) {
      chamber(s, x, z, 0.5, 1.39);
      rod(s, new THREE.Vector3(x * 0.45, 1.12, z * 0.45), new THREE.Vector3(x, 1.12, z), 0.19, palette.bright);
      pipe(s, [[x, 1.85, z], [x, 2.33, z], [x * 0.6, 2.43, z - 0.25]], 0.037, palette.teal);
    }
    chamber(s, 0, -1.04, 0.42, 2.09, true);
    cabinet(s, -1.55, -1.03, 0.42, 1.7, 0.8, false);
    loadport(s, 0, 1.52);
    monitor(s, 1.48, 1.72, 0.92, 0.68);
    statusTower(s, -1.51, 1.98, -1.1);
    wafer(s, 0, 1.9, -0.1, 0.46);
    if (nand) nandSample(s, 0, 1.98, -0.1, 'stack');
  }
  // 04 — Lithography scanner paired with the resist coat/develop track.
  {
    const s = stations[3];
    box(s, 2.25, 2.42, 1.92, 0.5, 1.4, -0.18, palette.white);
    box(s, 2.29, 0.11, 1.94, 0.5, 2.66, -0.18, palette.light);
    box(s, 2.26, 0.15, 1.96, 0.5, 0.2, -0.18, palette.dark);
    for (const x of [-0.05, 0.99]) {
      box(s, 0.018, 2.33, 0.024, x, 1.43, 0.802, palette.side, false);
      fasteners(s, x + 0.27, 1.45, 0.813, 0.53, 2.1);
    }
    box(s, 0.92, 0.51, 0.035, 0.47, 1.77, 0.81, palette.dark);
    box(s, 0.77, 0.4, 0.045, 0.47, 1.77, 0.835, palette.tintedGlass);
    cylinder(s, 0.25, 0.71, 0.48, 1.68, 0.3, palette.bright);
    wafer(s, 0.49, 1.25, 0.4, 0.37);
    cabinet(s, -1.36, -0.13, 0.94, 1.76, 1.9);
    cylinder(s, 0.33, 0.15, -1.36, 1.99, 0.22, palette.steel);
    const spinner = wafer(s, -1.36, 2.1, 0.22, 0.31);
    movingParts.push({ object: spinner, kind: 'spin', stage: 3 });
    loadport(s, -0.9, 1.38);
    monitor(s, 1.38, 1.24, 0.99, 0.86);
    vent(s, 1.31, 0.51, 0.825, 0.39, 0.34);
    statusTower(s, 1.42, 2.71, -0.55);
    box(s, 1.67, 0.035, 0.46, 0.48, 2.755, -0.17, palette.side);
  }
  // 05 — Plasma etch: three vacuum pods, dry pumps and gas distribution.
  {
    const s = stations[4];
    box(s, 2.47, 1.03, 1.77, -0.32, 0.7, -0.16, palette.light);
    for (const [x, z] of [[-1, -0.5], [0.36, -0.5], [-0.3, 0.59]]) chamber(s, x, z, 0.52, 1.4);
    cabinet(s, 1.27, -0.47, 0.65, 2.24, 1.39);
    for (const x of [-1.22, -0.84, -0.47, -0.08]) {
      pipe(s, [[x, 0.28, -1.15], [x, 2.27, -1.15], [x + 0.24, 2.37, -0.8]], 0.027, palette.bright);
    }
    loadport(s, 0.35, 1.52);
    monitor(s, 1.27, 1.66, 0.38, 0.74);
    statusTower(s, 1.25, 2.49, -0.6);
    box(s, 0.27, 0.08, 0.016, 1.28, 2.07, 0.242, palette.teal);
    cylinder(s, 0.24, 0.63, -1.45, 0.6, -1.07, palette.steel);
    if (nand) nandSample(s, -0.3, 2.18, 0.59, 'holes');
  }
  // 06 — DRAM beamline/thermal treatment or a NAND cell-formation schematic.
  if (!nand) {
    const s = stations[5];
    box(s, 2.42, 1.26, 1.39, -0.4, 0.86, 0.11, palette.white);
    box(s, 2.48, 0.09, 1.45, -0.4, 1.53, 0.11, palette.steel);
    const beam = cylinder(s, 0.29, 2.22, -0.44, 1.93, -0.04, palette.bright); beam.rotation.z = Math.PI / 2;
    for (const x of [-1.28, -0.56, 0.17, 0.59]) {
      const flange = cylinder(s, 0.36, 0.11, x, 1.93, -0.04, palette.steel); flange.rotation.z = Math.PI / 2;
    }
    box(s, 0.72, 0.9, 0.95, -1.32, 1.91, -0.06, palette.dark);
    box(s, 0.75, 0.08, 1, -1.32, 2.4, -0.06, palette.yellow);
    const chamberFace = cylinder(s, 0.5, 0.7, 0.52, 1.85, 0.15, palette.steel); chamberFace.rotation.x = Math.PI / 2;
    const port = cylinder(s, 0.27, 0.025, 0.52, 1.85, 0.515, palette.tintedGlass); port.rotation.x = Math.PI / 2;
    cabinet(s, 1.44, -0.57, 0.68, 2.44, 1.46);
    cylinder(s, 0.22, 1.65, 1.44, 1.56, -0.55, palette.dark);
    for (const x of [-1.16, -0.42, 0.32]) {
      box(s, 0.69, 1.05, 0.025, x, 0.86, 0.82, palette.light);
      vent(s, x, 0.5, 0.85, 0.42, 0.21);
    }
    monitor(s, 1.44, 1.46, 0.32, 0.68);
    statusTower(s, 1.44, 2.66, -0.62);
    pipe(s, [[0.52, 2.2, -0.3], [0.52, 2.57, -0.3], [1.1, 2.63, -0.3]], 0.05);
  } else {
    const s = stations[5];
    cabinet(s, 1.36, -0.28, 0.72, 2.26, 1.7);
    box(s, 2.53, 1.12, 1.68, -0.4, 0.74, -0.08, palette.white);
    box(s, 2.6, 0.1, 1.74, -0.4, 1.34, -0.08, palette.steel);
    chamber(s, -1.02, -0.62, 0.44, 1.46);
    chamber(s, 0.18, -0.62, 0.44, 1.46);
    rod(s, new THREE.Vector3(-0.68, 1.38, -0.62), new THREE.Vector3(-0.18, 1.38, -0.62), 0.13, palette.bright);
    glassFrame(s, -0.38, 1.93, 0.38, 1.54, 0.96, 0.88);
    const sample = nandSample(s, -0.38, 1.57, 0.43, 'channels');
    sample.userData.equipmentRelation = '構造を学ぶための拡大表示。装置内の実際の処理対象・配置を示さない';
    loadport(s, 0.53, 1.46, false);
    monitor(s, 1.36, 1.68, 0.61, 0.73);
    statusTower(s, 1.34, 2.45, -0.65);
    for (const x of [-1.06, -0.36]) vent(s, x, 0.54, 0.79, 0.52, 0.28);
    pipe(s, [[-1.02, 1.85, -0.62], [-1.02, 2.37, -0.89], [0.28, 2.37, -0.89]], 0.036, palette.teal);
  }
  // 07 — Chemical mechanical polishing: exposed polishing bowls and carriers.
  {
    const s = stations[6];
    box(s, 2.88, 0.92, 1.85, -0.23, 0.65, -0.06, palette.white);
    box(s, 2.96, 0.085, 1.93, -0.23, 1.17, -0.06, palette.steel);
    for (const [x, z] of [[-1.02, -0.5], [0.15, -0.5], [-0.55, 0.58]]) {
      cylinder(s, 0.49, 0.18, x, 1.31, z, palette.bright);
      cylinder(s, 0.425, 0.038, x, 1.425, z, palette.ceramic);
      const polish = new THREE.Group(); polish.position.set(x, 1.45, z); s.add(polish);
      cylinder(polish, 0.24, 0.15, 0.12, 0.23, 0, palette.dark);
      cylinder(polish, 0.19, 0.055, 0.12, 0.125, 0, palette.teal);
      box(polish, 0.14, 0.085, 0.63, 0.12, 0.36, -0.22, palette.steel);
      cylinder(polish, 0.068, 0.65, 0.12, 0.39, -0.48, palette.steel);
      movingParts.push({ object: polish, kind: 'spin', stage: 6 });
      pipe(s, [[x - 0.25, 1.45, z], [x - 0.25, 1.95, z - 0.25], [x - 0.08, 1.97, z - 0.3]], 0.025, palette.teal);
    }
    cabinet(s, 1.34, -0.35, 0.74, 2.14, 1.53);
    monitor(s, 1.34, 1.61, 0.47, 0.74);
    statusTower(s, 1.32, 2.33, -0.6);
    for (const x of [-1.03, -0.15]) vent(s, x, 0.52, 0.89, 0.63, 0.35);
    loadport(s, 0.53, 1.45);
  }
  // 08 — DRAM optical metrology or a generic NAND CBA wafer-alignment tool.
  if (!nand) {
    const s = stations[7];
    cabinet(s, -1.35, -0.06, 0.6, 2.27, 1.74);
    box(s, 2.31, 1.13, 1.79, 0.24, 0.77, -0.06, palette.white);
    glassFrame(s, 0.23, 1.98, -0.05, 2.22, 1.12, 1.77);
    box(s, 0.76, 0.14, 1.4, 0.27, 1.44, -0.15, palette.dark);
    const stage = new THREE.Group(); stage.position.set(0.22, 1.56, 0.09); s.add(stage);
    cylinder(stage, 0.53, 0.085, 0, 0, 0, palette.steel);
    wafer(stage, 0, 0.08, 0, 0.43);
    movingParts.push({ object: stage, kind: 'scan', stage: 7 });
    box(s, 0.3, 0.92, 0.36, 0.25, 1.96, -0.67, palette.light);
    box(s, 0.32, 0.17, 0.93, 0.25, 2.42, -0.29, palette.steel);
    cylinder(s, 0.13, 0.35, 0.25, 2.23, 0.11, palette.dark);
    cylinder(s, 0.1, 0.06, 0.25, 2.02, 0.11, palette.teal);
    loadport(s, -0.33, 1.45);
    monitor(s, 1.09, 1.1, 0.95, 0.8);
    statusTower(s, -1.35, 2.49, -0.45);
    vent(s, 0.77, 0.58, 0.857, 0.63, 0.32);
  } else {
    const s = stations[7];
    cabinet(s, -1.38, -0.18, 0.55, 2.26, 1.67);
    box(s, 2.42, 1.08, 1.81, 0.23, 0.76, -0.08, palette.white);
    box(s, 2.49, 0.09, 1.9, 0.23, 1.35, -0.08, palette.steel);
    glassFrame(s, 0.22, 2.04, -0.02, 2.27, 1.3, 1.72);
    for (const x of [-0.57, 1.04]) cylinder(s, 0.048, 1.07, x, 1.96, -0.55, palette.bright);
    box(s, 1.76, 0.13, 0.43, 0.23, 2.5, -0.55, palette.steel);
    cylinder(s, 0.11, 0.22, 0.23, 2.33, 0.1, palette.dark);
    cylinder(s, 0.58, 0.12, 0.23, 1.5, 0.1, palette.steel);
    const cmos = wafer(s, 0.23, 1.6, 0.1, 0.48);
    cmos.name = 'CMOSウェーハ・CBA模式';
    cmos.userData.schematicFeature = 'cba-cmos-wafer';
    const array = new THREE.Group(); array.position.set(0.23, 2.05, 0.1); s.add(array);
    array.name = 'セルアレイウェーハ・CBA対向模式';
    array.userData.schematicFeature = 'cba-array-wafer';
    array.userData.representation = '上下のウェーハと間隔は貼り合わせを説明する模式表現。実寸・装置構成・接合条件は再現しない';
    array.userData.sourceUrls = ['https://www.kioxia.com/ja-jp/rd/technology/cba.html'];
    ring(array, 0.54, 0.038, 0, 0.11, 0, palette.bright);
    wafer(array, 0, 0.025, 0, 0.48, false);
    const pads: [number, number, number][] = [];
    for (const px of [-0.24, -0.08, 0.08, 0.24]) for (const pz of [-0.24, -0.08, 0.08, 0.24]) {
      if (px * px + pz * pz < 0.15) pads.push([px, 0.027, pz]);
    }
    repeated(cmos, cached('cba-pad', () => new THREE.BoxGeometry(0.052, 0.014, 0.052)), palette.gold, pads).name = 'CMOS側Cu接合パッド・模式';
    repeated(array, cached('cba-pad', () => new THREE.BoxGeometry(0.052, 0.014, 0.052)), palette.gold, pads.map(([px, , pz]) => [px, 0.002, pz])).name = 'セルアレイ側Cu接合パッド・模式';
    movingParts.push({ object: array, kind: 'scan', stage: 7 });
    loadport(s, -0.33, 1.44);
    monitor(s, 1.09, 1.16, 0.99, 0.8);
    statusTower(s, -1.37, 2.46, -0.51);
    vent(s, 0.81, 0.56, 0.84, 0.58, 0.3);
  }
  // 09 — Wafer prober: wafer chuck, probe card and fine alignment mechanics.
  {
    const s = stations[8];
    box(s, 2.87, 0.99, 1.92, 0, 0.7, -0.05, palette.white);
    box(s, 2.93, 0.08, 1.96, 0, 1.24, -0.05, palette.steel);
    glassFrame(s, 0, 1.97, -0.1, 2.79, 1.4, 1.81);
    box(s, 1.46, 0.14, 1.32, -0.22, 1.4, -0.08, palette.dark);
    const chuck = new THREE.Group(); chuck.position.set(-0.22, 1.53, 0.1); s.add(chuck);
    cylinder(chuck, 0.55, 0.14, 0, 0, 0, palette.steel);
    wafer(chuck, 0, 0.12, 0, 0.46);
    movingParts.push({ object: chuck, kind: 'scan', stage: 8 });
    for (const x of [-0.83, 0.42]) cylinder(s, 0.045, 0.97, x, 1.94, -0.2, palette.bright);
    box(s, 1.61, 0.13, 0.34, -0.23, 2.4, -0.2, palette.steel);
    cylinder(s, 0.18, 0.25, -0.22, 2.25, 0.1, palette.dark);
    cylinder(s, 0.38, 0.048, -0.22, 2.08, 0.1, palette.gold);
    cylinder(s, 0.28, 0.05, -0.22, 2.025, 0.1, palette.ceramic);
    box(s, 0.45, 0.7, 0.37, 1.05, 1.7, -0.55, palette.light);
    monitor(s, -0.59, 1.13, 1.09, 0.82, true);
    monitor(s, 0.34, 1.13, 1.09, 0.82, true);
    box(s, 2.4, 0.07, 0.58, -0.06, 0.85, 1.05, palette.light);
    vent(s, -0.73, 0.5, 0.94, 0.79, 0.27);
    statusTower(s, 1.16, 2.72, -0.66);
  }
  // Generic OHT/FOUP demonstration, never a reconstruction of the named fab.
  const rail = new THREE.Group();
  rail.name = 'OHT搬送レール・模式配置';
  rail.userData.transportItem = 'oht';
  rail.userData.representation = `OHT・FOUP搬送の一般的な模式表現。${facility}の実経路・実寸を示さない`;
  group.add(rail);
  const railPoints = [
    [-12, 4.5, -2], [12, 4.5, -2], [12, 4.5, 2], [-12, 4.5, 2], [-12, 4.5, -2],
  ].map(p => new THREE.Vector3(...p as [number, number, number]));
  const railTies: [number, number, number][] = [];
  for (let i = 1; i < railPoints.length; i++) {
    const a = railPoints[i - 1]; const b = railPoints[i];
    const d = b.clone().sub(a); const length = d.length();
    const beam = box(rail, length, 0.17, 0.17, (a.x + b.x) / 2, 4.5, (a.z + b.z) / 2, palette.yellow);
    beam.rotation.y = -Math.atan2(d.z, d.x);
    const track = box(rail, length, 0.05, 0.07, (a.x + b.x) / 2, 4.37, (a.z + b.z) / 2, palette.steel);
    track.rotation.copy(beam.rotation);
    for (let t = 0.4; t < length; t += 1.3) {
      const point = a.clone().lerp(b, t / length);
      railTies.push([point.x, 4.55, point.z]);
    }
  }
  repeated(rail, cached('rail-tie', () => new THREE.BoxGeometry(0.17, 0.24, 0.32)), palette.dark, railTies);
  for (const [x, z] of [[-12, -2], [12, -2], [-12, 2], [12, 2]]) {
    box(rail, 0.15, 4.43, 0.15, x, 2.2, z, palette.light);
    box(rail, 0.38, 0.07, 0.38, x, 0.03, z, palette.steel);
    box(rail, 0.35, 0.16, 0.29, x, 4.46, z, palette.yellow);
    box(rail, 0.13, 0.56, 0.15, x, 0.31, z, palette.yellow);
  }
  const carrier = new THREE.Group();
  carrier.name = 'OHT・FOUP 搬送キャリア';
  carrier.userData.transportItem = 'oht';
  carrier.userData.representation = 'OHT・FOUP搬送の一般的な模式表現';
  carrier.position.set(-10, 4.5, -2);
  group.add(carrier);
  box(carrier, 0.96, 0.22, 0.68, 0, -0.18, 0, palette.yellow);
  for (const x of [-0.36, 0.36]) {
    box(carrier, 0.08, 0.23, 0.08, x, -0.355, 0, palette.steel);
    cylinder(carrier, 0.09, 0.07, x, -0.055, 0, palette.dark).rotation.z = Math.PI / 2;
  }
  const payload = new THREE.Group();
  payload.name = 'FOUP昇降部';
  payload.position.y = -1.7;
  carrier.add(payload);
  box(payload, 0.83, 0.1, 0.58, 0, 0.83, 0, palette.dark);
  foup(payload, 0, 0, 0, false);
  for (const [x, name] of [[-0.31, '昇降ケーブル左'], [0.31, '昇降ケーブル右']] as const) {
    const topY = -0.44;
    const attachmentOffsetY = 0.86;
    const bottomY = payload.position.y + attachmentOffsetY;
    const cable = cylinder(carrier, 0.012, 1, x, (topY + bottomY) / 2, 0, palette.dark);
    cable.name = name;
    cable.scale.y = topY - bottomY;
    cable.userData.topY = topY;
    cable.userData.attachmentOffsetY = attachmentOffsetY;
    cable.userData.baseLength = 1;
  }
  box(carrier, 0.1, 0.06, 0.018, 0, -0.17, 0.354, palette.green);

  const labelAnchors = STATION_POSITIONS.map(([x, , z]) => new THREE.Vector3(x, 3.38, z));
  stations.forEach((station, stage) => {
    station.userData.stage = stage;
    station.userData.classificationNumber = stage + 1;
    station.userData.classification = japaneseNames[stage];
    station.userData.profile = profile;
    station.userData.modelPurpose = `${facility}公開資料に基づく工程分類`;
    station.userData.representation = '装置外観・寸法・配置は模式表現';
    station.userData.classificationNumberMeaning = '分類番号。実際の工程順序ではない';
    station.traverse(child => {
      child.userData.stage = stage;
      if (!child.name) child.name = `${japaneseNames[stage]}・模式部品`;
    });
  });
  carrier.traverse(child => { child.userData.carrier = true; });

  let batching: StaticBatchStats;
  if (optimizeStatic) {
    const result = optimizeStaticMeshes(group, {
      excludedRoots: new Set<THREE.Object3D>([carrier, ...movingParts.map(part => part.object), ...highlights]),
    });
    batching = result.stats;
    result.geometries.forEach((geometry, id) => geometries.set(`static-batch:${id}`, geometry));
    const retained = new Set<THREE.BufferGeometry>();
    group.traverse(object => { if (object instanceof THREE.Mesh) retained.add(object.geometry); });
    geometries.forEach((geometry, key) => {
      if (!retained.has(geometry)) { geometry.dispose(); geometries.delete(key); }
    });
  } else {
    let meshes = 0;
    group.traverse(object => { if (object instanceof THREE.Mesh) meshes++; });
    batching = { beforeMeshes: meshes, afterMeshes: meshes, sourceMeshes: 0, batches: 0 };
  }

  return {
    profile, group, stations, labelAnchors, carrier, rail, highlights, movingParts, railPoints, batching,
    dispose: () => {
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      group.clear();
    },
  };
}
