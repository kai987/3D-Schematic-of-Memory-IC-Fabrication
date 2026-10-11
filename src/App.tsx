import { useCallback, useEffect, useRef, useState } from 'react';
import FabScene from './scene/FabScene';
import type { FabSceneHandle, SceneView } from './scene/FabScene';
import Icon from './components/Icon';
import Inspector from './components/Inspector';
import Player from './components/Player';
import ProcessRail from './components/ProcessRail';
import AboutDialog from './components/AboutDialog';
import { useSimulation } from './hooks/useSimulation';
import { useI18n } from './i18n/LocaleContext';
import type { Locale } from './i18n/types';
import type { TransportItemId } from './data/transport';

function revealInspector() {
  requestAnimationFrame(() => {
    const panel = document.querySelector<HTMLElement>('.inspector');
    if (window.innerWidth <= 700) panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else panel?.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

export default function App() {
  const { text, locale, setLocale, theme, setTheme, scopeNote } = useI18n();
  const simulation = useSimulation();
  const scene = useRef<FabSceneHandle>(null);
  const [view, setView] = useState<SceneView>('all');
  const [showLabels, setShowLabels] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [transport, setTransport] = useState<TransportItemId | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<'saved' | 'saveFailed' | ''>('');
  useEffect(() => {
    if (!saveMessage) return;
    const timer = setTimeout(() => setSaveMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [saveMessage]);
  const focus = useCallback(() => {
    scene.current?.focus(simulation.stage);
    if (window.innerWidth <= 700) document.querySelector('.canvas-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [simulation.stage]);
  const selectStage = useCallback((id: number) => {
    setTransport(null);
    simulation.selectStage(id);
  }, [simulation.selectStage]);
  const selectTransport = useCallback((id: TransportItemId) => {
    setTransport(id);
    revealInspector();
  }, []);
  const dismissTransport = useCallback(() => {
    setTransport(null);
    revealInspector();
  }, []);
  const resetView = () => { setView('all'); scene.current?.reset(); };
  const save = async () => {
    setSaving(true); setSaveMessage('');
    try { if (!scene.current) throw new Error('Scene unavailable'); await scene.current.exportGLB(); setSaveMessage('saved'); }
    catch { setSaveMessage('saveFailed'); }
    finally { setSaving(false); }
  };
  return <div className="app">
    <header className="app-header">
      <div className="brand"><Icon name="chip" size={48} /><h1>{text.brand}</h1></div>
      <div className="header-description"><p className="subtitle">{text.subtitle}</p><p className="model-kind">{text.modelKind}</p></div>
      <div className="display-controls">
        <div className="theme-control" role="group" aria-label={text.appearance}>
          {(['day', 'night'] as const).map(value => <button key={value} onClick={() => setTheme(value)} aria-pressed={theme === value} className={theme === value ? 'active' : ''}><Icon name={value === 'day' ? 'sun' : 'moon'} size={16} /><span>{text[value]}</span></button>)}
        </div>
        <label className="language-control"><span className="sr-only">{text.language}</span><select aria-label={text.language} value={locale} onChange={event => setLocale(event.target.value as Locale)}>
          <option value="ja" lang="ja">日本語</option><option value="en" lang="en">English</option><option value="zh" lang="zh-CN">中文</option>
        </select></label>
      </div>
    </header>
    <div className="scope-banner" role="note"><strong>{text.scopeTitle}</strong><p>{scopeNote}</p></div>
    <main className="workspace">
      <section className="model-area" aria-label={text.viewLabel}>
        <div className="canvas-area">
          <FabScene ref={scene} theme={theme} stage={simulation.stage} playing={simulation.playing} playbackPosition={simulation.progress} snapshot={simulation.snapshot} showLabels={showLabels} view={view} onSelect={selectStage} transport={transport} onSelectTransport={selectTransport} />
          <div className="viewport-toolbar">
            <div className="view-tabs" aria-label={text.rangeLabel}>
              {(['all', 'fab', 'probe'] as const).map(value =>
                <button key={value} onClick={() => setView(value)} className={view === value ? 'active' : ''} aria-pressed={view === value}>{text[value]}</button>)}
            </div>
            <div className="view-options">
              <button onClick={resetView} className="reset-view" aria-label={text.reset}><Icon name="reset" /><span>{text.reset}</span></button>
              <button className="label-toggle" onClick={() => setShowLabels(!showLabels)} aria-pressed={showLabels} aria-label={text.showLabels}><Icon name="tag" /><span>{text.labels}</span><span className={`switch ${showLabels ? 'on' : ''}`} /></button>
            </div>
          </div>
          <div className="viewport-bottom">
            <span className="repeat-note"><Icon name="rotate" size={15} />{text.repeatNote}</span>
            <span className="orbit-hint">{text.orbitHint}</span>
          </div>
        </div>
        <Player simulation={simulation} />
      </section>
      <Inspector stage={simulation.stage} onFocus={focus} transport={transport} onDismissTransport={dismissTransport} />
    </main>
    <ProcessRail stage={simulation.stage} onSelect={selectStage} />
    <footer className="app-footer">
      <p>{text.footer}</p>
      <div className="footer-actions"><button onClick={() => setShowAbout(true)}><Icon name="book" size={15} />{text.sourcesButton}</button>
        <button onClick={save} disabled={saving}><Icon name="download" size={15} />{saving ? text.saving : text.save}</button></div>
    </footer>
    <span className="save-status" role="status">{saveMessage ? text[saveMessage] : ''}</span>
    {showAbout ? <AboutDialog onClose={() => setShowAbout(false)} /> : null}
  </div>;
}
