import { describe, expect, it } from 'vitest';

import { buildGitHubRenderModel } from './utils';

describe('buildGitHubRenderModel', () => {
  it('summarizes a GitHub pull request result without exposing raw JSON first', () => {
    const model = buildGitHubRenderModel({
      apiName: 'create_pull_request',
      args: {
        base: 'canary',
        head: 'fix/codex-github-render',
        repository_full_name: 'azzar/azzar',
      },
      content: JSON.stringify({
        body: 'PR body',
        draft: false,
        mergeable: true,
        merged: false,
        number: 16430,
        state: 'open',
        title: 'Render Codex GitHub MCP tool calls',
        updated_at: '2026-06-29T08:20:00Z',
        url: '',
      }),
    });

    expect(model.rawResultJson).toBeUndefined();
    expect(model.resultEntities).toHaveLength(1);
    expect(model.resultEntities[0]).toMatchObject({
      description: 'PR body',
      id: '#16430',
      kind: 'Pull request',
      state: 'Open',
      title: 'Render Codex GitHub MCP tool calls',
      url: '',
    });
    expect(model.resultEntities[0].fields).toEqual(
      expect.arrayContaining([
        { key: 'repository', label: 'Repository', value: 'azzar/azzar' },
      ]),
    );
  });

  it('unwraps GitHub list wrappers into entity cards', () => {
    const model = buildGitHubRenderModel({
      apiName: 'search_issues',
      args: { query: 'is:open repo:azzar/azzar' },
      content: JSON.stringify({
        items: [
          {
            number: 10,
            state: 'open',
            title: 'First issue',
            url: '',
          },
        ],
      }),
    });

    expect(model.resultEntities).toHaveLength(1);
    expect(model.resultEntities[0]).toMatchObject({
      id: '#10',
      kind: 'Issue',
      title: 'First issue',
    });
  });
});
