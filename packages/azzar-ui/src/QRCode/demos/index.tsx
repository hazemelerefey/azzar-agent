import { Flexbox, QRCode  } from '@azzar/ui';
import { useState } from 'react';

export default () => {
  const [expired, setExpired] = useState(true);

  return (
    <Flexbox horizontal gap={24} padding={16} wrap="wrap">
      <QRCode value="" />
      <QRCode
        icon={<img alt="" height="100%" src="" width="100%" />}
        value=""
      />
      <QRCode status="loading" value="" />
      <QRCode
        status={expired ? 'expired' : 'active'}
        value=""
        onRefresh={() => setExpired(false)}
      />
    </Flexbox>
  );
};
