import type { Locale } from '../i18n/types.ts';
import type { ModelProfile } from './modelProfiles.ts';

export type TransportItemId = 'oht' | 'foup';

export interface TransportItem {
  id: TransportItemId;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  steps: string[];
  scopeNote: string;
  sourceIds: string[];
}

export interface TransportContent {
  category: string;
  roleLabel: string;
  stepsLabel: string;
  schematicLabel: string;
  backToProcess: string;
  selectionLabel: string;
  items: Record<TransportItemId, TransportItem>;
}

const transportContent: Record<Locale, TransportContent> = {
  ja: {
    category: 'ウェーハ搬送のしくみ',
    roleLabel: '役割（学習用解説）',
    stepsLabel: '搬送・受け渡しの模式例',
    schematicLabel: '模式表現・未確認',
    backToProcess: '工程の説明に戻る',
    selectionLabel: '搬送設備を選択',
    items: {
      oht: {
        id: 'oht',
        label: 'OHT搬送レール',
        title: 'OHTレールと搬送台車',
        subtitle: '天井側の軌道に沿って容器を搬送',
        description: 'OHTは、天井側の軌道を走る台車がウェーハ搬送容器を運ぶ仕組みです。このモデルでは台車がFOUPを保持して運び、装置への受け渡しのためにOHTの昇降機構で容器を下ろします。',
        steps: [
          '搬送台車は天井側のレールに沿って走行します。',
          '台車がFOUPを保持し、ウェーハを容器に入れたまま搬送します。',
          '装置への受け渡しでは、OHTの昇降機構がFOUPを下ろしたり引き上げたりします。',
          'この模式例では台車はレール上に留まり、FOUPはOHTの昇降機構によって上下します。',
        ],
        scopeNote: '黄色のレール、形状、寸法、支持構造、分岐、走行経路は説明用の模式表現です。マイクロンの公開AMHS職務から搬送・保管に関する役割は確認できますが、Fab15の実際のレール構成や、この形状の実在は確認していません。',
        sourceIds: ['micron-amhs'],
      },
      foup: {
        id: 'foup',
        label: 'FOUP搬送容器',
        title: 'FOUP：前面開口型ウェーハ搬送容器',
        subtitle: 'ウェーハを収納し、搬送中に保護する容器',
        description: 'FOUPは前面に開口部を持つ密閉型のウェーハ搬送容器です。ウェーハを収納し、搬送中の接触や汚染を抑える役割を持ちます。上下の移動はOHTの昇降機構が行い、FOUPは搬送される容器として動きます。',
        steps: [
          'ウェーハを容器に収納し、外部との接触や汚染を抑えます。',
          'OHTなどの搬送設備が容器を保持して運び、昇降機構で受け渡し位置へ移動させます。',
          'ウェーハは容器前面の開口部から出し入れする構造です。',
        ],
        scopeNote: '容器の色、形状、寸法、型式、容量、収納枚数は説明用の模式表現です。引用資料はAMHSの搬送・保管に関する職務を示しており、Fab15で使用するFOUPの具体的な型式や、この容器の実在を確認する資料ではありません。',
        sourceIds: ['micron-amhs'],
      },
    },
  },
  en: {
    category: 'How wafer transport works',
    roleLabel: 'Role (learning explanation)',
    stepsLabel: 'Illustrative transport and handoff',
    schematicLabel: 'Illustrative / unverified',
    backToProcess: 'Back to the process description',
    selectionLabel: 'Select transport equipment',
    items: {
      oht: {
        id: 'oht',
        label: 'OHT rail',
        title: 'OHT rail and transport trolley',
        subtitle: 'Move containers along overhead tracks',
        description: 'OHT uses trolleys that travel on overhead tracks to carry wafer transport containers. In this model, the trolley holds and carries a FOUP, and the OHT hoist lowers the container for handoff to equipment.',
        steps: [
          'The transport trolley travels along an overhead rail.',
          'The trolley holds the FOUP and transports the wafers inside the container.',
          'For equipment handoff, the OHT hoist lowers or raises the FOUP.',
          'In this schematic example, the trolley remains on the rail while the OHT hoist moves the FOUP up or down.',
        ],
        scopeNote: 'The yellow rail, geometry, dimensions, supports, junctions and travel routes are explanatory schematic representations. Micron’s public AMHS job description supports responsibilities for transport and storage; it does not establish Fab15’s actual rail configuration or the existence of the specific form shown here.',
        sourceIds: ['micron-amhs'],
      },
      foup: {
        id: 'foup',
        label: 'FOUP carrier',
        title: 'FOUP: front-opening wafer carrier',
        subtitle: 'House and protect wafers during transport',
        description: 'A FOUP is an enclosed wafer transport container with a front opening. It houses wafers and helps limit contact and contamination during transport. The OHT hoist provides the vertical motion; the FOUP moves as the container being transported.',
        steps: [
          'Wafers are housed in the container to limit external contact and contamination.',
          'Transport equipment such as OHT holds and carries the container, using a hoist to move it to the handoff position.',
          'The container is designed for wafers to enter and leave through its front opening.',
        ],
        scopeNote: 'The container’s color, geometry, dimensions, model, capacity and wafer count are explanatory schematic representations. The cited source describes AMHS transport and storage responsibilities; it does not establish a specific FOUP model used at Fab15 or the existence of the illustrated container.',
        sourceIds: ['micron-amhs'],
      },
    },
  },
  zh: {
    category: '晶圆搬运机制',
    roleLabel: '作用（学习说明）',
    stepsLabel: '搬运与交接示意',
    schematicLabel: '示意／尚未确认',
    backToProcess: '返回工艺说明',
    selectionLabel: '选择搬运设备',
    items: {
      oht: {
        id: 'oht',
        label: 'OHT空中轨道',
        title: 'OHT空中轨道与搬运小车',
        subtitle: '沿顶部轨道搬运容器',
        description: 'OHT通过在顶部轨道上行驶的小车搬运晶圆容器。本模型中，小车抓持并运输FOUP，交接设备时由OHT的升降机构将容器放下。',
        steps: [
          '搬运小车沿顶部轨道行驶。',
          '小车抓持FOUP，将晶圆保持在容器内一起搬运。',
          '与设备交接时，由OHT的升降机构放下或提起FOUP。',
          '在这个示意例中，小车留在轨道上，FOUP由OHT的升降机构带动而上下移动。',
        ],
        scopeNote: '黄色轨道、形状、尺寸、支撑结构、分岔与行驶路线均为说明用示意。美光公开的AMHS岗位说明可支持搬运与存储相关职责，但不能据此确认Fab15的实际轨道配置，或图中具体形态的真实存在。',
        sourceIds: ['micron-amhs'],
      },
      foup: {
        id: 'foup',
        label: 'FOUP晶圆盒',
        title: 'FOUP：前开式晶圆搬运容器',
        subtitle: '收纳晶圆并在搬运中提供保护',
        description: 'FOUP是前方带开口的晶圆密闭容器，用于收纳晶圆，并减少搬运中的接触和污染。上下移动由OHT的升降机构完成，FOUP作为被搬运的容器随之移动。',
        steps: [
          '将晶圆收纳在容器内，减少与外界的接触和污染。',
          'OHT等搬运设备抓持并运输容器，通过升降机构移动至交接位置。',
          '晶圆通过容器前方的开口进出。',
        ],
        scopeNote: '容器颜色、形状、尺寸、型号、容量和晶圆数量均为说明用示意。引用资料描述的是AMHS搬运与存储职责，不能据此确认Fab15采用的具体FOUP型号，或图中容器的真实存在。',
        sourceIds: ['micron-amhs'],
      },
    },
  },
};

const kioxiaScope: Record<Locale, { oht: string; foup: string }> = {
  ja: {
    oht: '四日市の公式スマートファクトリー紹介はOHTによる自動搬送を説明しています。黄色の軌道、台車、支持構造、配置、経路、昇降の形状・時間は学習用の模式表現であり、実際の設備を再現していません。',
    foup: 'FOUPの役割を説明する一般例です。四日市の公式資料は自動搬送を紹介していますが、この容器の色・形状・寸法・型式・容量・収納枚数は確認できず、模式表現です。',
  },
  en: {
    oht: 'The official Yokkaichi smart-factory page describes automated OHT transport. The yellow rails, trolley, supports, layout, routing and hoist geometry and timing are learning illustrations, not reproductions of the actual equipment.',
    foup: 'This is a generic illustration of a FOUP and its role. The official Yokkaichi source describes automated transport, but does not establish the illustrated container color, shape, dimensions, type, capacity or wafer count.',
  },
  zh: {
    oht: '四日市官方智能工厂介绍说明了OHT自动搬运。黄色轨道、小车、支撑结构、布局、路线、升降形状与时间均为学习示意，并未还原真实设备。',
    foup: '这是说明FOUP作用的通用示例。四日市官方资料介绍了自动搬运，但未确认图中容器的颜色、形状、尺寸、型号、容量与晶圆数量，均按示意表达。',
  },
};

export function getTransportContent(locale: Locale, profile: ModelProfile = 'micron'): TransportContent {
  const content = transportContent[locale];
  if (profile === 'micron') return content;
  return { ...content, items: {
    oht: { ...content.items.oht, scopeNote: kioxiaScope[locale].oht, sourceIds: ['kioxia-yokkaichi-smart'] },
    foup: { ...content.items.foup, scopeNote: kioxiaScope[locale].foup, sourceIds: ['kioxia-yokkaichi-smart'] },
  } };
}
