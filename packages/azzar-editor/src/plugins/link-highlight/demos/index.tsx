import {
  ReactEditor,
  ReactEditorContent,
  ReactLinkHighlightPlugin,
  ReactPlainText,
} from '@azzar/editor';

import content from './data.json';

export default () => {
  return (
    <ReactEditor>
      <ReactLinkHighlightPlugin />
      <ReactPlainText>
        <ReactEditorContent content={content} type="json" />
      </ReactPlainText>
    </ReactEditor>
  );
};
