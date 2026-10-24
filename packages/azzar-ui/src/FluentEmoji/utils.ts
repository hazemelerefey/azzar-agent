export type EmojiType = 'anim' | 'flat' | 'modern' | 'mono' | 'raw' | '3d';

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

  switch (type) {
    case 'raw': {
      return null;
    }
    case 'anim': {
      return {
        path: `assets/${emojiToUnicode(emoji)}.${ext}`,
        pkg: emojiAnimPkg(emoji),
        version: 'latest',
      };
    }
    case '3d': {
      return {
        path: `assets/${emojiToUnicode(emoji)}.${ext}`,
        pkg: '3d',
        version: 'latest',
      };
    }
    case 'flat': {
      return {
        path: `assets/${emojiToUnicode(emoji)}.${ext}`,
        pkg: 'flat',
        version: 'latest',
      };
    }
    case 'modern': {
      return {
        path: `assets/${emojiToUnicode(emoji)}.${ext}`,
        pkg: 'modern',
        version: 'latest',
      };
    }
    case 'mono': {
      return {
        path: `assets/${emojiToUnicode(emoji)}.${ext}`,
        pkg: 'mono',
        version: 'latest',
      };
    }
  }
};
