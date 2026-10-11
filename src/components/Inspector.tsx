import { memo } from 'react';
import { stages, sources, evidenceLabels } from '../data/processes';
import WaferDiagram from './WaferDiagram';
import Icon from './Icon';

const changes = ['保護・搬送', '清浄な表面', '材料の薄膜', 'レジストのパターン', '穴・溝の形状', '電気的特性', '平坦な表面', '計測・欠陥情報', '電気検査マップ'];
const checks = ['汚染・搬送状態', '粒子・残留物', '膜厚・均一性', '線幅・位置合わせ', '深さ・側壁形状', '注入量・熱処理条件', '残膜厚・平坦性', '寸法・欠陥', '特性・接触状態'];

export default memo(function Inspector({ stage, onFocus }: { stage: number; onFocus: () => void }) {
  const selected = stages[stage];
  return <aside className="inspector" aria-label="選択した工程の説明">
    <div className="step-number"><strong>{String(stage + 1).padStart(2, '0')}</strong><span>/ {String(stages.length).padStart(2, '0')} 工程区分</span></div>
    <h2>{selected.title}</h2>
    <p className="equipment">装置の一般例：{selected.equipment}</p>
    <div className={`evidence-card ${selected.evidenceStatus}`}>
      <span className="evidence-badge">{evidenceLabels[selected.evidenceStatus]}</span>
      <p>{selected.evidenceStatement}</p>
      <p className="unconfirmed"><strong>模式表現・未確認：</strong>{selected.unconfirmed.join('、')}。</p>
      <div className="stage-sources">{sources.filter(source => selected.sourceIds.includes(source.id)).map(source =>
        <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.title}<Icon name="external" size={11} /></a>)}</div>
    </div>
    <p className="explanation-label">工程の役割（学習用解説）</p>
    <p className="description">{selected.description}</p>
    <WaferDiagram stage={stage} />
    <div className="properties">
      <div><span>変化・得られるもの</span><strong>{changes[stage]}</strong></div>
      <div><span>確認するもの</span><strong>{checks[stage]}</strong></div>
    </div>
    <button className="focus-button" onClick={onFocus}>この工程に移動<Icon name="arrow" /></button>
    <details className="engineering-details" key={stage}>
      <summary>工程管理・DXの視点（一般例）</summary>
      <dl><dt>工程の役割</dt><dd>{selected.action}</dd><dt>品質を確認する</dt><dd>{selected.quality}</dd><dt>データを活用する</dt><dd>{selected.dx}</dd></dl>
      <p className="diagram-note">{selected.waferNote}</p>
    </details>
  </aside>;
});
