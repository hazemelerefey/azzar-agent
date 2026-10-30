import { useTranslation } from 'react-i18next';

import type { Bi, Lang } from '../catalog';

/**
 * Self-contained Arabic/English dictionary for the workbench. The repo's locale files are shared
 * with the rest of the product, so the workbench keeps its own strings and does not touch them.
 * Arabic is formal (Modern Standard); Egyptian wording appears only in sample mission text.
 */
const dict = {
  // Required on-screen labels
  simulated: { ar: 'محاكاة', en: 'Simulated' },
  simulatedNote: {
    ar: 'هذا التشغيل محاكاة. لا يتم استدعاء أي نموذج ولا تنفيذ أي إجراء حقيقي.',
    en: 'This run is simulated. No model is called and no real action is taken.',
  },
  live: { ar: 'تشغيل حي', en: 'Live LLM' },
  liveNote: {
    ar: 'تشغيل حقيقي مباشر مدعوم بنموذج الذكاء الاصطناعي المحلي (Ollama). يتم توليد الخطط والأبحاث والمحتوى في الوقت الفعلي.',
    en: 'Live run powered by local Ollama LLM. Plans, research, and campaign copy are generated in real-time.',
  },
  executionMode: { ar: 'وضع التنفيذ', en: 'Execution mode' },
  modelChoice: { ar: 'النموذج المحلي', en: 'Local model' },
  liveLLM: { ar: 'ذكاء اصطناعي حقيقي (Ollama)', en: 'Live LLM (Ollama)' },
  generatingStep: { ar: 'جاري التوليد بواسطة النموذج...', en: 'Generating with model...' },
  uiOnly: { ar: 'واجهة فقط', en: 'UI only' },
  localCatalog: { ar: 'كتالوج محلي', en: 'Local catalog' },
  groupingNotInfra: {
    ar: 'تجميع منطقي وليس عزلًا بنيويًا',
    en: 'Grouping, not infrastructure',
  },
  comingSoon: { ar: 'قريبًا', en: 'Coming soon' },
  available: { ar: 'متاح', en: 'Available' },

  // Nav
  navHome: { ar: 'المهام', en: 'Missions' },
  navMarketplace: { ar: 'السوق', en: 'Marketplace' },
  navAgents: { ar: 'وكلائي', en: 'My Agents' },
  navProjects: { ar: 'المشاريع', en: 'Projects' },
  navDepartments: { ar: 'الأقسام', en: 'Departments' },
  navCao: { ar: 'شجرة المدير التنفيذي', en: 'CAO tree' },
  navBriefing: { ar: 'الملخص', en: 'Briefing' },
  navClassic: { ar: 'الصفحة الرئيسية الكلاسيكية', en: 'Classic home' },

  // Mode choice
  modeTitle: { ar: 'كيف ستستخدم AZZAR؟', en: 'How will you use AZZAR?' },
  modeSubtitle: {
    ar: 'يمكنك التبديل في أي وقت. التبديل لا يحذف أي بيانات.',
    en: 'You can switch at any time. Switching never deletes data.',
  },
  modeCompany: { ar: 'شركة', en: 'Company' },
  modeCompanyDesc: {
    ar: 'أقسام ومشاريع ووكلاء ومدير تنفيذي للوكلاء يرتب العمل بينها.',
    en: 'Departments, projects, agents and a Chief Agent Orchestrator that coordinates them.',
  },
  modeIndividual: { ar: 'فرد', en: 'Individual' },
  modeIndividualDesc: {
    ar: 'وكلاؤك ومشاريعك الشخصية بدون أقسام.',
    en: 'Your own agents and projects, without departments.',
  },
  modeSwitch: { ar: 'تبديل الوضع', en: 'Switch mode' },
  modeSwitchNote: {
    ar: 'عند الانتقال إلى وضع الفرد تُخفى بيانات الشركة ولا تُحذف، ويمكنك العودة إليها.',
    en: 'Moving to Individual hides company data without deleting it. You can switch back.',
  },
  modeCurrent: { ar: 'الوضع الحالي', en: 'Current mode' },
  companyOnly: {
    ar: 'هذه الصفحة متاحة في وضع الشركة فقط.',
    en: 'This page is available in Company mode only.',
  },

  resetDemo: { ar: 'مسح بيانات العرض', en: 'Reset demo data' },
  resetConfirm: {
    ar: 'سيتم مسح كل بيانات العرض المحفوظة في هذا المتصفح. المتابعة؟',
    en: 'This clears all demo data stored in this browser. Continue?',
  },

  // Missions
  missionsTitle: { ar: 'المهام', en: 'Missions' },
  missionsSubtitle: {
    ar: 'حدّد الهدف والمسؤول والموعد النهائي، ثم اترك الوكيل يعمل.',
    en: 'Set the goal, the owner and the deadline, then let the agent work.',
  },
  newMission: { ar: 'مهمة جديدة', en: 'New mission' },
  missionScript: { ar: 'نوع المهمة', en: 'Mission type' },
  missionGoal: { ar: 'الهدف', en: 'Goal' },
  missionOwner: { ar: 'المسؤول', en: 'Owner' },
  missionDeadline: { ar: 'الموعد النهائي', en: 'Deadline' },
  missionApprovals: { ar: 'موافقات إضافية مطلوبة', en: 'Extra approvals needed' },
  missionApprovalsHint: {
    ar: 'يمكنك تشديد القواعد لهذه المهمة فقط. لا يمكنك تخفيفها.',
    en: 'You can make the Rules stricter for this mission only. You cannot loosen them.',
  },
  missionCriteria: { ar: 'معايير النجاح', en: 'Success criteria' },
  missionCriteriaHint: { ar: 'معيار في كل سطر.', en: 'One criterion per line.' },
  launch: { ar: 'ابدأ المهمة', en: 'Start mission' },
  noMissions: { ar: 'لا توجد مهام بعد.', en: 'No missions yet.' },
  setupFirst: { ar: 'قبل أن تبدأ مهمة:', en: 'Before you start a mission:' },
  setupInstall: {
    ar: 'ثبّت مدير قسم متاح من السوق.',
    en: 'Install an available department manager from the Marketplace.',
  },
  setupActivate: {
    ar: 'فعّل قسم هذا المدير من صفحة الأقسام.',
    en: "Activate that manager's department on the Departments page.",
  },
  setupAssign: {
    ar: 'أسند الوكيل إلى القسم من صفحة وكلائي.',
    en: 'Assign the agent to the department in My Agents.',
  },
  setupInstallIndividual: {
    ar: 'ثبّت وكيلًا متاحًا من السوق.',
    en: 'Install an available agent from the Marketplace.',
  },
  noAvailableScripts: {
    ar: 'لا توجد أنواع مهام جاهزة لهذا الاختيار بعد.',
    en: 'No mission types are ready for this choice yet.',
  },
  whileAway: { ar: 'أثناء غيابك', en: 'While you were away' },
  needsYou: { ar: 'يحتاج إلى قرارك', en: 'Needs your decision' },
  statusRunning: { ar: 'قيد التنفيذ', en: 'Running' },
  statusWaiting: { ar: 'بانتظار موافقتك', en: 'Waiting for your approval' },
  statusCompleted: { ar: 'مكتملة', en: 'Completed' },
  statusCancelled: { ar: 'ملغاة', en: 'Cancelled' },
  errInvalid: {
    ar: 'أكمل الهدف ومعيار نجاح واحدًا على الأقل والموعد النهائي.',
    en: 'Fill in the goal, at least one success criterion and the deadline.',
  },
  errNotInstalled: { ar: 'الوكيل غير مثبّت بعد.', en: 'The agent is not installed yet.' },
  errNotAssigned: {
    ar: 'الوكيل غير مسند إلى هذا القسم أو المشروع.',
    en: 'The agent is not assigned to this department or project.',
  },
  errInactive: { ar: 'القسم غير مفعّل.', en: 'The department is not active.' },
  errPaused: { ar: 'الوكيل متوقف مؤقتًا.', en: 'The agent is paused.' },
  errComingSoon: {
    ar: 'هذا القسم أو الوكيل غير متاح بعد.',
    en: 'This department or agent is not available yet.',
  },
  errGeneric: { ar: 'تعذر تنفيذ الطلب.', en: 'The request could not be completed.' },

  // Mission page
  step: { ar: 'تقدّم خطوة', en: 'Next step' },
  runAll: { ar: 'شغّل حتى التوقف', en: 'Run until it pauses' },
  cancel: { ar: 'إلغاء المهمة', en: 'Cancel mission' },
  goalGraph: { ar: 'مخطط الهدف', en: 'Goal graph' },
  specialistsNow: { ar: 'المتخصصون النشطون الآن', en: 'Active specialists now' },
  noneActive: {
    ar: 'لا أحد. يُغلق كل متخصص عند انتهاء عمله.',
    en: 'None. Each specialist is closed when its job ends.',
  },
  timeline: { ar: 'السجل', en: 'Timeline' },
  approvalCard: { ar: 'طلب موافقة', en: 'Approval request' },
  approve: { ar: 'موافقة', en: 'Approve' },
  reject: { ar: 'رفض', en: 'Reject' },
  approvalNote: {
    ar: 'بوابة موافقة حقيقية محفوظة في قاعدة البيانات وتُستهلك ذريًا لمرة واحدة.',
    en: 'Real durable approval gate stored in PostgreSQL and consumed atomically once.',
  },
  approved: { ar: 'تمت الموافقة', en: 'Approved' },
  rejected: { ar: 'تم الرفض', en: 'Rejected' },
  reportTitle: { ar: 'تقرير الإنجاز', en: 'Completion report' },
  reportOutcome: { ar: 'النتيجة', en: 'Outcome' },
  reportDone: { ar: 'ما أُنجز', en: 'Done' },
  reportEvidence: { ar: 'الأدلة', en: 'Evidence' },
  reportBlockers: { ar: 'العوائق', en: 'Blockers' },
  reportDecisions: { ar: 'قرارات مطلوبة منك', en: 'Decisions for you' },
  reportNext: { ar: 'الخطوة التالية', en: 'Next step' },
  reportedActions: { ar: 'إجراءات نُفذت وأُبلغ عنها', en: 'Actions taken and reported' },
  cost: { ar: 'التكلفة الفعلية', en: 'Cost' },
  budget: { ar: 'الحد الأقصى للميزانية', en: 'Budget cap' },
  back: { ar: 'رجوع', en: 'Back' },
  open: { ar: 'فتح', en: 'Open' },
  notFound: { ar: 'غير موجود.', en: 'Not found.' },

  // Marketplace
  marketTitle: { ar: 'السوق', en: 'Marketplace' },
  marketSubtitle: {
    ar: 'اختر الوكلاء وثبّتهم، ثم أسندهم إلى الأقسام والمشاريع.',
    en: 'Pick agents and install them, then assign them to departments and projects.',
  },
  install: { ar: 'تثبيت', en: 'Install' },
  installed: { ar: 'مثبّت', en: 'Installed' },
  allDepartments: { ar: 'الكل', en: 'All' },
  individualAgents: { ar: 'وكلاء الأفراد', en: 'Individual agents' },
  doesLabel: { ar: 'ما يفعله', en: 'What it does' },
  doesNotLabel: { ar: 'ما لا يفعله', en: 'What it does not do' },
  roleLabel: { ar: 'دوره', en: 'Role' },
  toolsLabel: { ar: 'الأدوات ومستوى الموافقة', en: 'Tools and approval level' },
  canTouch: { ar: 'يمكنه الوصول إلى', en: 'Can touch' },
  cannotTouch: { ar: 'لا يمكنه الوصول إلى', en: 'Cannot touch' },
  modelReq: { ar: 'متطلبات النموذج', en: 'Model requirements' },
  specialistsLabel: { ar: 'المتخصصون المؤقتون', en: 'Temporary specialists' },
  examples: { ar: 'أمثلة على المهام', en: 'Example missions' },
  systemRoleLabel: {
    ar: 'الدور الكامل للوكيل (النص الإنتاجي)',
    en: 'Full agent role (production text)',
  },
  needsConnector: {
    ar: 'يحتاج موصلًا قبل التشغيل الحقيقي',
    en: 'Needs a connector before a real run',
  },
  marketNote: {
    ar: 'كتالوج محلي ضمن التطبيق. لا يوجد خادم سوق بعد.',
    en: 'A catalog bundled with the app. There is no marketplace backend yet.',
  },
  tools: { ar: 'أدوات', en: 'tools' },

  // Approval levels
  levelAlone: { ar: 'يعمل وحده', en: 'Alone' },
  levelReport: { ar: 'ينفذ ويبلغ', en: 'Acts, then reports' },
  levelTap: { ar: 'يطلب موافقة', en: 'Asks first' },
  levelForbidden: { ar: 'ممنوع', en: 'Forbidden' },

  // My agents
  agentsTitle: { ar: 'وكلائي', en: 'My Agents' },
  agentsSubtitle: {
    ar: 'الوكلاء المثبّتون وأماكن عملهم.',
    en: 'Installed agents and where they work.',
  },
  noAgents: { ar: 'لم تثبّت أي وكيل بعد.', en: 'No agents installed yet.' },
  goMarketplace: { ar: 'اذهب إلى السوق', en: 'Go to the Marketplace' },
  worksIn: { ar: 'يعمل في', en: 'Works in' },
  assignDepartment: { ar: 'إسناد إلى قسم', en: 'Assign to a department' },
  assignProject: { ar: 'إسناد إلى مشروع', en: 'Assign to a project' },
  unassign: { ar: 'إزالة', en: 'Remove' },
  uninstall: { ar: 'إلغاء التثبيت', en: 'Uninstall' },
  nowhere: { ar: 'غير مسند بعد', en: 'Not assigned yet' },
  choose: { ar: 'اختر...', en: 'Choose...' },
  alsoMultiple: {
    ar: 'يمكن للوكيل الواحد أن يعمل في عدة أقسام ومشاريع.',
    en: 'One agent can work in several departments and projects.',
  },

  // Projects
  projectsTitle: { ar: 'المشاريع', en: 'Projects' },
  projectsSubtitle: {
    ar: 'مشاريع الأقسام والمشاريع المستقلة.',
    en: 'Department projects and standalone projects.',
  },
  newProject: { ar: 'مشروع جديد', en: 'New project' },
  projectName: { ar: 'اسم المشروع', en: 'Project name' },
  projectDescription: { ar: 'الوصف', en: 'Description' },
  projectDepartment: { ar: 'القسم', en: 'Department' },
  standalone: { ar: 'مشروع مستقل (بدون قسم)', en: 'Standalone (no department)' },
  create: { ar: 'إنشاء', en: 'Create' },
  noProjects: { ar: 'لا توجد مشاريع بعد.', en: 'No projects yet.' },
  privateByDefault: { ar: 'خاص', en: 'Private' },
  shared: { ar: 'مشترك', en: 'Shared' },
  visibility: { ar: 'الظهور', en: 'Visibility' },
  inheritTitle: {
    ar: 'ما يرثه المشروع من القسم',
    en: 'What the project inherits from the department',
  },
  inheritPolicies: { ar: 'السياسات والتعليمات', en: 'Policies and instructions' },
  inheritTone: { ar: 'النبرة', en: 'Tone' },
  inheritSources: { ar: 'المصادر المشاركة', en: 'Shared sources' },
  projectContext: { ar: 'سياق المشروع', en: 'Project context' },
  effectiveContext: { ar: 'السياق الفعلي للمشروع', en: 'Effective project context' },
  save: { ar: 'حفظ', en: 'Save' },
  nothingInherited: { ar: 'لا شيء موروث.', en: 'Nothing inherited.' },

  // Departments
  deptTitle: { ar: 'الأقسام', en: 'Departments' },
  deptSubtitle: {
    ar: 'فعّل الأقسام التي تحتاجها. بعض الأقسام قيد الإعداد وتظهر كقوالب فقط.',
    en: 'Activate the departments you need. Some are still being prepared and show as templates only.',
  },
  activate: { ar: 'تفعيل', en: 'Activate' },
  deactivate: { ar: 'إيقاف', en: 'Deactivate' },
  active: { ar: 'مفعّل', en: 'Active' },
  starterOffer: { ar: 'عرض البداية: ٥ أقسام', en: 'Starter offer: 5 departments' },
  starterOfferNote: {
    ar: 'اقتراح فقط. يمكنك تفعيل أي قسم من الأقسام الثمانية الأساسية.',
    en: 'A suggestion only. You can activate any of the 8 core departments.',
  },
  activateStarter: { ar: 'فعّل أقسام البداية', en: 'Activate starter departments' },
  coreDepartments: { ar: 'الأقسام الأساسية', en: 'Core departments' },
  moreDepartments: { ar: 'أقسام إضافية', en: 'More departments' },
  customDepartment: { ar: 'قسم مخصص', en: 'Custom department' },
  specialistsCount: { ar: 'متخصصون', en: 'specialists' },
  missionStatement: { ar: 'مهمة القسم', en: 'Department mission' },

  // Hub
  tabOverview: { ar: 'نظرة عامة', en: 'Overview' },
  tabProjects: { ar: 'المشاريع', en: 'Projects' },
  tabAgents: { ar: 'الوكلاء', en: 'Agents' },
  tabSources: { ar: 'المصادر', en: 'Sources' },
  tabContext: { ar: 'السياق', en: 'Context' },
  tabMemory: { ar: 'الذاكرة', en: 'Memory' },
  tabMissions: { ar: 'المهام', en: 'Missions' },
  tabRules: { ar: 'القواعد', en: 'Rules' },
  recommended: { ar: 'الوكلاء الموصى بهم', en: 'Recommended agents' },
  recommendedWhy: { ar: 'سبب التوصية', en: 'Why recommended' },
  deptDoes: { ar: 'ما يقوم به القسم', en: 'What the department does' },
  deptDoesNot: { ar: 'ما لا يقوم به القسم', en: 'What the department does not do' },
  notActive: { ar: 'هذا القسم غير مفعّل.', en: 'This department is not active.' },
  templateOnly: {
    ar: 'هذا القسم قالب فقط في هذا الإصدار. لا يعمل وكلاؤه بعد.',
    en: 'This department is a template in this release. Its agents do not work yet.',
  },
  noSources: { ar: 'لا توجد مصادر.', en: 'No sources.' },
  addSource: { ar: 'إضافة مصدر', en: 'Add source' },
  sourceName: { ar: 'اسم المصدر', en: 'Source name' },
  sourceContent: { ar: 'المحتوى أو الرابط', en: 'Content or link' },
  shareable: { ar: 'قابل للمشاركة مع المشاريع', en: 'Shareable with projects' },
  remove: { ar: 'حذف', en: 'Remove' },
  contextField: { ar: 'سياق القسم', en: 'Department context' },
  instructionsField: { ar: 'التعليمات', en: 'Instructions' },
  toneField: { ar: 'النبرة', en: 'Tone' },
  memoryNote: {
    ar: 'تنتقل المعرفة إلى الأعلى كملخصات فقط وبإذن من القواعد. لا تنتقل جانبيًا بين الأقسام.',
    en: 'Knowledge moves up as summaries only, and only when a Rule allows it. It never moves sideways between departments.',
  },
  noMemory: {
    ar: 'لا توجد ذاكرة بعد. تظهر الملخصات بعد اكتمال المهام.',
    en: 'No memory yet. Summaries appear after missions finish.',
  },
  layerGlobal: { ar: 'عامة', en: 'Global' },
  layerDepartment: { ar: 'القسم', en: 'Department' },
  layerProject: { ar: 'المشروع', en: 'Project' },
  layerAgent: { ar: 'الوكيل', en: 'Agent' },
  layerMission: { ar: 'المهمة', en: 'Mission' },

  // Rules console
  rulesTitle: { ar: 'وحدة القواعد', en: 'Rules console' },
  rulesSubtitle: {
    ar: 'تحدد القواعد ما يفعله الوكلاء وحدهم وما يحتاج إلى موافقتك. تسري من المهمة التالية.',
    en: 'Rules set what agents do alone and what needs your approval. They apply from the next run.',
  },
  rulesToolLevels: { ar: 'مستوى كل أداة', en: 'Level per tool' },
  rulesRoleAccess: { ar: 'صلاحيات الأدوار', en: 'Role access' },
  roleManager: { ar: 'المدير', en: 'Manager' },
  roleSpecialist: { ar: 'المتخصص', en: 'Specialist' },
  accessRead: { ar: 'قراءة', en: 'Read' },
  accessWrite: { ar: 'كتابة', en: 'Write' },
  accessSend: { ar: 'إرسال خارجي', en: 'Send outward' },
  rulesRunLocation: { ar: 'مكان التشغيل', en: 'Run location' },
  runEmployeeDevice: { ar: 'جهاز الموظف', en: 'Employee device' },
  runCompanyServer: { ar: 'خادم الشركة', en: 'Company server' },
  runLocationNote: {
    ar: 'للعرض فقط في هذا الإصدار. التشغيل المحاكى لا يعمل في أي مكان.',
    en: 'Shown only in this release. The simulated run does not run anywhere.',
  },
  rulesModel: { ar: 'قفل النموذج', en: 'Model lock' },
  rulesModelLock: { ar: 'تثبيت نموذج واحد للقسم', en: 'Lock one model for the department' },
  rulesModelId: { ar: 'معرّف النموذج', en: 'Model id' },
  rulesModelNote: {
    ar: 'يُحفظ الاختيار ويُعرض فقط. لا يُفرض على الخادم بعد.',
    en: 'The choice is stored and shown only. It is not enforced on the server yet.',
  },
  rulesMemory: { ar: 'الذاكرة', en: 'Memory' },
  rulesDigestDept: {
    ar: 'تلخيص المهام المكتملة إلى ذاكرة القسم',
    en: 'Summarise finished missions into department memory',
  },
  rulesDigestGlobal: {
    ar: 'تلخيص المهام المكتملة إلى الذاكرة العامة',
    en: 'Summarise finished missions into global memory',
  },
  rulesInherit: {
    ar: 'ما تأخذه المشاريع الجديدة افتراضيًا',
    en: 'What new projects take by default',
  },
  rulesIsolation: {
    ar: 'العزل بين الأقسام هنا منطقي في هذا الإصدار.',
    en: 'Isolation between departments is logical in this release.',
  },
  rulesReset: { ar: 'استعادة الافتراضي', en: 'Reset to default' },
  default: { ar: 'الافتراضي', en: 'default' },
  personalRules: { ar: 'قواعدي الشخصية', en: 'My rules' },

  // CAO
  caoTitle: { ar: 'شجرة المدير التنفيذي للوكلاء', en: 'Chief Agent Orchestrator tree' },
  caoSubtitle: {
    ar: 'الشركة والأقسام والمشاريع والوكلاء والمهام في مكان واحد، مع تجميع التكلفة والمخاطر.',
    en: 'Company, departments, projects, agents and missions in one place, with cost and risk rolled up.',
  },
  riskNone: { ar: 'سليم', en: 'Clear' },
  riskRunning: { ar: 'قيد التنفيذ', en: 'Running' },
  riskNeeds: { ar: 'يحتاج قرارًا', en: 'Needs decision' },
  riskBlocked: { ar: 'متعثر', en: 'Blocked' },
  expandAll: { ar: 'توسيع الكل', en: 'Expand all' },
  collapseAll: { ar: 'طي الكل', en: 'Collapse all' },

  // Briefing
  briefTitle: { ar: 'الملخص', en: 'Briefing' },
  briefSubtitle: {
    ar: 'ملخص واحد للشركة بقسم لكل إدارة.',
    en: 'One company briefing with a section per department.',
  },
  briefSubtitleIndividual: { ar: 'ملخصك الشخصي.', en: 'Your personal briefing.' },
  briefEmpty: {
    ar: 'لا شيء جديد. ابدأ مهمة لتظهر هنا.',
    en: 'Nothing yet. Start a mission and it appears here.',
  },
  briefCompleted: { ar: 'اكتملت', en: 'Completed' },
  briefRunning: { ar: 'قيد التنفيذ', en: 'In progress' },
  briefReported: { ar: 'إجراءات نُفذت وأُبلغ عنها', en: 'Actions taken and reported' },
  briefNeeds: { ar: 'تحتاج إلى قرارك', en: 'Need your decision' },
  markSeen: { ar: 'تم الاطلاع', en: 'Mark as seen' },
  newSinceLast: { ar: 'جديد منذ آخر زيارة', en: 'New since your last visit' },
  decisionsCount: { ar: 'قرارات بانتظارك', en: 'decisions waiting' },
} satisfies Record<string, Bi>;

export type AzzarKey = keyof typeof dict;

export const useAzzarLang = (): Lang => {
  const { i18n } = useTranslation();
  return (i18n.language || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en';
};

export const useAzzarT = () => {
  const lang = useAzzarLang();
  return {
    bi: (b: Bi): string => b[lang],
    dir: (lang === 'ar' ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
    lang,
    t: (key: AzzarKey): string => dict[key][lang],
  };
};

export const translate = (key: AzzarKey, lang: Lang): string => dict[key][lang];
export const DICTIONARY_KEYS = Object.keys(dict) as AzzarKey[];
export const dictionaryEntry = (key: AzzarKey): Bi => dict[key];
