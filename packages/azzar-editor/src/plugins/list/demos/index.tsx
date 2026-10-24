import { ReactEditor, ReactEditorContent, ReactListPlugin, ReactPlainText } from '@azzar/editor';

import content from './data.json';

export default () => {
  return (
    <ReactEditor>
      <ReactPlainText>
        <ReactEditorContent content={content} type="json" />
      </ReactPlainText>
      <ReactListPlugin />
    </ReactEditor>
  );
};
