// BAD fixture (rules introduced in 2.1.0): every `expect:` id must be reported by lint-azzar.mjs on that line.
import { createStaticStyles, keyframes } from '@azzar/ui';
import { Button } from '@azzar/ui';

const fadeUp = keyframes`from { opacity: 0 } to { opacity: 1 }`; // expect: AZZAR-REDUCED-MOTION

export const styles = createStaticStyles(({ css, cssVar }) => ({
  title: css`
    font-size: 16px;
    font-size: 18px;
    font-size: 20px;
    font-size: 22px;
    font-size: 24px;
    font-size: 28px; /* expect: AZZAR-FONT-SIZE-SCALE */
    letter-spacing: 0.2em; /* expect: AZZAR-LETTER-SPACING */
    padding: 13px 18px; /* expect: AZZAR-SPACING-OFFGRID */
    transition: width 200ms ease-out; /* expect: AZZAR-ANIMATE-LAYOUT */
    animation: ${fadeUp} 200ms ease-out;
    width: 960px; /* expect: AZZAR-FIXED-WIDTH */
  `,
  a: css`background: ${cssVar.gradientAnimation};`,
  b: css`background: ${cssVar.gradientAnimation};`,
  c: css`background: ${cssVar.gradientAnimation};`, /* expect: AZZAR-GRADIENT-ANIMATION-OVERUSE */
}));

export const Hero = () => (
  <div className={styles.title}>
    <Button type="primary">开始试用</Button>
    <Button type="primary">预约演示</Button> {/* expect: AZZAR-MULTI-PRIMARY */}
  </div>
);

// An ignore without a `: reason` does not suppress anything and is itself reported.
const legacy = '#ff6a00'; // azzar-design-ignore AZZAR-RAW-COLOR   expect: AZZAR-IGNORE-NO-REASON AZZAR-RAW-COLOR
