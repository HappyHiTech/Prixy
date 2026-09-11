import { useMemo, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

import CompactRequestcard from '@/components/CompactRequestCard/CompactRequestCard';

import { usePrayerRequests } from '@/hooks/TanStack/prayerRequest/usePrayerRequestQuery';
import { usePrayeeQuery } from '@/hooks/TanStack/prayee/usePrayeesQuery';
import { useCategoriesQuery } from '@/hooks/TanStack/category/useCategoriesQuery';
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

  const setActiveSegment = useHomeStore((s) => s.setActiveSegment);
  const { data: inboxReqs } = usePrayerRequests('inbox');

  useEffect(() => {
    if (inboxReqs?.length === 0) setActiveSegment('active');
  }, [inboxReqs, setActiveSegment]);

  const { data: prayees } = usePrayeeQuery();
  const { data: categories } = useCategoriesQuery();

  const prayeeNameById = useMemo(
    () => new Map((prayees ?? []).map((p) => [p.id, p.name])),
    [prayees],
  );

  const categoryById = useMemo(
    () => new Map((categories ?? []).map((c) => [c.id, c])),
    [categories],
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
          category={
            item.categoryId ? categoryById.get(item.categoryId) : undefined
          }
        />
      ))}
    </View>
  );
};

export default RequestView;
