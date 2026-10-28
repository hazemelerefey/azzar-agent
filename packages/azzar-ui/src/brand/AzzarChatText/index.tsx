import clsx from 'clsx';
import type { FC } from 'react';

import { styles } from '../../brand/components/style';
import { styleProps } from '../../styles/stylex/props';
import type { DivProps, SvgProps } from '../../types';
import { brandAzzarChatTextClasses } from './stable';

const AzzarChatText: FC<SvgProps & DivProps & { size?: number }> = ({
  size = '1em',
  className,
  style,
  ...rest
}) => (
  <svg
    fill="currentColor"
    fillRule="evenodd"
    height={size}
    viewBox="0 0 548 92"
    xmlns="http://www.w3.org/2000/svg"
    {...styleProps(styles.svg, clsx(brandAzzarChatTextClasses(), className), style)}
    {...rest}
  >
    <title>AzzarChat</title>
    <path d="M31 0 L61 0 L92 92 L68 92 L61.9 74 L30.1 74 L24 92 L0 92 Z M36.1 56 L55.9 56 L46 26.7 Z M114 0 L206 0 L206 20 L114 20 Z M167.5 24 L201.5 24 L185.9 38 L151.9 38 Z M147.5 42 L181.5 42 L168.1 54 L134.1 54 Z M129.7 58 L163.7 58 L152.5 68 L118.5 68 Z M114 72 L182 72 L182 92 L114 92 Z M228 0 L320 0 L320 20 L228 20 Z M281.5 24 L315.5 24 L299.9 38 L265.9 38 Z M261.5 42 L295.5 42 L282.1 54 L248.1 54 Z M243.7 58 L277.7 58 L266.5 68 L232.5 68 Z M228 72 L296 72 L296 92 L228 92 Z M373 0 L403 0 L434 92 L410 92 L403.9 74 L372.1 74 L366 92 L342 92 Z M378.1 56 L397.9 56 L388 26.7 Z M456 0 L518 0 L538 18 L538 40 L518 58 L478 58 L478 92 L456 92 Z M478 20 L510 20 L516 26 L516 32 L510 38 L478 38 Z M490 58 L516 58 L548 92 L522 92 Z" />
  </svg>
);

AzzarChatText.displayName = 'AzzarChatText';

export default AzzarChatText;
