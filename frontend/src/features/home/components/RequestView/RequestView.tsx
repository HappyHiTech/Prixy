import { View, ActivityIndicator, Text } from 'react-native';

import CompactRequestcard from '@/components/CompactRequestCard/CompactRequestCard';

import { usePrayerRequests } from '@/hooks/TanStack/usePrayerRequests';
import { useHomeStore } from '../../stores/useHomeStore';

import { styles } from './RequestView.styles';

const RequestView = () => {
  const activeSegment = useHomeStore((s) => s.activeSegment);
  const {
    data: prayReqs,
    isPending,
    isError,
    error,
  } = usePrayerRequests(activeSegment);
  console.log(prayReqs);

  if (isPending) {
    return (
      <View style={styles.container}>
        <ActivityIndicator style={styles.stateIndicator} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.stateText}>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {prayReqs.map((item) => (
        <CompactRequestcard key={item.id} prayReq={item} />
      ))}
    </View>
  );
};

export default RequestView;
