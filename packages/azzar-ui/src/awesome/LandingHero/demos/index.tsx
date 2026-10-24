import { LandingHero } from '@azzar/ui/awesome';
import { GithubIcon } from '@azzar/ui/icons';
import { ArrowRight } from 'lucide-react';

export default () => (
  <LandingHero
    accent="UI Kit"
    badge="New · Landing components"
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
      { href: '', icon: GithubIcon, label: 'GitHub' },
    ]}
  />
);
