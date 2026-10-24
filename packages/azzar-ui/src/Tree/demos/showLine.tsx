import { Flexbox } from '@azzar/ui';
import { Text, Tree, type TreeDataNode } from '@azzar/ui';

const task = (id: string, name: string, children?: TreeDataNode[]): TreeDataNode => ({
  children,
  key: id,
  title: (
    <Flexbox horizontal align="center" gap={8} style={{ minWidth: 0, width: '100%' }}>
      <Text fontSize={12} style={{ flex: 'none' }} type="secondary">
        {id}
      </Text>
      <Text ellipsis fontSize={13} style={{ flex: 1, minWidth: 0 }}>
        {name}
      </Text>
    </Flexbox>
  ),
});

const tasks: TreeDataNode[] = [
  task('AZZAR-412', 'Research Collapsible height animation', [
    task('AZZAR-413', 'Compare with the Accordion panel-height approach'),
  ]),
  task('AZZAR-414', 'Implement flattenVisible / conductCheck', [
    task('AZZAR-415', 'utils.test.ts'),
    task('AZZAR-416', 'checkStrictly branch'),
  ]),
  task('AZZAR-417', 'Keyboard navigation + roving tabindex'),
];

export default () => (
  <div style={{ maxWidth: 480, padding: 16 }}>
    <Tree blockNode defaultExpandAll showLine size="large" treeData={tasks} />
  </div>
);
