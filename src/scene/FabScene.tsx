import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { RefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildFab, STATION_POSITIONS } from './buildFab';
import { stages, sources, disclaimer, MODEL_TITLE } from '../data/processes';
import type { SimulationSnapshot } from '../hooks/useSimulation';

export type SceneView = 'all' | 'fab' | 'probe';
export interface FabSceneHandle { reset: () => void; focus: (stage: number) => void; exportGLB: () => Promise<void> }
interface Props { stage: number; showLabels: boolean; view: SceneView; snapshot: RefObject<SimulationSnapshot>; onSelect: (id: number) => void }

const FabScene = forwardRef<FabSceneHandle, Props>(function FabScene({ stage, showLabels, view, snapshot, onSelect }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const labels = useRef<(HTMLButtonElement | null)[]>([]);
  const selection = useRef(onSelect);
  selection.current = onSelect;
  const liveStage = useRef(stage);
  liveStage.current = stage;
  const liveLabels = useRef(showLabels);
  liveLabels.current = showLabels;
  const liveView = useRef(view);
  liveView.current = view;
  const runtime = useRef<{
    camera: THREE.OrthographicCamera; controls: OrbitControls; model: ReturnType<typeof buildFab>;
    desiredTarget: THREE.Vector3; desiredCamera: THREE.Vector3; desiredZoom: number; transitioning: boolean;
  } | null>(null);
  const [error, setError] = useState('');
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
      if (!r) throw new Error('3Dモデルを読み込み中です。');
      const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
      // Selection ornaments are UI, not part of the saved scientific model.
      const copy = r.model.group.clone(true);
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
      const result = await new GLTFExporter().parseAsync(copy, { binary: true, onlyVisible: true });
      if (!(result instanceof ArrayBuffer)) throw new Error('モデルの保存に失敗しました。');
      const url = URL.createObjectURL(new Blob([result], { type: 'model/gltf-binary' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = '東広島Fab15_ウェーハ製造工程_公開資料模式モデル.glb';
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
      setError('3Dを表示できません。WebGLに対応したブラウザで開いてください。工程説明は下から選択できます。');
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
    renderer.domElement.setAttribute('aria-label', '東広島Fab15の公開資料に基づくウェーハ製造の3D模式モデル。ドラッグで回転、ホイールで拡大縮小。');
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
    scene.add(new THREE.HemisphereLight(0xe5f5ff, 0x70848d, 1.6));
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
    Object.assign(model.group.userData, { title: MODEL_TITLE, language: 'ja', disclaimer, modelType: 'public-information-schematic', sources,
      processes: stages.map(s => ({ id: s.id, title: s.title, equipment: s.equipment, description: s.description,
        evidenceStatus: s.evidenceStatus, evidenceStatement: s.evidenceStatement, unconfirmed: s.unconfirmed, sourceIds: s.sourceIds })) });
    model.stations.forEach((station, id) => {
      station.name = `${String(id + 1).padStart(2, '0')} ${stages[id].title}`;
      Object.assign(station.userData, { title: stages[id].title, equipment: stages[id].equipment, phase: stages[id].phase,
        evidenceStatus: stages[id].evidenceStatus, evidenceStatement: stages[id].evidenceStatement,
        unconfirmed: stages[id].unconfirmed, sourceIds: stages[id].sourceIds });
    });
    for (const part of model.movingParts) part.object.userData.baseX = part.object.position.x;
    const payload = model.carrier.getObjectByName('FOUP昇降部');
    const cables = ['昇降ケーブル左', '昇降ケーブル右'].map(name => model.carrier.getObjectByName(name)).filter((object): object is THREE.Object3D => !!object);
    scene.add(model.group);
    runtime.current = { camera, controls, model, desiredTarget: controls.target.clone(), desiredCamera: camera.position.clone(), desiredZoom: 1, transitioning: false };

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
      const hits = raycaster.intersectObjects(model.stations, true);
      if (!hits.length) return;
      let object: THREE.Object3D | null = hits[0].object;
      while (object && typeof object.userData.stage !== 'number') object = object.parent;
      if (object) selection.current(object.userData.stage);
    };
    const cancelTransition = () => { if (runtime.current) runtime.current.transitioning = false; };
    controls.addEventListener('start', cancelTransition);
    renderer.domElement.addEventListener('pointerdown', pointerDown);
    renderer.domElement.addEventListener('pointerup', pointerUp);
    const contextLost = (e: Event) => { e.preventDefault(); setError('3Dの描画が中断されました。ページを再読み込みしてください。'); };
    renderer.domElement.addEventListener('webglcontextlost', contextLost);
    let raf = 0;
    const projected = new THREE.Vector3();
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
      const placed: { x: number; y: number; width: number }[] = [];
      // Selected label is retained, then hide only labels that collide after orbit/zoom.
      const order = [liveStage.current, ...stages.map(s => s.id).filter(id => id !== liveStage.current)];
      for (const id of order) {
        const label = labels.current[id];
        if (!label) continue;
        projected.copy(model.labelAnchors[id]).project(camera);
        const x = (projected.x + 1) / 2 * width, y = (1 - projected.y) / 2 * height;
        const phaseVisible = liveView.current === 'all' || (liveView.current === 'fab' ? id < 8 : id >= 8);
        const w = label.offsetWidth || 100;
        const collides = placed.some(p => Math.abs(p.y - y) < 36 && Math.abs(p.x - x) < (p.width + w) / 2 + 7);
        const visible = liveLabels.current && phaseVisible && projected.z >= -1 && projected.z <= 1
          && x > w / 2 && x < width - w / 2 && y > 24 && y < height - 20 && !collides;
        label.style.display = visible ? 'flex' : 'none';
        label.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
        if (visible) placed.push({ x, y, width: w });
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
    if (!ready) return;
    if (view === 'all') moveCamera(new THREE.Vector3(0, 1.1, 0), 1);
    else if (view === 'fab') moveCamera(new THREE.Vector3(-1.5, 1.1, 0), 1.15);
    else moveCamera(new THREE.Vector3(...STATION_POSITIONS[8]).add(new THREE.Vector3(0, 1, 0)), 2.4);
  }, [view, ready]);

  return <div className="scene-host" ref={host} data-ready={ready ? 'true' : 'false'}>
    {!ready && !error ? <div className="scene-loading">3Dモデルを準備しています…</div> : null}
    {error ? <div className="scene-error" role="alert">{error}</div> : null}
    <div className="scene-labels" aria-label="装置を選択">
      {stages.map(s => <button key={s.id} ref={element => { labels.current[s.id] = element; }}
        onClick={() => selection.current(s.id)} className={`machine-label ${s.id === stage ? 'selected' : ''}`}
        aria-label={`${s.id + 1}. ${s.title}の装置`} aria-pressed={s.id === stage} style={{ display: 'none' }}>
        <span>{String(s.id + 1).padStart(2, '0')}</span>{s.shortTitle}
      </button>)}
    </div>
  </div>;
});

export default FabScene;
