export type IconName = 'chip' | 'play' | 'pause' | 'previous' | 'next' | 'reset' | 'tag' | 'arrow' | 'download' | 'rotate' | 'close' | 'book' | 'external';
const paths: Record<IconName, string> = {
  chip: 'M6 6h12v12H6z M9 9h6v6H9z M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4',
  play: 'M8 5l11 7-11 7z',
  pause: 'M8 5v14M16 5v14',
  previous: 'M6 5v14M18 5L8 12l10 7z',
  next: 'M18 5v14M6 5l10 7-10 7z',
  reset: 'M4 9a8 8 0 1 0 4-4M4 3v6h6',
  tag: 'M3 3h7l11 11-7 7L3 10z M7 7h.01',
  arrow: 'M5 12h14m-6-6l6 6-6 6',
  download: 'M12 3v12m-5-5l5 5 5-5M4 16v5h16v-5',
  rotate: 'M6 6a8 8 0 1 1-2 8M2 2v6h6',
  close: 'M6 6l12 12M18 6L6 18',
  book: 'M4 3h6l2 2 2-2h6v17h-6l-2 1-2-1H4zM12 5v16',
  external: 'M14 3h7v7M21 3L10 14M10 3H3v18h18v-7',
};
export default function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill={name === 'play' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}
