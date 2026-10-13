import type { Locale } from '../i18n/types';
import type { ProcessContent } from './localizedProcesses';
import type { EvidenceStatus, ProcessStage, PublicSource } from './processes';

type StageText = Omit<ProcessStage, 'id' | 'phase' | 'sourceIds' | 'evidenceStatus'>;
type SourceText = Pick<PublicSource, 'title' | 'date' | 'support' | 'limits'>;
type ModelText = Pick<ProcessContent, 'modelTitle' | 'scopeNote' | 'disclaimer' | 'evidenceLabels'>;

// One illustrative wet-process revisit; CBA appears once. This is not a fab recipe.
export const KIOXIA_DEMO_ROUTE = [0, 1, 2, 3, 4, 1, 5, 6, 7, 8];
export const KIOXIA_TRANSPORT_SOURCE_IDS = ['kioxia-yokkaichi-smart'];

const checkedAt = '2026-10-13';
const sourceMetadata = [
  { id: 'kioxia-yokkaichi-about', url: 'https://www.kioxia.com/ja-jp/about/yokkaichi/about.html' },
  { id: 'kioxia-yokkaichi-smart', url: 'https://www.kioxia.com/ja-jp/about/yokkaichi/smart-factory.html' },
  { id: 'kioxia-amdc', url: 'https://www.kioxia.com/ja-jp/rd/organization/amdc.html' },
  { id: 'kioxia-bics', url: 'https://www.kioxia.com/ja-jp/rd/technology/bics-flash.html' },
  { id: 'kioxia-rie', url: 'https://www.kioxia.com/ja-jp/rd/technology/topics/topics-11.html' },
  { id: 'kioxia-cba8', url: 'https://www.kioxia.com/ja-jp/rd/technology/topics/topics-66.html' },
  { id: 'kioxia-development', url: 'https://www.kioxia.com/ja-jp/rd/organization/process.html' },
  { id: 'kioxia-yokkaichi-2025', url: 'https://www.kioxia.com/en-jp/business/topics/yokkaichi-plant-202507.html' },
];

const stageMetadata: Pick<ProcessStage, 'id' | 'phase' | 'sourceIds' | 'evidenceStatus'>[] = [
  { id: 0, phase: 'fab', sourceIds: ['kioxia-yokkaichi-smart'], evidenceStatus: 'public' },
  { id: 1, phase: 'fab', sourceIds: ['kioxia-amdc'], evidenceStatus: 'public' },
  { id: 2, phase: 'fab', sourceIds: ['kioxia-bics', 'kioxia-amdc'], evidenceStatus: 'public' },
  { id: 3, phase: 'fab', sourceIds: ['kioxia-amdc', 'kioxia-development'], evidenceStatus: 'public' },
  { id: 4, phase: 'fab', sourceIds: ['kioxia-rie', 'kioxia-amdc'], evidenceStatus: 'public' },
  { id: 5, phase: 'fab', sourceIds: ['kioxia-bics', 'kioxia-rie'], evidenceStatus: 'public' },
  { id: 6, phase: 'fab', sourceIds: ['kioxia-amdc'], evidenceStatus: 'public' },
  { id: 7, phase: 'fab', sourceIds: ['kioxia-cba8', 'kioxia-yokkaichi-2025'], evidenceStatus: 'public' },
  { id: 8, phase: 'test', sourceIds: ['kioxia-amdc', 'kioxia-development', 'kioxia-yokkaichi-smart'], evidenceStatus: 'illustrative' },
];

const stageText: Record<Locale, StageText[]> = {
  ja: [
    {
      title: 'ウェーハ搬送・保管', shortTitle: '搬送・保管',
      equipment: '自動搬送・搬送容器（模式表現）',
      description: 'ウェーハを容器で保護し、必要な装置へ搬送する役割を示します。レールや容器は機能を説明する形です。',
      action: '製品の識別と装置間の受け渡しを学ぶ。',
      quality: '汚染や接触による損傷を抑える考え方を示す。',
      dx: '搬送状態と処理待ちを可視化する考え方を示す。',
      waferNote: '容器の形・容量・収納枚数とウェーハの寸法は模式表現です。',
      evidenceStatement: '四日市の公式工場紹介は自動搬送とOHTを説明しています。',
      unconfirmed: ['実際の経路・装置配置・所要時間', 'FOUPの型式・容量と保管設備の構成'],
    },
    {
      title: 'ウェット処理・洗浄', shortTitle: 'ウェット・洗浄',
      equipment: 'ウェット処理装置（模式表現）',
      description: '汚染物や対象の膜を取り除く工程を説明します。洗浄は複数の加工の間にも必要となる一般的な役割です。',
      action: '不要な粒子・残留物・対象膜を除去する役割を学ぶ。',
      quality: '表面の清浄さと処理のばらつきを管理する考え方を示す。',
      dx: '処理履歴と検査結果を照合する考え方を示す。',
      waferNote: '液体の色と動きは説明用です。実際の薬液を示していません。',
      evidenceStatement: '四日市で試作・検証を行うAMDCがWetの開発を説明しています。',
      unconfirmed: ['薬液・濃度・温度・処理時間', '四日市の量産レシピと装置型式'],
    },
    {
      title: '多層膜の堆積', shortTitle: '多層膜・成膜',
      equipment: '積層・成膜装置（模式表現）',
      description: 'BiCS FLASHの基本概念として、電極層と絶縁層を重ねる構造を説明します。描画した層数は学習用です。',
      action: '積層によって多数のセルを構成する考え方を学ぶ。',
      quality: '膜の厚さや均一性を管理する考え方を示す。',
      dx: '膜形成の条件と計測情報を結びつける考え方を示す。',
      waferNote: '少数の色付き層は模式表現です。現行製品の層数・材料・膜厚ではありません。',
      evidenceStatement: '公式BiCS解説は積層構造を説明。AMDCは成膜分野を紹介しています。',
      unconfirmed: ['対象製品・世代の実際の積層数と材料', '四日市での量産方式・膜厚・条件'],
    },
    {
      title: 'フォトリソグラフィ', shortTitle: '塗布・露光・現像',
      equipment: '塗布現像・露光装置の例（模式表現）',
      description: '感光性の膜に加工位置のパターンを作る役割を示します。表示は塗布・露光・現像をまとめた説明です。',
      action: '加工する位置をパターンとして指定する役割を学ぶ。',
      quality: '寸法・位置合わせ・欠陥を管理する考え方を示す。',
      dx: 'パターンの計測と工程条件を照合する考え方を示す。',
      waferNote: '光や格子は模式表現です。実際のマスクや露光光学系ではありません。',
      evidenceStatement: 'AMDCと製品開発の公式説明にリソグラフィ分野を記載しています。',
      unconfirmed: ['露光方式・装置型式・台数', '四日市での対象層・寸法・実際の条件'],
    },
    {
      title: '高アスペクト比エッチング', shortTitle: 'メモリホール加工',
      equipment: 'プラズマエッチング装置の例（模式表現）',
      description: '細く深いメモリホールを積層膜に加工する役割を示します。穴の形と深さは拡大した説明用の形です。',
      action: '積層膜を貫く穴を形成する考え方を学ぶ。',
      quality: '穴の形状・均一性を管理する考え方を示す。',
      dx: '加工条件と形状評価を照合する考え方を示す。',
      waferNote: '穴の本数・直径・深さは模式表現です。実寸や実際の断面を再現していません。',
      evidenceStatement: '公式RIE解説は深いメモリホール形成の技術を説明しています。',
      unconfirmed: ['四日市の現行製品への適用範囲', 'ガス・圧力・出力・加工寸法・所要時間'],
    },
    {
      title: 'メモリセル・電極形成', shortTitle: 'セル・電極形成',
      equipment: '膜形成・電極加工装置の例（模式表現）',
      description: 'メモリホール内の膜と柱状構造を、周囲の電極層と組み合わせてセルを構成する基本概念を示します。',
      action: '電荷を蓄える膜とセルの構造を学ぶ。',
      quality: '膜の均一性や接続を管理する考え方を示す。',
      dx: '構造評価と電気特性を結びつける考え方を示す。',
      waferNote: '色付きの円柱はBiCSの基本概念の模式表現です。現行世代の実断面ではありません。',
      evidenceStatement: '公式BiCS解説は穴内の膜・柱状電極とセル構造を説明しています。',
      unconfirmed: ['現行世代の材料・チャネル・電極の実構造', '四日市の実際の加工順序と処理条件'],
    },
    {
      title: 'CMP・平坦化', shortTitle: 'CMP・平坦化',
      equipment: 'CMP装置の例（模式表現）',
      description: '化学的・機械的な作用で表面の段差を調整する役割を示します。研磨部品の構成は説明用です。',
      action: '表面の平坦化と後続加工の関係を学ぶ。',
      quality: '平坦性・残膜・傷を管理する考え方を示す。',
      dx: '研磨の条件と計測情報を照合する考え方を示す。',
      waferNote: '平らになる表示は模式表現です。研磨量や粗さを示していません。',
      evidenceStatement: 'AMDCは要素技術としてCMPを紹介しています。',
      unconfirmed: ['四日市の実際の挿入位置と反復回数', '研磨材・条件・装置型式'],
    },
    {
      title: 'CBA・ウェーハ貼り合わせ', shortTitle: 'CBA・貼り合わせ',
      equipment: 'ウェーハ貼り合わせ装置の例（模式表現）',
      description: '第8世代の公開例を説明します。メモリセルアレイ用とCMOS回路用のウェーハを別々に作り、その後貼り合わせます。',
      action: '二つの製造分岐を結合するCBAの考え方を学ぶ。',
      quality: '位置合わせと接合状態を管理する考え方を示す。',
      dx: '両ウェーハの履歴と位置合わせ情報を結びつける考え方を示す。',
      waferNote: '2枚と接合部は模式表現です。第8世代の公開例であり、全製品の共通工程を示しません。',
      evidenceStatement: '公式技術記事が第8世代のCBAを説明。四日市の紹介記事にも掲載されています。',
      unconfirmed: ['四日市の現在の世代別・製品別の採用範囲', '装置型式・接合条件・精度と実際の配置'],
    },
    {
      title: 'ウェーハ検査・電気評価', shortTitle: '検査・電気評価',
      equipment: '検査・計測装置／プローバ・テスタの例（模式表現）',
      description: '欠陥や電気特性を評価する役割をまとめて示します。描画したプローブ接触は学習用で、検査は工程の最後だけに行うという意味ではありません。',
      action: '検査・計測・電気評価が工程管理を支えることを学ぶ。',
      quality: '評価条件と結果の再現性を管理する考え方を示す。',
      dx: '検査データを位置と履歴に結びつける考え方を示す。',
      waferNote: '色分けや測定点は架空の表示です。四日市の実測値・合否・歩留まりではありません。',
      evidenceStatement: '公式資料は検査・計測と電気評価を説明していますが、四日市の現行プローブ検査範囲は未確認です。',
      unconfirmed: ['四日市のウェーハ・プローブ検査の現在の実施範囲', '装置型式・工程内の位置・検査条件・判定基準'],
    },
  ],
  en: [
    {
      title: 'Wafer transport and storage', shortTitle: 'Transport / storage',
      equipment: 'Automated transport and containers (schematic)',
      description: 'Illustrates how protected wafers are transported to tools. The rails and containers explain functions rather than an actual factory layout.',
      action: 'Learn about product identification and tool handoffs.', quality: 'Illustrate practices that limit contamination and contact damage.',
      dx: 'Illustrate visibility of transport status and processing queues.',
      waferNote: 'Container geometry, capacity, wafer count and wafer dimensions are schematic.',
      evidenceStatement: 'The official Yokkaichi factory page describes automated transport and OHT.',
      unconfirmed: ['Actual routes, equipment layout and timing', 'FOUP models, capacities and storage configurations'],
    },
    {
      title: 'Wet processing and cleaning', shortTitle: 'Wet processing',
      equipment: 'Wet-processing tools (schematic)',
      description: 'Explains removal of contamination or selected films. Cleaning can also serve between processing steps.',
      action: 'Learn the role of removing particles, residues and selected films.', quality: 'Illustrate management of surface cleanliness and variation.',
      dx: 'Illustrate comparing processing histories with inspection results.',
      waferNote: 'Liquid colors and motion are illustrative, not actual chemicals.',
      evidenceStatement: 'AMDC, which prototypes and verifies processes at Yokkaichi, describes Wet process development.',
      unconfirmed: ['Chemicals, concentrations, temperatures and processing times', 'Yokkaichi production recipes and tool models'],
    },
    {
      title: 'Multilayer film deposition', shortTitle: 'Multilayer deposition',
      equipment: 'Stacking and deposition tools (schematic)',
      description: 'Explains the BiCS FLASH concept of stacked electrode and insulating layers. The depicted layer count is educational.',
      action: 'Learn how a stack supports many memory cells.', quality: 'Illustrate management of film thickness and uniformity.',
      dx: 'Illustrate relating deposition conditions to measurements.',
      waferNote: 'The few colored layers do not reproduce current product layer counts, materials or thicknesses.',
      evidenceStatement: 'The official BiCS overview explains the stack; AMDC describes deposition development.',
      unconfirmed: ['Actual layer counts and materials by product and generation', 'Yokkaichi production methods, thicknesses and conditions'],
    },
    {
      title: 'Photolithography', shortTitle: 'Coat / expose / develop',
      equipment: 'Coating, developing and exposure tool examples (schematic)',
      description: 'Illustrates creating a processing pattern in a photosensitive film. Coating, exposure and development are grouped for explanation.',
      action: 'Learn how patterns specify areas for processing.', quality: 'Illustrate management of dimensions, alignment and defects.',
      dx: 'Illustrate comparing pattern measurements with process conditions.',
      waferNote: 'Light and grids do not reproduce actual masks or exposure optics.',
      evidenceStatement: 'Official AMDC and product-development pages describe lithography-related work.',
      unconfirmed: ['Exposure methods, tool models and quantities', 'Target layers, dimensions and actual Yokkaichi conditions'],
    },
    {
      title: 'High-aspect-ratio etching', shortTitle: 'Memory-hole etching',
      equipment: 'Plasma etching tool example (schematic)',
      description: 'Illustrates etching narrow, deep memory holes into a multilayer stack. Hole shapes and depths are enlarged for explanation.',
      action: 'Learn the role of holes through the stack.', quality: 'Illustrate management of hole geometry and uniformity.',
      dx: 'Illustrate comparing etch conditions with shape evaluation.',
      waferNote: 'Hole counts, diameters and depths are schematic, not an actual cross-section.',
      evidenceStatement: 'The official RIE article explains deep memory-hole formation.',
      unconfirmed: ['Application to current Yokkaichi products', 'Gases, pressures, power, dimensions and processing times'],
    },
    {
      title: 'Memory-cell and electrode formation', shortTitle: 'Cell / electrode formation',
      equipment: 'Film and electrode processing tool examples (schematic)',
      description: 'Explains the basic concept of films and column structures inside memory holes forming cells with surrounding electrode layers.',
      action: 'Learn about charge-storage films and cell structures.', quality: 'Illustrate management of film uniformity and connections.',
      dx: 'Illustrate relating structure evaluation to electrical characteristics.',
      waferNote: 'Colored columns illustrate the BiCS concept, not a current generation cross-section.',
      evidenceStatement: 'The official BiCS overview explains hole films, column electrodes and memory cells.',
      unconfirmed: ['Current materials, channels and electrode structures', 'Actual processing order and conditions at Yokkaichi'],
    },
    {
      title: 'CMP and planarization', shortTitle: 'CMP / planarization',
      equipment: 'CMP tool example (schematic)',
      description: 'Illustrates adjusting surface topography through chemical and mechanical action. The polishing components are explanatory.',
      action: 'Learn the relationship between planarization and later processing.', quality: 'Illustrate management of flatness, residual films and scratches.',
      dx: 'Illustrate comparing polishing conditions with measurements.',
      waferNote: 'The flattening effect does not represent removal amounts or surface roughness.',
      evidenceStatement: 'AMDC describes CMP as a process-development technology.',
      unconfirmed: ['Actual process positions and repetition counts at Yokkaichi', 'Polishing materials, conditions and tool models'],
    },
    {
      title: 'CBA wafer bonding', shortTitle: 'CBA / wafer bonding',
      equipment: 'Wafer-bonding tool example (schematic)',
      description: 'Explains the public eighth-generation example: memory-cell-array and CMOS-circuit wafers are fabricated separately and then bonded.',
      action: 'Learn how CBA joins two manufacturing branches.', quality: 'Illustrate management of alignment and bond quality.',
      dx: 'Illustrate linking both wafer histories with alignment information.',
      waferNote: 'The two wafers and bond are schematic. This eighth-generation example does not establish a common step for every product.',
      evidenceStatement: 'An official technical article explains eighth-generation CBA; a Yokkaichi factory article also describes it.',
      unconfirmed: ['Current adoption by generation and product at Yokkaichi', 'Tool models, bonding conditions, precision and actual layout'],
    },
    {
      title: 'Wafer inspection and electrical evaluation', shortTitle: 'Inspection / evaluation',
      equipment: 'Inspection, metrology, prober and tester examples (schematic)',
      description: 'Groups defect and electrical evaluation roles. Depicted probe contact is educational; inspection is not restricted to the end of fabrication.',
      action: 'Learn how inspection, metrology and electrical evaluation support process management.', quality: 'Illustrate management of evaluation conditions and reproducibility.',
      dx: 'Illustrate linking inspection data to positions and histories.',
      waferNote: 'Colors and measurement points are fictitious, not Yokkaichi measurements, pass/fail results or yield.',
      evidenceStatement: 'Official sources describe inspection, metrology and electrical evaluation; current Yokkaichi wafer-probe scope remains unverified.',
      unconfirmed: ['Current wafer-probe testing scope at Yokkaichi', 'Tool models, process positions, conditions and acceptance criteria'],
    },
  ],
  zh: [
    {
      title: '晶圆搬运与存储', shortTitle: '搬运与存储', equipment: '自动搬运与晶圆容器（示意）',
      description: '展示受保护的晶圆被运往设备的作用。轨道与容器用于解释功能，不复刻实际工厂布局。',
      action: '了解产品识别与设备间交接。', quality: '说明减少污染和接触损伤的管理思路。', dx: '说明搬运状态与待加工队列的可视化。',
      waferNote: '容器形状、容量、晶圆数量与尺寸均为示意。',
      evidenceStatement: '四日市官方工厂介绍说明了自动搬运和OHT。',
      unconfirmed: ['实际路线、设备布局与时间', 'FOUP型号、容量及存储设备配置'],
    },
    {
      title: '湿法处理与清洗', shortTitle: '湿法与清洗', equipment: '湿法处理设备（示意）',
      description: '说明去除污染物或目标膜层的作用。清洗也可以安排在不同加工步骤之间。',
      action: '了解去除颗粒、残留物和目标膜层的作用。', quality: '说明表面洁净度与处理波动的管理思路。', dx: '说明将处理记录与检测结果对应的方法。',
      waferNote: '液体颜色和动作仅用于说明，不代表实际药液。',
      evidenceStatement: '在四日市进行试制与验证的AMDC介绍了湿法工艺开发。',
      unconfirmed: ['药液、浓度、温度与处理时间', '四日市的量产配方和设备型号'],
    },
    {
      title: '多层膜沉积', shortTitle: '多层膜与沉积', equipment: '堆叠与沉积设备（示意）',
      description: '以BiCS FLASH基本概念说明电极层与绝缘层的堆叠结构。图中层数仅用于学习。',
      action: '了解堆叠结构如何容纳多个存储单元。', quality: '说明膜厚与均匀性的管理思路。', dx: '说明将沉积条件与计量信息对应的方法。',
      waferNote: '少量彩色膜层不代表当前产品的层数、材料或厚度。',
      evidenceStatement: '官方BiCS解说介绍了堆叠结构，AMDC介绍了沉积工艺开发。',
      unconfirmed: ['具体产品与世代的实际层数和材料', '四日市量产方法、膜厚与处理条件'],
    },
    {
      title: '光刻', shortTitle: '涂胶、曝光与显影', equipment: '涂胶显影与曝光设备示例（示意）',
      description: '展示在感光膜上形成加工图形的作用。涂胶、曝光和显影在此合并说明。',
      action: '了解图形如何指定需要加工的位置。', quality: '说明尺寸、对准与缺陷的管理思路。', dx: '说明将图形测量与工艺条件对应的方法。',
      waferNote: '光和格线为示意，不复现实际掩膜或曝光光学系统。',
      evidenceStatement: 'AMDC与产品开发的官方说明记载了光刻相关领域。',
      unconfirmed: ['曝光方式、设备型号与数量', '四日市的目标膜层、尺寸与实际条件'],
    },
    {
      title: '高深宽比刻蚀', shortTitle: '存储孔刻蚀', equipment: '等离子体刻蚀设备示例（示意）',
      description: '说明在多层膜中加工细长深孔的作用。图中的孔形和深度经过放大，仅用于说明。',
      action: '了解贯穿堆叠膜层的存储孔。', quality: '说明孔形与均匀性的管理思路。', dx: '说明将刻蚀条件与形状评价对应的方法。',
      waferNote: '孔数量、直径和深度均为示意，不代表实际截面。',
      evidenceStatement: '官方RIE技术文章解释了深存储孔的形成。',
      unconfirmed: ['四日市当前产品的具体适用范围', '气体、压力、功率、加工尺寸与时间'],
    },
    {
      title: '存储单元与电极形成', shortTitle: '单元与电极', equipment: '膜层与电极加工设备示例（示意）',
      description: '说明存储孔内的膜层和柱状结构如何与周围电极层共同构成存储单元这一基本概念。',
      action: '了解电荷存储膜与存储单元结构。', quality: '说明膜均匀性和连接状态的管理思路。', dx: '说明将结构评价与电气特性对应的方法。',
      waferNote: '彩色圆柱表示BiCS基本概念，不代表当前世代的实际截面。',
      evidenceStatement: '官方BiCS解说介绍了孔内膜层、柱状电极与存储单元。',
      unconfirmed: ['当前世代的实际材料、沟道与电极结构', '四日市实际加工顺序和处理条件'],
    },
    {
      title: 'CMP与平坦化', shortTitle: 'CMP与平坦化', equipment: 'CMP设备示例（示意）',
      description: '说明利用化学与机械作用调整表面起伏的功能。抛光部件配置仅用于说明。',
      action: '了解平坦化与后续加工的关系。', quality: '说明平坦度、残膜和划伤的管理思路。', dx: '说明将抛光条件与计量信息对应的方法。',
      waferNote: '变平的效果不代表实际去除量或表面粗糙度。',
      evidenceStatement: 'AMDC将CMP列为工艺开发的要素技术。',
      unconfirmed: ['四日市实际工艺位置与重复次数', '抛光材料、条件和设备型号'],
    },
    {
      title: 'CBA晶圆键合', shortTitle: 'CBA晶圆键合', equipment: '晶圆键合设备示例（示意）',
      description: '展示公开的第8代案例：分别制造存储单元阵列晶圆与CMOS电路晶圆，随后将两片晶圆键合。',
      action: '了解CBA如何连接两条制造分支。', quality: '说明对准和键合状态的管理思路。', dx: '说明将两片晶圆的履历与对准信息关联的方法。',
      waferNote: '两片晶圆与键合面均为示意。这是第8代公开案例，不代表全部产品共有的工序。',
      evidenceStatement: '官方技术文章介绍了第8代CBA，四日市工厂介绍文章也说明了该案例。',
      unconfirmed: ['四日市当前各世代、各产品的采用范围', '设备型号、键合条件、精度与实际布局'],
    },
    {
      title: '晶圆检测与电气评价', shortTitle: '检测与电气评价', equipment: '检测计量、探针台与测试设备示例（示意）',
      description: '合并说明缺陷与电气特性评价的作用。图中探针接触仅用于学习，并不表示检测只发生在制造末端。',
      action: '了解检测、计量与电气评价如何支持工艺管理。', quality: '说明评价条件与结果重复性的管理思路。', dx: '说明检测数据与位置、履历的对应关系。',
      waferNote: '色分布和测量点为虚构示例，不代表四日市的实测值、合格判定或良率。',
      evidenceStatement: '官方资料介绍了检测、计量与电气评价，但四日市当前晶圆探针测试的实施范围尚未核实。',
      unconfirmed: ['四日市晶圆探针测试的当前实施范围', '设备型号、工艺位置、检测条件与判定标准'],
    },
  ],
};

const sourceText: Record<Locale, SourceText[]> = {
  ja: [
    { title: 'キオクシア｜四日市工場概要', date: '公開日記載なし／掲載情報に2026-03-31時点の記載あり', support: '所在地と主要製品にBiCS FLASH・NAND型フラッシュメモリを記載。', limits: '現在の世代別生産量、工程順、設備配置は示していない。' },
    { title: 'キオクシア｜四日市スマートファクトリー', date: '公開日記載なし', support: '自動搬送、OHT・AGV、検査計測と欠陥画像の分析を紹介。', limits: '具体的なFOUP型式・容量、経路、実寸、検査条件は示していない。' },
    { title: 'キオクシア｜先端メモリ開発センター AMDC', date: '公開日記載なし', support: '四日市内での試作・検証と、成膜、リソグラフィ、RIE、Wet、CMP等の開発分野を紹介。', limits: '開発組織の説明。各技術がすべての量産品に採用されるとは判断できない。' },
    { title: 'キオクシア｜BiCS FLASHの基本技術', date: '公開日記載なし／世代説明は2023-03時点を含む', support: '積層、メモリホール、穴内の膜・柱状電極によるセルの基本概念を説明。', limits: '企業全体の技術解説。現行世代の実断面・四日市のレシピではない。' },
    { title: 'キオクシア｜BiCS FLASHを支えるRIE技術', date: '2019-06-13', support: '深いメモリホール形成と形状制御の技術課題を説明。', limits: '公表当時の技術解説。現行量産品の加工寸法・材料・条件は確定できない。' },
    { title: 'キオクシア｜第8世代に適用したCBA技術', date: '2024-03-28', support: '第8世代でCMOS回路とセルアレイを別ウェーハで製造し、貼り合わせるCBAを説明。', limits: '第8世代の公開例。現在の四日市全製品の採用範囲を示さない。' },
    { title: 'キオクシア｜製品開発プロセスと評価', date: '公開日記載なし', support: '検査計測、電気特性評価、テストシステム開発と製品評価を紹介。', limits: '企業全体の開発説明。四日市のウェーハ・プローブ検査範囲は示さない。' },
    { title: 'キオクシア掲載｜四日市工場の技術紹介インタビュー', date: '2025-07-14（転載元記事の日付）', support: '四日市工場の紹介に、第8世代の独立ウェーハ製造とCBA貼合を掲載。', limits: 'EE Timesの取材記事を公式転載。情報は取材時点であり、設備配置や現在の全製品の構成ではない。' },
  ],
  en: [
    { title: 'KIOXIA | Yokkaichi Plant overview', date: 'No publication date stated; includes information as of 2026-03-31', support: 'Lists the location and BiCS FLASH / NAND flash among its main products.', limits: 'Does not establish current output by generation, process order or equipment layout.' },
    { title: 'KIOXIA | Yokkaichi smart factory', date: 'No publication date stated', support: 'Describes automated transport, OHT / AGV, inspection, metrology and defect-image analysis.', limits: 'Does not specify FOUP models, capacities, routes, dimensions or inspection conditions.' },
    { title: 'KIOXIA | Advanced Memory Development Center', date: 'No publication date stated', support: 'Describes prototyping at Yokkaichi and deposition, lithography, RIE, Wet and CMP development.', limits: 'Describes development activities, not adoption of every technology in every production product.' },
    { title: 'KIOXIA | Basic BiCS FLASH technology', date: 'No publication date stated; some generation information is as of 2023-03', support: 'Explains the basic stack, memory-hole, film and column-electrode cell concepts.', limits: 'Company-wide explanation, not a current-generation cross-section or Yokkaichi recipe.' },
    { title: 'KIOXIA | RIE technology supporting BiCS FLASH', date: '2019-06-13', support: 'Explains deep memory-hole formation and shape-control challenges.', limits: 'A dated technical explanation; current production dimensions, materials and conditions remain unverified.' },
    { title: 'KIOXIA | CBA applied to the eighth generation', date: '2024-03-28', support: 'Explains separate CMOS-circuit and memory-array wafer fabrication followed by CBA bonding in the eighth generation.', limits: 'An eighth-generation example, not evidence of adoption in every current Yokkaichi product.' },
    { title: 'KIOXIA | Product development and evaluation', date: 'No publication date stated', support: 'Describes inspection, metrology, electrical evaluation and test-system development.', limits: 'Company-wide development information; does not establish Yokkaichi wafer-probe testing scope.' },
    { title: 'Hosted by KIOXIA | Yokkaichi factory technology interview', date: '2025-07-14 (date of the reprinted article)', support: 'The Yokkaichi factory article describes separate wafer fabrication and CBA bonding in the eighth generation.', limits: 'Official reprint of an EE Times interview. Information reflects the interview date, not a current layout or every product configuration.' },
  ],
  zh: [
    { title: '凯侠｜四日市工厂概况', date: '未标注发布日期；含截至2026-03-31的信息', support: '记载所在地，主要产品包括BiCS FLASH和NAND闪存。', limits: '未说明当前各世代产量、工艺顺序或设备布局。' },
    { title: '凯侠｜四日市智能工厂', date: '未标注发布日期', support: '介绍自动搬运、OHT和AGV，以及检测计量和缺陷图像分析。', limits: '未公开具体FOUP型号、容量、路线、尺寸或检测条件。' },
    { title: '凯侠｜先进存储器开发中心AMDC', date: '未标注发布日期', support: '介绍四日市试制验证，以及沉积、光刻、RIE、湿法和CMP等开发领域。', limits: '属于开发组织说明，不能证明每种技术用于全部量产产品。' },
    { title: '凯侠｜BiCS FLASH基本技术', date: '未标注发布日期；部分世代说明截至2023-03', support: '解释堆叠、存储孔、孔内膜层与柱状电极构成单元的基本概念。', limits: '属于公司技术解说，不是当前世代实际截面或四日市配方。' },
    { title: '凯侠｜支撑BiCS FLASH的RIE技术', date: '2019-06-13', support: '解释深存储孔的形成及形状控制课题。', limits: '属于当时的技术解说，不能确认当前量产尺寸、材料或条件。' },
    { title: '凯侠｜第8代采用的CBA技术', date: '2024-03-28', support: '说明第8代分别制造CMOS电路晶圆和存储阵列晶圆，随后通过CBA键合。', limits: '是第8代公开案例，不证明四日市当前全部产品均采用该方式。' },
    { title: '凯侠｜产品开发流程与评价', date: '未标注发布日期', support: '介绍检测计量、电气评价和测试系统开发。', limits: '属于公司总体开发说明，未确认四日市晶圆探针测试范围。' },
    { title: '凯侠官网转载｜四日市工厂技术采访', date: '2025-07-14（原转载文章日期）', support: '四日市工厂介绍文章中说明了第8代分别制造晶圆并通过CBA键合的案例。', limits: '凯侠官方转载EE Times采访，信息对应采访时点，不代表当前布局或全部产品配置。' },
  ],
};

const evidenceLabels: Record<Locale, Record<EvidenceStatus, string>> = {
  ja: { public: '公開資料で確認', historical: '過去の公開記録', illustrative: '模式表現・学習用補助' },
  en: { public: 'Confirmed in public sources', historical: 'Historical public record', illustrative: 'Schematic learning aid' },
  zh: { public: '公开资料可确认', historical: '历史公开记录', illustrative: '示意与学习辅助' },
};

const modelText: Record<Locale, Omit<ModelText, 'evidenceLabels'>> = {
  ja: {
    modelTitle: 'キオクシア四日市｜BiCS FLASHウェーハ製造の3D学習モデル',
    scopeNote: '工程区分は公式公開資料に基づきます。順序・反復回数・装置外観・配置・時間は模式表現です。CBAは第8世代の公開例、プローブ検査は学習用補助です。',
    disclaimer: 'キオクシア四日市工場の紹介、AMDCの開発説明、BiCS FLASHの公式技術解説に基づく3D学習モデルです。BiCS FLASHは3次元NAND型フラッシュメモリで、DRAMとは異なる製品です。公開確認の表示は工程分野や公開技術に対応し、描画した装置や実際の量産経路を保証しません。AMDCの開発分野を、四日市の全量産品に共通する工程とは推定していません。CBAは第8世代の公開例として、別々に作製するメモリセルアレイ用とCMOS回路用のウェーハを示します。現在の全製品がCBAを用いるとは示していません。検査・計測・電気評価の公開説明はありますが、四日市の現行ウェーハ・プローブ検査範囲は未確認です。実際の順序、反復、材料、寸法、層数、条件、時間、歩留まり、装置、搬送経路は非再現です。役割・品質・DXと色分けは学習用説明です。切断・パッケージ組立・最終製品検査は対象外です。',
  },
  en: {
    modelTitle: 'KIOXIA Yokkaichi | 3D learning model of BiCS FLASH wafer manufacturing',
    scopeNote: 'Categories use official public sources. Order, repetition, equipment appearance, layout and timing are schematic. CBA is a public eighth-generation example; probe testing is an educational illustration.',
    disclaimer: 'This learning model uses official information about Yokkaichi, AMDC development and BiCS FLASH technology. BiCS FLASH is 3D NAND flash memory, a different product from DRAM. Confirmation labels refer to process fields or public technologies, not the existence of illustrated tools or actual production routes. AMDC development fields are not assumed to be common to every Yokkaichi production product. CBA illustrates the public eighth-generation example of separately fabricated memory-cell-array and CMOS-circuit wafers; it does not establish CBA adoption in every current product. Official sources describe inspection, metrology and electrical evaluation, but current Yokkaichi wafer-probe scope is unverified. Actual order, repetitions, materials, dimensions, layer counts, conditions, timing, yield, tools and transport routes are not reproduced. Roles, quality, digital-transformation concepts and colors are educational. Dicing, package assembly and final product testing are excluded.',
  },
  zh: {
    modelTitle: '凯侠四日市｜BiCS FLASH晶圆制造3D学习模型',
    scopeNote: '工艺分类依据官方公开资料。顺序、重复次数、设备外观、布局与时间均为示意。CBA采用第8代公开案例，探针测试为学习辅助。',
    disclaimer: '本学习模型依据凯侠四日市工厂介绍、AMDC开发说明与BiCS FLASH官方技术解说。BiCS FLASH是3D NAND闪存，与DRAM属于不同产品。公开确认标记对应工艺领域或公开技术，并不证明图中设备存在，也不代表实际量产路线。不会将AMDC开发领域推定为四日市全部量产产品的共同工序。CBA展示第8代公开案例：分别制造存储单元阵列晶圆和CMOS电路晶圆再键合，不代表当前全部产品都采用CBA。官方资料介绍了检测、计量与电气评价，但四日市当前晶圆探针测试范围尚未核实。实际顺序、重复、材料、尺寸、层数、条件、时间、良率、设备与搬运路径均未复现。工艺作用、质量管理、数字化概念与颜色仅用于学习。切割、封装组装与最终成品测试不在本模型范围内。',
  },
};

export function getKioxiaProcessContent(locale: Locale): ProcessContent {
  if (stageText[locale].length !== stageMetadata.length || sourceText[locale].length !== sourceMetadata.length) {
    throw new Error(`Incomplete KIOXIA process translations for locale: ${locale}`);
  }
  return {
    ...modelText[locale],
    evidenceLabels: evidenceLabels[locale],
    stages: stageMetadata.map((stage, index) => ({ ...stage, ...stageText[locale][index] })),
    sources: sourceMetadata.map((source, index) => ({
      ...source, ...sourceText[locale][index], checkedAt,
      verification: locale === 'ja' ? '本文確認' : locale === 'en' ? 'Full text checked' : '已核对正文',
    })),
  };
}
