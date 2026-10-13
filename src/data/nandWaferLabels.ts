import type { Locale } from '../i18n/types';

export interface NandWaferLabels {
  stageNames: string[];
  diagramSuffix: string;
  caption: string;
  cbaCaption: string;
  wafer: string;
  container: string;
  cleaning: string;
  stack: string;
  resist: string;
  memoryHoles: string;
  cellFilm: string;
  wordLines: string;
  surface: string;
  arrayWafer: string;
  cmosWafer: string;
  testPoint: string;
}

export const nandWaferLabels: Record<Locale, NandWaferLabels> = {
  ja: {
    stageNames: ['ウェーハ搬送', 'ウェーハ洗浄', '多層膜の積層', '露光・パターン形成', '垂直メモリホール形成', 'セル膜・ワード線形成', '表面の平坦化', 'CBA：ウェーハ接合', 'ウェーハ検査'],
    diagramSuffix: 'の模式図',
    caption: '層数・断面・寸法は説明用の模式表現であり、実際の構造を示しません。',
    cbaCaption: 'CBA（第8世代の公開例）：メモリセルアレイ用とCMOS回路用のウェーハを別々に形成し、高精度に接合。',
    wafer: 'シリコンウェーハ', container: '搬送容器（模式）', cleaning: '洗浄液', stack: '多層膜（模式）', resist: 'レジスト',
    memoryHoles: '垂直メモリホール', cellFilm: 'セル膜（模式）', wordLines: 'ワード線（模式）', surface: '平坦な表面',
    arrayWafer: 'アレイ用ウェーハ', cmosWafer: 'CMOS用ウェーハ', testPoint: '検査位置（例）',
  },
  en: {
    stageNames: ['Wafer transport', 'Wafer cleaning', 'Multilayer stack deposition', 'Lithography and patterning', 'Vertical memory-hole formation', 'Cell-film and word-line formation', 'Surface planarization', 'CBA: wafer bonding', 'Wafer inspection'],
    diagramSuffix: ': schematic',
    caption: 'Layer count, section and dimensions are schematic and do not represent an actual device structure.',
    cbaCaption: 'CBA (public 8th-generation example): separately fabricated memory-cell-array and CMOS-circuit wafers are precision bonded.',
    wafer: 'Silicon wafer', container: 'Carrier (schematic)', cleaning: 'Cleaning fluid', stack: 'Multilayer stack', resist: 'Resist',
    memoryHoles: 'Vertical memory holes', cellFilm: 'Cell film (schematic)', wordLines: 'Word lines (schematic)', surface: 'Flat surface',
    arrayWafer: 'Array wafer', cmosWafer: 'CMOS wafer', testPoint: 'Inspection point (example)',
  },
  zh: {
    stageNames: ['晶圆搬运', '晶圆清洗', '多层薄膜堆叠', '曝光与图案形成', '垂直存储孔形成', '单元膜与字线形成', '表面平坦化', 'CBA：晶圆键合', '晶圆检测'],
    diagramSuffix: '示意图',
    caption: '层数、截面与尺寸均为说明用示意，不代表实际结构。',
    cbaCaption: 'CBA（第8代公开案例）：分别制造存储单元阵列晶圆与CMOS电路晶圆，再进行高精度键合。',
    wafer: '硅晶圆', container: '搬运容器（示意）', cleaning: '清洗液', stack: '多层薄膜（示意）', resist: '光刻胶',
    memoryHoles: '垂直存储孔', cellFilm: '单元膜（示意）', wordLines: '字线（示意）', surface: '平坦表面',
    arrayWafer: '阵列晶圆', cmosWafer: 'CMOS晶圆', testPoint: '检测位置（示例）',
  },
};
