import { EmojiPicker } from '@azzar/ui';

const LOGO = 'https://registry.npmmirror.com/@azzar/assets-logo/1.2.0/files/assets/logo-3d.webp';

export default () => (
  <EmojiPicker
    defaultAvatar={LOGO}
    customEmojis={[
      {
        emojis: [
          {
            id: 'logo',
            keywords: ['azzar', 'azzar'],
            name: 'AZZAR Logo',
            skins: [
              {
                src: LOGO,
              },
            ],
          },
        ],
        id: 'azzar',
        name: 'AZZAR',
      },
    ]}
  />
);
