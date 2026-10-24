import { Breadcrumb } from '@azzar/ui/dashboard';

export default () => {
  return (
    <Breadcrumb
      items={[
        { href: '#', label: 'Workspace', optional: true },
        { href: '#', label: 'Resources' },
        { label: 'api-gateway' },
      ]}
    />
  );
};
