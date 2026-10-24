import { AgentIcon, agentMappings } from '@azzar/icons';
import { Flexbox } from '@azzar/ui';

export default () => {
  return (
    <Flexbox gap={16} horizontal width={'100%'} wrap={'wrap'}>
      {Object.values(agentMappings).map((item) => {
        const agent = item.keywords[0].replace('^', '');
        return <AgentIcon agent={agent} key={agent} size={48} type={'mono'} />;
      })}
    </Flexbox>
  );
};
