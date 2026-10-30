import {
  AssistantCategory,
  type DiscoverAssistantDetail,
  type DiscoverAssistantItem,
} from '@azzar/types';

export const WORKBENCH_ASSISTANTS: Record<
  string,
  {
    avatar: string;
    category: AssistantCategory;
    description: { ar: string; en: string };
    identifier: string;
    tags: string[];
    title: { ar: string; en: string };
    systemRole: { ar: string; en: string };
  }
> = {
  'marketing-manager': {
    avatar: '🎯',
    category: AssistantCategory.Marketing,
    description: {
      ar: 'أبحاث السوق، الهوية، مسودات الحملات، وتسجيل العملاء المحتملين للإطلاق. يستأذن دائماً قبل النشر؛ الإنفاق الإعلاني محظور دون موافقة.',
      en: 'Research, brand, campaign drafts and lead scoring for a launch. Asks before publishing; paid spend is forbidden without approval.',
    },
    identifier: 'marketing-manager',
    systemRole: {
      ar: 'أنت مدير التسويق لمنصة AZZAR. تقود إطلاق الحملات التسويقية، وتنسيق الأبحاث، وتحليل الجمهور المستهدف، وإعداد المسودات الإبداعية للإعلانات والمحتوى.',
      en: 'You are the Marketing Manager for AZZAR. You lead campaign launches, coordinate market research, analyze target audiences, and draft creative campaign assets and copy.',
    },
    tags: ['marketing', 'campaigns', 'azzar-workbench', 'official', 'enterprise'],
    title: {
      ar: 'مدير التسويق (AZZAR Official)',
      en: 'Marketing Manager (AZZAR Official)',
    },
  },
  'hr-manager': {
    avatar: '👥',
    category: AssistantCategory.Career,
    description: {
      ar: 'التوظيف، الإعداد، تقييم الأداء، وتنسيق تدريب الفريق وتطوير المهارات.',
      en: 'Recruitment, onboarding, performance reviews, and team training coordination.',
    },
    identifier: 'hr-manager',
    systemRole: {
      ar: 'أنت مدير الموارد البشرية لمنصة AZZAR. تدير عمليات استقطاب المواهب وإعداد خطط التطوير الوظيفي وتنسيق تقييمات الأداء.',
      en: 'You are the HR Manager for AZZAR. You manage talent acquisition, onboarding workflows, team development, and performance reviews.',
    },
    tags: ['hr', 'recruitment', 'team', 'azzar-workbench', 'official'],
    title: {
      ar: 'مدير الموارد البشرية (AZZAR Official)',
      en: 'HR Manager (AZZAR Official)',
    },
  },
  'sales-manager': {
    avatar: '💼',
    category: AssistantCategory.Career,
    description: {
      ar: 'خط أنابيب المبيعات، تأهيل الصفقات، استراتيجيات الإغلاق، وتوقعات الإيرادات.',
      en: 'Sales pipeline, deal qualification, closing strategies, and revenue forecasting.',
    },
    identifier: 'sales-manager',
    systemRole: {
      ar: 'أنت مدير المبيعات لمنصة AZZAR. تقود المفاوضات التجارية، وتحلل خط الصفقات، وتساعد في إغلاق الصفقات الكبرى.',
      en: 'You are the Sales Manager for AZZAR. You guide commercial outreach, pipeline acceleration, and strategic deal closing.',
    },
    tags: ['sales', 'revenue', 'deals', 'azzar-workbench', 'official'],
    title: {
      ar: 'مدير المبيعات (AZZAR Official)',
      en: 'Sales Manager (AZZAR Official)',
    },
  },
  'finance-manager': {
    avatar: '📊',
    category: AssistantCategory.Office,
    description: {
      ar: 'تحليل الميزانية، التدفق النقدي، الرقابة المالية، وتوقعات التكاليف.',
      en: 'Budget analysis, cash flow oversight, financial controls, and runway forecasting.',
    },
    identifier: 'finance-manager',
    systemRole: {
      ar: 'أنت مدير المالية لمنصة AZZAR. تدير التدقيق المالي، وتحليل هوامش الربح، والميزانيات التقديرية.',
      en: 'You are the Finance Manager for AZZAR. You oversee cash runway, financial audits, profit margins, and budgeting.',
    },
    tags: ['finance', 'budget', 'azzar-workbench', 'official'],
    title: {
      ar: 'مدير المالية (AZZAR Official)',
      en: 'Finance Manager (AZZAR Official)',
    },
  },
  'operations-manager': {
    avatar: '⚙️',
    category: AssistantCategory.Office,
    description: {
      ar: 'كفاءة سير العمل، تتبع المشاريع، توثيق الإجراءات التشغيلية القياسية.',
      en: 'Workflow efficiency, project tracking, SOP documentation, and resource allocation.',
    },
    identifier: 'operations-manager',
    systemRole: {
      ar: 'أنت مدير العمليات لمنصة AZZAR. تحسن كفاءة الإجراءات اليومية وتزيل العوائق أمام فرق العمل.',
      en: 'You are the Operations Manager for AZZAR. You optimize operational bottlenecks and standardize company procedures.',
    },
    tags: ['operations', 'processes', 'azzar-workbench', 'official'],
    title: {
      ar: 'مدير العمليات (AZZAR Official)',
      en: 'Operations Manager (AZZAR Official)',
    },
  },
  'support-manager': {
    avatar: '🎧',
    category: AssistantCategory.General,
    description: {
      ar: 'رضا العملاء، تصعيد التذاكر، قاعدة المعرفة، ومقاييس سرعة الحل.',
      en: 'Customer satisfaction, ticket escalation, knowledge base triage, and SLA metrics.',
    },
    identifier: 'support-manager',
    systemRole: {
      ar: 'أنت مدير الدعم الفني وخدمة العملاء لمنصة AZZAR. تضمن الاستجابة السريعة وحل مشكلات العملاء بأعلى جودة.',
      en: 'You are the Customer Support Manager for AZZAR. You ensure top-tier resolution rates and customer happiness.',
    },
    tags: ['support', 'customer-service', 'azzar-workbench', 'official'],
    title: {
      ar: 'مدير الدعم الفني (AZZAR Official)',
      en: 'Support Manager (AZZAR Official)',
    },
  },
  'legal-manager': {
    avatar: '⚖️',
    category: AssistantCategory.Office,
    description: {
      ar: 'مراجعة العقود، الامتثال التنظيمي، إدارة المخاطر، وسياسات الخصوصية.',
      en: 'Contract review, regulatory compliance, risk management, and privacy policies.',
    },
    identifier: 'legal-manager',
    systemRole: {
      ar: 'أنت المستشار القانوني لمنصة AZZAR. تدقق العقود، وتراجع شروط الاستخدام والخصوصية، وتضمن الامتثال التنظيمي.',
      en: 'You are the Legal Counsel for AZZAR. You review contracts, terms of service, and regulatory compliance.',
    },
    tags: ['legal', 'contracts', 'compliance', 'azzar-workbench', 'official'],
    title: {
      ar: 'المستشار القانوني (AZZAR Official)',
      en: 'Legal Manager (AZZAR Official)',
    },
  },
  'it-manager': {
    avatar: '💻',
    category: AssistantCategory.Programming,
    description: {
      ar: 'أمن البنية التحتية، إدارة الوصول، استقرار الأنظمة، واستجابة الحوادث.',
      en: 'Infrastructure security, access management, system reliability, and incident response.',
    },
    identifier: 'it-manager',
    systemRole: {
      ar: 'أنت مدير تقنية المعلومات والبنية التحتية لمنصة AZZAR. تحافظ على أمن البيانات واستقرار الأنظمة التقنية.',
      en: 'You are the IT Manager for AZZAR. You monitor infrastructure reliability, access control, and platform security.',
    },
    tags: ['it', 'infrastructure', 'security', 'azzar-workbench', 'official'],
    title: {
      ar: 'مدير تقنية المعلومات (AZZAR Official)',
      en: 'IT Manager (AZZAR Official)',
    },
  },
};

export const getWorkbenchAssistantItems = (locale?: string): DiscoverAssistantItem[] => {
  const isAr = locale?.startsWith('ar');
  return Object.values(WORKBENCH_ASSISTANTS).map((item) => ({
    author: 'AZZAR',
    avatar: item.avatar,
    category: item.category,
    createdAt: '2026-10-30',
    description: isAr ? item.description.ar : item.description.en,
    homepage: 'https://azzar.app',
    identifier: item.identifier,
    isValidated: true,
    knowledgeCount: 0,
    tags: item.tags,
    title: isAr ? item.title.ar : item.title.en,
    tokenUsage: 2500,
  }));
};

export const getWorkbenchAssistantDetail = (
  identifier: string,
  locale?: string,
): DiscoverAssistantDetail | undefined => {
  const item = WORKBENCH_ASSISTANTS[identifier];
  if (!item) return undefined;
  const isAr = locale?.startsWith('ar');
  const items = getWorkbenchAssistantItems(locale);
  const baseItem = items.find((i) => i.identifier === identifier)!;

  return {
    ...baseItem,
    config: {
      chatConfig: { displayMode: 'chat' },
      model: 'qwen2.5:7b',
      params: { temperature: 0.6 },
      provider: 'ollama',
      systemRole: isAr ? item.systemRole.ar : item.systemRole.en,
    } as any,
    currentVersion: '1.0.0',
    examples: [],
    isValidated: true,
    related: items.filter((i) => i.identifier !== identifier).slice(0, 4),
    summary: isAr ? item.description.ar : item.description.en,
    versions: [
      {
        createdAt: '2026-10-30',
        isLatest: true,
        isValidated: true,
        version: '1.0.0',
      },
    ],
  };
};
