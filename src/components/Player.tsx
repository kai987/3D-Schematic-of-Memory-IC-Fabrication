import Icon from './Icon';
import { useI18n } from '../i18n/LocaleContext';
import type { useSimulation } from '../hooks/useSimulation';
import { STEP_SECONDS } from '../lib/playback';

export default function Player({ simulation }: { simulation: ReturnType<typeof useSimulation> }) {
  const s = simulation;
  const { text: { player: text }, stages } = useI18n();
  const seekProgress = (value: number) => {
    const total = Math.min(value / 100 * s.routeLength, s.routeLength - 0.001);
    s.seek(Math.floor(total), (total % 1) * STEP_SECONDS);
  };
  return <div className="player" aria-label={text.label}>
    <button className="play-button" onClick={s.togglePlaying} aria-label={s.playing ? text.pause : s.position.ended ? text.replay : text.play}>
      <span className="play-circle"><Icon name={s.playing ? 'pause' : 'play'} size={22} /></span><span>{s.playing ? text.pause : text.play}</span>
    </button>
    <div className="current-process"><span>{s.playing ? s.processing ? text.processing : text.transfer : s.position.ended ? text.complete : text.demo}</span><strong>{stages[s.stage].shortTitle}</strong></div>
    <input type="range" min="0" max="100" step="0.1" value={s.progress * 100} onChange={event => seekProgress(Number(event.target.value))}
      aria-label={text.seek} style={{ '--progress': `${s.progress * 100}%` } as React.CSSProperties} />
    <label className="speed"><span className="sr-only">{text.speed}</span><select aria-label={text.speed} value={s.speed} onChange={event => s.setSpeed(Number(event.target.value))}>
      <option value="0.5">0.5×</option><option value="1">1×</option><option value="2">2×</option>
    </select></label>
    <button className="icon-button" aria-label={text.previous} onClick={() => s.seek(s.position.cursor - 1)} disabled={s.position.cursor === 0}><Icon name="previous" /></button>
    <button className="icon-button" aria-label={text.next} onClick={() => s.seek(s.position.cursor + 1)} disabled={s.position.cursor === s.routeLength - 1}><Icon name="next" /></button>
  </div>;
}
