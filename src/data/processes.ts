export type EvidenceStatus = 'public' | 'historical' | 'illustrative'

export interface ProcessStage {
  id: number
  title: string
  shortTitle: string
  equipment: string
  description: string
  action: string
  quality: string
  dx: string
  waferNote: string
  phase: 'fab' | 'test'
  sourceIds: string[]
  evidenceStatus: EvidenceStatus
  evidenceStatement: string
  unconfirmed: string[]
}

export interface PublicSource {
  id: string
  title: string
  url: string
  date: string
  checkedAt: string
  support: string
  limits: string
  verification: '本文確認' | '公式検索索引'
}

export const MODEL_TITLE = '東広島 Fab15｜DRAMウェーハ製造工程の3D学習モデル'
export const MODEL_SUBTITLE = 'マイクロンの公開資料に基づく工程区分・説明用の模式モデル'
export const SCOPE_NOTE = '工程区分は公開資料に基づきます。順序・反復回数・装置外観・配置・時間は説明用の模式表現です。'
export const LEARNING_LABEL = '学習用解説'
export const evidenceLabels: Record<EvidenceStatus, string> = {
  public: '公開資料で確認',
  historical: '過去の公開記録',
  illustrative: '模式表現・学習用補助',
}

const checkedAt = '2026-10-12'

export const sources: PublicSource[] = [
  {
    id: 'micron-locations',
    title: 'Micron｜広島工場・技術開発拠点',
    url: 'https://www.micron.com/about/locations',
    date: '公開日記載なし',
    checkedAt,
    support: '東広島市のHiroshima Plant／Technology Developmentと所在地を確認できる。',
    limits: '工程順序、建物内部、装置配置は示していない。',
    verification: '本文確認',
  },
  {
    id: 'micron-certifications',
    title: 'Micron｜品質認証一覧・Fab15表記',
    url: 'https://www.micron.com/about/company/quality/quality-certifications',
    date: '公開日記載なし',
    checkedAt,
    support: 'Micron Memory Japan K.K.のFab15を認証一覧に掲載している。',
    limits: '一覧だけでは個々の証明書の有効期限や工程詳細を判断できない。',
    verification: '本文確認',
  },
  {
    id: 'micron-iso14001-history',
    title: 'Micron｜旧ISO 14001証明書・Fab15の活動範囲',
    url: 'https://in.micron.com/content/dam/micron/global/public/documents/about/certificate/iso-14001.pdf',
    date: '再発行：2022-01-14／有効期限：2025-01-15（期限切れ）',
    checkedAt,
    support: '旧証明書のFab15欄にウェーハの研究開発・製造・検査を記載。拡散、イオン注入、フォトリソグラフィ、ウェット処理、ドライエッチ、薄膜、CMP、Probe等を列挙している。',
    limits: '歴史的記録。有効な現行認証の証拠ではなく、列挙順は製造順序ではない。今回は公式PDFの検索索引で確認し、PDF本文の直接取得はできなかった。',
    verification: '公式検索索引',
  },
  {
    id: 'micron-hiroshima-2023',
    title: 'Micron｜日本へのEUV導入計画（2023年）',
    url: 'https://investors.micron.com/news/press-release/2023/Micron-to-Bring-EUV-Technology-to-Japan-Advancing-Next-Generation-Memory-Manufacturing-05-17-2023/default.aspx',
    date: '2023-05-17',
    checkedAt,
    support: '広島での1β DRAM生産と、1γ DRAM向けEUVを日本・台湾で2025年から導入する当時の計画を説明。',
    limits: '2023年時点の計画であり、この資料だけでは導入完了や全露光工程での採用を確認できない。',
    verification: '本文確認',
  },
  {
    id: 'micron-hiroshima-2026',
    title: 'Micron｜広島のDRAM製造・EUV導入と新クリーンルーム着工',
    url: 'https://jp.micron.com/about/press/news/micron-breaks-ground-on-hiroshima-cleanroom-to-support-advanced-memory-for-ai',
    date: '2026-07-04',
    checkedAt,
    support: '広島拠点が1β DRAMの生産、1γ DRAMでのEUV露光技術の導入を実現してきたと説明。広島の研究開発・製造機能も確認できる。',
    limits: '全露光工程がEUVとは記載していない。装置型式・台数・対象層は非公開。新クリーンルームは将来の拡張であり、モデルの現存配置を裏づけない。',
    verification: '本文確認',
  },
  {
    id: 'micron-amhs',
    title: 'Micron公式採用｜Fab15常駐 AMHS技術職・JR104229',
    url: 'https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/Staff-Senior-Engineer--Frontend-Global-AMHS_JR104229',
    date: '募集開始：2026-06-17（公式採用データ）',
    checkedAt,
    support: 'Fab15常駐のAMHS技術担当、ウェーハ搬送・保管、OHTや保管システムの管理を明記。',
    limits: '国内外を含む職務範囲。実際のレール経路・容器・ストッカ構成・搬送時間は確認できない。',
    verification: '本文確認',
  },
  {
    id: 'micron-wet',
    title: 'Micron公式採用｜Fab15 WETプロセス・装置技術職・JR97434',
    url: 'https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/Fab15-WET-Process---Equipment-Engineer--MFG-PEE-_JR97434',
    date: '募集開始：2026-05-11（公式採用データ）',
    checkedAt,
    support: '勤務地Hiroshima - Fab 15。ウェット処理による粒子・汚染物・膜の除去を職務説明に記載。',
    limits: '薬液、濃度、処理条件、装置形状、工程順序は確認できない。',
    verification: '本文確認',
  },
  {
    id: 'micron-development',
    title: 'Micron公式採用｜Fab15 プロセス開発技術職・JR109536',
    url: 'https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/Technology-Development--Senior-Staff-Principal-Process-Development-Engineer_JR109536',
    date: '募集開始：2026-09-03（公式採用データ）',
    checkedAt,
    support: '勤務地Hiroshima - Fab 15。DRAM等の開発分野としてリソグラフィ、CVD、ドライエッチ、ウェット処理、金属膜、拡散、イオン注入、CMPを列挙。関連経験にCVD／ALD／PVDや熱処理を挙げる。',
    limits: '開発分野・求める経験の記述。すべての方式が全製品の量産工程に採用済みであるとは判断できない。',
    verification: '本文確認',
  },
  {
    id: 'micron-photo',
    title: 'Micron公式採用｜Fab15 HVM Photo Track技術職・JR84928',
    url: 'https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/HVM-Photo-Track-Engineer_JR84928',
    date: '募集開始：2026-03-27（公式採用データ）',
    checkedAt,
    support: '勤務地Hiroshima - Fab 15。先端DRAMのPhoto／Trackプロセス最適化と装置の安定稼働を説明。',
    limits: 'Track装置は露光装置そのものではない。露光方式・装置型式・台数はこの求人から判断できない。',
    verification: '本文確認',
  },
  {
    id: 'micron-dry',
    title: 'Micron公式採用｜Fab15 HVM DRY技術職・JR94008',
    url: 'https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/XMLNAME--Fab15-HVM----Dry-Etch-Process-Equipment-Engineer_JR94008',
    date: '募集開始：2026-03-17（公式採用データ）',
    checkedAt,
    support: '勤務地Hiroshima - Fab 15。先端DRAM量産におけるDRYグループの工程・装置管理と量産改善を記載。',
    limits: 'ガス、処理条件、加工寸法、チャンバ形状・台数は確認できない。',
    verification: '本文確認',
  },
  {
    id: 'micron-diffusion-implant',
    title: 'Micron公式採用｜Fab15 拡散・注入の製造調整技術職・JR109148',
    url: 'https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/Sr-Engineer--Staff-Engineer--Operations-Central-Team-Diffusion-Implant-Manufacturing-Alignment_JR109148',
    date: '募集開始：2026-08-18（公式採用データ）',
    checkedAt,
    support: '勤務地Hiroshima - Fab 15。拡散・注入分野の工程・装置最適化や拠点間の製造調整を担当。',
    limits: 'グローバルな調整業務も含む。個々の装置がFab15の同一建屋に存在することや実際のレシピは示していない。',
    verification: '本文確認',
  },
  {
    id: 'micron-cmp',
    title: 'Micron公式採用｜Fab15 CMPプロセス・装置技術職・JR102354',
    url: 'https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/Fab15-CMP-Process---Equipment-Engineer_JR102354',
    date: '募集開始：2026-09-03（公式採用データ）',
    checkedAt,
    support: '勤務地Hiroshima - Fab 15。機械的・化学的なウェーハ平坦化と欠陥低減に関する職務を記載。',
    limits: '研磨材、条件、パッド・ヘッド構成、実工程での挿入位置は確認できない。',
    verification: '本文確認',
  },
  {
    id: 'micron-metrology',
    title: 'Micron公式採用｜Fab15 RDA・計測技術職・JR95387',
    url: 'https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/RDA-and-Metrology-Central-Team-Engineer_JR95387',
    date: '募集開始：2026-03-27（公式採用データ）',
    checkedAt,
    support: '勤務地Hiroshima - Fab 15。欠陥検出、工程内の可視化・管理、検査・計測装置に関する職務を説明。',
    limits: '開発・量産・他拠点を含む職務範囲。具体的な検査装置の現地設置、頻度、判定基準は確認できない。',
    verification: '本文確認',
  },
]

export const stages: ProcessStage[] = [
  {
    id: 0,
    title: 'ウェーハ搬送・保管',
    shortTitle: '搬送・保管',
    equipment: 'AMHS・OHT・搬送容器（模式表現）',
    description: 'ウェーハを容器で保護し、装置間で搬送・保管します。AMHSは自動搬送システムの総称です。表示するレールと容器は機能を説明する形です。',
    action: 'ロットを識別し、必要な装置へ搬送する仕組みを学ぶ。',
    quality: '粒子汚染や接触による損傷を抑えるための管理を学ぶ。',
    dx: '搬送状態や処理待ちを可視化する考え方を示す。',
    waferNote: '円板・容器・枚数は模式表現です。Fab15の容器型式や容量を再現していません。',
    phase: 'fab',
    sourceIds: ['micron-amhs'],
    evidenceStatus: 'public',
    evidenceStatement: 'Fab15常駐のAMHS職務に、ウェーハ搬送・保管とOHT等の管理が記載されています。',
    unconfirmed: ['実際の搬送経路とレール配置', '容器の型式・容量・保管設備の構成', '搬送時間と処理待ち時間'],
  },
  {
    id: 1,
    title: 'ウェット処理・洗浄',
    shortTitle: 'ウェット・洗浄',
    equipment: 'ウェット処理装置（模式表現）',
    description: '液体を用いる処理などで、粒子・汚染物や対象の膜を除去します。ここでは洗浄を中心に表現します。槽や液体の色は説明用です。',
    action: '不要な汚染物や対象の膜を除去する役割を学ぶ。',
    quality: '残留物や粒子などに起因する欠陥を抑える考え方を示す。',
    dx: '処理条件と欠陥情報を照合する考え方を示す。',
    waferNote: '洗浄の動きは模式表現です。実際の薬液や流れを再現していません。',
    phase: 'fab',
    sourceIds: ['micron-wet', 'micron-iso14001-history'],
    evidenceStatus: 'public',
    evidenceStatement: 'Fab15のWET職務説明に、粒子・汚染物・膜の除去が記載されています。',
    unconfirmed: ['薬液・濃度・温度・処理時間', '枚葉・バッチ等の装置構成', '実際の工程内の位置と反復回数'],
  },
  {
    id: 2,
    title: '薄膜形成・成膜',
    shortTitle: '薄膜・成膜',
    equipment: '成膜装置の例（模式表現）',
    description: '素子や配線を構成する材料を薄膜として形成します。膜の役割や材料に応じて方式を選ぶ、という一般的な役割を示します。',
    action: '必要な材料をウェーハ上に形成する役割を学ぶ。',
    quality: '膜厚・均一性・材料の状態を管理する考え方を示す。',
    dx: '成膜条件と計測情報を結びつける考え方を示す。',
    waferNote: '色の重なりは薄膜形成の模式表現です。実際の材料・膜厚・断面構造ではありません。',
    phase: 'fab',
    sourceIds: ['micron-development', 'micron-iso14001-history'],
    evidenceStatus: 'public',
    evidenceStatement: 'Fab15のプロセス開発職にCVD等の成膜分野が記載されています。旧認証資料にも薄膜工程の記録があります。',
    unconfirmed: ['CVD・ALD・PVDそれぞれの量産採用範囲', '材料・膜厚・処理条件', '装置型式・チャンバ配置'],
  },
  {
    id: 3,
    title: 'フォトリソグラフィ',
    shortTitle: '塗布・露光・現像',
    equipment: '塗布現像（トラック）装置・露光装置（模式表現）',
    description: 'レジスト塗布・露光・現像によって加工する位置のパターンを作ります。学習のため、Trackと露光の機能を一つの区画にまとめて表示します。',
    action: 'レジストに加工位置のパターンを形成する役割を学ぶ。',
    quality: 'パターン寸法・位置合わせ・欠陥を管理する考え方を示す。',
    dx: '工程条件とパターン計測を照合する考え方を示す。',
    waferNote: '光と格子はパターン形成の模式表現です。EUVの光学系や実際のマスク構造を再現していません。',
    phase: 'fab',
    sourceIds: ['micron-photo', 'micron-development', 'micron-hiroshima-2026', 'micron-hiroshima-2023'],
    evidenceStatus: 'public',
    evidenceStatement: 'Fab15のPhoto Track職務を確認。2026年の公式発表は広島での1γ DRAM向けEUV導入を実現済みの取り組みとして説明しています。2023年資料は当時の計画です。',
    unconfirmed: ['EUVを用いる対象層と露光方式の組合せ', '露光装置の型式・台数', '全製品・全露光工程への採用範囲'],
  },
  {
    id: 4,
    title: 'ドライエッチング',
    shortTitle: 'ドライエッチ',
    equipment: 'ドライエッチング装置（模式表現）',
    description: 'パターンに沿って材料を除去し、穴や溝などを加工する工程の役割を示します。装置内部と加工形状は一般的な説明用の形です。',
    action: '必要な形状を材料へ加工する役割を学ぶ。',
    quality: '加工寸法・形状・選択性・欠陥を管理する考え方を示す。',
    dx: '処理条件と加工後の計測を照合する考え方を示す。',
    waferNote: '格子や溝は加工の模式表現です。DRAMセルの実寸・断面・実際の加工レシピではありません。',
    phase: 'fab',
    sourceIds: ['micron-dry', 'micron-development'],
    evidenceStatus: 'public',
    evidenceStatement: 'Fab15の公式DRY職務に、先端DRAM量産の工程・装置管理と量産改善が記載されています。',
    unconfirmed: ['ガス・圧力・出力・処理時間', '加工寸法と対象層', 'チャンバ形状・台数・配置'],
  },
  {
    id: 5,
    title: '拡散・イオン注入・熱処理',
    shortTitle: '拡散・注入・熱処理',
    equipment: '注入・熱処理装置の例（模式表現）',
    description: '材料の電気的性質や状態を調整する関連工程をまとめて説明します。注入と熱処理は異なる処理であり、一つの装置で連続実行する実工程を示すものではありません。',
    action: '注入や熱処理が材料の性質に関わることを学ぶ。',
    quality: '処理量や温度などを管理する考え方を示す。',
    dx: '処理履歴と材料・電気特性の評価を結びつける考え方を示す。',
    waferNote: '色と粒子は材料特性の調整を表す模式表現です。実際の注入分布・温度・材料構造ではありません。',
    phase: 'fab',
    sourceIds: ['micron-development', 'micron-diffusion-implant', 'micron-iso14001-history'],
    evidenceStatus: 'public',
    evidenceStatement: 'Fab15の開発職に拡散・イオン注入と熱処理に関する分野を記載。Fab15を勤務地とする製造調整職にも拡散・注入分野が記載されています。',
    unconfirmed: ['拡散・注入・熱処理の実際の組合せと順序', '注入種・量・エネルギー・温度・処理時間', '個々の装置型式と設置場所'],
  },
  {
    id: 6,
    title: 'CMP・平坦化',
    shortTitle: 'CMP・平坦化',
    equipment: 'CMP装置（模式表現）',
    description: '機械的・化学的な作用を組み合わせてウェーハ表面を平坦化します。回転する部品は研磨機能を説明するための形です。',
    action: '表面の段差を調整し、次の加工につなぐ役割を学ぶ。',
    quality: '平坦性・残膜・傷・欠陥を管理する考え方を示す。',
    dx: '研磨条件と加工後の計測を照合する考え方を示す。',
    waferNote: '平らになる表示は模式表現です。研磨量・実際の材料・表面粗さを再現していません。',
    phase: 'fab',
    sourceIds: ['micron-cmp', 'micron-iso14001-history'],
    evidenceStatus: 'public',
    evidenceStatement: 'Fab15のCMP職務説明に、機械的・化学的なウェーハ平坦化と欠陥低減が記載されています。',
    unconfirmed: ['研磨材・圧力・速度・処理時間', 'パッド・ヘッドの構成', '実際の挿入位置と反復回数'],
  },
  {
    id: 7,
    title: '計測・欠陥検査',
    shortTitle: '計測・欠陥検査',
    equipment: '検査・計測装置の例（模式表現）',
    description: '膜やパターンを測定し、欠陥やばらつきの把握に役立てます。一つの検査区画で表現しますが、工程中の検査が一度だけという意味ではありません。',
    action: '測定や欠陥検出を工程の管理に結びつける役割を学ぶ。',
    quality: '測定の再現性と欠陥の検出を管理する考え方を示す。',
    dx: '検査・計測データから工程の変化を把握する考え方を示す。',
    waferNote: '走査光と測定点は模式表現です。装置の測定方式・実測データ・合否基準ではありません。',
    phase: 'fab',
    sourceIds: ['micron-metrology'],
    evidenceStatus: 'public',
    evidenceStatement: '勤務地Fab15のRDA・計測職に、欠陥検出と工程内の可視化・管理が記載されています。職務範囲には開発・量産・他拠点支援も含まれます。',
    unconfirmed: ['具体的な計測装置の現地設置範囲', '検査位置・頻度・測定項目', '判定基準と実測値'],
  },
  {
    id: 8,
    title: 'ウェーハ電気検査・プローブ',
    shortTitle: 'プローブ検査',
    equipment: 'プローバ・テスタの例（模式表現）',
    description: 'ウェーハ上の回路へ接触し、電気的な動作を評価する工程の役割を示します。本モデルの対象はウェーハ工程までです。',
    action: 'ウェーハ状態で電気特性や動作を評価する役割を学ぶ。',
    quality: '接触状態や試験条件を管理する考え方を示す。',
    dx: '検査結果をウェーハ上の位置と結びつける考え方を示す。',
    waferNote: '色分けしたマップは架空の説明表示です。Fab15の合否データや歩留まりを示していません。',
    phase: 'test',
    sourceIds: ['micron-iso14001-history'],
    evidenceStatus: 'historical',
    evidenceStatement: '旧ISO 14001証明書のFab15活動範囲にプローブ検査を記載。有効期限は2025年1月15日で、現在のプローブ検査の実施範囲を確認する資料ではありません。',
    unconfirmed: ['現在のFab15におけるプローブ検査の実施範囲', '装置構成・検査条件・検査項目', '実際の工程経路と検査結果・歩留まり'],
  },
]

// 工程の役割と反復を説明する学習用経路。Fab15の実際の製造順序ではない。
export const DEMO_ROUTE = [0, 1, 2, 3, 4, 1, 5, 6, 7, 2, 3, 4, 1, 6, 7, 8]

export const disclaimer = 'マイクロンの公式公開資料に基づき、東広島Fab15に関係するDRAMウェーハ製造の工程区分をまとめた3D学習モデルです。確認表示は工程分野や職務の記載に対応し、描画した装置の実在や実際の製造経路を保証するものではありません。番号と搬送経路は説明順です。実際の順序・反復回数・材料・条件・時間・歩留まり・装置型式・台数・配置は確認できていないため模式表現としています。役割・品質・DXの記述も学習用解説です。旧認証資料は期限切れの過去の記録として扱います。2026年公式発表のEUV導入記述は、全露光工程がEUVであることを意味しません。切断・組立・封止・最終検査などの後工程は対象に含めていません。'
