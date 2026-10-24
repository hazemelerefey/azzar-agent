import { Button, Input } from '@azzar/ui';
import { PageToolbar } from '@azzar/ui/dashboard';

export default () => (
  <PageToolbar
    actions={
      <>
        <Button>Export</Button>
        <Button type="primary">Create</Button>
      </>
    }
  >
    <Input placeholder="Search" style={{ width: 240 }} />
  </PageToolbar>
);
