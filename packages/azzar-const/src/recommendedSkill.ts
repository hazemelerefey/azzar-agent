export enum RecommendedSkillType {
  Builtin = 'builtin',
  Composio = 'composio',
  Azzar = 'azzar',
}

export interface RecommendedSkillItem {
  id: string;
  type: RecommendedSkillType;
}

export const RECOMMENDED_SKILLS: RecommendedSkillItem[] = [
  // Builtin skills
  { id: 'azzar-artifacts', type: RecommendedSkillType.Builtin },
  { id: 'azzar-user-memory', type: RecommendedSkillType.Builtin },
  { id: 'azzar-cloud-sandbox', type: RecommendedSkillType.Builtin },
  { id: 'azzar-task', type: RecommendedSkillType.Builtin },
  { id: 'azzar-agent-documents', type: RecommendedSkillType.Builtin },
  { id: 'azzar-message', type: RecommendedSkillType.Builtin },
  // Opt-in chat image/video generation: default-installed so Tools can pin them without Skill Store first.
  { id: 'azzar-image-generation', type: RecommendedSkillType.Builtin },
  { id: 'azzar-video-generation', type: RecommendedSkillType.Builtin },
  // AZZAR skills
  { id: 'notion', type: RecommendedSkillType.Azzar },
  { id: 'posthog', type: RecommendedSkillType.Azzar },
  { id: 'twitter', type: RecommendedSkillType.Azzar },
  // Composio skills
  { id: 'gmail', type: RecommendedSkillType.Composio },
  { id: 'google-drive', type: RecommendedSkillType.Composio },
  { id: 'google-calendar', type: RecommendedSkillType.Composio },
  { id: 'slack', type: RecommendedSkillType.Composio },
];
