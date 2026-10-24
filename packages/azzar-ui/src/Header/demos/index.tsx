import { Header } from '@azzar/ui';
import { AZZAR } from '@azzar/ui/brand';

export default () => {
  return <Header actions={'ACTIONS'} logo={<AZZAR type={'combine'} />} nav={'NAV'} />;
};
