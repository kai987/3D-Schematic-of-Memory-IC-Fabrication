import { memo } from 'react';
import { useI18n } from '../i18n/LocaleContext';
import WaferDiagram from './WaferDiagram';
import Icon from './Icon';

export default memo(function Inspector({ stage, onFocus }: { stage: number; onFocus: () => void }) {
  const { stages, sources, evidenceLabels, text: { inspector: text } } = useI18n();
  const selected = stages[stage];
  return <aside className="inspector" aria-label={text.label}>
    <div className="step-number"><strong>{String(stage + 1).padStart(2, '0')}</strong><span>/ {String(stages.length).padStart(2, '0')} {text.categories}</span></div>
    <h2>{selected.title}</h2>
    <p className="equipment">{text.equipment}：{selected.equipment}</p>
    <div className={`evidence-card ${selected.evidenceStatus}`}>
      <span className="evidence-badge">{evidenceLabels[selected.evidenceStatus]}</span>
      <p>{selected.evidenceStatement}</p>
      <p className="unconfirmed"><strong>{text.unconfirmed}：</strong>{selected.unconfirmed.join(text.separator)}{text.period}</p>
      <div className="stage-sources">{sources.filter(source => selected.sourceIds.includes(source.id)).map(source =>
        <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.title}<Icon name="external" size={11} /></a>)}</div>
    </div>
    <p className="explanation-label">{text.role}</p>
    <p className="description">{selected.description}</p>
    <WaferDiagram stage={stage} />
    <div className="properties">
      <div><span>{text.change}</span><strong>{text.changes[stage]}</strong></div>
      <div><span>{text.check}</span><strong>{text.checks[stage]}</strong></div>
    </div>
    <button className="focus-button" onClick={onFocus}>{text.focus}<Icon name="arrow" /></button>
    <details className="engineering-details" key={stage}>
      <summary>{text.engineering}</summary>
      <dl><dt>{text.action}</dt><dd>{selected.action}</dd><dt>{text.quality}</dt><dd>{selected.quality}</dd><dt>{text.dx}</dt><dd>{selected.dx}</dd></dl>
      <p className="diagram-note">{selected.waferNote}</p>
    </details>
  </aside>;
});
