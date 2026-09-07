import { useMemo } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

import CompactRequestcard from '@/components/CompactRequestCard/CompactRequestCard';

import { usePrayerRequests } from '@/hooks/TanStack/usePrayerRequestQuery';
import { usePrayeeQuery } from '@/hooks/TanStack/usePrayeesQuery';
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

  const { data: prayees } = usePrayeeQuery();

  const prayeeNameById = useMemo(
    () => new Map((prayees ?? []).map((p) => [p.id, p.name])),
    [prayees],
  );

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
        <CompactRequestcard
          key={item.id}
          prayReq={item}
          prayeeName={
            item.prayeeId ? prayeeNameById.get(item.prayeeId) : undefined
          }
        />
      ))}
    </View>
  );
};

export default RequestView;
