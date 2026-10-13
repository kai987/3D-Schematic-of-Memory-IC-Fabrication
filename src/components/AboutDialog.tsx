import { useEffect, useRef } from 'react';
import { useI18n } from '../i18n/LocaleContext';
import Icon from './Icon';

export default function AboutDialog({ onClose }: { onClose: () => void }) {
  const { disclaimer, sources, stages, evidenceLabels, demoRoute, text: { about: text } } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="about-dialog" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <button className="dialog-close icon-button" onClick={onClose} aria-label={text.close}><Icon name="close" /></button>
    <h2>{text.title}</h2>
    <p>{disclaimer}</p>
    <h3>{text.legend}</h3>
    <ul className="evidence-legend">
      <li><strong>{evidenceLabels.public}</strong>：{text.public}</li>
      <li><strong>{evidenceLabels.historical}</strong>：{text.historical}</li>
      <li><strong>{evidenceLabels.illustrative}</strong>：{text.illustrative}</li>
    </ul>
    <p>{text.scope}</p>
    <h3>{text.comparisonTitle}</h3><p>{text.comparisonIntro}</p><ul>{text.comparison.map(item => <li key={item}>{item}</li>)}</ul>
    <h3>{text.controlsTitle}</h3>
    <p>{text.controls}</p>
    <p>{text.routeIntro}{demoRoute.length}{text.routeEnd}</p>
    <details className="route-details"><summary>{text.route}</summary><p>{demoRoute.map(id => stages[id].shortTitle).join(' → ')}</p></details>
    <h3>{text.exportTitle}</h3>
    <p>{text.export}</p>
    <h3>{text.sourcesTitle}</h3>
    <p>{text.date}</p>
    <ul className="source-list">{sources.map(source => <li key={source.id}>
      <a href={source.url} target="_blank" rel="noreferrer">{source.title}<Icon name="external" size={12} /></a>
      <p className="source-date">{source.date} · {source.verification}</p>
      <p><strong>{text.support}：</strong>{source.support}</p><p><strong>{text.limits}：</strong>{source.limits}</p>
    </li>)}</ul>
  </dialog>;
}
