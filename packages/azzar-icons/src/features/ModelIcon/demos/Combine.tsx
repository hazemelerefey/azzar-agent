import { ModelIcon, modelMappings } from '@azzar/icons';
import { Grid } from '@azzar/ui';

export default () => {
  return (
    <Grid gap={16} width={'100%'}>
      {Object.values(modelMappings).map((item) => {
        const model = item.keywords[0].replace('^', '');
        return <ModelIcon key={model} model={model} size={28} type={'combine'} />;
      })}
    </Grid>
  );
};
