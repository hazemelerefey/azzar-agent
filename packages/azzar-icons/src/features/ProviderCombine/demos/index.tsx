import { ModelProvider, ProviderCombine } from '@azzar/icons';
import { Flexbox } from '@azzar/ui';

export default () => {
  return (
    <Flexbox gap={16} width={'100%'} wrap={'wrap'}>
      {Object.values(ModelProvider).map((provider) => (
        <ProviderCombine id={provider} key={provider} provider={provider} size={24} />
      ))}
    </Flexbox>
  );
};
