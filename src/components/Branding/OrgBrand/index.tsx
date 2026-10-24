import { ORG_NAME } from '@azzar/business-const';
import { type AZZARProps } from '@azzar/ui/brand';
import { AZZAR } from '@azzar/ui/brand';
import { memo } from 'react';

import { isCustomORG } from '@/const/version';

export const OrgBrand = memo<AZZARProps>((props) => {
  if (isCustomORG) {
    return <span>{ORG_NAME}</span>;
  }

  return <AZZAR {...props} />;
});
