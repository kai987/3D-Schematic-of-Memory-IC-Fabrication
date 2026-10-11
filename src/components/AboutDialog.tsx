import { useEffect, useRef } from 'react';
import { disclaimer, sources, stages, DEMO_ROUTE, evidenceLabels } from '../data/processes';
import Icon from './Icon';

export default function AboutDialog({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} className="about-dialog" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <button className="dialog-close icon-button" onClick={onClose} aria-label="閉じる"><Icon name="close" /></button>
    <h2>Fab15の公開資料・確認範囲</h2>
    <p>{disclaimer}</p>
    <h3>表示の読み方</h3>
    <ul className="evidence-legend">
      <li><strong>{evidenceLabels.public}</strong>：資料が明記した拠点・工程区分だけを確認済み情報として扱います。</li>
      <li><strong>{evidenceLabels.historical}</strong>：過去の証書などに記録があります。現在の実施状況や認証の有効性を保証しません。</li>
      <li><strong>{evidenceLabels.illustrative}</strong>：理解を助ける一般例です。Fab15の実工程としては確認していません。</li>
    </ul>
    <p>装置の外観・内部構造・寸法・台数・フロア配置・搬送経路・工程順・反復回数・時間は、すべて説明用の模式表現です。膜厚、断面、検査位置は実測値ではありません。この図はマイクロンの公式工程図ではありません。</p>
    <h3>操作方法</h3>
    <p>ドラッグで回転、ホイール・ピンチで拡大縮小、右ドラッグで移動します。装置や工程名を選ぶと日本語の説明が表示されます。「この工程に移動」で装置を拡大できます。</p>
    <p>再生すると、搬送と加工の繰り返しを例示する{DEMO_ROUTE.length}区間の模式デモが進みます。実際の処理時間・経路・製造レシピとは無関係です。プローブ検査までを対象とし、切断・組立・封止・製品の最終試験は表示しません。</p>
    <details className="route-details"><summary>説明用経路（実際の工程順ではありません）</summary><p>{DEMO_ROUTE.map(id => stages[id].shortTitle).join(' → ')}</p></details>
    <h3>3Dモデルの保存</h3>
    <p>「GLBを保存」で、装置・搬送容器・フロアの静止モデルを保存できます。Blenderなどで読み込めます。日本語の工程名と公開資料の確認範囲はオブジェクト名とモデルのメタデータに含まれます。Web画面の説明・ラベル・再生操作はこのアプリで利用してください。</p>
    <h3>マイクロンの公開一次資料</h3>
    <p>確認日：2026年10月12日。資料の公開日と現在の操業状況を区別して表示しています。</p>
    <ul className="source-list">{sources.map(source => <li key={source.id}>
      <a href={source.url} target="_blank" rel="noreferrer">{source.title}<Icon name="external" size={12} /></a>
      <p className="source-date">{source.date} · {source.verification}</p>
      <p><strong>確認できること：</strong>{source.support}</p><p><strong>確認できないこと：</strong>{source.limits}</p>
    </li>)}</ul>
  </dialog>;
}
