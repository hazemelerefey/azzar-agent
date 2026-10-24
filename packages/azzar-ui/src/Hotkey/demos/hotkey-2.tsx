import { Hotkey, KeyMapEnum } from '@azzar/ui';

export default () => {
  return (
    <>
      <Hotkey keys={KeyMapEnum.LeftClick} />
      <Hotkey keys={`${KeyMapEnum.Shift}+${KeyMapEnum.Alt}+r`} />
    </>
  );
};
