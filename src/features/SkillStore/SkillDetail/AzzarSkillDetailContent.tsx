'use client';

import { AzzarDetailProvider } from './AzzarDetailProvider';
import SkillDetailInner from './SkillDetailInner';

export interface AzzarSkillDetailContentProps {
  identifier: string;
}

export const AzzarSkillDetailContent = ({ identifier }: AzzarSkillDetailContentProps) => {
  return (
    <AzzarDetailProvider identifier={identifier}>
      <SkillDetailInner type="azzar" />
    </AzzarDetailProvider>
  );
};
