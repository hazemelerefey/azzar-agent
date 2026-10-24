import { Hero, type HeroProps } from '@azzar/ui/awesome';

const actions: HeroProps['actions'] = [
  {
    github: true,
    link: '',
    text: 'Github',
  },
  {
    link: '/components/action-icon',
    text: 'Get Started',
    type: 'primary',
  },
];

export default () => {
  return (
    <Hero
      actions={actions}
      description="Azzar UI is an open-source UI component library for <br/>building chatbot web apps"
      title="Azzar <b>UI</b>"
    />
  );
};
