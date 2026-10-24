import urlJoin from 'url-join';

import type { EmojiType } from './utils';
import { genEmojiUrl } from './utils';

export interface FluentEmojiCdnConfig {
  /**
   * CDN to use: `aliyun` (registry.npmmirror.com) or `unpkg`.
   * @default 'aliyun'
   */
  cdn?: 'aliyun' | 'unpkg';
  /**
   * Emoji style.
   */
  type: EmojiType;
}

const SELF_HOSTED_ICON_CDN = ({ pkg, path }: { path: string; pkg: string }) =>
  urlJoin('https://hazemelerefy.tech/emoji-assets', pkg, path);

/**
 * Resolve the CDN URL of a Fluent Emoji asset. Without `config`, returns the `3d` style.
 */
export const getFluentEmojiCDN = (id: string, config?: FluentEmojiCdnConfig): string => {
  const { type = '3d' } = config || {};
  const emoji = genEmojiUrl(id, type);

  return SELF_HOSTED_ICON_CDN(emoji);
};
