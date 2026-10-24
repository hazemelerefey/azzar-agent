import { EditableText } from '@azzar/ui';
import { useState } from 'react';

export default () => {
  const [value, setValue] = useState('editable text');

  return (
    <EditableText
      value={value}
      onChange={(v) => {
        console.info('changed', v);
        setValue(v);
      }}
    />
  );
};
