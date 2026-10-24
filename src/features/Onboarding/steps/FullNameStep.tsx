'use client';

import { SendButton } from '@azzar/editor/react';
import { Button, cssVar, Flexbox, Icon, Input } from '@azzar/ui';
import { SignatureIcon, Undo2Icon } from 'lucide-react';
import { memo, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

import AzzarMessage from '../components/AzzarMessage';

interface FullNameStepProps {
  onBack: () => void;
  onNext: () => void;
}

const FullNameStep = memo<FullNameStepProps>(({ onBack, onNext }) => {
  const { t } = useTranslation('onboarding');
  const existingFullName = useUserStore(userProfileSelectors.fullName);
  const updateFullName = useUserStore((s) => s.updateFullName);

  const [value, setValue] = useState(existingFullName || '');
  const [isNavigating, setIsNavigating] = useState(false);
  const isNavigatingRef = useRef(false);

  const handleNext = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsNavigating(true);
    if (value.trim()) {
      updateFullName(value.trim());
    }
    onNext();
  }, [value, updateFullName, onNext]);

  const handleBack = useCallback(() => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setIsNavigating(true);
    onBack();
  }, [onBack]);

  return (
    <Flexbox gap={16}>
      <AzzarMessage sentences={[t('username.title'), t('username.title2'), t('username.title3')]} />
      <Flexbox horizontal align={'center'} gap={12}>
        <Input
          autoFocus
          placeholder={t('username.placeholder')}
          size="large"
          style={{ paddingBlock: 8 }}
          title={t('username.hint')}
          value={value}
          prefix={
            <Icon
              color={cssVar.colorTextDescription}
              icon={SignatureIcon}
              size={32}
              style={{
                marginInline: 8,
              }}
            />
          }
          styles={{
            input: {
              fontSize: 28,
              fontWeight: 'bolder',
            },
          }}
          suffix={
            <SendButton
              disabled={!value?.trim() || isNavigating}
              type="primary"
              style={{
                zoom: 1.5,
              }}
              onClick={handleNext}
            />
          }
          onChange={(e) => setValue(e.target.value)}
          onPressEnter={handleNext}
        />
      </Flexbox>
      <Flexbox horizontal justify={'flex-start'} style={{ marginTop: 32 }}>
        <Button
          disabled={isNavigating}
          icon={Undo2Icon}
          type={'text'}
          style={{
            color: cssVar.colorTextDescription,
          }}
          onClick={handleBack}
        >
          {t('back')}
        </Button>
      </Flexbox>
    </Flexbox>
  );
});

FullNameStep.displayName = 'FullNameStep';

export default FullNameStep;
