import { memo } from 'react';
import { stages } from '../data/processes';

export default memo(function ProcessRail({ stage, onSelect }: { stage: number; onSelect: (id: number) => void }) {
  return <nav className="process-rail" aria-label="工程区分を選択">
    <div className="rail-inner">
      <div className="phase-headings"><p>ウェーハ製造・前工程<span>番号は分類用です。実際の処理順を示しません。</span></p><p>電気検査<span>ウェーハの状態で検査</span></p></div>
      <div className="steps">
        {stages.map(s => <button key={s.id} className={`process-step ${stage === s.id ? 'active' : ''} ${s.id === 8 ? 'phase-divider' : ''}`}
          aria-label={`${s.id + 1}. ${s.title}`} aria-current={stage === s.id ? 'step' : undefined} onClick={() => onSelect(s.id)}>
          <span className="step-dot" /><span className="step-name"><small>{String(s.id + 1).padStart(2, '0')}</small>{s.shortTitle}</span>
        </button>)}
      </div>
    </div>
  </nav>;
});
