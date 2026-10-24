import { Video } from '@azzar/ui';

import { markers, SAMPLE_SRC, sections } from './data';

export default () => (
  <Video markers={markers} maxHeight={360} sections={sections} src={SAMPLE_SRC} />
);
