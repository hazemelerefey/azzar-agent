import { ARTIFACT_THINKING_TAG } from '@/const/plugin';

import { createRemarkCustomTagPlugin } from '../remarkPlugins/createRemarkCustomTagPlugin';
import { type MarkdownElement } from '../type';
import Component from './Render';

const AzzarThinkingElement: MarkdownElement = {
  Component,
  remarkPlugin: createRemarkCustomTagPlugin(ARTIFACT_THINKING_TAG),
  scope: 'assistant',
  tag: ARTIFACT_THINKING_TAG,
};

export default AzzarThinkingElement;
