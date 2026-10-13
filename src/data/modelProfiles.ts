import type { Locale } from '../i18n/types.ts';
import { DEMO_ROUTE } from './processes.ts';
import { KIOXIA_DEMO_ROUTE } from './kioxiaProcesses.ts';

export type ModelProfile = 'micron' | 'kioxia';

export const profileLabels: Record<Locale, { label: string; micron: string; kioxia: string }> = {
  ja: { label: '学習モデルを選択', micron: 'Micron｜東広島 Fab15・DRAM', kioxia: 'KIOXIA｜四日市・3D NAND' },
  en: { label: 'Choose learning model', micron: 'Micron | Hiroshima Fab15 · DRAM', kioxia: 'KIOXIA | Yokkaichi · 3D NAND' },
  zh: { label: '选择学习模型', micron: '美光｜东广岛 Fab15・DRAM', kioxia: '凯侠｜四日市・3D NAND' },
};

// Learning visits only. CBA's separately manufactured CMOS wafer is illustrated
// at the bonding station; this route is not a complete two-wafer factory flow.
export function getDemoRoute(profile: ModelProfile = 'micron'): readonly number[] {
  return profile === 'kioxia' ? KIOXIA_DEMO_ROUTE : DEMO_ROUTE;
}
