import { Icon, IconProvider } from '@azzar/ui';
import { PlusCircle, Settings } from 'lucide-react';

export default () => (
  <IconProvider config={{ color: 'red', size: 'large' }}>
    <Icon icon={PlusCircle} />
    <Icon icon={Settings} />
  </IconProvider>
);
