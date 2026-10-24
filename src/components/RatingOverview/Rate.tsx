import { Rate as BaseRate, type RateProps } from '@azzar/ui';
import { createStaticStyles, cx } from '@azzar/ui';
import { memo } from 'react';

const styles = createStaticStyles(({ css }) => ({
  rate: css`
    display: flex;
  `,
}));

const Rate = memo<RateProps>(({ className, size = 16, ...props }) => (
  <BaseRate allowHalf readOnly className={cx(styles.rate, className)} size={size} {...props} />
));

export default Rate;
