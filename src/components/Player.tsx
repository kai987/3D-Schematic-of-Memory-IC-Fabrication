import Icon from './Icon';
import { stages, DEMO_ROUTE } from '../data/processes';
import type { useSimulation } from '../hooks/useSimulation';
import { STEP_SECONDS } from '../lib/playback';

export default function Player({ simulation }: { simulation: ReturnType<typeof useSimulation> }) {
  const s = simulation;
  const seekProgress = (value: number) => {
    const total = Math.min(value / 100 * DEMO_ROUTE.length, DEMO_ROUTE.length - 0.001);
    s.seek(Math.floor(total), (total % 1) * STEP_SECONDS);
  };
  return <div className="player" aria-label="模式デモの再生操作">
    <button className="play-button" onClick={s.togglePlaying} aria-label={s.playing ? '一時停止' : s.position.ended ? '最初から再生' : '再生'}>
      <span className="play-circle"><Icon name={s.playing ? 'pause' : 'play'} size={22} /></span><span>{s.playing ? '一時停止' : '再生'}</span>
    </button>
    <div className="current-process"><span>{s.playing ? s.processing ? '加工の模式表示' : '搬送の模式表示' : s.position.ended ? '模式デモ完了' : '模式デモ'}</span><strong>{stages[s.stage].shortTitle}</strong></div>
    <input type="range" min="0" max="100" step="0.1" value={s.progress * 100} onChange={event => seekProgress(Number(event.target.value))}
      aria-label="工程デモの再生位置" style={{ '--progress': `${s.progress * 100}%` } as React.CSSProperties} />
    <label className="speed"><span className="sr-only">再生速度</span><select aria-label="再生速度" value={s.speed} onChange={event => s.setSpeed(Number(event.target.value))}>
      <option value="0.5">0.5×</option><option value="1">1×</option><option value="2">2×</option>
    </select></label>
    <button className="icon-button" aria-label="前の工程" onClick={() => s.seek(s.position.cursor - 1)} disabled={s.position.cursor === 0}><Icon name="previous" /></button>
    <button className="icon-button" aria-label="次の工程" onClick={() => s.seek(s.position.cursor + 1)} disabled={s.position.cursor === DEMO_ROUTE.length - 1}><Icon name="next" /></button>
  </div>;
}
