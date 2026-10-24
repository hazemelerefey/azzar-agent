import { AgentSkillCard, LandingHero } from '@azzar/ui/awesome';
import { ArrowRight } from 'lucide-react';

export default () => (
  <LandingHero
    accent="UI Kit"
    description="An open-source React component library for building AIGC web apps."
    title="AZZAR"
    actions={[
      {
        href: '/components/button',
        icon: ArrowRight,
        iconPlacement: 'end',
        label: 'Get Started',
        primary: true,
      },
    ]}
    aside={
      <AgentSkillCard
        human={{ code: 'npx skills add azzar/azzar-ui', description: 'Install the skills' }}
        agent={{
          code: 'Read  and follow it to build UI with @azzar/ui.',
          description: 'Send this prompt to your agent',
        }}
      />
    }
  />
);
