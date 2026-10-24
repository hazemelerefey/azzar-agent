// BAD fixture: every line marked `expect:` must be reported by lint-azzar.mjs.
import { Button, Table, message } from 'antd'; // expect: AZZAR-ANTD-IMPORT
import { Form } from '@azzar/ui'; // expect: AZZAR-FORM-ENTRY
import { DeleteOutlined } from '@ant-design/icons'; // expect: AZZAR-ANT-ICONS
import { createStyles } from 'antd-style'; // expect: AZZAR-CREATE-STYLES AZZAR-ANTD-IMPORT

export const useStyles = createStyles(({ css }) => ({ // expect: AZZAR-CREATE-STYLES
  hero: css`
    // this is not a comment in a css template   expect: AZZAR-CSS-LINE-COMMENT
    background: linear-gradient(135deg, #6366f1, #a855f7); /* expect: AZZAR-PURPLE-GRADIENT AZZAR-RAW-COLOR */
    color: #333; /* expect: AZZAR-RAW-COLOR */
    font-family: Inter, sans-serif; /* expect: AZZAR-FONT-FAMILY */
    transition: all 500ms cubic-bezier(0.68, -0.55, 0.27, 1.55); /* expect: AZZAR-TRANSITION-ALL AZZAR-BOUNCE AZZAR-MOTION-DURATION */
    outline: none; /* expect: AZZAR-OUTLINE-NONE */
    background-clip: text; /* expect: AZZAR-GRADIENT-TEXT */
    text-transform: uppercase; /* expect: AZZAR-UPPERCASE */
    box-shadow: 0 0 24px rgba(99, 102, 241, 0.6); /* expect: AZZAR-GLOW AZZAR-RAW-COLOR */
    backdrop-filter: blur(12px); /* expect: AZZAR-BLUR-CARD */
    border-left: 4px solid red; /* expect: AZZAR-SIDE-STRIPE */
  `,
}));

export const Page = () => (
  <div>
    <span className="eyebrow">NEW FEATURE</span> {/* expect: AZZAR-EYEBROW */}
    <img src="/a.png" /> {/* expect: AZZAR-IMG-ALT */}
    <div onClick={() => message.info('x')}>open</div> {/* expect: AZZAR-DIV-CLICK */}
    <p>Lorem ipsum dolor sit amet</p> {/* expect: AZZAR-PLACEHOLDER-COPY */}
    <p>{'操作失败'}</p> {/* expect: AZZAR-VAGUE-ERROR */}
    <p>{'暂无数据'}</p> {/* expect: AZZAR-BARE-EMPTY */}
    <Button>确定</Button> {/* expect: AZZAR-VAGUE-BUTTON */}
    <i>{value ?? 'N/A'}</i> {/* expect: AZZAR-NULLISH-RENDER */}
    <i>{value ?? '—'}</i> {/* expect: AZZAR-NULLISH-RENDER */}
    <li>🚀 Fast</li> {/* expect: AZZAR-EMOJI-ICON */}
    <I18nProvider /> {/* expect: AZZAR-I18N-PROVIDER */}
    <div className="x .ant-btn" /> {/* expect: AZZAR-ANT-CLASS */}
    <ActionIcon icon={Trash2} onClick={remove} /> {/* expect: AZZAR-ICON-BUTTON-LABEL */}
  </div>
);
const s = `--ant-color-border: red !important;`; // expect: AZZAR-ANT-VAR-OVERRIDE
const s2 = `--azzar-color-border: red !important;`; // expect: AZZAR-ANT-VAR-OVERRIDE
import { theme } from 'antd'; // expect: AZZAR-ANTD-IMPORT
