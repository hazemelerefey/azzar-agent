import { Avatar } from '@azzar/ui';
import { cssVar } from '@azzar/ui';
import { memo } from 'react';

import { CATEGORY_ICON_MAP } from '../../const';

interface CategoryAvatarProps {
  category: string;
}

export const CategoryAvatar = memo<CategoryAvatarProps>(({ category }) => {
  const IconComponent = CATEGORY_ICON_MAP[category];

  return (
    <Avatar
      alt={category}
      avatar={<IconComponent />}
      style={{
        backgroundColor: 'transparent',
        color: cssVar.colorTextSecondary,
        height: 16,
        width: 16,
      }}
    />
  );
});
