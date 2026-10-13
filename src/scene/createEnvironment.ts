import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/** Generates an owned environment target without leaving PMREM renderer state behind. */
export function createEnvironment(renderer: THREE.WebGLRenderer): THREE.WebGLRenderTarget {
  const previousTarget = renderer.getRenderTarget();
  const previousFace = renderer.getActiveCubeFace();
  const previousLevel = renderer.getActiveMipmapLevel();
  const previousAutoClear = renderer.autoClear;
  const previousToneMapping = renderer.toneMapping;
  const previousXR = renderer.xr.enabled;
  const previousColor = renderer.getClearColor(new THREE.Color());
  const previousAlpha = renderer.getClearAlpha();
  const setRenderTarget = renderer.setRenderTarget;
  const generator = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const captured: { output: Parameters<THREE.WebGLRenderer['setRenderTarget']>[0] } = { output: null };
  let completed = false;

  // Three r181 fromScene binds its output CubeUV target before any ping-pong
  // target. Capture that public call so an exception cannot orphan the output;
  // fromScene has no option for a caller-owned output target. Generation is sync.
  renderer.setRenderTarget = (target, face, level) => {
    if (captured.output === null && target !== null && target !== previousTarget) captured.output = target;
    setRenderTarget.call(renderer, target, face, level);
  };

  try {
    const environment = generator.fromScene(room, 0.04);
    completed = true;
    return environment;
  } finally {
    renderer.setRenderTarget = setRenderTarget;
    try {
      renderer.setRenderTarget(previousTarget, previousFace, previousLevel);
      renderer.autoClear = previousAutoClear;
      renderer.toneMapping = previousToneMapping;
      renderer.xr.enabled = previousXR;
      renderer.setClearColor(previousColor, previousAlpha);
    } finally {
      try {
        room.dispose();
      } finally {
        try {
          generator.dispose();
        } finally {
          if (!completed) captured.output?.dispose();
        }
      }
    }
  }
}
