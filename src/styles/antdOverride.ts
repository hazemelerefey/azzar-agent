import { isDesktop } from '@azzar/const';
import { css } from '@azzar/ui';
import { rgba } from 'polished';

const antdOverride = ({ token }: { prefixCls?: string; token: any }) => css`
  .${token.prefixCls}-popover {
    z-index: 1100;
  }

  .${token.prefixCls}-menu-item-selected {
    .${token.prefixCls}-menu-title-content {
      color: ${token.colorText};
    }
  }

  .${token.prefixCls}-modal-mask, .${token.prefixCls}-drawer-mask {
    background: ${rgba(token.colorBgLayout, 0.5)} !important;
    backdrop-filter: blur(2px);
  }

  ${
    isDesktop &&
    css`
      .${token.prefixCls}-modal-mask.${token.prefixCls}-modal-mask-blur {
        background: ${rgba(token.colorBgLayout, 0.8)} !important;
        backdrop-filter: none !important;
      }
    `
  }
`;

export default antdOverride;
