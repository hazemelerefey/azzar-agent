import type { Bi, DepartmentTier } from './types';

/**
 * Compact specs for the 8 core departments. The catalog builder turns each spec into a
 * department template plus coming-soon agent templates for its manager and specialists.
 * Marketing is the exception: its agents are hand-written in `agents/marketing.ts`.
 */

export interface SpecialistSpec {
  name: Bi;
  tag: string;
}

export interface DoesSpec {
  ar: string;
  en: string;
  tag: string;
}

export interface CoreDepartmentSpec {
  avatarKey: string;
  does: DoesSpec[];
  doesNot: Bi[];
  examples: Bi[];
  id: string;
  managerName: Bi;
  mission: Bi;
  name: Bi;
  specialists: SpecialistSpec[];
  tier: DepartmentTier;
}

const sp = (tag: string, en: string, ar: string): SpecialistSpec => ({ name: { ar, en }, tag });
const d = (tag: string, en: string, ar: string): DoesSpec => ({ ar, en, tag });
const n = (en: string, ar: string): Bi => ({ ar, en });

export const CORE_DEPARTMENT_SPECS: CoreDepartmentSpec[] = [
  {
    avatarKey: '01-human-resources',
    does: [
      d(
        'hiring',
        'Job descriptions, hiring pipelines, interview scheduling and feedback',
        'توصيف الوظائف ومسارات التوظيف وجدولة المقابلات وجمع الملاحظات',
      ),
      d('onboarding', 'Onboarding checklists and documents', 'قوائم التأهيل ومستنداته'),
      d('benefits', 'Benefits and leave tracking', 'متابعة المزايا والإجازات'),
      d('training', 'Training plans', 'خطط التدريب'),
      d('reviews', 'Performance reviews', 'تقييم الأداء'),
      d('culture', 'Culture and engagement check-ins', 'متابعة الثقافة والانخراط'),
    ],
    doesNot: [
      n('Decide pay or termination alone', 'لا يقرر الأجور أو إنهاء الخدمة بمفرده'),
      n('Handle legal disputes alone', 'لا يعالج نزاعاً قانونياً بمفرده'),
      n(
        'Share private employee data outside HR',
        'لا يشارك بيانات الموظفين الخاصة خارج الموارد البشرية',
      ),
    ],
    examples: [
      n(
        'Onboard two new designers this week: documents, accounts and a first-week plan ready.',
        'وظّف مصمّمَين جداد الأسبوع ده: المستندات والحسابات وخطة الأسبوع الأول جاهزة.',
      ),
      n(
        'Run the quarterly review cycle, collect feedback, draft summaries, flag overdue managers.',
        'شغّل دورة التقييم الربع سنوية، واجمع الملاحظات، واكتب الملخصات، ونبّهني على المديرين المتأخرين.',
      ),
    ],
    id: 'human-resources',
    managerName: n('HR Manager', 'مدير الموارد البشرية'),
    mission: n(
      'Hire, onboard, develop, and keep people, fairly and on time.',
      'توظيف الأفراد وتأهيلهم وتطويرهم والحفاظ عليهم بعدالة وفي الوقت المناسب.',
    ),
    name: n('Human Resources', 'الموارد البشرية'),
    specialists: [
      sp('hiring', 'Hiring Specialist', 'متخصص التوظيف'),
      sp('onboarding', 'Onboarding Specialist', 'متخصص التأهيل'),
      sp('benefits', 'Benefits Specialist', 'متخصص المزايا'),
      sp('training', 'Training Specialist', 'متخصص التدريب'),
      sp('reviews', 'Reviews Specialist', 'متخصص التقييم'),
      sp('culture', 'Culture Specialist', 'متخصص الثقافة'),
    ],
    tier: 'growth',
  },
  {
    avatarKey: '02-accounting-finance',
    does: [
      d('bookkeeping', 'Bookkeeping and invoices', 'مسك الدفاتر والفواتير'),
      d('payroll', 'Payroll preparation', 'إعداد الرواتب'),
      d('budgeting', 'Expenses and budgets', 'المصروفات والميزانيات'),
      d('tax', 'Tax preparation support', 'دعم إعداد الإقرارات الضريبية'),
      d(
        'forecasting',
        'Cash flow, forecasting and plain-language financial reports',
        'التدفق النقدي والتوقعات والتقارير المالية بلغة واضحة',
      ),
    ],
    doesNot: [
      n('Move money', 'لا يحرّك الأموال'),
      n('Sign payments', 'لا يوقّع على مدفوعات'),
      n('File tax alone without human approval', 'لا يقدّم إقراراً ضريبياً دون موافقة بشرية'),
    ],
    examples: [
      n(
        'Close this month: reconcile bank and invoices, draft the P and L, flag unmatched items.',
        'اقفل الشهر ده: طابق البنك مع الفواتير، وجهّز قائمة الأرباح والخسائر، ونبّهني على أي حاجة مش متطابقة.',
      ),
      n(
        'Forecast next quarter cash flow from current pipeline and costs.',
        'اعمل توقع للتدفق النقدي للربع الجاي من المبيعات والتكاليف الحالية.',
      ),
    ],
    id: 'accounting-finance',
    managerName: n('Finance Manager', 'مدير المحاسبة والمالية'),
    mission: n(
      'Keep the money true, on time, and forecastable.',
      'إبقاء الأرقام المالية صحيحة وفي وقتها وقابلة للتوقع.',
    ),
    name: n('Accounting and Finance', 'المحاسبة والمالية'),
    specialists: [
      sp('bookkeeping', 'Bookkeeping Specialist', 'متخصص مسك الدفاتر'),
      sp('payroll', 'Payroll Specialist', 'متخصص الرواتب'),
      sp('budgeting', 'Budgeting Specialist', 'متخصص الميزانيات'),
      sp('tax', 'Tax Specialist', 'متخصص الضرائب'),
      sp('forecasting', 'Forecasting Specialist', 'متخصص التوقعات'),
    ],
    tier: 'starter',
  },
  {
    avatarKey: '03-marketing',
    does: [
      d('research', 'Market and competitor research', 'أبحاث السوق والمنافسين'),
      d('brand', 'Brand and messaging', 'العلامة التجارية والرسائل'),
      d('campaigns', 'Campaigns and content', 'الحملات والمحتوى'),
      d(
        'ads',
        'Social and ads management, as drafts',
        'إدارة الشبكات الاجتماعية والإعلانات، كمسودات',
      ),
      d('leads', 'Lead generation and lead scoring', 'توليد العملاء المحتملين وتقييمهم'),
      d('reporting', 'SEO and analytics reporting', 'تقارير SEO والتحليلات'),
    ],
    doesNot: [
      n('Spend budget alone', 'لا يُنفق الميزانية بمفرده'),
      n('Publish brand statements alone', 'لا ينشر بيانات العلامة التجارية بمفرده'),
      n(
        'Contact customers with promises Sales cannot keep',
        'لا يتواصل مع العملاء بوعود لا تستطيع المبيعات الوفاء بها',
      ),
    ],
    examples: [
      n(
        'Launch the product campaign: content, ads and a landing page, with a daily lead report.',
        'اعمل حملة إطلاق للمنتج الجديد: محتوى وإعلانات وصفحة هبوط، وتقرير يومي بالليدز.',
      ),
      n(
        'Research competitors this month and draft a positioning brief.',
        'ابحث في المنافسين الشهر ده واكتب ورقة تموضع.',
      ),
    ],
    id: 'marketing',
    managerName: n('Marketing Manager', 'مدير التسويق'),
    mission: n(
      'Make the right people know, trust, and try the company.',
      'جعل الأشخاص المناسبين يعرفون الشركة ويثقون بها ويجربونها.',
    ),
    name: n('Marketing', 'التسويق'),
    specialists: [
      sp('research', 'Research Specialist', 'متخصص البحث'),
      sp('brand', 'Brand Specialist', 'متخصص العلامة التجارية'),
      sp('campaigns', 'Campaigns Specialist', 'متخصص الحملات'),
      sp('leads', 'Leads Specialist', 'متخصص العملاء المحتملين'),
    ],
    tier: 'starter',
  },
  {
    avatarKey: '04-sales',
    does: [
      d('conversion', 'Lead qualification and follow-up', 'تأهيل العملاء المحتملين ومتابعتهم'),
      d('pipeline', 'Pipeline management', 'إدارة خط المبيعات'),
      d('proposals', 'Proposals and quotes', 'العروض وعروض الأسعار'),
      d(
        'closing',
        'Closing, hand-over to Operations and Support, and revenue reporting',
        'إغلاق الصفقات والتسليم للعمليات والدعم وتقارير الإيرادات',
      ),
    ],
    doesNot: [
      n('Discount alone beyond its rule', 'لا يمنح خصماً يتجاوز قاعدته بمفرده'),
      n('Promise features that do not exist', 'لا يعد بميزات غير موجودة'),
      n('Close a deal without the agreed approvals', 'لا يغلق صفقة دون الموافقات المتفق عليها'),
    ],
    examples: [
      n(
        "Work this week's leads: qualify, follow up, and move qualified ones to proposal.",
        'اشتغل على ليدز الأسبوع ده: أهّلهم وتابعهم وحوّل المؤهلين لعرض سعر.',
      ),
      n(
        'Draft a proposal for client X from the agreed price list and terms.',
        'جهّز عرض سعر للعميل س من قائمة الأسعار والشروط المتفق عليها.',
      ),
    ],
    id: 'sales',
    managerName: n('Sales Manager', 'مدير المبيعات'),
    mission: n(
      'Turn leads into revenue, honestly and on pipeline.',
      'تحويل العملاء المحتملين إلى إيرادات بصدق وضمن خط المبيعات.',
    ),
    name: n('Sales', 'المبيعات'),
    specialists: [
      sp('conversion', 'Lead Conversion Specialist', 'متخصص تحويل العملاء'),
      sp('pipeline', 'Pipeline Specialist', 'متخصص خط المبيعات'),
      sp('proposals', 'Proposals Specialist', 'متخصص العروض'),
      sp('closing', 'Closing and Revenue Specialist', 'متخصص الإغلاق والإيرادات'),
    ],
    tier: 'starter',
  },
  {
    avatarKey: '05-operations',
    does: [
      d(
        'processes',
        'Processes and SOPs, quality checks',
        'العمليات والإجراءات الموحدة وفحوص الجودة',
      ),
      d('supply-chain', 'Supply chain and vendor coordination', 'سلاسل الإمداد وتنسيق الموردين'),
      d(
        'logistics',
        'Logistics coordination and operational reporting',
        'تنسيق اللوجستيات والتقارير التشغيلية',
      ),
      d('allocation', 'Resource allocation', 'توزيع الموارد'),
    ],
    doesNot: [
      n('Change a core process alone', 'لا يغيّر عملية أساسية بمفرده'),
      n('Sign a vendor contract alone', 'لا يوقّع عقد مورد بمفرده'),
      n('Override a Legal or Finance rule', 'لا يتجاوز قاعدة قانونية أو مالية'),
    ],
    examples: [
      n(
        'Run this delivery end to end, track every step, flag delays before they become misses.',
        'شغّل التسليم ده من أوله لآخره، وتابع كل خطوة، ونبّه قبل ما التأخير يبقى فشل.',
      ),
      n(
        'Document the onboarding process as an SOP and assign owners.',
        'وثّق عملية التأهيل كإجراء موحد وحدد المسؤولين.',
      ),
    ],
    id: 'operations',
    managerName: n('Operations Manager', 'مدير العمليات'),
    mission: n(
      'Make delivery repeatable, on time, and without chaos.',
      'جعل التسليم متكرراً وفي موعده وبلا فوضى.',
    ),
    name: n('Operations', 'العمليات'),
    specialists: [
      sp('processes', 'Processes Specialist', 'متخصص العمليات والإجراءات'),
      sp('supply-chain', 'Supply Chain Specialist', 'متخصص سلاسل الإمداد'),
      sp('logistics', 'Logistics Specialist', 'متخصص اللوجستيات'),
      sp('allocation', 'Resource Allocation Specialist', 'متخصص توزيع الموارد'),
    ],
    tier: 'starter',
  },
  {
    avatarKey: '06-customer-support',
    does: [
      d(
        'troubleshooting',
        'Troubleshooting and ticket handling',
        'استكشاف الأعطال ومعالجة التذاكر',
      ),
      d(
        'questions',
        "Answering questions in the customer's language and tone",
        'الإجابة عن الأسئلة بلغة العميل ونبرته',
      ),
      d('retention', 'Retention follow-up', 'متابعة الاحتفاظ بالعملاء'),
      d(
        'satisfaction',
        'Satisfaction follow-up and escalation with full context',
        'متابعة الرضا والتصعيد بسياق كامل',
      ),
    ],
    doesNot: [
      n('Refund or compensate beyond its rule', 'لا يعيد أموالاً أو يعوّض بما يتجاوز قاعدته'),
      n('Change a contract alone', 'لا يغيّر عقداً بمفرده'),
      n(
        'Hide a recurring problem from Operations and Product',
        'لا يخفي مشكلة متكررة عن العمليات والمنتج',
      ),
    ],
    examples: [
      n(
        "Clear today's tickets, solve what you can, escalate the rest with context, and report the top three recurring issues.",
        'صفّي تذاكر النهارده، وحل اللي تقدر عليه، وصعّد الباقي بالسياق، وقولّي أكتر ٣ مشاكل بتتكرر.',
      ),
      n(
        'Follow up with churn-risk customers this week.',
        'تابع العملاء اللي معرّضين للمغادرة الأسبوع ده.',
      ),
    ],
    id: 'customer-support',
    managerName: n('Support Manager', 'مدير دعم العملاء'),
    mission: n(
      "Solve the customer's problem fast, and keep them.",
      'حل مشكلة العميل بسرعة والحفاظ عليه.',
    ),
    name: n('Customer Support', 'دعم العملاء'),
    specialists: [
      sp('troubleshooting', 'Troubleshooting Specialist', 'متخصص استكشاف الأعطال'),
      sp('questions', 'Questions Specialist', 'متخصص الأسئلة والاستفسارات'),
      sp('retention', 'Retention Specialist', 'متخصص الاحتفاظ بالعملاء'),
      sp('satisfaction', 'Satisfaction Specialist', 'متخصص رضا العملاء'),
    ],
    tier: 'starter',
  },
  {
    avatarKey: '07-legal-compliance',
    does: [
      d('contracts', 'Contract drafting and review', 'صياغة العقود ومراجعتها'),
      d('ip', 'IP and trademark checks', 'فحوص الملكية الفكرية والعلامات التجارية'),
      d('regulation', 'Regulation and compliance checklists', 'قوائم اللوائح والامتثال'),
      d(
        'risk',
        'Risk flags on deals, campaigns and hires, document control',
        'تنبيهات المخاطر على الصفقات والحملات والتعيينات وضبط المستندات',
      ),
    ],
    doesNot: [
      n(
        'Give a final legal opinion alone on a high-risk matter',
        'لا يقدّم رأياً قانونياً نهائياً بمفرده في مسألة عالية المخاطر',
      ),
      n('Sign on behalf of the company', 'لا يوقّع نيابة عن الشركة'),
      n(
        'Replace a human lawyer where the law requires one',
        'لا يحل محل المحامي حيث يشترط القانون ذلك',
      ),
    ],
    examples: [
      n(
        'Review this contract, flag risky clauses in plain language, and draft the safer version.',
        'راجع العقد ده ونبّهني على البنود الخطرة بلغة بسيطة واكتب نسخة أكتر أماناً.',
      ),
      n(
        'Check this campaign against current advertising and data rules.',
        'راجع الحملة دي على قواعد الإعلان والبيانات الحالية.',
      ),
    ],
    id: 'legal-compliance',
    managerName: n('Legal Manager', 'مدير الشؤون القانونية'),
    mission: n('Keep the company safe, compliant, and clear.', 'إبقاء الشركة آمنة وملتزمة وواضحة.'),
    name: n('Legal and Compliance', 'الشؤون القانونية والامتثال'),
    specialists: [
      sp('contracts', 'Contracts Specialist', 'متخصص العقود'),
      sp('ip', 'IP Specialist', 'متخصص الملكية الفكرية'),
      sp('regulation', 'Regulation Specialist', 'متخصص اللوائح'),
      sp('risk', 'Risk Specialist', 'متخصص المخاطر'),
    ],
    tier: 'growth',
  },
  {
    avatarKey: '08-information-technology',
    does: [
      d('hardware', 'Hardware management and device setup', 'إدارة الأجهزة وإعدادها'),
      d('software', 'Software management and updates', 'إدارة البرمجيات وتحديثها'),
      d('networks', 'Networks and access', 'الشبكات والوصول'),
      d('helpdesk', 'Helpdesk and troubleshooting', 'الدعم الفني واستكشاف الأعطال'),
      d(
        'security',
        'Security checks, updates and backups',
        'فحوص الأمان والتحديثات والنسخ الاحتياطي',
      ),
    ],
    doesNot: [
      n('Grant admin access alone', 'لا يمنح صلاحيات المسؤول بمفرده'),
      n('Change a security rule alone', 'لا يغيّر قاعدة أمنية بمفرده'),
      n(
        'Access private department data beyond its IT need',
        'لا يصل إلى بيانات قسم خاصة بما يتجاوز حاجته التقنية',
      ),
    ],
    examples: [
      n(
        'Set up a new employee device: accounts, access and security, ready on day one.',
        'جهّز جهاز موظف جديد: حسابات وصلاحيات وأمان، جاهز من أول يوم.',
      ),
      n(
        'Run the weekly security check, patch what is safe, and report what needs a human decision.',
        'شغّل فحص الأمان الأسبوعي، وحدّث اللي آمن، وقولّي إيه اللي محتاج قرار بشري.',
      ),
    ],
    id: 'information-technology',
    managerName: n('IT Manager', 'مدير تقنية المعلومات'),
    mission: n(
      'Keep systems, devices, and data working and secure.',
      'إبقاء الأنظمة والأجهزة والبيانات تعمل وآمنة.',
    ),
    name: n('Information Technology', 'تقنية المعلومات'),
    specialists: [
      sp('hardware', 'Hardware Specialist', 'متخصص الأجهزة'),
      sp('software', 'Software Specialist', 'متخصص البرمجيات'),
      sp('networks', 'Networks Specialist', 'متخصص الشبكات'),
      sp('helpdesk', 'Helpdesk Specialist', 'متخصص الدعم الفني'),
      sp('security', 'Security Specialist', 'متخصص الأمن'),
    ],
    tier: 'growth',
  },
];

/** Departments 9 to 15 plus Custom. Templates only: no approved avatar and no agents yet. */
export interface ExtraDepartmentSpec {
  id: string;
  mission: Bi;
  name: Bi;
  tier: DepartmentTier;
}

export const EXTRA_DEPARTMENT_SPECS: ExtraDepartmentSpec[] = [
  {
    id: 'product-engineering',
    mission: n('Build and improve what the company sells.', 'بناء وتحسين ما تبيعه الشركة.'),
    name: n('Product and Engineering', 'المنتج والهندسة'),
    tier: 'enterprise',
  },
  {
    id: 'data-analytics',
    mission: n(
      'Turn company data into numbers people can trust and use.',
      'تحويل بيانات الشركة إلى أرقام يمكن الوثوق بها واستخدامها.',
    ),
    name: n('Data and Analytics', 'البيانات والتحليلات'),
    tier: 'enterprise',
  },
  {
    id: 'procurement-supply-chain',
    mission: n(
      'Buy well, from the right vendors, at the right time.',
      'الشراء الجيد من الموردين المناسبين في الوقت المناسب.',
    ),
    name: n('Procurement and Supply Chain', 'المشتريات وسلاسل الإمداد'),
    tier: 'enterprise',
  },
  {
    id: 'customer-success',
    mission: n('Help customers get value and renew.', 'مساعدة العملاء على تحقيق القيمة والتجديد.'),
    name: n('Customer Success', 'نجاح العملاء'),
    tier: 'enterprise',
  },
  {
    id: 'security',
    mission: n('Protect systems and data from threats.', 'حماية الأنظمة والبيانات من التهديدات.'),
    name: n('Security', 'الأمن'),
    tier: 'enterprise',
  },
  {
    id: 'corporate-communications',
    mission: n(
      'Speak for the company clearly, inside and outside.',
      'التحدث باسم الشركة بوضوح داخلياً وخارجياً.',
    ),
    name: n('Corporate Communications', 'الاتصال المؤسسي'),
    tier: 'enterprise',
  },
  {
    id: 'admin-facilities',
    mission: n('Keep offices, assets and travel running.', 'إبقاء المكاتب والأصول والسفر تعمل.'),
    name: n('Administration and Facilities', 'الإدارة والمرافق'),
    tier: 'optional',
  },
  {
    id: 'custom',
    mission: n(
      'A department you define: name, mission and rules.',
      'قسم تعرّفه أنت: الاسم والمهمة والقواعد.',
    ),
    name: n('Custom department', 'قسم مخصص'),
    tier: 'custom',
  },
];

/** Individual agents, proposed for launch. Catalog only, coming soon. */
export interface IndividualSpec {
  id: string;
  major: string;
  name: Bi;
  summary: Bi;
}

export const INDIVIDUAL_SPECS: IndividualSpec[] = [
  {
    id: 'ind-chief-of-staff',
    major: 'organisation',
    name: n('Chief of staff', 'رئيس الأركان الشخصي'),
    summary: n(
      'Your CAO: turns your goals into missions and runs them.',
      'الـ CAO الخاص بك: يحوّل أهدافك إلى مهام ويديرها.',
    ),
  },
  {
    id: 'ind-planner',
    major: 'organisation',
    name: n('Planner', 'المخطط'),
    summary: n('Plans your week, tasks and deadlines.', 'يخطط أسبوعك ومهامك ومواعيدك.'),
  },
  {
    id: 'ind-research',
    major: 'research',
    name: n('Research assistant', 'مساعد البحث'),
    summary: n('Finds and summarises sources with links.', 'يجد المصادر ويلخصها مع الروابط.'),
  },
  {
    id: 'ind-study',
    major: 'research',
    name: n('Study coach', 'مدرب الدراسة'),
    summary: n('Builds study plans and tests you.', 'يبني خطط الدراسة ويختبرك.'),
  },
  {
    id: 'ind-writer',
    major: 'writing',
    name: n('Writer and editor', 'الكاتب والمحرر'),
    summary: n('Drafts and edits in Arabic and English.', 'يكتب ويحرر بالعربية والإنجليزية.'),
  },
  {
    id: 'ind-translator',
    major: 'writing',
    name: n('Translator by dialect', 'المترجم حسب اللهجة'),
    summary: n(
      'Translates between named Arabic dialects and English.',
      'يترجم بين لهجات عربية مسماة والإنجليزية.',
    ),
  },
  {
    id: 'ind-career',
    major: 'career',
    name: n('CV and job-search coach', 'مدرب السيرة الذاتية والبحث عن عمل'),
    summary: n(
      'Improves your CV and prepares applications.',
      'يحسّن سيرتك الذاتية ويجهز طلبات التوظيف.',
    ),
  },
  {
    id: 'ind-budget',
    major: 'money',
    name: n('Personal budget helper', 'مساعد الميزانية الشخصية'),
    summary: n('Tracks spending against your own budget.', 'يتابع إنفاقك مقابل ميزانيتك.'),
  },
  {
    id: 'ind-contract-reader',
    major: 'legal-reading',
    name: n('Contract and lease reader', 'قارئ العقود وعقود الإيجار'),
    summary: n(
      'Flags risky clauses in plain language. Not legal advice.',
      'ينبّه إلى البنود الخطرة بلغة بسيطة. ليس استشارة قانونية.',
    ),
  },
  {
    id: 'ind-designer',
    major: 'creative-technical',
    name: n('Designer', 'المصمم'),
    summary: n('Drafts layouts and visual ideas.', 'يصمم مسودات التخطيطات والأفكار البصرية.'),
  },
  {
    id: 'ind-developer',
    major: 'creative-technical',
    name: n('Developer helper', 'مساعد المطور'),
    summary: n('Explains and drafts code for you to review.', 'يشرح الكود ويكتب مسودات لتراجعها.'),
  },
];
