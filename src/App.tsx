import { useCallback, useEffect, useRef, useState } from 'react';
import FabScene from './scene/FabScene';
import type { FabSceneHandle, SceneView } from './scene/FabScene';
import Icon from './components/Icon';
import Inspector from './components/Inspector';
import Player from './components/Player';
import ProcessRail from './components/ProcessRail';
import AboutDialog from './components/AboutDialog';
import { useSimulation } from './hooks/useSimulation';
import { SCOPE_NOTE } from './data/processes';

export default function App() {
  const simulation = useSimulation();
  const scene = useRef<FabSceneHandle>(null);
  const [view, setView] = useState<SceneView>('all');
  const [showLabels, setShowLabels] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  useEffect(() => {
    if (!saveMessage) return;
    const timer = setTimeout(() => setSaveMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [saveMessage]);
  const focus = useCallback(() => {
    scene.current?.focus(simulation.stage);
    if (window.innerWidth <= 700) document.querySelector('.canvas-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [simulation.stage]);
  const resetView = () => { setView('all'); scene.current?.reset(); };
  const save = async () => {
    setSaving(true); setSaveMessage('');
    try { await scene.current?.exportGLB(); setSaveMessage('GLBファイルを保存しました。'); }
    catch { setSaveMessage('保存できませんでした。もう一度お試しください。'); }
    finally { setSaving(false); }
  };
  return <div className="app">
    <header className="app-header">
      <div className="brand"><Icon name="chip" size={48} /><h1>東広島 Fab15</h1></div>
      <p className="subtitle">DRAMウェーハ製造工程</p>
      <p className="model-kind">DRAMウェーハの3D学習モデル</p>
    </header>
    <div className="scope-banner" role="note"><strong>マイクロンの公開資料に基づく工程区分</strong><p>{SCOPE_NOTE}</p></div>
    <main className="workspace">
      <section className="model-area" aria-label="製造工程の3Dビュー">
        <div className="canvas-area">
          <FabScene ref={scene} stage={simulation.stage} snapshot={simulation.snapshot} showLabels={showLabels} view={view} onSelect={simulation.selectStage} />
          <div className="viewport-toolbar">
            <div className="view-tabs" aria-label="表示する工程範囲">
              {([['all', '全体'], ['fab', '前工程'], ['probe', 'プローブ']] as const).map(([value, title]) =>
                <button key={value} onClick={() => setView(value)} className={view === value ? 'active' : ''} aria-pressed={view === value}>{title}</button>)}
            </div>
            <div className="view-options">
              <button onClick={resetView} className="reset-view" aria-label="視点を戻す"><Icon name="reset" /><span>視点を戻す</span></button>
              <button className="label-toggle" onClick={() => setShowLabels(!showLabels)} aria-pressed={showLabels} aria-label="ラベルを表示"><Icon name="tag" /><span>ラベル</span><span className={`switch ${showLabels ? 'on' : ''}`} /></button>
            </div>
          </div>
          <div className="viewport-bottom">
            <span className="repeat-note"><Icon name="rotate" size={15} />搬送・反復の動きは説明用の模式表現</span>
            <span className="orbit-hint">ドラッグで回転 · スクロールで拡大</span>
          </div>
        </div>
        <Player simulation={simulation} />
      </section>
      <Inspector stage={simulation.stage} onFocus={focus} />
    </main>
    <ProcessRail stage={simulation.stage} onSelect={simulation.selectStage} />
    <footer className="app-footer">
      <p>Fab15の実工程順・実配置の再現ではありません。後工程はこのモデルの対象外です。</p>
      <div className="footer-actions"><button onClick={() => setShowAbout(true)}><Icon name="book" size={15} />公開資料・確認範囲</button>
        <button onClick={save} disabled={saving}><Icon name="download" size={15} />{saving ? '保存中…' : 'GLBを保存'}</button></div>
    </footer>
    <span className="save-status" role="status">{saveMessage}</span>
    {showAbout ? <AboutDialog onClose={() => setShowAbout(false)} /> : null}
  </div>;
}
