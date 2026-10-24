import { Button } from '@azzar/ui';
import { MessageModal } from '@azzar/ui/chat';
import { useState } from 'react';

export default () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        open
      </Button>
      <MessageModal open={open} value={'editable text'} onOpenChange={setOpen} />
    </>
  );
};
