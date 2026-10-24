import { AuvManifest } from '@azzar/builtin-tool-auv';
import { groupSupervisorToolIds } from '@azzar/builtin-tools';
import { describe, expect, it } from 'vitest';

import { filterAllowedBuiltinTools } from './deviceTools';
import { resolveToolRules } from './resolveToolRules';
import type { ToolRuleRequest } from './types';

const request = (overrides: Partial<ToolRuleRequest> = {}): ToolRuleRequest => ({
  agent: { chatConfig: {}, plugins: ['my-plugin'] },
  executionTarget: 'sandbox',
  localExecutionReady: false,
  model: { canUseFC: true },
  ...overrides,
});

describe('resolveToolRules', () => {
  it('derives the three modes from the chat config, never from the model', () => {
    expect(resolveToolRules(request()).toolMode).toBe('agent');
    expect(
      resolveToolRules(request({ agent: { chatConfig: { enableAgentMode: false }, plugins: [] } }))
        .toolMode,
    ).toBe('chat');
    expect(
      resolveToolRules(request({ agent: { chatConfig: { toolMode: 'custom' }, plugins: [] } }))
        .toolMode,
    ).toBe('custom');
    // A model without function calling keeps the stored mode; the tools
    // engine marks the tools incompatible instead.
    expect(resolveToolRules(request({ model: { canUseFC: false } })).toolMode).toBe('agent');
  });

  it('enables only the attachments tool when an oversized file is previewed', () => {
    expect(resolveToolRules(request()).rules['azzar-attachments']).toBe(false);

    const { rules } = resolveToolRules(request({ hasOversizedFiles: true }));
    expect(rules['azzar-attachments']).toBe(true);
    expect(rules['azzar-knowledge-base']).toBe(false);

    const chatMode = resolveToolRules(
      request({ agent: { chatConfig: { enableAgentMode: false } }, hasOversizedFiles: true }),
    );
    expect(chatMode.rules['azzar-attachments']).toBe(true);
  });

  it('chat mode is a strict whitelist with no activator and no always-on tools', () => {
    const resolved = resolveToolRules(
      request({
        agent: { chatConfig: { enableAgentMode: false }, plugins: ['my-plugin'] },
        hasEnabledKnowledgeBases: true,
      }),
    );
    expect(resolved.allowExplicitActivation).toBe(false);
    expect(resolved.rules['my-plugin']).toBeUndefined();
    expect(resolved.rules['azzar-agent']).toBeUndefined();
    expect(resolved.rules['azzar-knowledge-base']).toBe(true);
    expect(resolved.rules['azzar-web-browsing']).toBe(true);
    expect(resolved.defaultToolIds).not.toContain('azzar-agent');
  });

  it('custom mode is exactly the pinned plugins', () => {
    const resolved = resolveToolRules(
      request({ agent: { chatConfig: { toolMode: 'custom' }, plugins: ['a', 'b'] } }),
    );
    expect(resolved.rules).toEqual({ a: true, b: true });
    expect(resolved.defaultToolIds).toEqual(['a', 'b']);
    expect(resolved.allowExplicitActivation).toBe(false);
  });

  it('agent mode enables pinned, runtime and always-on tools and opens the activator', () => {
    const resolved = resolveToolRules(
      request({ isGroupSupervisor: true, runtimePluginIds: ['scope-plugin'] }),
    );
    expect(resolved.allowExplicitActivation).toBe(true);
    expect(resolved.rules['my-plugin']).toBe(true);
    expect(resolved.rules['scope-plugin']).toBe(true);
    expect(resolved.rules['azzar-agent']).toBe(true);
    for (const id of groupSupervisorToolIds) {
      expect(resolved.rules[id]).toBe(true);
      expect(resolved.defaultToolIds).toContain(id);
    }
  });

  it('offers image generation only when pinned on a tool-calling model without native output', () => {
    const pinned = { chatConfig: { enableAgentMode: false }, plugins: ['azzar-image-generation'] };
    expect(resolveToolRules(request({ agent: pinned })).rules['azzar-image-generation']).toBe(true);
    expect(
      resolveToolRules(request({ agent: pinned, model: { canUseFC: true, hasImageOutput: true } }))
        .rules['azzar-image-generation'],
    ).toBe(false);
    expect(
      resolveToolRules(request({ agent: pinned, model: { canUseFC: false } })).rules[
        'azzar-image-generation'
      ],
    ).toBe(false);
  });

  it('gates the sandbox, local and device tools on the execution target', () => {
    const sandbox = resolveToolRules(request({ executionTarget: 'sandbox' }));
    expect(sandbox.rules['azzar-cloud-sandbox']).toBe(true);
    expect(sandbox.rules['azzar-local-system']).toBe(false);

    const auto = resolveToolRules(request({ executionTarget: 'auto' }));
    expect(auto.rules['azzar-cloud-sandbox']).toBe(true);

    const localNotReady = resolveToolRules(request({ executionTarget: 'local' }));
    expect(localNotReady.rules['azzar-local-system']).toBe(false);
    expect(localNotReady.rules['azzar-browser']).toBe(false);

    const localReady = resolveToolRules(
      request({ executionTarget: 'local', localExecutionReady: true }),
    );
    expect(localReady.rules['azzar-local-system']).toBe(true);
    expect(localReady.rules['azzar-browser']).toBe(true);
    expect(localReady.rules['azzar-cloud-sandbox']).toBe(false);

    const disabledLocal = resolveToolRules(
      request({ disableLocalSystem: true, executionTarget: 'local', localExecutionReady: true }),
    );
    expect(disabledLocal.rules['azzar-local-system']).toBe(false);
  });

  it('offers the device picker only behind a gateway while a device decision remains', () => {
    // A persisted `device` target on a server without a gateway: the policy
    // allows a device, but nothing could dispatch to one.
    const noGateway = resolveToolRules(
      request({
        deviceAccess: { canUseDevice: true, deviceLocked: false },
        executionTarget: 'device',
      }),
    );
    expect(noGateway.rules['azzar-remote-device']).toBe(false);
    expect(noGateway.excludedIdentifiers).toEqual(new Set());

    const open = resolveToolRules(
      request({
        device: { supportedTools: [AuvManifest.identifier] },
        deviceAccess: { canUseDevice: true, deviceLocked: false },
        executionTarget: 'device',
      }),
    );
    expect(open.rules['azzar-remote-device']).toBe(true);

    const locked = resolveToolRules(
      request({
        device: { supportedTools: [AuvManifest.identifier] },
        deviceAccess: { canUseDevice: true, deviceLocked: true },
        executionTarget: 'device',
      }),
    );
    expect(locked.rules['azzar-remote-device']).toBe(false);
    expect(locked.excludedIdentifiers.has('azzar-remote-device')).toBe(true);
    expect(locked.excludedIdentifiers.has('azzar-local-system')).toBe(false);
  });

  it('walls every device tool off for a run whose policy denies devices, gateway or not', () => {
    const denied = resolveToolRules(
      request({
        deviceAccess: { canUseDevice: false, deviceLocked: false },
        disabledPluginIds: ['my-plugin'],
        executionTarget: 'none',
      }),
    );
    expect(denied.excludedIdentifiers).toEqual(
      new Set([
        'my-plugin',
        'azzar-local-system',
        'azzar-remote-device',
        'azzar-browser',
        AuvManifest.identifier,
      ]),
    );
    // Computer Use also disappears when the routed device does not support it.
    const unsupported = resolveToolRules(
      request({
        device: {},
        deviceAccess: { canUseDevice: true, deviceLocked: false },
        executionTarget: 'local',
      }),
    );
    expect(unsupported.excludedIdentifiers.has(AuvManifest.identifier)).toBe(true);
  });

  it('enables the message tool in bot conversations and search per the decision', () => {
    const bot = resolveToolRules(
      request({ isBotConversation: true, useApplicationBuiltinSearchTool: false }),
    );
    expect(bot.rules['azzar-message']).toBe(true);
    expect(bot.rules['azzar-web-browsing']).toBe(false);
    const off = resolveToolRules(request({ agent: { chatConfig: { searchMode: 'off' } } }));
    expect(off.rules['azzar-web-browsing']).toBe(false);
  });
});

describe('filterAllowedBuiltinTools', () => {
  const tools = [
    { identifier: 'azzar-local-system' },
    { identifier: 'azzar-remote-device' },
    { identifier: AuvManifest.identifier },
    { identifier: 'azzar-web-browsing' },
  ];
  it('keeps non-device tools and drops device tools per the walls', () => {
    const ids = (params: Parameters<typeof filterAllowedBuiltinTools>[1]) =>
      filterAllowedBuiltinTools(tools, params).map((t) => t.identifier);
    expect(ids({ canUseDevice: false, deviceLocked: false })).toEqual(['azzar-web-browsing']);
    expect(ids({ canUseDevice: true, deviceLocked: true })).toEqual([
      'azzar-local-system',
      AuvManifest.identifier,
      'azzar-web-browsing',
    ]);
    expect(ids({ canUseDevice: true, deviceLocked: false, supportedDeviceTools: [] })).toEqual([
      'azzar-local-system',
      'azzar-remote-device',
      'azzar-web-browsing',
    ]);
    expect(ids({ canUseDevice: true, deviceLocked: false, disableLocalSystem: true })).toEqual([
      'azzar-remote-device',
      'azzar-web-browsing',
    ]);
  });
});
