import { View } from 'react-native';

import { usePrayerRequests } from '@/hooks/TanStack/usePrayerRequestQuery';

import SegmentedPill from '../SegmentedPill/SegmentedPill';

import { styles } from './SegmentedControlSection.styles';

const SegmentedControlSection = () => {
  const { data: inboxReqs } = usePrayerRequests('inbox');

  return (
    <View style={styles.container}>
      {inboxReqs?.length !== 0 && <SegmentedPill text="inbox" />}

      <SegmentedPill text="active" />
    </View>
  );
};

export default SegmentedControlSection;
