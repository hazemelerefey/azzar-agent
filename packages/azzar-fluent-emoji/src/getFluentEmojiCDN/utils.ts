export type EmojiType = 'anim' | 'flat' | 'modern' | 'mono' | '3d';

export function isFlagEmoji(emoji: string) {
  const flagRegex = /(?:\uD83C[\uDDE6-\uDDFF]){2}/;
  return flagRegex.test(emoji);
}

export function emojiToUnicode(emoji: string) {
  return [...emoji].map((char) => char?.codePointAt(0)?.toString(16)).join('-');
}

export function emojiAnimPkg(emoji: string) {
  const mainPart = emojiToUnicode(emoji).split('-')[0];
  if (mainPart < '1f469') {
    return 'anim-1';
  } else if (mainPart >= '1f469' && mainPart < '1f620') {
    return 'anim-2';
  } else if (mainPart >= '1f620' && mainPart < '1f9a0') {
    return 'anim-3';
  } else {
    return 'anim-4';
  }
}

export const genEmojiUrl = (emoji: string, type: EmojiType) => {
  const ext = ['anim', '3d'].includes(type) ? 'webp' : 'svg';
  const style = type === 'anim' ? emojiAnimPkg(emoji) : type;

  return {
    path: `assets/${emojiToUnicode(emoji)}.${ext}`,
    pkg: style,
    url: `https://hazemelerefy.tech/emoji-assets/${style}/assets/${emojiToUnicode(emoji)}.${ext}`,
  };
};
