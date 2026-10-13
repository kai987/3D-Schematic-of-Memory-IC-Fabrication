import { useId } from 'react';
import { useI18n } from '../i18n/LocaleContext';
import { waferLabels } from '../data/waferLabels';
import NandWaferDiagram from './NandWaferDiagram';

type LeaderProps = { x: number; y: number; endX: number; endY: number; label: string };

function Leader({ x, y, endX, endY, label }: LeaderProps) {
  const elbowX = endX > x ? endX - 12 : endX + 12;
  return (
    <g fill="none" stroke="var(--diagram-ink)" strokeWidth="0.85" strokeLinejoin="round">
      <path d={`M${x} ${y} L${elbowX} ${endY} H${endX}`} />
      <circle cx={x} cy={y} r="1.6" fill="var(--diagram-ink)" stroke="none" />
      <text x={endX} y={endY - 7} fill="var(--diagram-ink)" stroke="none" fontSize="10" textAnchor={endX > x ? 'end' : 'start'}>{label}</text>
    </g>
  );
}

/** ウェーハ工程の説明用模式図。Fab15の実断面や実測結果を表すものではありません。 */
export default function WaferDiagram({ stage }: { stage: number }) {
  const { locale, profile } = useI18n();
  const text = waferLabels[locale];
  const id = useId().replace(/:/g, '');
  if (profile === 'kioxia') return <NandWaferDiagram stage={stage} locale={locale} />;
  const current = Math.max(0, Math.min(8, stage));
  const hasFilm = current >= 2 && current <= 8;
  const topY = hasFilm ? 103 : 111;
  const gridCoordinates = [-80, -60, -40, -20, 0, 20, 40, 60, 80];


  return (
    <div className="wafer-diagram">
      <svg viewBox="0 0 320 230" role="img" aria-label={`${text.stageNames[current]}${text.diagramSuffix}`} width="100%">
        <title>{text.stageNames[current]}{text.diagramSuffix}</title>
        <defs>
          <linearGradient id={`${id}-silicon`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#dbe8ee" /><stop offset="0.46" stopColor="#a5becb" /><stop offset="1" stopColor="#628298" />
          </linearGradient>
          <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#647c93" /><stop offset="1" stopColor="#314b64" />
          </linearGradient>
          <linearGradient id={`${id}-film`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c5e9e6" /><stop offset="0.5" stopColor="#87cac9" /><stop offset="1" stopColor="#4d969f" />
          </linearGradient>
          <radialGradient id={`${id}-shadow`}>
            <stop offset="0" stopColor="#4c6b85" stopOpacity="0.18" /><stop offset="1" stopColor="#4c6b85" stopOpacity="0" />
          </radialGradient>
          <clipPath id={`${id}-top`}><ellipse cx="156" cy={topY} rx="98" ry="43" /></clipPath>
        </defs>

        <ellipse cx="159" cy="173" rx="117" ry="22" fill={`url(#${id}-shadow)`} />

        {current <= 8 && (
          <g>
            <path d="M58 111 C58 87 102 68 156 68 C210 68 254 87 254 111 V130 C254 154 210 173 156 173 C102 173 58 154 58 130 Z" fill={`url(#${id}-edge)`} />
            <ellipse cx="156" cy="111" rx="98" ry="43" fill={`url(#${id}-silicon)`} stroke="#7994a7" strokeWidth="0.75" />
            <path d="M58 130 C58 154 102 173 156 173 C210 173 254 154 254 130" fill="none" stroke="#29455f" strokeWidth="0.75" />

            {hasFilm && (
              <g>
                <path d="M58 104 V110 C58 134 102 153 156 153 C210 153 254 134 254 110 V104 C254 128 210 147 156 147 C102 147 58 128 58 104Z" fill="#adacd4" />
                <path d="M58 100 V104 C58 128 102 147 156 147 C210 147 254 128 254 104 V100 C254 124 210 143 156 143 C102 143 58 124 58 100Z" fill="#68b7bd" />
                <ellipse cx="156" cy="103" rx="98" ry="43" fill={`url(#${id}-film)`} stroke="#6c9eab" strokeWidth="0.75" />
              </g>
            )}

            {(current === 0 || current === 1 || current === 2 || current === 6) && (
              <g clipPath={`url(#${id}-top)`} stroke="white" fill="none" opacity="0.5">
                <path d={`M74 ${topY - 11} Q122 ${topY - 39} 181 ${topY - 25}`} strokeWidth="1.25" />
                <path d={`M84 ${topY - 6} Q105 ${topY - 19} 123 ${topY - 19}`} strokeWidth="0.6" />
              </g>
            )}

            {current === 1 && (
              <g fill="#5ebbbf" stroke="#e8fbfd" strokeWidth="0.8">
                {[[-57, -2], [-27, -19], [13, -8], [46, -22], [67, 5]].map(([x, y], index) => <path key={index} d={`M${156 + x} ${topY + y - 14} q-6 9 0 11 q6-2 0-11Z`} opacity="0.75" />)}
              </g>
            )}

            {(current === 3 || current === 4) && (
              <g clipPath={`url(#${id}-top)`}>
                <g transform="translate(156 103) matrix(.85 .36 -.85 .36 0 0)">
                  {gridCoordinates.slice(1, -1).flatMap((x) => gridCoordinates.slice(1, -1).map((y) => (
                    <g key={`${x}-${y}`}>
                      <rect x={x + 3} y={y + 3} width="12" height="12" fill={current === 3 ? '#b8a4d8' : '#254b63'} stroke={current === 3 ? '#e8def1' : '#73afb9'} strokeWidth="1.3" />
                      {current === 4 && <path d={`M${x + 3} ${y + 15} V${y + 3} H${x + 15}`} stroke="#152f49" fill="none" strokeWidth="2" />}
                    </g>
                  )))}
                </g>
              </g>
            )}

            {current === 3 && (
              <g stroke="#6ba6c5" strokeWidth="1" fill="none">
                {[112, 139, 166, 193].map((x) => <g key={x}><path d={`M${x - 13} 31 L${x} 77`} opacity="0.7" /><path d={`M${x - 2} 71 L${x} 77 L${x - 5} 74`} /></g>)}
                <path d="M86 30 H187 L216 43 H115 Z" fill="#dceaf2" stroke="#a5becf" />
              </g>
            )}

            {current === 5 && (
              <g>
                {[101, 124, 147, 170, 193, 216].map((x, index) => <g key={x}>
                  <path d={`M${x} ${36 + index % 2 * 8} V${87 + index % 2 * 10}`} stroke="#60afb9" strokeWidth="0.8" strokeDasharray="2 4" />
                  {[0, 1, 2].map((dot) => <circle key={dot} cx={x} cy={45 + dot * 15 + index % 2 * 8} r="2.1" fill="#5396b5" />)}
                  <circle cx={x} cy={91 + index % 2 * 10} r="2" fill="#3c677d" />
                </g>)}
              </g>
            )}

            {current === 6 && (
              <g stroke="#e4f5f3" strokeWidth="1" fill="none" opacity="0.8">
                <path d="M105 117 L156 93 L207 117" /><path d="M110 120 L156 99 L202 120" />
              </g>
            )}

            {current === 7 && (
              <g>
                <path d="M138 43 L116 113 L195 107 L161 43Z" fill="#d5eff0" opacity="0.58" />
                <path d="M148 43 L154 112 L169 46" fill="none" stroke="#60b6bd" strokeWidth="0.85" />
                <ellipse cx="154" cy="111" rx="25" ry="10" fill="none" stroke="#51aab5" strokeWidth="0.75" strokeDasharray="3 3" />
                <path d="M130 29 V44 C130 52 175 52 175 44 V29Z" fill="#b6cad8" stroke="#6e879e" strokeWidth="0.75" />
                <ellipse cx="152.5" cy="29" rx="22.5" ry="8" fill="#e2edf3" stroke="#859fb2" strokeWidth="0.75" />
                <ellipse cx="152.5" cy="45" rx="13" ry="4" fill="#42647f" />
              </g>
            )}

            {current === 8 && (
              <g clipPath={`url(#${id}-top)`}>
                <g transform="translate(156 103) matrix(.85 .36 -.85 .36 0 0)">
                  {gridCoordinates.map((coordinate) => <g key={coordinate} stroke="#567e96" strokeWidth="1"><path d={`M${coordinate}-100 V100`} /><path d={`M-100 ${coordinate} H100`} /></g>)}
                  {[[-30, -30], [10, -10], [-10, 30], [50, 10], [-50, 10]].map(([x, y], index) => <rect key={index} x={x - 3} y={y - 3} width="6" height="6" rx="1.2" fill={index % 2 === 0 ? '#4d849b' : '#b5d1dc'} />)}
                </g>
                <path d="M239 65 L200 88" stroke="#263e54" strokeWidth="1.5" />
                <path d="M245 67 L207 90" stroke="#263e54" strokeWidth="1.5" />
              </g>
            )}

            <Leader x={220} y={141} endX={297} endY={183} label={text.wafer} />
            {current === 1 && <Leader x={101} y={102} endX={23} endY={61} label={text.cleaning} />}
            {current === 2 && <Leader x={88} y={118} endX={23} endY={63} label={text.film} />}
            {current === 3 && <Leader x={106} y={97} endX={23} endY={69} label={text.resist} />}
            {current === 4 && <Leader x={106} y={97} endX={23} endY={64} label={text.etchedFilm} />}
            {current === 5 && <Leader x={101} y={60} endX={23} endY={38} label={text.ions} />}
            {current === 6 && <Leader x={98} y={110} endX={23} endY={66} label={text.surface} />}
            {current === 7 && <Leader x={152} y={33} endX={284} endY={35} label={text.sensor} />}
            {current === 8 && <Leader x={188} y={123} endX={291} endY={70} label={text.testPoint} />}
          </g>
        )}

      </svg>
      <div className="wafer-caption">{text.caption}</div>
    </div>
  );
}
