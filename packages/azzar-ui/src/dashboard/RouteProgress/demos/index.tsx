import { Button } from '@azzar/ui';
import { RouteProgress } from '@azzar/ui/dashboard';
import { useState } from 'react';

export default () => {
  const [loading, setLoading] = useState(true);
  return (
    <div>
      <RouteProgress loading={loading} />
      <Button type="primary" onClick={() => setLoading((current) => !current)}>
        {loading ? 'Finish' : 'Start'}
      </Button>
    </div>
  );
};
