# 東広島 Fab15 公開資料とモデル範囲

確認日：2026年10月12日（日本時間）

モデル名：東広島 Fab15｜DRAMウェーハ製造工程の3D学習モデル

Micronの公式公開資料に記載された工程分野を、日本語の3D学習モデルとして表現する。製造拠点の再現図ではない。工程区分は公開資料に基づくが、順序・反復回数・装置外観・配置・時間は説明用の模式表現である。公開資料で確認した事項と、一般的な役割を説明する表示を各工程で分ける。

## 拠点と対象

[Micronの拠点一覧](https://www.micron.com/about/locations)は、東広島市のHiroshima Plant／Technology Developmentを掲載している。所在地は広島県東広島市吉川工業団地7番10号。[品質認証一覧](https://www.micron.com/about/company/quality/quality-certifications)にはMicron Memory Japan K.K.のFab15表記がある。下記の現行求人は、公式採用データで勤務地がHiroshima - Fab 15, Japanであることを確認した。

モデルはウェーハ搬送、製造に関わる工程分野、ウェーハ検査の役割までを対象とする。切断・組立・封止・パッケージ製品の最終検査は含めない。HBM開発への言及を根拠に、積層やパッケージ工程がFab15で行われるとは推定しない。

## 現行の公式採用資料

日付は公開採用データの募集開始日であり、設備の導入日や製品の量産開始日ではない。

| 工程分野 | 公式資料と募集開始日 | 確認できる範囲 | モデルで再現していない事項 |
| --- | --- | --- | --- |
| AMHS・搬送・保管 | [JR104229](https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/Staff-Senior-Engineer--Frontend-Global-AMHS_JR104229)／2026-06-17 | Fab15常駐の技術担当。ウェーハ搬送・保管とOHT等の管理。 | 実際の経路、レール、容器型式、保管構成、搬送時間。 |
| WET | [JR97434](https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/Fab15-WET-Process---Equipment-Engineer--MFG-PEE-_JR97434)／2026-05-11 | WET分野の工程・装置業務。粒子・汚染物・膜の除去。 | 薬液、濃度、装置構成、処理条件。 |
| 薄膜等のプロセス開発 | [JR109536](https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/Technology-Development--Senior-Staff-Principal-Process-Development-Engineer_JR109536)／2026-09-03 | DRAM等の開発分野としてCVD、リソグラフィ、拡散、注入等を記載。関連経験としてALD・PVD・熱処理も記載。 | 列挙された全方式が全製品の量産に採用済みとは判断できない。膜厚・材料・レシピ。 |
| Photo・Track | [JR84928](https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/HVM-Photo-Track-Engineer_JR84928)／2026-03-27 | 先端DRAM向けPhoto／Trackの最適化・装置安定稼働。 | Trackは露光装置そのものではない。露光方式・装置型式・台数。 |
| DRY | [JR94008](https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/XMLNAME--Fab15-HVM----Dry-Etch-Process-Equipment-Engineer_JR94008)／2026-03-17 | DRYグループにおける先端DRAM量産の工程・装置管理と改善。 | ガス、加工寸法、チャンバ、レシピ。 |
| 拡散・注入 | [JR109148](https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/Sr-Engineer--Staff-Engineer--Operations-Central-Team-Diffusion-Implant-Manufacturing-Alignment_JR109148)／2026-08-18 | 拡散・注入分野の製造調整と工程・装置最適化。 | 実工程の組合せ・順序、個々の設備設置場所。 |
| CMP | [JR102354](https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/Fab15-CMP-Process---Equipment-Engineer_JR102354)／2026-09-03 | 機械的・化学的な平坦化と欠陥低減。 | 研磨材、パッド・ヘッド構成、処理条件、挿入位置。 |
| RDA・計測 | [JR95387](https://micron.wd1.myworkdayjobs.com/External/job/Hiroshima---Fab-15-Japan/RDA-and-Metrology-Central-Team-Engineer_JR95387)／2026-03-27 | 欠陥検出、工程内の可視化・管理、検査・計測装置に関する業務。 | 現地設置装置の範囲、検査頻度、測定値、判定基準。 |

AMHS、拡散・注入の製造調整、RDA・計測の職務には他拠点への支援も含まれる。Fab15を勤務地とすることは、職務に出てくるすべての機器が同じ建屋に設置されている証拠ではない。

求人ページがJavaScriptのみの表示となる場合は、同じMicron公式Workdayの公開データを参照できる。確認に使用した形式は次のとおり。上表の求人URLの末尾の名称を`求人名と番号`へ代入する。

```text
https://micron.wd1.myworkdayjobs.com/wday/cxs/micron/External/job/求人名と番号
```

[AMHS求人の公式公開データ](https://micron.wd1.myworkdayjobs.com/wday/cxs/micron/External/job/Staff-Senior-Engineer--Frontend-Global-AMHS_JR104229)を例に、`jobPostingInfo`内の`location`、`startDate`、`jobReqId`、`jobDescription`を確認する。採用情報は将来削除・更新される可能性がある。

## 過去の認証記録とプローブ検査

[Micron公式の旧ISO 14001証明書](https://in.micron.com/content/dam/micron/global/public/documents/about/certificate/iso-14001.pdf)のFab15欄には、半導体ウェーハの研究開発・製造・検査が記載されている。工程分野として拡散、イオン注入、フォトリソグラフィ、ウェット処理、ドライエッチ、薄膜、CMPを列挙し、検査にプローブ検査を含めている。

この証明書は2022年1月14日再発行、2025年1月15日が有効期限で、確認日現在は期限切れである。列挙された工程の順序は製造順序を示さない。今回は公式PDFに対応する検索索引で確認し、PDF本文の直接取得はできていない。現行の認証や現在のプローブ検査実施範囲を証明する資料として扱わない。

そのため、プローブ検査の表示は「過去の公開記録」とする。プローバ・テスタの外観と電気検査の動きは学習用の模式表現である。現在の現地実施範囲、試験項目、判定基準、歩留まりは未確認。

## EUVの計画と導入確認

[2023年5月17日のMicron公式発表](https://investors.micron.com/news/press-release/2023/Micron-to-Bring-EUV-Technology-to-Japan-Advancing-Next-Generation-Memory-Manufacturing-05-17-2023/default.aspx)は、日本と台湾で1γ DRAM向けEUVを2025年から導入する当時の計画を説明する。この発表だけで導入完了とは判断しない。

[2026年7月4日のMicron公式発表](https://jp.micron.com/about/press/news/micron-breaks-ground-on-hiroshima-cleanroom-to-support-advanced-memory-for-ai)は、広島拠点での1β DRAM生産と1γ DRAMでのEUV露光技術導入を、実現してきた技術移行として説明している。短い該当箇所は「1ガンマ（1γ）DRAMでの極端紫外線（EUV）露光技術の導入」。これを根拠に広島拠点の1γ向けEUV導入を説明するが、全露光工程がEUV、全製品の切替完了、特定型式・台数の採用とは表現しない。

同じ2026年発表の新クリーンルームは将来の拡張で、製造装置の搬入開始は2028年後半の予定。3Dに描いた既存設備の配置を裏づける資料として用いない。

## 模式表現の規則

9つの工程区画は、実工場の装置数や部屋数ではない。学習用の搬送経路は16回の訪問で構成する。

```text
搬送 → WET → 薄膜 → リソグラフィ → DRY → WET → 拡散・注入・熱処理
→ CMP → 計測 → 薄膜 → リソグラフィ → DRY → WET → CMP → 計測 → プローブ検査
```

この経路は工程の役割と繰り返しを理解するための説明順で、Fab15の実際の製造経路ではない。公開求人や旧証明書の工程一覧から実際の製造レシピを組み立てていない。時間、レール、装置、材料の色、ウェーハ上の格子・溝・検査マップは模式表現。品質とDXの解説は一般的な管理の考え方であり、Fab15の実運用、改善効果、管理基準、歩留まりを示すものではない。
