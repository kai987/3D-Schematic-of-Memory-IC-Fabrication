import type { Locale } from '../i18n/types';
import {
  stages as canonicalStages,
  sources as canonicalSources,
  MODEL_TITLE,
  SCOPE_NOTE,
  disclaimer as canonicalDisclaimer,
  evidenceLabels as canonicalEvidenceLabels,
} from './processes.ts';
import type { EvidenceStatus, ProcessStage, PublicSource } from './processes.ts';

type TranslatedLocale = Exclude<Locale, 'ja'>;
type ProcessText = Pick<ProcessStage,
  'title' | 'shortTitle' | 'equipment' | 'description' | 'action' | 'quality' |
  'dx' | 'waferNote' | 'evidenceStatement' | 'unconfirmed'>;
type SourceText = Pick<PublicSource, 'title' | 'date' | 'support' | 'limits'> & { verification: string };
type LocalizedSource = Omit<PublicSource, 'verification'> & { verification: string };

export interface ProcessContent {
  stages: ProcessStage[];
  sources: LocalizedSource[];
  modelTitle: string;
  scopeNote: string;
  disclaimer: string;
  evidenceLabels: Record<EvidenceStatus, string>;
}

// The canonical arrays provide IDs, source links, dates checked, and evidence status.
// Every displayed text field is translated explicitly; missing entries are errors.
const processText: Record<TranslatedLocale, readonly ProcessText[]> = {
  en: [
    {
      title: 'Wafer transport and storage',
      shortTitle: 'Transport / storage',
      equipment: 'AMHS, OHT and transport containers (schematic)',
      description: 'Wafers are protected in containers and transported or stored between tools. AMHS is the general term for an automated material handling system. The displayed rails and containers illustrate their functions.',
      action: 'Learn how lots are identified and transported to the required tools.',
      quality: 'Learn the management practices used to limit particle contamination and damage from contact.',
      dx: 'Illustrate how transport status and processing queues can be visualized.',
      waferNote: 'The disks, containers and wafer count are schematic. They do not reproduce the container types or capacities at Fab15.',
      evidenceStatement: 'The AMHS role based at Fab15 describes wafer transport and storage, and management of OHT and related systems.',
      unconfirmed: ['Actual transport routes and rail layout', 'Container types, capacities and storage system configuration', 'Transport and queue times'],
    },
    {
      title: 'Wet processing and cleaning',
      shortTitle: 'Wet / cleaning',
      equipment: 'Wet processing equipment (schematic)',
      description: 'Liquid-based and related treatments remove particles, contaminants or selected films. This illustration focuses on cleaning. The tanks and liquid colors are explanatory.',
      action: 'Learn the role of removing unwanted contaminants or selected films.',
      quality: 'Illustrate how defects caused by residues and particles can be limited.',
      dx: 'Illustrate how processing conditions can be compared with defect information.',
      waferNote: 'The cleaning motion is schematic. Actual chemicals and fluid flow are not reproduced.',
      evidenceStatement: 'The Fab15 WET job description mentions the removal of particles, contaminants and films.',
      unconfirmed: ['Chemicals, concentrations, temperatures and processing times', 'Single-wafer, batch and other equipment configurations', 'Actual position in the process and repetition counts'],
    },
    {
      title: 'Thin-film formation and deposition',
      shortTitle: 'Thin films / deposition',
      equipment: 'Example deposition equipment (schematic)',
      description: 'Materials that form devices and interconnects are deposited as thin films. This illustrates the general role of choosing a method according to the function and material of the film.',
      action: 'Learn the role of forming the required materials on the wafer.',
      quality: 'Illustrate how film thickness, uniformity and material condition are managed.',
      dx: 'Illustrate how deposition conditions can be linked with measurement information.',
      waferNote: 'The colored layers illustrate thin-film formation. They are not actual materials, film thicknesses or cross-sectional structures.',
      evidenceStatement: 'A Fab15 process development role lists deposition fields such as CVD. An older certification document also records thin-film processes.',
      unconfirmed: ['Production adoption of CVD, ALD and PVD individually', 'Materials, film thicknesses and processing conditions', 'Equipment models and chamber layout'],
    },
    {
      title: 'Photolithography',
      shortTitle: 'Coat / expose / develop',
      equipment: 'Coat-and-develop track and exposure tools (schematic)',
      description: 'Resist coating, exposure and development create a pattern that defines where material will be processed. For learning, the track and exposure functions are displayed together in one area.',
      action: 'Learn the role of forming a processing pattern in the resist.',
      quality: 'Illustrate how pattern dimensions, alignment and defects are managed.',
      dx: 'Illustrate how processing conditions can be compared with pattern measurements.',
      waferNote: 'The light and grid illustrate pattern formation. The EUV optical system and actual mask structure are not reproduced.',
      evidenceStatement: 'A Fab15 Photo Track role is documented. The official 2026 announcement describes the introduction of EUV for 1γ DRAM at Hiroshima as an achieved initiative. The 2023 document describes the plan at that time.',
      unconfirmed: ['Layers using EUV and the combination of exposure methods', 'Exposure tool models and quantities', 'Adoption across all products and exposure steps'],
    },
    {
      title: 'Dry etching',
      shortTitle: 'Dry etch',
      equipment: 'Dry etching equipment (schematic)',
      description: 'This illustrates the role of selectively removing material along a pattern to form holes and trenches. The tool interior and etched shapes are generic explanatory forms.',
      action: 'Learn the role of shaping material as required.',
      quality: 'Illustrate how dimensions, shape, selectivity and defects are managed.',
      dx: 'Illustrate how processing conditions can be compared with measurements after etching.',
      waferNote: 'The grid and trenches are schematic. They are not actual DRAM cell dimensions, cross sections or etch recipes.',
      evidenceStatement: 'The official Fab15 DRY job description mentions process and equipment management and production improvement for advanced DRAM mass production.',
      unconfirmed: ['Gases, pressures, power settings and processing times', 'Etched dimensions and target layers', 'Chamber shapes, quantities and layout'],
    },
    {
      title: 'Diffusion, ion implantation and heat treatment',
      shortTitle: 'Diffusion / implant / heat',
      equipment: 'Example implantation and heat-treatment equipment (schematic)',
      description: 'Related processes that adjust the electrical properties and condition of materials are explained together. Implantation and heat treatment are different treatments; this does not depict an actual sequence performed in a single tool.',
      action: 'Learn how implantation and heat treatment relate to material properties.',
      quality: 'Illustrate how quantities processed, temperatures and related conditions are managed.',
      dx: 'Illustrate how processing histories can be linked with material and electrical property evaluation.',
      waferNote: 'Colors and particles illustrate adjustments to material properties. They are not actual implantation distributions, temperatures or material structures.',
      evidenceStatement: 'A Fab15 development role lists fields related to diffusion, ion implantation and heat treatment. A manufacturing alignment role located at Fab15 also lists diffusion and implantation.',
      unconfirmed: ['Actual combinations and order of diffusion, implantation and heat treatment', 'Ion species, doses, energies, temperatures and processing times', 'Individual equipment models and installation locations'],
    },
    {
      title: 'CMP and planarization',
      shortTitle: 'CMP / planarization',
      equipment: 'CMP equipment (schematic)',
      description: 'Mechanical and chemical actions are combined to planarize the wafer surface. The rotating parts are shapes used to explain the polishing function.',
      action: 'Learn the role of adjusting surface topography before subsequent processing.',
      quality: 'Illustrate how planarity, remaining films, scratches and defects are managed.',
      dx: 'Illustrate how polishing conditions can be compared with measurements after processing.',
      waferNote: 'The flattening is schematic. Removal amounts, actual materials and surface roughness are not reproduced.',
      evidenceStatement: 'The Fab15 CMP job description mentions mechanical and chemical wafer planarization and defect reduction.',
      unconfirmed: ['Polishing materials, pressures, speeds and processing times', 'Pad and head configurations', 'Actual insertion points and repetition counts'],
    },
    {
      title: 'Metrology and defect inspection',
      shortTitle: 'Metrology / inspection',
      equipment: 'Example inspection and metrology equipment (schematic)',
      description: 'Films and patterns are measured to help identify defects and variation. A single inspection area is shown, but this does not mean inspection occurs only once during processing.',
      action: 'Learn the role of connecting measurements and defect detection with process management.',
      quality: 'Illustrate how measurement repeatability and defect detection are managed.',
      dx: 'Illustrate how inspection and measurement data can reveal process changes.',
      waferNote: 'The scanning light and measurement points are schematic. They do not represent an actual measurement method, measured data or acceptance criteria.',
      evidenceStatement: 'The RDA and metrology role located at Fab15 describes defect detection and process visibility and control. Its responsibilities also include development, production and support for other sites.',
      unconfirmed: ['Which specific metrology tools are installed locally', 'Inspection locations, frequencies and measurement items', 'Acceptance criteria and measured values'],
    },
    {
      title: 'Wafer electrical testing and probing',
      shortTitle: 'Wafer probe test',
      equipment: 'Example wafer prober and tester (schematic)',
      description: 'This illustrates the role of contacting circuits on a wafer to evaluate their electrical operation. The scope of this model ends with wafer processes.',
      action: 'Learn the role of evaluating electrical properties and operation while devices remain on the wafer.',
      quality: 'Illustrate how contact conditions and test conditions are managed.',
      dx: 'Illustrate how test results can be linked to positions on a wafer.',
      waferNote: 'The colored map is a fictional explanatory display. It does not show Fab15 pass/fail data or yield.',
      evidenceStatement: 'The older ISO 14001 certificate lists probe testing within the activities of Fab15. It expired on January 15, 2025 and does not establish the current scope of probe testing.',
      unconfirmed: ['Current scope of probe testing at Fab15', 'Equipment configurations, test conditions and test items', 'Actual process routes, test results and yield'],
    },
  ],
  zh: [
    {
      title: '晶圆搬运与存储',
      shortTitle: '搬运与存储',
      equipment: 'AMHS、OHT与搬运容器（示意）',
      description: '晶圆在容器内受到保护，并在设备之间搬运或存储。AMHS是自动物料搬运系统的统称。图中的轨道与容器用于说明其功能。',
      action: '学习识别批次并将其搬运至所需设备的机制。',
      quality: '学习减少颗粒污染与接触损伤的管理方法。',
      dx: '展示搬运状态和待加工队列可视化的思路。',
      waferNote: '圆片、容器和晶圆数量均为示意，并未再现Fab15的容器型号或容量。',
      evidenceStatement: '常驻Fab15的AMHS岗位说明记载了晶圆搬运、存储以及OHT等系统的管理职责。',
      unconfirmed: ['实际搬运路线与轨道布局', '容器型号、容量及存储设备配置', '搬运时间与等待加工时间'],
    },
    {
      title: '湿法处理与清洗',
      shortTitle: '湿法与清洗',
      equipment: '湿法处理设备（示意）',
      description: '通过液体等处理去除颗粒、污染物或指定薄膜。本图以清洗功能为主，槽体和液体颜色仅用于说明。',
      action: '学习去除不需要的污染物或指定薄膜的作用。',
      quality: '展示减少残留物和颗粒等引起的缺陷的思路。',
      dx: '展示将处理条件与缺陷信息进行比对的思路。',
      waferNote: '清洗动作是示意，并未再现实际药液或液体流动。',
      evidenceStatement: 'Fab15的湿法处理岗位说明记载了颗粒、污染物和薄膜的去除。',
      unconfirmed: ['药液、浓度、温度与处理时间', '单片、批量等设备配置', '实际工艺中的位置与重复次数'],
    },
    {
      title: '薄膜形成与沉积',
      shortTitle: '薄膜与沉积',
      equipment: '沉积设备示例（示意）',
      description: '将构成器件和互连的材料形成薄膜。本图说明根据薄膜的作用与材料选择工艺方式这一一般功能。',
      action: '学习在晶圆上形成所需材料的作用。',
      quality: '展示管理膜厚、均匀性与材料状态的思路。',
      dx: '展示将沉积条件与测量信息关联的思路。',
      waferNote: '叠加的颜色是薄膜形成的示意，并非实际材料、膜厚或截面结构。',
      evidenceStatement: 'Fab15的工艺开发岗位说明列出了CVD等沉积领域，旧认证资料中也有薄膜工艺的记录。',
      unconfirmed: ['CVD、ALD与PVD各自的量产采用范围', '材料、膜厚与处理条件', '设备型号与腔室布局'],
    },
    {
      title: '光刻',
      shortTitle: '涂胶、曝光与显影',
      equipment: '涂胶显影设备与曝光设备（示意）',
      description: '通过涂覆光刻胶、曝光和显影，形成确定加工位置的图形。为方便学习，将涂胶显影与曝光功能集中显示在一个区域。',
      action: '学习在光刻胶上形成加工位置图形的作用。',
      quality: '展示管理图形尺寸、对准与缺陷的思路。',
      dx: '展示将工艺条件与图形测量结果进行比对的思路。',
      waferNote: '光线与网格是图形形成的示意，并未再现EUV光学系统或实际掩模结构。',
      evidenceStatement: '已确认Fab15的光刻涂胶显影岗位说明。2026年的官方公告将广岛面向1γ DRAM引入EUV的工作描述为已实现的举措；2023年的资料则是当时的计划。',
      unconfirmed: ['使用EUV的目标层及曝光方式的组合', '曝光设备型号与数量', '所有产品与全部曝光工序的采用范围'],
    },
    {
      title: '干法刻蚀',
      shortTitle: '干法刻蚀',
      equipment: '干法刻蚀设备（示意）',
      description: '说明沿图形去除材料、加工孔和沟槽等结构的工艺作用。设备内部和加工形状均为一般性的说明用形态。',
      action: '学习将材料加工成所需形状的作用。',
      quality: '展示管理加工尺寸、形状、选择性与缺陷的思路。',
      dx: '展示将处理条件与加工后的测量结果进行比对的思路。',
      waferNote: '网格和沟槽是加工示意，并非DRAM单元的实际尺寸、截面或刻蚀配方。',
      evidenceStatement: 'Fab15的官方干法刻蚀岗位说明记载了先进DRAM量产中的工艺与设备管理，以及量产改善工作。',
      unconfirmed: ['气体、压力、功率与处理时间', '加工尺寸与目标层', '腔室形状、数量与布局'],
    },
    {
      title: '扩散、离子注入与热处理',
      shortTitle: '扩散、注入与热处理',
      equipment: '注入与热处理设备示例（示意）',
      description: '将调整材料电学性质与状态的相关工艺合并说明。注入和热处理是不同处理，并非表示在同一设备内连续执行的实际工艺。',
      action: '学习注入与热处理如何影响材料性质。',
      quality: '展示管理处理量、温度等条件的思路。',
      dx: '展示将处理历史与材料及电学性质评估关联的思路。',
      waferNote: '颜色与粒子表示材料特性调整的示意，并非实际注入分布、温度或材料结构。',
      evidenceStatement: 'Fab15的开发岗位说明列出了扩散、离子注入与热处理相关领域。以Fab15为工作地点的制造协调岗位说明也列出了扩散与注入领域。',
      unconfirmed: ['扩散、注入与热处理的实际组合和顺序', '注入离子种类、剂量、能量、温度与处理时间', '各设备型号及安装位置'],
    },
    {
      title: 'CMP与平坦化',
      shortTitle: 'CMP与平坦化',
      equipment: 'CMP设备（示意）',
      description: '结合机械与化学作用，使晶圆表面平坦化。旋转部件的形态用于说明抛光功能。',
      action: '学习调整表面起伏、衔接后续加工的作用。',
      quality: '展示管理平坦性、残余薄膜、划伤与缺陷的思路。',
      dx: '展示将抛光条件与加工后的测量结果进行比对的思路。',
      waferNote: '表面变平的显示是示意，并未再现去除量、实际材料或表面粗糙度。',
      evidenceStatement: 'Fab15的CMP岗位说明记载了利用机械与化学作用进行晶圆平坦化，以及减少缺陷的工作。',
      unconfirmed: ['抛光材料、压力、速度与处理时间', '抛光垫与抛光头配置', '实际插入位置与重复次数'],
    },
    {
      title: '计量与缺陷检测',
      shortTitle: '计量与缺陷检测',
      equipment: '检测与计量设备示例（示意）',
      description: '测量薄膜与图形，帮助识别缺陷和波动。图中集中显示一个检测区域，并不意味着工艺中只检测一次。',
      action: '学习将测量与缺陷检测用于工艺管理的作用。',
      quality: '展示管理测量重复性与缺陷检测的思路。',
      dx: '展示利用检测与计量数据识别工艺变化的思路。',
      waferNote: '扫描光线与测量点均为示意，并非实际测量方式、实测数据或合格判定标准。',
      evidenceStatement: '工作地点为Fab15的RDA与计量岗位说明记载了缺陷检测以及工艺内的可视化和管理。其职责也包括开发、量产和对其他厂区的支持。',
      unconfirmed: ['具体计量设备在当地的安装范围', '检测位置、频率与测量项目', '判定标准与实测值'],
    },
    {
      title: '晶圆电气检验与探针测试',
      shortTitle: '晶圆探针测试',
      equipment: '探针台与测试机示例（示意）',
      description: '说明接触晶圆上的电路、评估其电气运行情况的工艺作用。本模型的范围截至晶圆工艺。',
      action: '学习在晶圆状态下评估电学性质与运行情况的作用。',
      quality: '展示管理接触状态与测试条件的思路。',
      dx: '展示将测试结果与晶圆上的位置关联的思路。',
      waferNote: '彩色分布图是虚构的说明用显示，并非Fab15的合格与不合格数据或良率。',
      evidenceStatement: '旧ISO 14001证书在Fab15的活动范围中记载了探针测试。其有效期于2025年1月15日结束，不能据此确认目前探针测试的实施范围。',
      unconfirmed: ['目前Fab15探针测试的实施范围', '设备配置、测试条件与测试项目', '实际工艺路线、测试结果与良率'],
    },
  ],
};

const sourceText: Record<TranslatedLocale, readonly SourceText[]> = {
  en: [
    {
      title: 'Micron | Hiroshima Plant and Technology Development site',
      date: 'Publication date not stated',
      support: 'Identifies the Hiroshima Plant / Technology Development site and its address in Higashihiroshima.',
      limits: 'Does not show process order, building interiors or equipment layout.',
      verification: 'Source text checked',
    },
    {
      title: 'Micron | Quality certifications list and Fab15 entry',
      date: 'Publication date not stated',
      support: 'Lists Fab15 of Micron Memory Japan K.K. in the certification list.',
      limits: 'The list alone does not establish the expiry dates or detailed process scope of individual certificates.',
      verification: 'Source text checked',
    },
    {
      title: 'Micron | Older ISO 14001 certificate and Fab15 activity scope',
      date: 'Reissued: 2022-01-14 / Expired: 2025-01-15',
      support: 'The Fab15 entry in the older certificate records wafer research, development, manufacturing and testing. It lists diffusion, ion implantation, photolithography, wet processing, dry etching, thin films, CMP, probe testing and other activities.',
      limits: 'A historical record, not evidence of a valid current certification. The listed order is not a manufacturing sequence. This review used the search index of the official PDF; the PDF text could not be retrieved directly.',
      verification: 'Official source search index',
    },
    {
      title: 'Micron | Plan to introduce EUV in Japan (2023)',
      date: '2023-05-17',
      support: 'Describes 1β DRAM production in Hiroshima and the plan at that time to introduce EUV for 1γ DRAM in Japan and Taiwan starting in 2025.',
      limits: 'A plan announced in 2023. This document alone does not establish completion or adoption in all exposure steps.',
      verification: 'Source text checked',
    },
    {
      title: 'Micron | Hiroshima DRAM manufacturing, EUV introduction and new cleanroom groundbreaking',
      date: '2026-07-04',
      support: 'States that the Hiroshima site has achieved 1β DRAM production and introduced EUV exposure technology for 1γ DRAM. It also identifies research, development and manufacturing functions at Hiroshima.',
      limits: 'Does not state that all exposure steps use EUV. Tool models, quantities and target layers are not public. The new cleanroom is a future expansion and does not establish the existing layout shown in the model.',
      verification: 'Source text checked',
    },
    {
      title: 'Micron official careers | Fab15-based AMHS engineering role · JR104229',
      date: 'Posted: 2026-06-17 (official careers data)',
      support: 'Specifies a Fab15-based AMHS engineering role covering wafer transport and storage and management of OHT and storage systems.',
      limits: 'Responsibilities extend to domestic and overseas sites. Actual rail routes, containers, stocker configurations and transport times are not established.',
      verification: 'Source text checked',
    },
    {
      title: 'Micron official careers | Fab15 WET process and equipment engineer · JR97434',
      date: 'Posted: 2026-05-11 (official careers data)',
      support: 'The work location is Hiroshima - Fab 15. The job description mentions removing particles, contaminants and films through wet processing.',
      limits: 'Chemicals, concentrations, processing conditions, equipment shapes and process order are not established.',
      verification: 'Source text checked',
    },
    {
      title: 'Micron official careers | Fab15 process development engineer · JR109536',
      date: 'Posted: 2026-09-03 (official careers data)',
      support: 'The work location is Hiroshima - Fab 15. Development fields for DRAM and related technologies include lithography, CVD, dry etching, wet processing, metal films, diffusion, ion implantation and CMP. Relevant experience includes CVD, ALD, PVD and heat treatment.',
      limits: 'Describes development fields and required experience. It does not establish that every method has been adopted in mass production for every product.',
      verification: 'Source text checked',
    },
    {
      title: 'Micron official careers | Fab15 HVM Photo Track engineer · JR84928',
      date: 'Posted: 2026-03-27 (official careers data)',
      support: 'The work location is Hiroshima - Fab 15. Describes Photo / Track process optimization and stable tool operation for advanced DRAM.',
      limits: 'A track tool is not the exposure tool itself. This job posting does not establish exposure methods, tool models or quantities.',
      verification: 'Source text checked',
    },
    {
      title: 'Micron official careers | Fab15 HVM DRY engineer · JR94008',
      date: 'Posted: 2026-03-17 (official careers data)',
      support: 'The work location is Hiroshima - Fab 15. Describes process and equipment management and production improvement by the DRY group in advanced DRAM mass production.',
      limits: 'Gases, processing conditions, etched dimensions, chamber shapes and quantities are not established.',
      verification: 'Source text checked',
    },
    {
      title: 'Micron official careers | Fab15 diffusion / implant manufacturing alignment engineer · JR109148',
      date: 'Posted: 2026-08-18 (official careers data)',
      support: 'The work location is Hiroshima - Fab 15. Responsibilities include process and equipment optimization in diffusion and implantation and manufacturing alignment between sites.',
      limits: 'Includes global alignment work. Does not show that individual tools exist in the same building at Fab15 or establish actual recipes.',
      verification: 'Source text checked',
    },
    {
      title: 'Micron official careers | Fab15 CMP process and equipment engineer · JR102354',
      date: 'Posted: 2026-09-03 (official careers data)',
      support: 'The work location is Hiroshima - Fab 15. Describes mechanical and chemical wafer planarization and defect reduction responsibilities.',
      limits: 'Polishing materials, conditions, pad and head configurations and insertion points in the actual process are not established.',
      verification: 'Source text checked',
    },
    {
      title: 'Micron official careers | Fab15 RDA and metrology engineer · JR95387',
      date: 'Posted: 2026-03-27 (official careers data)',
      support: 'The work location is Hiroshima - Fab 15. Describes responsibilities for defect detection, process visibility and control, and inspection and metrology equipment.',
      limits: 'Responsibilities cover development, production and other sites. Specific inspection tool installations at Fab15, inspection frequencies and acceptance criteria are not established.',
      verification: 'Source text checked',
    },
  ],
  zh: [
    {
      title: '美光｜广岛工厂与技术开发基地',
      date: '未标注发布日期',
      support: '可确认位于东广岛市的广岛工厂与技术开发基地及其地址。',
      limits: '未展示工艺顺序、建筑内部或设备布局。',
      verification: '已核对正文',
    },
    {
      title: '美光｜质量认证列表与Fab15条目',
      date: '未标注发布日期',
      support: '认证列表列出了Micron Memory Japan K.K.的Fab15。',
      limits: '仅凭列表无法判断各证书的有效期或详细工艺范围。',
      verification: '已核对正文',
    },
    {
      title: '美光｜旧ISO 14001证书与Fab15活动范围',
      date: '重新签发：2022-01-14／有效期至：2025-01-15（已过期）',
      support: '旧证书的Fab15条目记载了晶圆研发、制造与检验，并列出扩散、离子注入、光刻、湿法处理、干法刻蚀、薄膜、CMP和探针测试等活动。',
      limits: '这是历史记录，并非目前有效认证的证据，条目排列顺序也不是制造顺序。本次通过官方PDF的搜索索引核对，未能直接获取PDF正文。',
      verification: '官方来源搜索索引',
    },
    {
      title: '美光｜日本EUV引入计划（2023年）',
      date: '2023-05-17',
      support: '说明了广岛的1β DRAM生产，以及当时计划从2025年起在日本和台湾为1γ DRAM引入EUV的安排。',
      limits: '这是2023年时的计划，仅凭该资料不能确认引入已完成，也不能确认全部曝光工序均已采用。',
      verification: '已核对正文',
    },
    {
      title: '美光｜广岛DRAM制造、EUV引入与新洁净室开工',
      date: '2026-07-04',
      support: '说明广岛基地已经实现1β DRAM生产，并在1γ DRAM中引入EUV曝光技术，也可确认广岛具备研发与制造功能。',
      limits: '未说明全部曝光工序均使用EUV。设备型号、数量与目标层未公开。新洁净室属于未来扩建，不能据此证明模型中的现存布局。',
      verification: '已核对正文',
    },
    {
      title: '美光官方招聘｜常驻Fab15的AMHS工程岗位 · JR104229',
      date: '开始招聘：2026-06-17（官方招聘数据）',
      support: '明确记载常驻Fab15的AMHS工程职责，涵盖晶圆搬运、存储以及OHT和存储系统的管理。',
      limits: '职责涉及日本国内及海外，不能确认实际轨道路线、容器、储料设备配置或搬运时间。',
      verification: '已核对正文',
    },
    {
      title: '美光官方招聘｜Fab15湿法工艺与设备工程师 · JR97434',
      date: '开始招聘：2026-05-11（官方招聘数据）',
      support: '工作地点为广岛Fab15。岗位说明记载了通过湿法处理去除颗粒、污染物和薄膜的工作。',
      limits: '不能确认药液、浓度、处理条件、设备形态或工艺顺序。',
      verification: '已核对正文',
    },
    {
      title: '美光官方招聘｜Fab15工艺开发工程师 · JR109536',
      date: '开始招聘：2026-09-03（官方招聘数据）',
      support: '工作地点为广岛Fab15。DRAM等技术的开发领域包括光刻、CVD、干法刻蚀、湿法处理、金属薄膜、扩散、离子注入和CMP，相关经验要求还列出CVD、ALD、PVD与热处理。',
      limits: '这是开发领域与所需经验的说明，不能据此判断所有方式都已用于所有产品的量产工艺。',
      verification: '已核对正文',
    },
    {
      title: '美光官方招聘｜Fab15量产光刻涂胶显影工程师 · JR84928',
      date: '开始招聘：2026-03-27（官方招聘数据）',
      support: '工作地点为广岛Fab15。说明了先进DRAM光刻及涂胶显影工艺的优化，以及设备稳定运行的工作。',
      limits: '涂胶显影设备并不是曝光设备本身，不能根据该招聘信息判断曝光方式、设备型号或数量。',
      verification: '已核对正文',
    },
    {
      title: '美光官方招聘｜Fab15量产干法刻蚀工程师 · JR94008',
      date: '开始招聘：2026-03-17（官方招聘数据）',
      support: '工作地点为广岛Fab15。记载了先进DRAM量产中干法刻蚀团队的工艺与设备管理，以及量产改善工作。',
      limits: '不能确认气体、处理条件、加工尺寸、腔室形状或数量。',
      verification: '已核对正文',
    },
    {
      title: '美光官方招聘｜Fab15扩散与注入制造协调工程师 · JR109148',
      date: '开始招聘：2026-08-18（官方招聘数据）',
      support: '工作地点为广岛Fab15。负责扩散与注入领域的工艺、设备优化，以及厂区之间的制造协调。',
      limits: '也包括全球协调工作，不能据此证明各设备都实际安装在Fab15的同一建筑内，也未说明实际工艺配方。',
      verification: '已核对正文',
    },
    {
      title: '美光官方招聘｜Fab15 CMP工艺与设备工程师 · JR102354',
      date: '开始招聘：2026-09-03（官方招聘数据）',
      support: '工作地点为广岛Fab15。记载了利用机械与化学作用使晶圆平坦化，以及减少缺陷的职责。',
      limits: '不能确认抛光材料、条件、抛光垫与抛光头配置，以及实际工艺中的插入位置。',
      verification: '已核对正文',
    },
    {
      title: '美光官方招聘｜Fab15 RDA与计量工程师 · JR95387',
      date: '开始招聘：2026-03-27（官方招聘数据）',
      support: '工作地点为广岛Fab15。说明了缺陷检测、工艺内可视化与管理，以及检测和计量设备相关职责。',
      limits: '职责涉及开发、量产和其他厂区，不能确认具体检测设备在当地的安装情况、检测频率或判定标准。',
      verification: '已核对正文',
    },
  ],
};

const modelText: Record<TranslatedLocale, Pick<ProcessContent, 'modelTitle' | 'scopeNote' | 'disclaimer' | 'evidenceLabels'>> = {
  en: {
    modelTitle: 'Higashihiroshima Fab15 | 3D learning model of DRAM wafer manufacturing',
    scopeNote: 'Process categories are based on public sources. Order, repetition counts, equipment appearance, layout and timing are explanatory schematic representations.',
    disclaimer: 'This 3D learning model groups DRAM wafer manufacturing process categories related to Higashihiroshima Fab15 using official Micron public sources. Confirmation labels refer to process fields or job descriptions; they do not establish the existence of the illustrated equipment or actual manufacturing routes. Numbers and transport routes follow an explanatory order. Actual order, repetition counts, materials, conditions, timing, yield, equipment models, quantities and layout have not been verified and are represented schematically. Process roles, quality management and digital transformation content are also educational explanations. Older certification documents are treated as expired historical records. The EUV introduction described in the official 2026 announcement does not imply that every exposure step uses EUV. Dicing, assembly, encapsulation, final testing and other back-end processes are outside the scope.',
    evidenceLabels: {
      public: 'Confirmed in public sources',
      historical: 'Historical public record',
      illustrative: 'Schematic learning aid',
    },
  },
  zh: {
    modelTitle: '东广岛Fab15｜DRAM晶圆制造工艺3D学习模型',
    scopeNote: '工艺分类以公开资料为依据。顺序、重复次数、设备外观、布局与时间均为说明用示意。',
    disclaimer: '本3D学习模型依据美光官方公开资料，整理与东广岛Fab15有关的DRAM晶圆制造工艺分类。确认标记对应资料中的工艺领域或岗位描述，并不证明图中设备实际存在，也不证明实际制造路线。编号与搬运路线按说明顺序展示。实际顺序、重复次数、材料、条件、时间、良率、设备型号、数量与布局均未经确认，因此采用示意表示。工艺作用、质量管理与数字化内容同样属于学习用说明。旧认证资料按已过期的历史记录处理。2026年官方公告中的EUV引入说明，并不意味着全部曝光工序都采用EUV。切割、组装、封装、最终检验等后道工序不在本模型范围内。',
    evidenceLabels: {
      public: '公开资料可确认',
      historical: '历史公开记录',
      illustrative: '示意与学习辅助',
    },
  },
};

export function getProcessContent(locale: Locale): ProcessContent {
  if (locale === 'ja') {
    return {
      stages: canonicalStages,
      sources: canonicalSources,
      modelTitle: MODEL_TITLE,
      scopeNote: SCOPE_NOTE,
      disclaimer: canonicalDisclaimer,
      evidenceLabels: canonicalEvidenceLabels,
    };
  }

  const translatedStages = processText[locale];
  const translatedSources = sourceText[locale];
  if (translatedStages.length !== canonicalStages.length || translatedSources.length !== canonicalSources.length) {
    throw new Error(`Incomplete process translations for locale: ${locale}`);
  }

  return {
    stages: canonicalStages.map((stage, index) => ({ ...stage, ...translatedStages[index] })),
    sources: canonicalSources.map((source, index) => ({ ...source, ...translatedSources[index] })),
    ...modelText[locale],
  };
}
