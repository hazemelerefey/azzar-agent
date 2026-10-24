import { type AzzarSkillProviderType } from '@azzar/const';
import { cssVar, Icon } from '@azzar/ui';
import { memo } from 'react';

export const SKILL_ICON_SIZE = 20;

/**
 * AZZAR Skill Provider icon component
 */
const AzzarSkillIcon = memo<Pick<AzzarSkillProviderType, 'icon' | 'label'> & { size: number }>(
  ({ icon, label, size = SKILL_ICON_SIZE }) => {
    if (typeof icon === 'string') {
      return (
        <img
          alt={label}
          src={icon}
          style={{ maxHeight: size, maxWidth: size, objectFit: 'contain' }}
        />
      );
    }

    return <Icon fill={cssVar.colorText} icon={icon} size={size} />;
  },
);

AzzarSkillIcon.displayName = 'AzzarSkillIcon';

export default AzzarSkillIcon;
