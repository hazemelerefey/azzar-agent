import { describe, expect, it } from 'vitest';

import { normalizeGithubShellToolResult, normalizeGithubToolResult } from '../githubToolResult';

/**
 * Pins the quoting edge cases of the hand-rolled shell tokenizer behind the
 * `runCommand` normalization path (see the tokenizer comment in
 * githubToolResult.ts for why it is hand-rolled).
 */
const runCommand = (command: string, output = '') =>
  normalizeGithubToolResult({
    data: { command, exitCode: 0, output },
    toolName: 'runCommand',
  });

describe('normalizeGithubToolResult (gh runCommand parsing)', () => {
  it('keeps spaces and double quotes inside single-quoted values', () => {
    const operation = runCommand(
      `gh issue create --repo azzar/azzar --title 'Fix: "quoted" bug report'`,
      '',
    );

    expect(operation?.params).toMatchObject({
      identifier: 'azzar/azzar#123',
      resourceId: 'azzar/azzar#123',
      changeType: 'created',
      title: 'Fix: "quoted" bug report',
      url: '',
    });
  });

  it('unescapes \\" inside double quotes and keeps $ literal', () => {
    const operation = runCommand(
      `gh issue create --repo azzar/azzar --title "hello" --body "He said \\"hi\\" for $5"`,
      '',
    );

    expect(operation?.params.description).toBe('He said "hi" for $5');
    // The full `--body` value is also emitted as `content`, and both fields are
    // named in `patchFields`.
    expect(operation?.params.content).toBe('He said "hi" for $5');
    expect(operation?.params.patchFields).toEqual(
      expect.arrayContaining(['content', 'description']),
    );
  });

  it('emits the full --body as content while capping the description preview', () => {
    const body = 'C'.repeat(300);
    const operation = runCommand(
      `gh issue create --repo azzar/azzar --title 'Long body' --body '${body}'`,
      '',
    );

    // `content` keeps the full untruncated body; `description` is the ≤120 preview.
    expect(operation?.params.content).toBe(body);
    expect(operation?.params.description).toBe(`${'C'.repeat(120)}...`);
    expect(operation?.params.patchFields).toContain('content');
  });

  it('honors backslash escapes outside quotes', () => {
    const operation = runCommand(`gh issue edit 42 --repo azzar/azzar --title Fix\\ the\\ bug`);

    expect(operation?.params).toMatchObject({
      identifier: 'azzar/azzar#42',
      changeType: 'updated',
      title: 'Fix the bug',
    });
  });

  it('treats backslash-newline as a line continuation', () => {
    const operation = runCommand(
      `gh issue create \\\n  --repo azzar/azzar \\\n  --title 'Multiline invocation'`,
      '',
    );

    expect(operation?.params.title).toBe('Multiline invocation');
  });

  it('supports --flag=value with quoted values', () => {
    const operation = runCommand(
      `gh issue edit 15 --repo azzar/azzar --title='Inline equals title'`,
    );

    expect(operation?.params.title).toBe('Inline equals title');
  });

  it('does not misread a value-flag argument as the edit target', () => {
    const operation = runCommand(
      `gh issue edit 952 --repo azzar/azzar --milestone 'v2 launch'`,
    );

    expect(operation?.params.identifier).toBe('azzar/azzar#952');
    // Milestone is consumed as the flag value, not snapshotted as a title.
    expect(operation?.params.title).toBeUndefined();
  });

  it('skips registration on an unterminated single quote', () => {
    expect(runCommand(`gh issue create --repo azzar/azzar --title 'broken`)).toBeNull();
  });

  it('skips registration on an unterminated double quote', () => {
    expect(runCommand(`gh issue create --repo azzar/azzar --title "broken`)).toBeNull();
  });

  it('uses the last gh create/edit segment of a chained command', () => {
    const operation = runCommand(
      `git push origin HEAD && gh pr create --base main --title 'New PR'`,
      '',
    );

    expect(operation?.params).toMatchObject({
      identifier: 'azzar/azzar#88',
      resourceType: 'github_pull_request',
      changeType: 'created',
      title: 'New PR',
    });
  });

  it('splits segments on semicolons and parses the last gh segment', () => {
    const operation = runCommand(
      `gh issue edit 1 --add-label bug; gh pr edit 7 --repo azzar/azzar --title 'Second'`,
    );

    expect(operation?.params).toMatchObject({
      identifier: 'azzar/azzar#7',
      changeType: 'updated',
      title: 'Second',
    });
  });
});

/**
 * The persisted url reaches shell.openExternal on desktop, and gh stdout is
 * member-controlled free text, so only http(s) URLs may be stored.
 */
describe('normalizeGithubToolResult (url scheme allowlist)', () => {
  const editWithStdoutUrl = (url: string) =>
    // `gh issue edit 5` supplies repo+number identity; the stdout URL is the
    // attacker-controlled value under test.
    runCommand(`gh issue edit 5 --repo azzar/azzar`, url);

  it.each([
    ['javascript:alert(1)', 'javascript'],
    ['data:text/html,x', 'data'],
    ['file:///etc/passwd', 'file'],
  ])('drops the persisted url for a %s scheme', (url) => {
    // A non-github scheme never matches the entity-URL regex, so the ref falls
    // back to the command's edit target (number 5) and carries no url.
    const operation = editWithStdoutUrl(url);

    expect(operation?.params.identifier).toBe('azzar/azzar#5');
    expect(operation?.params.url).toBeUndefined();
  });

  it('keeps a plain https github url', () => {
    const operation = runCommand(
      `gh issue create --repo azzar/azzar --title 'ok'`,
      '',
    );

    expect(operation?.params.url).toBe('');
  });

  it('keeps a structured-result html_url only when it is http(s)', () => {
    const good = normalizeGithubToolResult({
      data: { html_url: '', number: 9 },
      args: { owner: 'azzar', repo: 'azzar' },
      toolName: 'create_issue',
    });
    expect(good?.params.url).toBe('');

    const bad = normalizeGithubToolResult({
      data: { html_url: 'javascript:alert(1)', number: 9 },
      args: { owner: 'azzar', repo: 'azzar' },
      toolName: 'create_issue',
    });
    expect(bad?.params.identifier).toBe('azzar/azzar#9');
    expect(bad?.params.url).toBeUndefined();
  });
});

/**
 * Heterogeneous / device shell surface (codex `command_execution`, claude-code
 * `Bash`, azzar-local-system `runCommand`): same gh-CLI parsing, but no
 * toolName gate — the caller has already scoped the record to a shell tool.
 */
describe('normalizeGithubShellToolResult', () => {
  it('registers a codex-style gh pr create from command + stdout', () => {
    const operation = normalizeGithubShellToolResult({
      data: {
        command: `git push -u origin fix/tray && gh pr create --title 'Fix tray' --body 'Details'`,
        exitCode: 0,
        output: '',
      },
      toolName: 'command_execution',
    });

    expect(operation?.params).toMatchObject({
      changeType: 'created',
      identifier: 'azzar/azzar#17654',
      resourceId: 'azzar/azzar#17654',
      resourceType: 'github_pull_request',
      title: 'Fix tray',
      toolName: 'command_execution',
      url: '',
    });
  });

  it('resolves a claude-code Bash edit target without an exit code', () => {
    // claude-code persists no exitCode; failures are excluded upstream via the
    // plugin error, so a missing exit code must not reject the record.
    const operation = normalizeGithubShellToolResult({
      data: {
        command: `gh issue edit 952 --repo azzar/azzar --title 'Better title'`,
        output: '',
      },
      toolName: 'Bash',
    });

    expect(operation?.params).toMatchObject({
      changeType: 'updated',
      identifier: 'azzar/azzar#952',
      resourceType: 'github_issue',
      title: 'Better title',
    });
  });

  it('unwraps the codex login-shell wrapper before parsing', () => {
    // Codex spawns every command as `/bin/zsh -lc '<payload>'` and the adapter
    // records that argv verbatim (`adapters/codex.test.ts` fixtures).
    const operation = normalizeGithubShellToolResult({
      data: {
        command: `/bin/zsh -lc 'git push -u origin fix/tray && gh pr create --title "Fix tray"'`,
        exitCode: 0,
        output: '',
      },
      toolName: 'command_execution',
    });

    expect(operation?.params).toMatchObject({
      changeType: 'created',
      identifier: 'azzar/azzar#17654',
      resourceType: 'github_pull_request',
      title: 'Fix tray',
      url: '',
    });
  });

  it('keeps outer segments chained after a -c wrapper', () => {
    // The -c payload replaces only its own segment; `&& gh pr create ...`
    // lives at the OUTER level and must still parse.
    const operation = normalizeGithubShellToolResult({
      data: {
        command: `bash -c 'git push' && gh pr create --repo azzar/azzar --title 'Outer chain'`,
        exitCode: 0,
        output: '',
      },
      toolName: 'command_execution',
    });

    expect(operation?.params).toMatchObject({
      changeType: 'created',
      identifier: 'azzar/azzar#91',
      title: 'Outer chain',
    });
  });

  it('keeps a non--c shell invocation as an ordinary command chain', () => {
    // `bash ./prepare.sh` runs a script, not a `-c` wrapper — the later gh
    // segment must still parse from the original token stream.
    const operation = normalizeGithubShellToolResult({
      data: {
        command: `bash ./prepare.sh && gh pr create --repo azzar/azzar --title 'After script'`,
        exitCode: 0,
        output: '',
      },
      toolName: 'command_execution',
    });

    expect(operation?.params).toMatchObject({
      changeType: 'created',
      identifier: 'azzar/azzar#90',
      title: 'After script',
    });
  });

  it('registers gh pr create that follows a heredoc body with an apostrophe', () => {
    // Claude Code writes the PR body with a heredoc in the same Bash call; the
    // body is file content, so its `panel's` must not read as an open quote.
    const operation = normalizeGithubShellToolResult({
      data: {
        command: [
          "cd /repo && cat > /tmp/pr-body.md <<'EOF'",
          "Rename in the panel's menu now opens a dialog.",
          'EOF',
          'gh pr create --base canary --title "Fix rename" --body-file /tmp/pr-body.md',
        ].join('\n'),
        output: '',
      },
      toolName: 'Bash',
    });

    expect(operation?.params).toMatchObject({
      changeType: 'created',
      identifier: 'azzar/azzar#20360',
      resourceType: 'github_pull_request',
      title: 'Fix rename',
    });
  });

  it('treats an unquoted newline as a command separator', () => {
    const operation = normalizeGithubShellToolResult({
      data: {
        command: 'git push -u origin fix/x\ngh pr create --title "Fix x" --body "Details"',
        output: '',
      },
      toolName: 'Bash',
    });

    expect(operation?.params).toMatchObject({
      identifier: 'azzar/azzar#20361',
      title: 'Fix x',
    });
  });

  it('keeps a newline inside a quoted body as part of the argument', () => {
    const operation = normalizeGithubShellToolResult({
      data: {
        command: 'gh pr create --title "Fix y" --body "line one\nline two"',
        output: '',
      },
      toolName: 'Bash',
    });

    expect(operation?.params).toMatchObject({
      identifier: 'azzar/azzar#20362',
      title: 'Fix y',
    });
  });

  it('strips a heredoc body inside a codex login-shell wrapper', () => {
    const payload = [
      "cat > /tmp/b.md <<'EOF'",
      "It's ready",
      'EOF',
      'gh pr create --title "Fix z" --body-file /tmp/b.md',
    ].join('\n');
    const operation = normalizeGithubShellToolResult({
      data: {
        command: `/bin/zsh -lc '${payload.replaceAll("'", `'\\''`)}'`,
        exitCode: 0,
        output: '',
      },
      toolName: 'command_execution',
    });

    expect(operation?.params).toMatchObject({
      identifier: 'azzar/azzar#20363',
      title: 'Fix z',
    });
  });

  it('keeps a heredoc example inside a quoted body verbatim', () => {
    // A `<<` inside quotes is literal text, not a redirection — the body
    // snapshot must still mirror what was sent to GitHub.
    const body = ['Repro:', 'cat <<EOF', 'hello', 'EOF', 'Done.'].join('\n');
    const operation = normalizeGithubShellToolResult({
      data: {
        command: `gh pr create --title "Fix w" --body "${body}"`,
        output: '',
      },
      toolName: 'Bash',
    });

    expect(operation?.params).toMatchObject({
      identifier: 'azzar/azzar#20365',
      title: 'Fix w',
    });
    expect(operation?.params.content).toBe(body);
  });

  it('leaves a quoted `<<` without a delimiter line untouched', () => {
    const operation = normalizeGithubShellToolResult({
      data: {
        command: 'gh pr create --title "Shift a << b" --body "Details"',
        output: '',
      },
      toolName: 'Bash',
    });

    expect(operation?.params).toMatchObject({
      identifier: 'azzar/azzar#20364',
      title: 'Shift a << b',
    });
  });

  it('skips failed commands and non-gh shell output', () => {
    expect(
      normalizeGithubShellToolResult({
        data: { command: `gh pr create --title 'x'`, exitCode: 1, output: 'error' },
        toolName: 'command_execution',
      }),
    ).toBeNull();

    expect(
      normalizeGithubShellToolResult({
        data: { command: 'ls -la', exitCode: 0, output: 'README.md' },
        toolName: 'Bash',
      }),
    ).toBeNull();

    // A github URL merely PRINTED by a non-create/edit command must not register.
    expect(
      normalizeGithubShellToolResult({
        data: {
          command: 'gh pr view 17654',
          exitCode: 0,
          output: '',
        },
        toolName: 'command_execution',
      }),
    ).toBeNull();
  });
});
