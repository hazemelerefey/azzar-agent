import type { Bi } from '../../catalog';
import type { Mission, MissionReport } from '../../domain/types';
import { hasExecutedAction } from '../engine';
import type { MissionScript, ScriptStep } from '../types';

/**
 * Marketing mission scripts for the simulated runner. Outputs are labelled samples, never real
 * research or real published content. A real run replaces the script with the live agent.
 */

const MANAGER = 'marketing-manager';
const SOCIAL = 'connector:social-publish';
const ADS = 'connector:ads-spend';
const CRM = 'connector:crm-write';

const b = (en: string, ar: string): Bi => ({ ar, en });

const SIM_AR = '(عينة محاكاة)';
const SIM_EN = '(simulated sample)';

const researchSteps = (): ScriptStep[] => [
  {
    actor: 'marketing-research',
    costUsd: 0.01,
    detail: b(
      'Starts the Research Specialist with a written brief: audience, competitors, channels, deadline.',
      'يبدأ متخصص البحث بتكليف مكتوب: الجمهور والمنافسون والقنوات والموعد.',
    ),
    id: 'spawn-research',
    kind: 'spawn',
    title: b('Start Research Specialist', 'تشغيل متخصص البحث'),
  },
  {
    actor: 'marketing-research',
    costUsd: 0.12,
    id: 'work-research',
    kind: 'work',
    output: b(
      `Audience and competitor brief for "{{goal}}": three audience segments, the claims competitors repeat most, and three implications. Every claim is listed with a source or marked as an assumption ${SIM_EN}.`,
      `ورقة الجمهور والمنافسين لمهمة "{{goal}}": ثلاث شرائح جمهور، والادعاءات التي يكررها المنافسون، وثلاث دلالات. كل ادعاء مرفق بمصدر أو معلَّم كافتراض ${SIM_AR}.`,
    ),
    parentStep: 'spawn-research',
    title: b('Research: audience and competitors', 'البحث: الجمهور والمنافسون'),
  },
  {
    actor: 'marketing-research',
    costUsd: 0,
    detail: b(
      'Research Specialist closed. Result accepted by the manager.',
      'أُغلق متخصص البحث. قبل المدير النتيجة.',
    ),
    id: 'close-research',
    kind: 'close',
    parentStep: 'spawn-research',
    title: b('Close Research Specialist', 'إغلاق متخصص البحث'),
  },
];

const brandSteps = (): ScriptStep[] => [
  {
    actor: 'marketing-brand',
    costUsd: 0.01,
    detail: b(
      'Starts the Brand Specialist with the research brief and the department voice rules.',
      'يبدأ متخصص العلامة التجارية بورقة البحث وقواعد نبرة القسم.',
    ),
    id: 'spawn-brand',
    kind: 'spawn',
    title: b('Start Brand Specialist', 'تشغيل متخصص العلامة التجارية'),
  },
  {
    actor: 'marketing-brand',
    costUsd: 0.1,
    id: 'work-brand',
    kind: 'work',
    output: b(
      `Messaging brief: one positioning statement and four message pillars, each with a proof point marked verified or assumption, plus voice rules with Arabic and English examples ${SIM_EN}.`,
      `ورقة الرسائل: عبارة تموضع واحدة وأربع ركائز رسالة، لكل منها دليل معلَّم كمُتحقَّق أو افتراض، مع قواعد النبرة بأمثلة عربية وإنجليزية ${SIM_AR}.`,
    ),
    parentStep: 'spawn-brand',
    title: b('Brand: positioning and message pillars', 'العلامة التجارية: التموضع وركائز الرسالة'),
  },
  {
    actor: 'marketing-brand',
    costUsd: 0,
    detail: b(
      'Brand Specialist closed. Result accepted by the manager.',
      'أُغلق متخصص العلامة التجارية. قبل المدير النتيجة.',
    ),
    id: 'close-brand',
    kind: 'close',
    parentStep: 'spawn-brand',
    title: b('Close Brand Specialist', 'إغلاق متخصص العلامة التجارية'),
  },
];

const planStep = (detail: Bi): ScriptStep => ({
  actor: MANAGER,
  costUsd: 0.02,
  detail,
  id: 'plan',
  kind: 'plan',
  title: b('Plan the mission', 'وضع خطة المهمة'),
});

const verifyStep = (): ScriptStep => ({
  actor: MANAGER,
  costUsd: 0.03,
  detail: b(
    'Manager checks every output against the success criteria and sends weak work back once.',
    'يراجع المدير كل ناتج مقابل معايير النجاح ويعيد العمل الضعيف مرة واحدة.',
  ),
  id: 'verify',
  kind: 'verify',
  title: b('Check results against success criteria', 'مراجعة النتائج مقابل معايير النجاح'),
});

const reportStep = (): ScriptStep => ({
  actor: MANAGER,
  costUsd: 0.02,
  detail: b('Writes the completion report in plain language.', 'يكتب تقرير الإنجاز بلغة واضحة.'),
  id: 'report',
  kind: 'report',
  title: b('Write the completion report', 'كتابة تقرير الإنجاز'),
});

/* ------------------------------------------------------------ launch campaign */

const launchSteps = (): ScriptStep[] => [
  planStep(
    b(
      'Restates the goal "{{goal}}", the success criteria and the deadline, makes a plan, and flags where a person must approve: publishing and paid spend.',
      'يعيد صياغة الهدف "{{goal}}" ومعايير النجاح والموعد، ويضع خطة، وينبّه إلى مواضع الموافقة البشرية: النشر والإنفاق الإعلاني.',
    ),
  ),
  ...researchSteps(),
  ...brandSteps(),
  {
    actor: 'marketing-campaigns',
    costUsd: 0.01,
    detail: b(
      'Starts the Campaigns Specialist with the messaging brief.',
      'يبدأ متخصص الحملات بورقة الرسائل.',
    ),
    id: 'spawn-campaigns',
    kind: 'spawn',
    title: b('Start Campaigns Specialist', 'تشغيل متخصص الحملات'),
  },
  {
    actor: 'marketing-campaigns',
    costUsd: 0.18,
    id: 'work-campaigns',
    kind: 'work',
    output: b(
      `Campaign plan for "{{goal}}": a 14-post content calendar, 6 ad copy variants in Arabic and English, and a landing page brief. Everything is marked DRAFT ${SIM_EN}.`,
      `خطة الحملة لمهمة "{{goal}}": تقويم محتوى من 14 منشوراً، و6 نسخ إعلانية بالعربية والإنجليزية، وموجز صفحة هبوط. كل شيء معلَّم كمسودة ${SIM_AR}.`,
    ),
    parentStep: 'spawn-campaigns',
    title: b(
      'Campaigns: plan, copy and landing page brief',
      'الحملات: الخطة والنصوص وموجز صفحة الهبوط',
    ),
  },
  {
    actionLabel: b(
      'Publish the launch post to social channels',
      'نشر منشور الإطلاق على القنوات الاجتماعية',
    ),
    actor: MANAGER,
    approvalSummary: b(
      'Publish 1 launch post (draft v1) to the company social channels. It becomes public immediately. If refused, the post stays a draft in the project.',
      'نشر منشور إطلاق واحد (المسودة 1) على القنوات الاجتماعية للشركة. يصبح علنياً فوراً. إذا رُفض يبقى مسودة في المشروع.',
    ),
    blockedText: b(
      'Publishing is forbidden by the Marketing Rules. The draft stays in the project for a person to publish.',
      'النشر ممنوع بموجب قواعد التسويق. تبقى المسودة في المشروع لينشرها شخص.',
    ),
    costUsd: 0.01,
    id: 'action-publish',
    kind: 'action',
    output: b(
      'Launch post published to the social channels (simulated: nothing was really posted).',
      'نُشر منشور الإطلاق على القنوات الاجتماعية (محاكاة: لم يُنشر شيء فعلياً).',
    ),
    parentStep: 'spawn-campaigns',
    rejectedText: b(
      'Publishing refused by a person. The post stays a draft.',
      'رفض شخص النشر. يبقى المنشور مسودة.',
    ),
    title: b('Publish the launch post', 'نشر منشور الإطلاق'),
    toolId: SOCIAL,
  },
  {
    actionLabel: b('Set the paid ads budget', 'تحديد ميزانية الإعلانات المدفوعة'),
    actor: MANAGER,
    approvalSummary: b(
      'Set a paid ads budget and start spending on it.',
      'تحديد ميزانية إعلانات مدفوعة وبدء الإنفاق منها.',
    ),
    blockedText: b(
      'Paid spend is forbidden for the agent. Decision needed from a person: approve a budget and run the ads yourself. Marketing suggests testing organic content first.',
      'الإنفاق الإعلاني ممنوع على الوكيل. مطلوب قرار من شخص: اعتمد ميزانية ونفّذ الإعلانات بنفسك. يقترح التسويق تجربة المحتوى العضوي أولاً.',
    ),
    costUsd: 0,
    id: 'action-ads',
    kind: 'action',
    output: b(
      'Ads budget set and spending started (simulated).',
      'حُددت ميزانية الإعلانات وبدأ الإنفاق (محاكاة).',
    ),
    parentStep: 'spawn-campaigns',
    title: b('Set the paid ads budget', 'تحديد ميزانية الإعلانات المدفوعة'),
    toolId: ADS,
  },
  {
    actor: 'marketing-campaigns',
    costUsd: 0,
    detail: b(
      'Campaigns Specialist closed. Result accepted by the manager.',
      'أُغلق متخصص الحملات. قبل المدير النتيجة.',
    ),
    id: 'close-campaigns',
    kind: 'close',
    parentStep: 'spawn-campaigns',
    title: b('Close Campaigns Specialist', 'إغلاق متخصص الحملات'),
  },
  {
    actor: 'marketing-leads',
    costUsd: 0.01,
    detail: b(
      'Starts the Leads Specialist with the audience and messaging briefs.',
      'يبدأ متخصص العملاء المحتملين بورقتَي الجمهور والرسائل.',
    ),
    id: 'spawn-leads',
    kind: 'spawn',
    title: b('Start Leads Specialist', 'تشغيل متخصص العملاء المحتملين'),
  },
  {
    actor: 'marketing-leads',
    costUsd: 0.08,
    id: 'work-leads',
    kind: 'work',
    output: b(
      `Lead scoring sheet (fit and intent signals with explained weights), a daily lead report template, and the hand-off rule to Sales for qualified leads ${SIM_EN}.`,
      `جدول تقييم العملاء المحتملين (إشارات الملاءمة والنية بأوزان مشروحة)، وقالب تقرير يومي بالعملاء، وقاعدة تسليم المؤهلين إلى المبيعات ${SIM_AR}.`,
    ),
    parentStep: 'spawn-leads',
    title: b(
      'Leads: scoring sheet and daily report',
      'العملاء المحتملون: جدول التقييم والتقرير اليومي',
    ),
  },
  {
    actionLabel: b('Record the scoring fields in the CRM', 'تسجيل حقول التقييم في الـ CRM'),
    actor: MANAGER,
    approvalSummary: b(
      'Create the lead scoring fields in the CRM.',
      'إنشاء حقول تقييم العملاء المحتملين في الـ CRM.',
    ),
    blockedText: b(
      'CRM writes are forbidden by the Marketing Rules.',
      'الكتابة في الـ CRM ممنوعة بموجب قواعد التسويق.',
    ),
    costUsd: 0.01,
    id: 'action-crm',
    kind: 'action',
    output: b(
      'Lead scoring fields recorded in the CRM (simulated). Listed in the briefing.',
      'سُجلت حقول التقييم في الـ CRM (محاكاة). مدرجة في ملخص الصباح.',
    ),
    parentStep: 'spawn-leads',
    title: b('Record scoring fields in the CRM', 'تسجيل حقول التقييم في الـ CRM'),
    toolId: CRM,
  },
  {
    actor: 'marketing-leads',
    costUsd: 0,
    detail: b(
      'Leads Specialist closed. Result accepted by the manager.',
      'أُغلق متخصص العملاء المحتملين. قبل المدير النتيجة.',
    ),
    id: 'close-leads',
    kind: 'close',
    parentStep: 'spawn-leads',
    title: b('Close Leads Specialist', 'إغلاق متخصص العملاء المحتملين'),
  },
  verifyStep(),
  reportStep(),
];

const launchReport = (m: Mission): MissionReport => {
  const published = hasExecutedAction(m, SOCIAL);
  const adsSet = hasExecutedAction(m, ADS);
  const decisions: Bi[] = m.blockers.filter((x) => x.needsDecision).map((x) => x.text);
  if (!published && !m.blockers.some((x) => x.stepId === 'action-publish')) {
    decisions.push(
      b('Publish the launch post when you are ready.', 'انشر منشور الإطلاق عندما تكون جاهزاً.'),
    );
  }
  return {
    blockers: m.blockers.map((x) => x.text),
    decisions,
    done: [
      b(
        `Research: audience and competitor brief ${SIM_EN}`,
        `البحث: ورقة الجمهور والمنافسين ${SIM_AR}`,
      ),
      b(
        `Brand: positioning and four message pillars ${SIM_EN}`,
        `العلامة التجارية: التموضع وأربع ركائز رسالة ${SIM_AR}`,
      ),
      b(
        `Campaigns: 14-post calendar, 6 ad variants, landing page brief ${SIM_EN}`,
        `الحملات: تقويم 14 منشوراً و6 نسخ إعلانية وموجز صفحة الهبوط ${SIM_AR}`,
      ),
      b(
        `Leads: scoring sheet, daily report template, hand-off rule ${SIM_EN}`,
        `العملاء المحتملون: جدول التقييم وقالب التقرير اليومي وقاعدة التسليم ${SIM_AR}`,
      ),
    ],
    evidence: [
      b(
        'Outputs are simulated samples. No real research was done and nothing was published or spent.',
        'النواتج عينات محاكاة. لم يُجرَ بحث حقيقي ولم يُنشر شيء ولم يُنفق شيء.',
      ),
    ],
    next: published
      ? b('Review the first daily lead report.', 'راجع أول تقرير يومي بالعملاء المحتملين.')
      : b('Review the drafts, then decide on publishing.', 'راجع المسودات ثم قرر النشر.'),
    outcome: b(
      `Launch package for "${m.goal}" is ready. ${published ? 'The launch post was approved and published (simulated).' : 'Nothing has been published.'} ${adsSet ? 'Ads budget was set (simulated).' : 'No ads budget was set.'}`,
      `حزمة الإطلاق لمهمة "${m.goal}" جاهزة. ${published ? 'تمت الموافقة على منشور الإطلاق ونُشر (محاكاة).' : 'لم يُنشر شيء.'} ${adsSet ? 'حُددت ميزانية الإعلانات (محاكاة).' : 'لم تُحدد ميزانية إعلانات.'}`,
    ),
  };
};

export const MARKETING_LAUNCH_SCRIPT: MissionScript = {
  buildReport: launchReport,
  defaultSuccessCriteria: [
    b(
      'Campaign plan with Arabic and English copy is ready for review',
      'خطة الحملة بنصوص عربية وإنجليزية جاهزة للمراجعة',
    ),
    b('Nothing is published or spent without approval', 'لا يُنشر ولا يُنفق شيء دون موافقة'),
    b(
      'A daily lead report template and a hand-off rule exist',
      'يوجد قالب تقرير يومي بالعملاء وقاعدة تسليم',
    ),
  ],
  departmentId: 'marketing',
  description: b(
    'Research, brand, campaign drafts and lead scoring for a launch. Asks before publishing; paid spend is forbidden.',
    'بحث وعلامة تجارية ومسودات حملة وتقييم عملاء محتملين للإطلاق. يسأل قبل النشر، والإنفاق الإعلاني ممنوع.',
  ),
  id: 'marketing.launch-campaign',
  managerId: MANAGER,
  steps: launchSteps(),
  suggestedApprovals: [SOCIAL, ADS, 'connector:email-send'],
  title: b('Launch campaign', 'حملة إطلاق'),
};

/* ----------------------------------------------------------- competitor brief */

const competitorSteps = (): ScriptStep[] => [
  planStep(
    b(
      'Restates the goal "{{goal}}" and the success criteria, and plans a research pass followed by positioning.',
      'يعيد صياغة الهدف "{{goal}}" ومعايير النجاح، ويخطط لمرحلة بحث تتبعها صياغة التموضع.',
    ),
  ),
  ...researchSteps(),
  ...brandSteps(),
  verifyStep(),
  reportStep(),
];

const competitorReport = (m: Mission): MissionReport => ({
  blockers: m.blockers.map((x) => x.text),
  decisions: [
    b(
      'Choose which positioning option to take to the team.',
      'اختر خيار التموضع الذي سيُعرض على الفريق.',
    ),
  ],
  done: [
    b(`Research: competitor brief ${SIM_EN}`, `البحث: ورقة المنافسين ${SIM_AR}`),
    b(`Brand: positioning options ${SIM_EN}`, `العلامة التجارية: خيارات التموضع ${SIM_AR}`),
  ],
  evidence: [
    b(
      'Outputs are simulated samples. No real research was done.',
      'النواتج عينات محاكاة. لم يُجرَ بحث حقيقي.',
    ),
  ],
  next: b('Review the brief and pick an option.', 'راجع الورقة واختر خياراً.'),
  outcome: b(
    `Positioning brief for "${m.goal}" is ready. No approvals were needed.`,
    `ورقة التموضع لمهمة "${m.goal}" جاهزة. لم تكن هناك حاجة لموافقات.`,
  ),
});

export const MARKETING_COMPETITOR_SCRIPT: MissionScript = {
  buildReport: competitorReport,
  defaultSuccessCriteria: [
    b('Competitor brief with sources', 'ورقة منافسين بمصادرها'),
    b('Two positioning options', 'خياران للتموضع'),
  ],
  departmentId: 'marketing',
  description: b(
    'Competitor research and positioning options. No approvals needed.',
    'بحث في المنافسين وخيارات تموضع. لا تحتاج موافقات.',
  ),
  id: 'marketing.competitor-brief',
  managerId: MANAGER,
  steps: competitorSteps(),
  suggestedApprovals: [],
  title: b('Competitor and positioning brief', 'ورقة المنافسين والتموضع'),
};
