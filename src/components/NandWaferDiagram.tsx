import { useId } from 'react';
import type { Locale } from '../i18n/types';
import { nandWaferLabels } from '../data/nandWaferLabels';

interface LeaderProps { x: number; y: number; endX: number; endY: number; label: string }

function Leader({ x, y, endX, endY, label }: LeaderProps) {
  const elbowX = endX > x ? endX - 12 : endX + 12;
  return <g fill="none" stroke="var(--diagram-ink)" strokeWidth="0.85" strokeLinejoin="round">
    <path d={`M${x} ${y} L${elbowX} ${endY} H${endX}`} />
    <circle cx={x} cy={y} r="1.6" fill="var(--diagram-ink)" stroke="none" />
    <text x={endX} y={endY - 7} fill="var(--diagram-ink)" stroke="none" fontSize="10" textAnchor={endX > x ? 'end' : 'start'}>{label}</text>
  </g>;
}

function Wafer({ id, cy, rx = 98, ry = 38, depth = 18, film = false }: { id: string; cy: number; rx?: number; ry?: number; depth?: number; film?: boolean }) {
  return <g>
    <path d={`M${156 - rx} ${cy} C${156 - rx} ${cy - ry * .55} ${156 - rx * .55} ${cy - ry} 156 ${cy - ry} C${156 + rx * .55} ${cy - ry} ${156 + rx} ${cy - ry * .55} ${156 + rx} ${cy} V${cy + depth} C${156 + rx} ${cy + depth + ry * .55} ${156 + rx * .55} ${cy + depth + ry} 156 ${cy + depth + ry} C${156 - rx * .55} ${cy + depth + ry} ${156 - rx} ${cy + depth + ry * .55} ${156 - rx} ${cy + depth} Z`} fill={`url(#${id}-edge)`} />
    <ellipse cx="156" cy={cy} rx={rx} ry={ry} fill={`url(#${id}-${film ? 'film' : 'silicon'})`} stroke="#7994a7" strokeWidth=".75" />
    <path d={`M${156 - rx} ${cy + depth} C${156 - rx} ${cy + depth + ry * .55} ${156 - rx * .55} ${cy + depth + ry} 156 ${cy + depth + ry} C${156 + rx * .55} ${cy + depth + ry} ${156 + rx} ${cy + depth + ry * .55} ${156 + rx} ${cy + depth}`} fill="none" stroke="#29455f" strokeWidth=".75" />
  </g>;
}

const holePositions = [-24, 0, 24].flatMap(x => [-24, 0, 24].map(y => ({ x: 156 + .8 * x - .8 * y, y: 100 + .36 * x + .36 * y })));
const layerColors = ['#aab4dc', '#6fb9c0', '#c5c5e3', '#72b2bc', '#acb8d6', '#77bcc0'];

/** Qualitative NAND diagrams; displayed layers and geometry never specify a product structure. */
export default function NandWaferDiagram({ stage, locale }: { stage: number; locale: Locale }) {
  const text = nandWaferLabels[locale];
  const id = `nand-${useId().replace(/:/g, '')}`;
  const current = Number.isFinite(stage) ? Math.max(0, Math.min(8, Math.floor(stage))) : 0;
  const stack = current >= 2 && current <= 6;
  const waferY = current <= 1 ? 126 : current === 8 ? 130 : 136;
  const caption = current === 7 ? `${text.cbaCaption} ${text.caption}` : text.caption;

  return <div className="wafer-diagram">
    <svg viewBox="0 0 320 230" role="img" aria-label={`${text.stageNames[current]}${text.diagramSuffix}`} width="100%">
      <title>{text.stageNames[current]}{text.diagramSuffix}</title>
      <desc>{caption}</desc>
      <defs>
        <linearGradient id={`${id}-silicon`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#dbe8ee" /><stop offset=".46" stopColor="#a5becb" /><stop offset="1" stopColor="#628298" /></linearGradient>
        <linearGradient id={`${id}-edge`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#647c93" /><stop offset="1" stopColor="#314b64" /></linearGradient>
        <linearGradient id={`${id}-film`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c5e9e6" /><stop offset=".5" stopColor="#87cac9" /><stop offset="1" stopColor="#4d969f" /></linearGradient>
        <radialGradient id={`${id}-shadow`}><stop offset="0" stopColor="#4c6b85" stopOpacity=".18" /><stop offset="1" stopColor="#4c6b85" stopOpacity="0" /></radialGradient>
        <clipPath id={`${id}-wafer-top`}><ellipse cx="156" cy={waferY} rx="98" ry="38" /></clipPath>
        <clipPath id={`${id}-stack-top`}><path d="M88 98 L154 68 L224 100 L158 130 Z" /></clipPath>
        <clipPath id={`${id}-stack-front`}><path d="M88 98 L158 130 V160 L88 128 Z" /></clipPath>
        <clipPath id={`${id}-cmos-top`}><ellipse cx="156" cy="164" rx="82" ry="28" /></clipPath>
      </defs>
      <ellipse cx="159" cy="192" rx="117" ry="19" fill={`url(#${id}-shadow)`} />

      {current !== 7 && <g>
        {current === 0 && <g fill="#cce0e9" stroke="#7ba2b9" strokeWidth=".9">
          <path d="M55 73 L143 37 L261 81 V164 L174 198 L55 153 Z" fillOpacity=".22" />
          <path d="M55 73 L174 116 L261 81 M174 116 V198" fill="none" opacity=".65" />
          <path d="M89 59 L143 37 L227 68 L174 91 Z" fillOpacity=".42" />
        </g>}
        <Wafer id={id} cy={waferY} film={current === 8} />

        {current === 0 && <path d="M55 73 L174 116 V198 L55 153 Z" fill="#c1dce8" fillOpacity=".16" stroke="#7ba2b9" strokeWidth=".9" />}
        {current === 1 && <g fill="#5ebbbf" stroke="#e8fbfd" strokeWidth=".8">
          {[[-57, -2], [-27, -19], [13, -8], [46, -22], [67, 5]].map(([x, y], index) => <path key={index} d={`M${156 + x} ${waferY + y - 14} q-6 9 0 11 q6-2 0-11Z`} opacity=".75" />)}
          <path d="M76 126 Q126 89 197 110" fill="none" stroke="#f0fafb" strokeWidth="1.1" opacity=".65" />
        </g>}

        {stack && <g>
          {/* A small illustrative section makes the vertical stack visible; the number of stripes is not a layer count. */}
          {layerColors.map((color, index) => {
            const dy = index * 5;
            const frontColor = current === 5 && index % 2 === 0 ? '#c3ac71' : color;
            return <g key={index}>
              <path d={`M88 ${98 + dy} L158 ${130 + dy} V${135 + dy} L88 ${103 + dy} Z`} fill={frontColor} stroke="#6d899d" strokeWidth=".35" />
              <path d={`M158 ${130 + dy} L224 ${100 + dy} V${105 + dy} L158 ${135 + dy} Z`} fill={frontColor} stroke="#5f8296" strokeWidth=".35" opacity=".88" />
            </g>;
          })}
          <path d="M88 98 L154 68 L224 100 L158 130 Z" fill={current === 3 ? '#b8a4d8' : `url(#${id}-film)`} stroke="#608e9f" strokeWidth=".8" />

          {(current === 3 || current === 4 || current === 5) && <g clipPath={`url(#${id}-stack-top)`}>
            {holePositions.map(({ x, y }, index) => current === 3
              ? <path key={index} d={`M${x - 5} ${y} l5 -2.5 l5 2.5 l-5 2.5 Z`} fill="#d8cae8" stroke="#957cae" strokeWidth=".6" />
              : <g key={index}>
                <ellipse cx={x} cy={y} rx={current === 5 ? 5 : 4.5} ry="2.5" fill={current === 5 ? '#c4ae76' : '#254b63'} stroke="#e0e9dc" strokeWidth=".6" />
                {current === 5 && <ellipse cx={x} cy={y} rx="2.9" ry="1.5" fill="#335e70" stroke="#a9d5d7" strokeWidth=".6" />}
              </g>)}
          </g>}
          {(current === 4 || current === 5) && <g clipPath={`url(#${id}-stack-front)`}>
            {[[101, 104], [125, 115], [149, 126]].map(([x, y], index) => <g key={index}>
              <path d={`M${x - 3} ${y - 1} V${y + 32} H${x + 3} V${y - 1} Z`} fill="#254b63" />
              {current === 5 && <path d={`M${x - 2.7} ${y - 1} V${y + 32} M${x + 2.7} ${y - 1} V${y + 32}`} stroke="#bde0df" strokeWidth="1.1" />}
            </g>)}
          </g>}
          {(current === 2 || current === 6) && <path d="M106 100 L155 78 L205 101 M117 105 L155 87 L194 105" fill="none" stroke="#e7f6f4" strokeWidth="1" opacity=".7" />}
        </g>}

        {current === 3 && <g stroke="#6ba6c5" strokeWidth=".85" fill="none">
          <path d="M110 29 L156 10 L206 32 L160 52 Z" fill="#dceaf2" stroke="#a5becf" />
          {[130, 151, 172, 193].map((x, index) => <g key={x}><path d={`M${x - 8} ${35 + index * 1.5} L${x} ${80 + index * 4}`} opacity=".75" /><path d={`M${x - 4} ${76 + index * 4} L${x} ${80 + index * 4} L${x + 1} ${74 + index * 4}`} /></g>)}
        </g>}

        {current === 8 && <g>
          <g clipPath={`url(#${id}-wafer-top)`}>
            <g transform="translate(156 130) matrix(.85 .36 -.85 .36 0 0)" stroke="#567e96" strokeWidth=".8" fill="none">
              {[-80, -60, -40, -20, 0, 20, 40, 60, 80].map(coordinate => <g key={coordinate}><path d={`M${coordinate} -100 V100`} /><path d={`M-100 ${coordinate} H100`} /></g>)}
              {[[-30, -30], [10, -10], [-10, 30], [50, 10]].map(([x, y], index) => <rect key={index} x={x - 3} y={y - 3} width="6" height="6" rx="1" fill="#d9c18c" stroke="#718c9a" />)}
            </g>
          </g>
          <path d="M141 43 L120 130 L189 130 L164 43 Z" fill="#d5eff0" opacity=".5" />
          <path d="M151 44 L155 132 L164 44" fill="none" stroke="#60b6bd" strokeWidth=".85" />
          <path d="M132 30 V43 C132 51 176 51 176 43 V30 Z" fill="#b6cad8" stroke="#6e879e" strokeWidth=".75" />
          <ellipse cx="154" cy="30" rx="22" ry="8" fill="#e2edf3" stroke="#859fb2" strokeWidth=".75" />
          <ellipse cx="154" cy="44" rx="12" ry="4" fill="#42647f" />
        </g>}

        {current !== 5 && <Leader x={220} y={164} endX={297} endY={207} label={text.wafer} />}
        {current === 0 && <Leader x={87} y={77} endX={23} endY={47} label={text.container} />}
        {current === 1 && <Leader x={102} y={103} endX={23} endY={65} label={text.cleaning} />}
        {current === 2 && <Leader x={103} y={125} endX={23} endY={62} label={text.stack} />}
        {current === 3 && <Leader x={117} y={104} endX={23} endY={72} label={text.resist} />}
        {current === 4 && <Leader x={156} y={100} endX={23} endY={51} label={text.memoryHoles} />}
        {current === 5 && <><Leader x={125} y={133} endX={23} endY={54} label={text.cellFilm} /><Leader x={199} y={127} endX={297} endY={203} label={text.wordLines} /></>}
        {current === 6 && <Leader x={147} y={96} endX={23} endY={52} label={text.surface} />}
        {current === 8 && <Leader x={191} y={139} endX={297} endY={74} label={text.testPoint} />}
      </g>}

      {current === 7 && <g>
        {/* The two separate wafers illustrate the publicly described 8th-generation CBA concept, not every NAND generation. */}
        <Wafer id={id} cy={64} rx={82} ry={28} depth={12} />
        {[0, 4, 8].map((dy, index) => <path key={dy} d={`M74 ${72 + dy} C74 ${87 + dy} 111 ${100 + dy} 156 ${100 + dy} C201 ${100 + dy} 238 ${87 + dy} 238 ${72 + dy} V${76 + dy} C238 ${91 + dy} 201 ${104 + dy} 156 ${104 + dy} C111 ${104 + dy} 74 ${91 + dy} 74 ${76 + dy} Z`} fill={index % 2 ? '#aab4dc' : '#79bdc3'} stroke="#7298aa" strokeWidth=".35" />)}
        <Wafer id={id} cy={164} rx={82} ry={28} depth={10} film />
        <g clipPath={`url(#${id}-cmos-top)`}>
          <g transform="translate(156 164) matrix(.85 .36 -.85 .36 0 0)" stroke="#5b8d98" strokeWidth="1" fill="none">
            {[-40, -10, 20, 50].flatMap(x => [-40, -10, 20, 50].map(y => <g key={`${x}-${y}`}><rect x={x} y={y} width="16" height="12" rx="1" fill="#c0dedb" /><path d={`M${x + 16} ${y + 6} h10 M${x + 8} ${y + 12} v13`} /><circle cx={x + 8} cy={y + 6} r="2" fill="#c4b37f" stroke="none" /></g>))}
          </g>
        </g>
        <g fill="none" stroke="#5d9cae" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
          {[135, 156, 177].map(x => <g key={x}><path d={`M${x} 115 V131 M${x - 3} 128 L${x} 131 L${x + 3} 128`} /><path d={`M${x} 143 V135 M${x - 3} 138 L${x} 135 L${x + 3} 138`} /></g>)}
        </g>
        <Leader x={222} y={88} endX={297} endY={42} label={text.arrayWafer} />
        <Leader x={218} y={174} endX={297} endY={216} label={text.cmosWafer} />
      </g>}
    </svg>
    <div className="wafer-caption">{caption}</div>
  </div>;
}
