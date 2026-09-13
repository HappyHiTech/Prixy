import { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';

import CompactRequestcard from '@/components/CompactRequestCard/CompactRequestCard';
import NoReq from '@/components/NoReq/NoReq';

import { usePrayerRequests } from '@/hooks/TanStack/prayerRequest/usePrayerRequestQuery';
import { usePrayeeQuery } from '@/hooks/TanStack/prayee/usePrayeesQuery';
import { useCategoriesQuery } from '@/hooks/TanStack/category/useCategoriesQuery';
import { useGalleryStore } from '../stores/useGalleryStore';

import { styles } from './GalleryBody.styles';

const GalleryBody = () => {
  const prayeeId = useGalleryStore((s) => s.prayeeId);
  const categoryId = useGalleryStore((s) => s.categoryId);
  const status = useGalleryStore((s) => s.status);

  const {
    data: prayReqs,
    isPending,
    isError,
    error,
  } = usePrayerRequests(status ?? undefined, { prayeeId, categoryId });

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
      {prayReqs.length === 0 ? (
        <NoReq message="No prayers match these filters." />
      ) : (
        <Text style={styles.subText}>
          {prayReqs.length} {prayReqs.length === 1 ? 'prayer' : 'prayers'}
        </Text>
      )}

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {prayReqs.map((item) => (
          <View key={item.id} style={styles.reqWrapper}>
            <CompactRequestcard
              prayReq={item}
              prayeeName={
                item.prayeeId ? prayeeNameById.get(item.prayeeId) : undefined
              }
              category={
                item.categoryId ? categoryById.get(item.categoryId) : undefined
              }
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default GalleryBody;
