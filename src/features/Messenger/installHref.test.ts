import { describe, expect, it } from 'vitest';

import { resolveMessengerInstallHref } from './installHref';

describe('resolveMessengerInstallHref', () => {
  it('keeps official cloud installs on the app login origin', () => {
    expect(resolveMessengerInstallHref('discord', 'https://hazemelerefy.tech')).toBe(
      'https://app.hazemelerefy.tech/api/agent/messenger/discord/install',
    );
    expect(resolveMessengerInstallHref('slack', 'https://hazemelerefy.tech/')).toBe(
      'https://app.hazemelerefy.tech/api/agent/messenger/slack/install',
    );
  });

  it('preserves the configured self-hosted install origin and path prefix', () => {
    expect(resolveMessengerInstallHref('slack', 'https://chat.example.com/azzar/')).toBe(
      'https://chat.example.com/azzar/api/agent/messenger/slack/install',
    );
  });

  it('builds against the desktop remote server URL and tolerates trailing slashes', () => {
    expect(resolveMessengerInstallHref('slack', 'https://app.hazemelerefy.tech/')).toBe(
      'https://app.hazemelerefy.tech/api/agent/messenger/slack/install',
    );
  });

  it('returns undefined while the origin is not resolved yet', () => {
    expect(resolveMessengerInstallHref('discord', undefined)).toBeUndefined();
    expect(resolveMessengerInstallHref('discord', '')).toBeUndefined();
  });
});
