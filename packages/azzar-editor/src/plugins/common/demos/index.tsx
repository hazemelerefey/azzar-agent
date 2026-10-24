import { ReactEditor, ReactEditorContent, ReactPlainText } from '@azzar/editor';

import content from './data.json';

export default () => {
  return (
    <ReactEditor>
      <ReactPlainText>
        <ReactEditorContent content={content} placeholder={'placeholder...'} type="json" />
      </ReactPlainText>
    </ReactEditor>
  );
};
