// BAD fixture (3.0.0 rules): C-11 分层边界。
// 原子层被项目自己重写了一遍 —— 每次 `expect:` 的 id 都必须在该行被 lint-azzar.mjs 报出。
import { createStaticStyles } from '@azzar/ui';

// 原子层必须从 @azzar/ui 取用，不要在项目里重实现。
const Button = ({ children, ...rest }: any) => <button {...rest}>{children}</button>; // expect: AZZAR-REIMPLEMENT-ATOM
function Modal({ open, children }: any) { // expect: AZZAR-REIMPLEMENT-ATOM
  return open ? <div className="azzar-modal">{children}</div> : null;
}
export const Table = (props: any) => <table {...props} />; // expect: AZZAR-REIMPLEMENT-ATOM
export function Input(props: any) { // expect: AZZAR-REIMPLEMENT-ATOM
  return <input {...props} />;
}

// 取值仍然要走 cssVar：自建不等于可以写裸色值。
export const styles = createStaticStyles(({ css }) => ({
  wrap: css`
    color: #333333; /* expect: AZZAR-RAW-COLOR */
  `,
}));
