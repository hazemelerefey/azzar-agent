import { ModelProvider, ProviderIcon } from '@azzar/icons';
import { Flexbox } from '@azzar/ui';

export default () => {
  return (
    <Flexbox gap={16} horizontal width={'100%'} wrap={'wrap'}>
      {Object.values(ModelProvider).map((provider) => (
        <ProviderIcon forceMono key={provider} provider={provider} size={48} type={'mono'} />
      ))}
    </Flexbox>
  );
};
