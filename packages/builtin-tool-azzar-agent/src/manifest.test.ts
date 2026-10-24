import { describe, expect, it } from 'vitest';

import { AzzarAgentManifest } from './manifest';
import { AzzarAgentApiName } from './types';

describe('AzzarAgentManifest', () => {
  it('should keep the package metadata generic for future Azzar Agent capabilities', () => {
    expect(AzzarAgentManifest.meta.avatar).toBe('🤖');
    expect(AzzarAgentManifest.meta.description).toBe(
      'Run built-in Azzar Agent capabilities: plan + todo management, sub-agent dispatch, and multimodal media analysis.',
    );
    expect(AzzarAgentManifest.meta.readme).toContain(
      'built-in assistant capabilities that can be expanded over time',
    );
  });

  it('should describe multimodal analysis as a fallback tool', () => {
    const apiDescription = AzzarAgentManifest.api[0].description;

    expect(apiDescription).toContain('native multimodal capability');
    expect(apiDescription).toContain('use this tool only as a fallback');
    expect(apiDescription).toContain('Provide either refs or urls');
    expect(apiDescription).toContain('Prefer refs when stable refs are available');
    expect(apiDescription).toContain('msg_xxx.image_1');
    expect(apiDescription).toContain('msg_xxx.audio_1');
    expect(apiDescription).toContain('use urls only for direct media URLs');
    expect(apiDescription).toContain('answer the user directly with the result');
  });

  it('should instruct agents to prefer native multimodal access before media analysis', () => {
    expect(AzzarAgentManifest.systemRole).toContain('`analyzeMedia` is only a fallback');
    expect(AzzarAgentManifest.systemRole).toContain(
      'media is already visible in the current multimodal context',
    );
    expect(AzzarAgentManifest.systemRole).toContain(
      'active model lacks the needed audio/image/video capability',
    );
  });

  it('should route local media through file refs instead of local URLs or base64 text', () => {
    const analyzeMedia = AzzarAgentManifest.api[0];
    const { refs, urls } = analyzeMedia.parameters.properties;

    expect(analyzeMedia.description).toContain('local filesystem');
    expect(analyzeMedia.description).toContain('base64 text');
    expect(refs.description).toContain('local file-reading tools');
    expect(urls.description).toContain('Local filesystem paths and file:// URLs are unsupported');
    expect(AzzarAgentManifest.systemRole).toContain(
      'Never pass local filesystem paths or `file://` URLs to `analyzeMedia.urls`',
    );
    expect(AzzarAgentManifest.systemRole).toContain('stable ref');
  });

  it('should keep media analysis parameters compatible with strict tool schema validators', () => {
    const parameters = AzzarAgentManifest.api[0].parameters;

    expect(parameters).not.toHaveProperty('oneOf');
    expect(parameters).not.toHaveProperty('allOf');
    expect(parameters).not.toHaveProperty('anyOf');
  });

  it('should expose a restrained vent API for reporting platform friction', () => {
    const ventApi = AzzarAgentManifest.api.find((api) => api.name === AzzarAgentApiName.vent);

    expect(ventApi).toBeDefined();
    expect(ventApi!.parameters.required).toEqual(['category', 'severity', 'summary', 'details']);
    expect(Object.keys(ventApi!.parameters.properties)).toEqual([
      'category',
      'severity',
      'summary',
      'details',
      'attempts',
      'toolName',
      'evidenceRefs',
    ]);
    expect(ventApi!.description).toContain('at most one vent per run');
    expect(AzzarAgentManifest.systemRole).toContain('<vent>');
  });

  // A run once called vent 133 times as a way to "stop the tool loop".
  it('tells the model that vent is not a way to stop or end a loop', () => {
    const ventApi = AzzarAgentManifest.api.find((api) => api.name === AzzarAgentApiName.vent);

    expect(ventApi!.description).toContain('It never stops a tool loop or ends your turn');
    expect(AzzarAgentManifest.systemRole).toContain('`vent` is never a control action');
    expect(AzzarAgentManifest.systemRole).toContain('do not call it again');
  });
});
