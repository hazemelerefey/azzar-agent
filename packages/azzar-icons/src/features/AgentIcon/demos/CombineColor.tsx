import { AgentIcon, agentMappings } from '@azzar/icons';
import { Grid } from '@azzar/ui';

export default () => {
  return (
    <Grid gap={16} rows={2} width={'100%'}>
      {Object.values(agentMappings).map((item) => {
        const agent = item.keywords[0].replace('^', '');
        return <AgentIcon agent={agent} key={agent} size={28} type={'combine-color'} />;
      })}
    </Grid>
  );
};
