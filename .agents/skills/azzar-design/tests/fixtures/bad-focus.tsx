// BAD fixture: focus rings removed on focusable elements; fonts not taken from tokens.
import { createStaticStyles, cssVar } from '@azzar/ui';

export const styles = createStaticStyles(({ css }) => ({
  button: css`
    &:focus {
      outline: none; /* expect: AZZAR-OUTLINE-NONE */
    }
  `,
}));

export const Field = ({ code }: { code?: boolean }) => (
  <>
    <input style={{ outline: 'none' }} /> {/* expect: AZZAR-OUTLINE-NONE */}
    <span style={{ fontFamily: code ? 'monospace' : undefined }}>id</span> {/* expect: AZZAR-FONT-FAMILY */}
    <span style={{ fontFamily: 'Inter', color: cssVar.colorText }}>name</span> {/* expect: AZZAR-FONT-FAMILY */}
    <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>hash</span> {/* expect: AZZAR-FONT-FAMILY */}
  </>
);
