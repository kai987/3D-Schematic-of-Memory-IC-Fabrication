import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildFab, STATION_POSITIONS } from './buildFab';
import type { SimulationSnapshot } from '../hooks/useSimulation';
import { useI18n } from '../i18n/LocaleContext';
import type { Locale, Theme } from '../i18n/types';
import { getTransportContent } from '../data/transport';
import type { TransportItemId } from '../data/transport';

export type SceneView = 'all' | 'fab' | 'probe';
export interface FabSceneHandle { reset: () => void; focus: (stage: number) => void; exportGLB: () => Promise<void> }
interface Props { stage: number; showLabels: boolean; view: SceneView; theme: Theme; transport: TransportItemId | null; snapshot: RefObject<SimulationSnapshot>; onSelect: (id: number) => void; onSelectTransport: (id: TransportItemId) => void }

interface SceneRuntime {
  camera: THREE.OrthographicCamera;
  controls: OrbitControls;
  model: ReturnType<typeof buildFab>;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  hemisphere: THREE.HemisphereLight;
  sun: THREE.DirectionalLight;
  fill: THREE.DirectionalLight;
  floorMaterial: THREE.MeshStandardMaterial | null;
  desiredTarget: THREE.Vector3;
  desiredCamera: THREE.Vector3;
  desiredZoom: number;
  transitioning: boolean;
}

const exportNames: Record<Locale, string> = {
  ja: '東広島Fab15_ウェーハ製造工程_公開資料模式モデル.glb',
  en: 'Higashihiroshima_Fab15_Wafer_Fabrication_Public_Information_Model.glb',
  zh: '东广岛Fab15_晶圆制造工程_公开资料示意模型.glb',
};

const modelMetadata: Record<Locale, { purpose: string; representation: string; numberMeaning: string }> = {
  ja: { purpose: 'Fab15公開資料に基づく工程分類の学習用モデル', representation: '装置外観・寸法・配置は模式表現', numberMeaning: '工程IDは分類番号であり、実際の製造順序を示さない' },
  en: { purpose: 'Learning model of process categories based on Fab15 public information', representation: 'Equipment appearance, dimensions and arrangement are schematic', numberMeaning: 'Process IDs identify categories, not the actual manufacturing order' },
  zh: { purpose: '基于 Fab15 公开资料的工程分类学习模型', representation: '设备外观、尺寸与布置均为示意表达', numberMeaning: '工程 ID 是分类编号，不代表实际制造顺序' },
};

function localizeModel(group: THREE.Group, stations: THREE.Group[], localized: ReturnType<typeof useI18n>) {
  const metadata = modelMetadata[localized.locale];
  const transportContent = getTransportContent(localized.locale);
  group.name = localized.modelTitle;
  Object.assign(group.userData, {
    title: localized.modelTitle, language: localized.locale, disclaimer: localized.disclaimer,
    scope: localized.scopeNote, scopeNote: localized.scopeNote, modelPurpose: metadata.purpose,
    representation: metadata.representation, classificationNumberMeaning: metadata.numberMeaning,
    modelType: 'public-information-schematic', sources: localized.sources,
    transportSystems: Object.values(transportContent.items),
    processes: localized.stages.map(s => ({
      id: s.id, title: s.title, equipment: s.equipment, description: s.description,
      evidenceStatus: s.evidenceStatus, evidenceLabel: localized.evidenceLabels[s.evidenceStatus],
      evidenceStatement: s.evidenceStatement, unconfirmed: s.unconfirmed, sourceIds: s.sourceIds,
    })),
  });
  stations.forEach((station, id) => {
    const s = localized.stages[id];
    station.name = `${String(id + 1).padStart(2, '0')} ${s.title}`;
    Object.assign(station.userData, {
      title: s.title, language: localized.locale, classification: s.title,
      modelPurpose: metadata.purpose, representation: metadata.representation,
      classificationNumberMeaning: metadata.numberMeaning,
      equipment: s.equipment, phase: s.phase, evidenceStatus: s.evidenceStatus,
      evidenceLabel: localized.evidenceLabels[s.evidenceStatus], evidenceStatement: s.evidenceStatement,
      unconfirmed: s.unconfirmed, sourceIds: s.sourceIds,
    });
  });
  // Internal Japanese names are stable lookup keys for the hoist and its cables.
  for (const name of ['学習用クリーンルーム床・模式寸法', 'OHT搬送レール・模式配置', 'OHT・FOUP 搬送キャリア']) {
    const object = group.getObjectByName(name);
    if (object) object.userData.representation = metadata.representation;
  }
  group.traverse(object => {
    const id = object.userData.transportItem as TransportItemId | undefined;
    if (id !== 'oht' && id !== 'foup') return;
    const item = transportContent.items[id];
    Object.assign(object.userData, { language: localized.locale, title: item.title, description: item.description, scopeNote: item.scopeNote, sourceIds: item.sourceIds });
  });
}

function applyTheme(r: SceneRuntime, theme: Theme) {
  const night = theme === 'night';
  r.renderer.setClearColor(night ? '#101b2a' : '#e9eff2');
  r.renderer.toneMappingExposure = night ? 0.94 : 0.98;
  r.scene.environmentIntensity = night ? 0.5 : 1;
  r.hemisphere.color.set(night ? 0x9cbee5 : 0xe5f5ff);
  r.hemisphere.groundColor.set(night ? 0x172638 : 0x70848d);
  r.hemisphere.intensity = night ? 1.05 : 1.6;
  r.sun.color.set(night ? 0xd9e9ff : 0xffffff);
  r.sun.intensity = night ? 2.05 : 2.6;
  r.fill.color.set(night ? 0x87c9e4 : 0xd0e9f3);
  r.fill.intensity = night ? 1.4 : 1.2;
  if (r.floorMaterial) {
    r.floorMaterial.color.set(night ? '#334b62' : '#d8e5eb');
    r.floorMaterial.roughness = night ? 0.58 : 0.33;
  }
  r.model.highlights.forEach(highlight => {
    (highlight.material as THREE.MeshBasicMaterial).color.set(night ? '#45dae0' : '#00afbc');
  });
}

const FabScene = forwardRef<FabSceneHandle, Props>(function FabScene({ stage, showLabels, view, theme, transport, snapshot, onSelect, onSelectTransport }, ref) {
  const localized = useI18n();
  const { locale, stages, text } = localized;
  const transportContent = getTransportContent(locale);
  const liveI18n = useRef(localized);
  liveI18n.current = localized;
  const liveTheme = useRef(theme);
  liveTheme.current = theme;
  const host = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLButtonElement | null)[]>([]);
  const transportLabels = useRef<Record<TransportItemId, HTMLButtonElement | null>>({ oht: null, foup: null });
  const transportPaths = useRef<Record<TransportItemId, SVGPathElement | null>>({ oht: null, foup: null });
  const transportDots = useRef<Record<TransportItemId, SVGCircleElement | null>>({ oht: null, foup: null });
  const selection = useRef(onSelect);
  selection.current = onSelect;
  const transportSelection = useRef(onSelectTransport);
  transportSelection.current = onSelectTransport;
  const liveStage = useRef(stage);
  liveStage.current = stage;
  const liveLabels = useRef(showLabels);
  liveLabels.current = showLabels;
  const liveView = useRef(view);
  liveView.current = view;
  const runtime = useRef<SceneRuntime | null>(null);
  const [error, setError] = useState<'webglError' | 'contextLost' | null>(null);
  const [ready, setReady] = useState(false);

  const moveCamera = (target: THREE.Vector3, zoom: number) => {
    const r = runtime.current;
    if (!r) return;
    r.desiredTarget.copy(target);
    r.desiredCamera.copy(target).add(new THREE.Vector3(10, 23, 32));
    r.desiredZoom = zoom;
    r.transitioning = true;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      r.controls.target.copy(r.desiredTarget);
      r.camera.position.copy(r.desiredCamera);
      r.camera.zoom = zoom;
      r.camera.updateProjectionMatrix();
      r.transitioning = false;
    }
  };

  useImperativeHandle(ref, () => ({
    reset: () => moveCamera(new THREE.Vector3(0, 1.1, 0), 1),
    focus: id => moveCamera(new THREE.Vector3(...STATION_POSITIONS[id]).add(new THREE.Vector3(0, 1, 0)), 2.8),
    exportGLB: async () => {
      const r = runtime.current;
      if (!r) throw new Error(liveI18n.current.text.scene.exportLoading);
      const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
      // Selection ornaments are UI, not part of the saved scientific model.
      const copy = r.model.group.clone(true);
      const localized = liveI18n.current;
      const copiedStations = copy.children.filter((object): object is THREE.Group => object instanceof THREE.Group && typeof object.userData.stage === 'number');
      localizeModel(copy, copiedStations, localized);
      copy.traverse(object => { if (object.name.startsWith('selection')) object.visible = false; });
      const savedCarrier = copy.getObjectByName('OHT・FOUP 搬送キャリア');
      if (savedCarrier) {
        savedCarrier.visible = true;
        savedCarrier.position.set(STATION_POSITIONS[0][0], 4.5, -2);
        const savedPayload = savedCarrier.getObjectByName('FOUP昇降部');
        if (savedPayload) savedPayload.position.y = -1.7;
        for (const name of ['昇降ケーブル左', '昇降ケーブル右']) {
          const cable = savedCarrier.getObjectByName(name);
          if (cable) { cable.position.y = -0.64; cable.scale.y = 0.4; }
        }
      }
      let result: ArrayBuffer | object;
      try {
        result = await new GLTFExporter().parseAsync(copy, { binary: true, onlyVisible: true });
      } catch {
        throw new Error(liveI18n.current.text.scene.exportFailed);
      }
      if (!(result instanceof ArrayBuffer)) throw new Error(liveI18n.current.text.scene.exportFailed);
      const url = URL.createObjectURL(new Blob([result], { type: 'model/gltf-binary' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = exportNames[localized.locale];
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    },
  }));

  useEffect(() => {
    const container = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setError('webglError');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor('#e9eff2');
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
    renderer.domElement.setAttribute('aria-label', liveI18n.current.text.scene.canvasLabel);
    renderer.domElement.setAttribute('role', 'img');
    container.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-20, 20, 12, -12, 0.1, 200);
    camera.position.set(10, 24.1, 32);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.1, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.minZoom = 0.65;
    controls.maxZoom = 5;
    controls.minPolarAngle = 0.25;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.update();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    room.dispose();
    const hemisphere = new THREE.HemisphereLight(0xe5f5ff, 0x70848d, 1.6);
    scene.add(hemisphere);
    const sun = new THREE.DirectionalLight(0xffffff, 2.6);
    sun.position.set(-10, 25, 16);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -24; sun.shadow.camera.right = 24;
    sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
    sun.shadow.normalBias = 0.05;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xd0e9f3, 1.2);
    fill.position.set(20, 12, -8);
    scene.add(fill);
    const model = buildFab();
    localizeModel(model.group, model.stations, liveI18n.current);
    for (const part of model.movingParts) part.object.userData.baseX = part.object.position.x;
    const payload = model.carrier.getObjectByName('FOUP昇降部');
    const movingFoup = model.carrier.getObjectByName('FOUP容器');
    const cables = ['昇降ケーブル左', '昇降ケーブル右'].map(name => model.carrier.getObjectByName(name)).filter((object): object is THREE.Object3D => !!object);
    scene.add(model.group);
    const floor = model.group.getObjectByName('学習用クリーンルーム床・模式寸法');
    const floorMaterial = floor instanceof THREE.Mesh && floor.material instanceof THREE.MeshStandardMaterial ? floor.material : null;
    runtime.current = { camera, controls, model, renderer, scene, hemisphere, sun, fill, floorMaterial, desiredTarget: controls.target.clone(), desiredCamera: camera.position.clone(), desiredZoom: 1, transitioning: false };
    applyTheme(runtime.current, liveTheme.current);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      const aspect = width / Math.max(height, 1);
      const span = aspect < 1.05 ? 33 / aspect : 22;
      camera.left = -span * aspect / 2; camera.right = span * aspect / 2;
      camera.top = span / 2; camera.bottom = -span / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let down = { x: 0, y: 0 };
    const pointerDown = (event: PointerEvent) => { down = { x: event.clientX, y: event.clientY }; };
    const pointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects([...model.stations, model.rail, model.carrier], true)
        .filter(hit => hit.object.userData.role !== 'selection');
      if (!hits.length) return;
      let object: THREE.Object3D | null = hits[0].object;
      let stageId: number | undefined;
      // Only ancestors of the actual nearest hit count. A cabinet cannot inherit
      // a sibling FOUP's transport tag, while a FOUP inside a station wins over
      // the general process tag carried by its mesh children.
      while (object) {
        const item = object.userData.transportItem;
        if (item === 'oht' || item === 'foup') {
          transportSelection.current(item);
          return;
        }
        if (stageId === undefined && typeof object.userData.stage === 'number') stageId = object.userData.stage;
        object = object.parent;
      }
      if (stageId !== undefined) selection.current(stageId);
    };
    const cancelTransition = () => { if (runtime.current) runtime.current.transitioning = false; };
    controls.addEventListener('start', cancelTransition);
    renderer.domElement.addEventListener('pointerdown', pointerDown);
    renderer.domElement.addEventListener('pointerup', pointerUp);
    const contextLost = (e: Event) => { e.preventDefault(); setError('contextLost'); };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    let raf = 0;
    const projected = new THREE.Vector3();
    const transportAnchor = new THREE.Vector3();
    const ohtAnchor = new THREE.Vector3(2.8, 4.6, 2);
    const stationPoint = (id: number) => {
      const [x, , z] = STATION_POSITIONS[id];
      return new THREE.Vector3(x, 4.5, z > 0 ? 2 : -2);
    };
    const railPath = (from: number, to: number, t: number) => {
      const a = stationPoint(from), b = stationPoint(to);
      if (a.z === b.z) return a.lerp(b, t);
      // AMHS uses rail junction at left end, avoiding an impossible diagonal path.
      const junctionX = model.railPoints[0].x;
      const p1 = new THREE.Vector3(junctionX, a.y, a.z);
      const p2 = new THREE.Vector3(junctionX, b.y, b.z);
      const distances = [a.distanceTo(p1), p1.distanceTo(p2), p2.distanceTo(b)];
      let d = t * distances.reduce((sum, value) => sum + value, 0);
      if (d <= distances[0]) return a.lerp(p1, d / Math.max(distances[0], 0.001));
      d -= distances[0];
      if (d <= distances[1]) return p1.lerp(p2, d / distances[1]);
      return p2.lerp(b, (d - distances[1]) / Math.max(distances[2], 0.001));
    };
    const animate = () => {
      const r = runtime.current;
      if (!r) return;
      const state = snapshot.current;
      if (r.transitioning) {
        controls.target.lerp(r.desiredTarget, 0.12);
        camera.position.lerp(r.desiredCamera, 0.12);
        camera.zoom = THREE.MathUtils.lerp(camera.zoom, r.desiredZoom, 0.12);
        camera.updateProjectionMatrix();
        if (camera.position.distanceTo(r.desiredCamera) < 0.03 && Math.abs(camera.zoom - r.desiredZoom) < 0.01) r.transitioning = false;
      }
      controls.update();
      model.highlights.forEach((mesh, id) => { mesh.visible = id === liveStage.current; });
      {
        const to = state.stage, from = state.previousStage;
        const p = railPath(from, to, state.transfer);
        // Trolley stays on the rail. Only its suspended payload descends.
        let dock = 0;
        if (state.transfer < 0.14) dock = 1 - state.transfer / 0.14;
        else if (state.transfer > 0.86) dock = (state.transfer - 0.86) / 0.14;
        model.carrier.position.copy(p);
        if (payload) {
          payload.position.y = THREE.MathUtils.lerp(-1.7, -3.2, dock);
          for (const cable of cables) {
            const bottomY = payload.position.y + cable.userData.attachmentOffsetY;
            cable.position.y = (cable.userData.topY + bottomY) / 2;
            cable.scale.y = (cable.userData.topY - bottomY) / cable.userData.baseLength;
          }
        }
      }
      for (const part of model.movingParts) {
        if (part.stage !== state.stage || !state.playing || state.transfer < 1) continue;
        const t = state.time;
        if (part.kind === 'spin') part.object.rotation.y = t * 1.3;
        else if (part.kind === 'scan') part.object.position.x = (part.object.userData.baseX ?? 0) + Math.sin(t * 1.5) * 0.22;
        else part.object.rotation.y = Math.sin(t * 1.2) * 0.22;
      }
      const width = container.clientWidth, height = container.clientHeight;
      const placed: { x: number; y: number; width: number; height: number }[] = [];
      const overlaps = (x: number, y: number, w: number, h: number) => placed.some(p =>
        Math.abs(p.y - p.height / 2 - (y - h / 2)) < (p.height + h) / 2 + 7
        && Math.abs(p.x - x) < (p.width + w) / 2 + 8);

      // Transport labels remain usable during orbit, zoom, and mobile views.
      // Their leader lines point to the actual projected rail/container anchors.
      for (const id of ['oht', 'foup'] as const) {
        const label = transportLabels.current[id];
        const path = transportPaths.current[id];
        const dot = transportDots.current[id];
        if (!label) continue;
        if (!liveLabels.current || width < 1 || height < 1) {
          label.style.display = 'none';
          if (path) path.style.display = 'none';
          if (dot) dot.style.display = 'none';
          continue;
        }
        label.style.display = 'flex';
        label.style.maxWidth = `${Math.max(80, width - 24)}px`;
        const w = label.offsetWidth || 112;
        const h = label.offsetHeight || 34;
        const mobile = width < 640;
        const safeTop = mobile ? 92 : 76;
        const safeBottom = mobile ? 96 : 84;
        const minX = w / 2 + 12, maxX = Math.max(minX, width - w / 2 - 12);
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
          x: THREE.MathUtils.clamp(x, minX, maxX), y: THREE.MathUtils.clamp(y, minY, maxY),
        });
        let spot = clamp(rawX, rawY - 16);
        const candidates = [[0, -44], [0, 44], [-w - 18, 0], [w + 18, 0], [0, -88], [0, 88]];
        if (overlaps(spot.x, spot.y, w, h)) {
          for (const [dx, dy] of candidates) {
            const candidate = clamp(rawX + dx, rawY - 16 + dy);
            if (!overlaps(candidate.x, candidate.y, w, h)) { spot = candidate; break; }
          }
        }
        label.style.transform = `translate(${spot.x}px, ${spot.y}px) translate(-50%, -100%)`;
        const clamped = Math.abs(spot.x - rawX) > 1 || Math.abs(spot.y - (rawY - 16)) > 1;
        label.dataset.clamped = String(clamped);
        placed.push({ x: spot.x, y: spot.y, width: w, height: h });
        const targetX = THREE.MathUtils.clamp(rawX, 3, width - 3);
        const targetY = THREE.MathUtils.clamp(rawY, 3, height - 3);
        const showLeader = mobile || clamped;
        if (path) {
          path.style.display = showLeader ? '' : 'none';
          path.setAttribute('d', `M${spot.x} ${spot.y} L${targetX} ${targetY}`);
        }
        if (dot) {
          dot.style.display = showLeader ? '' : 'none';
          dot.setAttribute('cx', String(targetX));
          dot.setAttribute('cy', String(targetY));
        }
      }
      // Selected label is retained, then hide only labels that collide after orbit/zoom.
      const order = [liveStage.current, ...liveI18n.current.stages.map(s => s.id).filter(id => id !== liveStage.current)];
      for (const id of order) {
        const label = labels.current[id];
        if (!label) continue;
        projected.copy(model.labelAnchors[id]).project(camera);
        const x = (projected.x + 1) / 2 * width, y = (1 - projected.y) / 2 * height;
        const phaseVisible = liveView.current === 'all' || (liveView.current === 'fab' ? id < 8 : id >= 8);
        const w = label.offsetWidth || 100;
        const h = label.offsetHeight || 34;
        const collides = overlaps(x, y, w, h);
        const visible = liveLabels.current && phaseVisible && projected.z >= -1 && projected.z <= 1
          && x > w / 2 && x < width - w / 2 && y > 24 && y < height - 20 && !collides;
        label.style.display = visible ? 'flex' : 'none';
        label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
        if (visible) placed.push({ x, y, width: w, height: h });
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();
    setReady(true);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      model.dispose();
      env.dispose(); pmrem.dispose(); sun.shadow.dispose(); renderer.dispose();
      renderer.domElement.remove();
      runtime.current = null;
    };
  }, [snapshot]);

  useEffect(() => {
    if (runtime.current) applyTheme(runtime.current, theme);
  }, [theme, ready]);

  useEffect(() => {
    const r = runtime.current;
    if (!r) return;
    localizeModel(r.model.group, r.model.stations, liveI18n.current);
    r.renderer.domElement.setAttribute('aria-label', liveI18n.current.text.scene.canvasLabel);
  }, [locale, ready]);

  useEffect(() => {
    if (!ready) return;
    if (view === 'all') moveCamera(new THREE.Vector3(0, 1.1, 0), 1);
    else if (view === 'fab') moveCamera(new THREE.Vector3(-1.5, 1.1, 0), 1.15);
    else moveCamera(new THREE.Vector3(...STATION_POSITIONS[8]).add(new THREE.Vector3(0, 1, 0)), 2.4);
  }, [view, ready]);

  return <div className="scene-host" ref={host} data-ready={ready ? 'true' : 'false'}>
    {!ready && !error ? <div className="scene-loading">{text.scene.loading}</div> : null}
    {error ? <div className="scene-error" role="alert">{text.scene[error]}</div> : null}
    <div className="scene-labels" aria-label={text.scene.selectEquipment}>
      <svg className="transport-leaders" aria-hidden="true" focusable="false" width="100%" height="100%"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {(['oht', 'foup'] as const).map(id => <g key={id} data-transport={id}>
          <path ref={element => { transportPaths.current[id] = element; }} fill="none" stroke="var(--transport-line, #ae8933)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" style={{ display: 'none' }} />
          <circle ref={element => { transportDots.current[id] = element; }} r="2.4" fill="var(--transport-line, #ae8933)" style={{ display: 'none' }} />
        </g>)}
      </svg>
      <div className="transport-labels" aria-label={transportContent.selectionLabel}>
        {(['oht', 'foup'] as const).map(id => <button key={id}
          ref={element => { transportLabels.current[id] = element; }}
          onClick={() => transportSelection.current(id)}
          className={`machine-label transport-label ${transport === id ? 'selected' : ''}`}
          data-transport={id} aria-pressed={transport === id} aria-label={transportContent.items[id].title}
          style={{ display: 'none' }}>{transportContent.items[id].label}</button>)}
      </div>
      {stages.map(s => <button key={s.id} ref={element => { labels.current[s.id] = element; }}
        onClick={() => selection.current(s.id)} className={`machine-label ${s.id === stage ? 'selected' : ''}`}
        aria-label={`${s.id + 1}. ${s.title} · ${text.scene.equipment}`} aria-pressed={s.id === stage} style={{ display: 'none' }}>
        <span>{String(s.id + 1).padStart(2, '0')}</span>{s.shortTitle}
      </button>)}
    </div>
  </div>;
});

export default FabScene;
