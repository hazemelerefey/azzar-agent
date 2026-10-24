import type { FlexboxProps } from '@azzar/ui';
import type { ReactNode } from 'react';

export interface ChatInputActionBarProps extends Omit<FlexboxProps, 'children'> {
  left?: ReactNode;
  right?: ReactNode;
}
