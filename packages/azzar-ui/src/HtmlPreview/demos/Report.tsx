import { HtmlPreview } from '@azzar/ui';

import { reportHtml } from './reportHtml';

export default () => (
  <HtmlPreview defaultHeight={1080} fileName={'weekly-report.html'} theme={'dark'}>
    {reportHtml}
  </HtmlPreview>
);
