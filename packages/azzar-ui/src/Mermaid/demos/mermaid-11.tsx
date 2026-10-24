import { Mermaid } from '@azzar/ui';

const gitGraph = `gitGraph
   commit
   commit
   branch develop
   checkout develop
   commit
   commit
   checkout main
   merge develop
   commit
   commit
`;

export default () => {
  return <Mermaid>{gitGraph}</Mermaid>;
};
