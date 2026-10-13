import { ui } from './ui.ts';
import type { UIText } from './ui.ts';
import type { Locale } from './types.ts';
import type { ModelProfile } from '../data/modelProfiles.ts';

const kioxia = {
  ja: {
    brand: 'キオクシア 四日市', subtitle: 'BiCS FLASH™・3D NAND', modelKind: '3D NANDウェーハ製造の学習モデル',
    scopeTitle: 'キオクシアの公開資料に基づく学習モデル',
    footer: '四日市の実工程順・実配置の再現ではありません。CBAは第8世代の公開例。後工程は対象外です。',
    canvasLabel: 'キオクシアの公開資料に基づく3D NAND製造の模式モデル。多層膜、垂直孔、CBA接合を示します。',
    probe: '検査',
    changes: ['保護・搬送', '清浄な表面', '多層膜の積層', '加工用パターン', '縦に貫くメモリ孔', 'セル膜・ワード線', '平坦な表面', 'アレイとCMOSの接合', '検査・評価結果'],
    checks: ['汚染・搬送状態', '粒子・残留物', '膜厚・均一性', '寸法・位置合わせ', '孔の深さ・側壁', '膜の形成・電極', '残膜・平坦度', '位置合わせ・接合界面', '欠陥・電気特性'],
    about: {
      title: 'キオクシア 四日市｜公開資料と確認範囲',
      illustrative: '工程の役割を学ぶための一般例。四日市の実装置や現行の実施範囲を確認したものではありません。',
      scope: '四日市の製品情報と、キオクシアが公開したBiCS FLASH技術を組み合わせた学習モデルです。装置外観・内部・寸法・層数・台数・配置・経路・処理条件は模式表現。公式の工場配置図や製造レシピではありません。',
      sourcesTitle: 'キオクシアの公式公開資料', date: '確認日：2026年10月13日。公開技術と特定工場の量産実装を区別しています。',
      comparisonTitle: 'Micron Fab15のDRAMモデルとの違い',
      comparisonIntro: '四日市のモデルでは、電源を切ってもデータを保持する3D NANDフラッシュメモリを扱います。',
      comparison: [
        '多層膜、縦方向のメモリ孔、セル膜・ワード線を模式表示し、3次元に配置するセルの考え方を学びます。表示層数は実製品の層数ではありません。',
        'CBAはセルアレイとCMOSを別々のウェーハに形成して接合する技術。ここでは第8世代の公開例を示し、すべてのBiCS FLASH製品への適用を意味しません。',
        '成膜・露光・エッチング・洗浄・CMPなどの基本分野は共通ですが、DRAMと3D NANDではデバイス構造と工程の組み合わせが異なります。',
      ],
      routeEnd: '区間の学習用デモです。実工場の順序・時間・反復を示しません。CBAに必要な独立したCMOSウェーハ工程は接合区画で説明し、二系統の物流全体は再現していません。切断・組立・封止・製品最終検査は対象外です。',
    },
  },
  en: {
    brand: 'KIOXIA Yokkaichi', subtitle: 'BiCS FLASH™ · 3D NAND', modelKind: '3D NAND wafer fabrication learning model',
    scopeTitle: 'Learning model based on KIOXIA public sources',
    footer: 'Actual Yokkaichi routing and layout are unverified. CBA illustrates an 8th-generation example. Back-end processing is excluded.',
    canvasLabel: 'Schematic 3D NAND model based on KIOXIA public sources, showing multilayer stacks, vertical holes and CBA bonding.',
    probe: 'Inspection',
    changes: ['Protection & transport', 'Clean surface', 'Multilayer stack', 'Pattern for processing', 'Vertical memory holes', 'Cell films & word lines', 'Planar surface', 'Array / CMOS bonding', 'Inspection results'],
    checks: ['Contamination & transport', 'Particles & residue', 'Thickness & uniformity', 'Dimensions & alignment', 'Hole depth & sidewalls', 'Films & electrodes', 'Remaining film & planarity', 'Alignment & bond interface', 'Defects & electrical properties'],
    about: {
      title: 'KIOXIA Yokkaichi | Sources & evidence scope',
      illustrative: 'A generic learning aid, not confirmation of an actual Yokkaichi tool or current local process.',
      scope: 'This learning model combines Yokkaichi product information with publicly described KIOXIA BiCS FLASH technology. Tool appearance, interiors, dimensions, layer counts, quantities, layout, routing and conditions are schematic. It is not an official factory layout or recipe.',
      sourcesTitle: 'KIOXIA official public sources', date: 'Checked: 13 October 2026. Public technology descriptions are distinguished from implementation at a particular plant.',
      comparisonTitle: 'Compared with the Micron Fab15 DRAM model',
      comparisonIntro: 'The Yokkaichi model focuses on 3D NAND flash, which retains data without power.',
      comparison: [
        'Multilayer stacks, vertical memory holes, cell films and word lines illustrate cells arranged in three dimensions. The displayed layer count is not a product specification.',
        'CBA bonds a cell-array wafer to a separately fabricated CMOS wafer. The model uses a public 8th-generation example; it does not imply use in every BiCS FLASH product.',
        'Deposition, lithography, etching, cleaning and CMP are shared process fields, while DRAM and 3D NAND use different device structures and process combinations.',
      ],
      routeEnd: ' learning segments. These are not actual factory sequences, times or repetition counts. The separate CMOS-wafer process needed for CBA is explained at the bonding station; the demo does not reproduce the complete two-wafer logistics. Dicing, assembly, packaging and final product testing are excluded.',
    },
  },
  zh: {
    brand: '凯侠 四日市', subtitle: 'BiCS FLASH™・3D NAND', modelKind: '3D NAND 晶圆制造学习模型',
    scopeTitle: '依据凯侠公开资料制作的学习模型',
    footer: '未还原四日市真实工艺顺序与布局。CBA展示第8代公开示例，后道工艺不在模型范围内。',
    canvasLabel: '依据凯侠公开资料制作的3D NAND示意模型，展示多层堆叠、垂直孔和CBA晶圆键合。',
    probe: '检测',
    changes: ['保护与搬运', '清洁表面', '多层膜堆叠', '加工图形', '垂直存储孔', '存储单元膜与字线', '平坦表面', '阵列与CMOS键合', '检测与评估结果'],
    checks: ['污染与搬运状态', '颗粒与残留物', '膜厚与均匀性', '尺寸与对准', '孔深与侧壁', '膜层与电极', '剩余膜厚与平坦度', '对准与键合界面', '缺陷与电气特性'],
    about: {
      title: '凯侠 四日市｜公开资料与确认范围',
      illustrative: '用于学习工艺作用的通用示例，未确认是四日市实际设备或当前当地实施工艺。',
      scope: '本模型结合四日市产品信息与凯侠公开的BiCS FLASH技术说明。设备外观、内部结构、尺寸、层数、数量、布局、路线与条件均为示意，不是官方厂区布置图或制造配方。',
      sourcesTitle: '凯侠官方公开资料', date: '核对日期：2026年10月13日。公开技术说明与特定工厂的量产实施范围分别标注。',
      comparisonTitle: '与美光 Fab15 DRAM 模型的区别',
      comparisonIntro: '四日市版本聚焦断电后仍可保留数据的3D NAND闪存。',
      comparison: [
        '用多层膜、垂直存储孔、单元膜与字线展示存储单元沿三维方向排列的概念。显示层数不代表实际产品规格。',
        'CBA将独立制造的存储阵列晶圆与CMOS晶圆键合。本模型采用第8代公开示例，不意味着所有BiCS FLASH产品均使用此技术。',
        '沉积、光刻、刻蚀、清洗与CMP属于共通工艺领域，但DRAM与3D NAND的器件结构和工艺组合不同。',
      ],
      routeEnd: '段学习演示，不代表真实工厂的顺序、时间或重复次数。CBA所需的独立CMOS晶圆制造在键合区说明，演示未还原完整双晶圆物流。切割、组装、封装与成品最终测试不在范围内。',
    },
  },
};

export function getProfileUI(locale: Locale, profile: ModelProfile = 'micron'): UIText {
  const base = ui[locale];
  if (profile === 'micron') return base;
  const copy = kioxia[locale];
  return {
    ...base, brand: copy.brand, subtitle: copy.subtitle, modelKind: copy.modelKind,
    scopeTitle: copy.scopeTitle, footer: copy.footer, probe: copy.probe,
    scene: { ...base.scene, canvasLabel: copy.canvasLabel },
    inspector: { ...base.inspector, changes: copy.changes, checks: copy.checks },
    about: { ...base.about, ...copy.about },
  };
}
