import { useI18n } from '../i18n/LocaleContext';
import { getTransportContent } from '../data/transport';
import type { TransportItemId } from '../data/transport';
import Icon from './Icon';

export default function TransportInspector({ itemId, onBack }: { itemId: TransportItemId; onBack: () => void }) {
  const { locale, profile, sources } = useI18n();
  const content = getTransportContent(locale, profile);
  const item = content.items[itemId];
  return <div className="transport-inspector" data-transport={itemId}>
    <p className="transport-category"><Icon name="tag" size={15} />{content.category}</p>
    <h2>{item.title}</h2>
    <p className="equipment">{item.subtitle}</p>
    <p className="explanation-label">{content.roleLabel}</p>
    <p className="description">{item.description}</p>
    <h3 className="transport-steps-title">{content.stepsLabel}</h3>
    <ol className="transport-steps">{item.steps.map(step => <li key={step}>{step}</li>)}</ol>
    <div className="evidence-card illustrative">
      <span className="evidence-badge">{content.schematicLabel}</span>
      <p>{item.scopeNote}</p>
      <div className="stage-sources">{sources.filter(source => item.sourceIds.includes(source.id)).map(source =>
        <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.title}<Icon name="external" size={11} /></a>)}</div>
    </div>
    <button className="transport-back-button" onClick={onBack}><Icon name="arrow" size={17} />{content.backToProcess}</button>
  </div>;
}
