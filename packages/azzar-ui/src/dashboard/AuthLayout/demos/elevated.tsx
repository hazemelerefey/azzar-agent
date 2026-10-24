import { Button, Input } from '@azzar/ui';
import { Grainient } from '@azzar/ui/awesome';
import { AuthLayout } from '@azzar/ui/dashboard';
import { Box } from 'lucide-react';

export default () => {
  return (
    <AuthLayout
      background="grid"
      description="Grid backdrop, elevated card, art panel and a support footer."
      logo={<Box size={36} />}
      style={{ blockSize: 680, minBlockSize: 0 }}
      title="Welcome back"
      variant="elevated"
      aside={
        <AuthLayout.Aside
          background={<Grainient lightMode="auto" />}
          kicker="Developer Center"
          line="Build with every model in one place."
        />
      }
      footer={
        <>
          <a href="#community">Community</a>
          <span aria-hidden>{' · '}</span>
          <a href="#email">Email support</a>
        </>
      }
    >
      <Input aria-label="Email" placeholder="Email" />
      <Button block type="primary">
        Continue
      </Button>
    </AuthLayout>
  );
};
