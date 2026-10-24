import { AgentSkillCard } from '@azzar/ui/awesome';

export default () => (
  <AgentSkillCard
    style={{ marginInline: 'auto' }}
    agent={{
      code: 'Read  and follow it to build UI with Azzar UI.',
      description: 'Send this prompt to your agent to discover the right skill',
    }}
    human={{
      code: 'npx skills add azzar/azzar-ui',
      description: 'Install the skills into your project',
    }}
  />
);
