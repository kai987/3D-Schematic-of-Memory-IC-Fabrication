import { memo } from 'react';
import { useI18n } from '../i18n/LocaleContext';

export default memo(function ProcessRail({ stage, onSelect }: { stage: number; onSelect: (id: number) => void }) {
  const { stages, text: { rail: text } } = useI18n();
  return <nav className="process-rail" aria-label={text.label}>
    <div className="rail-inner">
      <div className="phase-headings"><p>{text.fab}<span>{text.numbering}</span></p><p>{text.electrical}<span>{text.wafer}</span></p></div>
      <div className="steps">
        {stages.map(s => <button key={s.id} className={`process-step ${stage === s.id ? 'active' : ''} ${s.id === 8 ? 'phase-divider' : ''}`}
          aria-label={`${s.id + 1}. ${s.title}`} aria-current={stage === s.id ? 'step' : undefined} onClick={() => onSelect(s.id)}>
          <span className="step-dot" /><span className="step-name"><small>{String(s.id + 1).padStart(2, '0')}</small>{s.shortTitle}</span>
        </button>)}
      </div>
    </div>
  </nav>;
});
