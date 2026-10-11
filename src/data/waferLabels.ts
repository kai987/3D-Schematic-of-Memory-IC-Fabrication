import type { Locale } from '../i18n/types';

interface WaferLabels {
  stageNames: string[];
  diagramSuffix: string;
  caption: string;
  wafer: string;
  cleaning: string;
  film: string;
  resist: string;
  etchedFilm: string;
  ions: string;
  surface: string;
  sensor: string;
  testPoint: string;
}

export const waferLabels: Record<Locale, WaferLabels> = {
  ja: {
    stageNames: ['シリコンウェーハ', '洗浄したウェーハ', '薄膜の成膜', '露光とパターン形成', 'エッチング', 'イオン注入', '表面の平坦化', '光学計測', 'ウェーハ検査'],
    diagramSuffix: 'の模式図',
    caption: 'ウェーハの状態：説明用の模式図（Fab15の実断面・実測結果ではありません）',
    wafer: 'シリコンウェーハ', cleaning: '洗浄液', film: '薄膜', resist: 'レジスト', etchedFilm: '加工した薄膜',
    ions: 'イオン', surface: '平坦な表面', sensor: '光学センサー', testPoint: '検査位置（例）',
  },
  en: {
    stageNames: ['Silicon wafer', 'Cleaned wafer', 'Thin-film deposition', 'Lithography and patterning', 'Etching', 'Ion implantation', 'Surface planarization', 'Optical metrology', 'Wafer testing'],
    diagramSuffix: ': schematic',
    caption: 'Wafer state: an explanatory schematic, not a Fab15 cross-section or measured result.',
    wafer: 'Silicon wafer', cleaning: 'Cleaning fluid', film: 'Thin film', resist: 'Resist', etchedFilm: 'Etched film',
    ions: 'Ions', surface: 'Flat surface', sensor: 'Optical sensor', testPoint: 'Test point (example)',
  },
  zh: {
    stageNames: ['硅晶圆', '清洗后的晶圆', '薄膜沉积', '曝光与图案形成', '刻蚀', '离子注入', '表面平坦化', '光学量测', '晶圆检测'],
    diagramSuffix: '示意图',
    caption: '晶圆状态：用于说明的示意图，并非 Fab15 的真实截面或实测结果。',
    wafer: '硅晶圆', cleaning: '清洗液', film: '薄膜', resist: '光刻胶', etchedFilm: '刻蚀后的薄膜',
    ions: '离子', surface: '平坦表面', sensor: '光学传感器', testPoint: '检测位置（示例）',
  },
};
