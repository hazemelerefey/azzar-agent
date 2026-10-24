import { Text } from '@azzar/ui';
import { Surface } from '@azzar/ui/dashboard';

export default () => {
  return (
    <Surface style={{ padding: 16 }}>
      <Text weight="bold">Workspace card</Text>
      <Text type="secondary">
        Elevated fill and border, so the panel sits above the page canvas.
      </Text>
    </Surface>
  );
};
