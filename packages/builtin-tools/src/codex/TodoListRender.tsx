'use client';

import type { TodoWriteArgs } from '@azzar/builtin-tool-claude-code';
import { ClaudeCodeApiName } from '@azzar/builtin-tool-claude-code';
import { ClaudeCodeRenders } from '@azzar/builtin-tool-claude-code/client';
import type { BuiltinRenderProps } from '@azzar/types';
import { type ComponentType, memo } from 'react';

import { type CodexTodoListArgs, toTodoWriteArgs } from './utils';

const TodoListRender = memo<BuiltinRenderProps<CodexTodoListArgs>>(({ args, ...rest }) => {
  const TodoWriteRender = ClaudeCodeRenders[ClaudeCodeApiName.TodoWrite] as ComponentType<
    BuiltinRenderProps<TodoWriteArgs>
  >;

  return <TodoWriteRender {...rest} args={toTodoWriteArgs(args)} />;
});

TodoListRender.displayName = 'CodexTodoListRender';

export default TodoListRender;
