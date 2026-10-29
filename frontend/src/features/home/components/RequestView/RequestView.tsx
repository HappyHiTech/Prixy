import { useMemo, useEffect, useCallback, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';

import CompactRequestcard from '@/components/CompactRequestCard/CompactRequestCard';
import NoReq from '@/components/NoReq/NoReq';

import { usePrayerRequests } from '@/hooks/TanStack/prayerRequest/usePrayerRequestQuery';
import { usePrayeeQuery } from '@/hooks/TanStack/prayee/usePrayeesQuery';
import { useCategoriesQuery } from '@/hooks/TanStack/category/useCategoriesQuery';
import { useDeckQuery } from '@/hooks/TanStack/deck/useDeckQuery';
import { useHomeStore } from '../../stores/useHomeStore';
import type { EditTarget } from '@/features/editPrayer/stores/useEditPrayerStore';

import { styles } from './RequestView.styles';

type RequestViewProps = {
  onEditField: (prayerId: string, field: EditTarget) => void;
};

const RequestView = ({ onEditField }: RequestViewProps) => {
  const activeSegment = useHomeStore((s) => s.activeSegment);
  const {
    data: prayReqs,
    isPending,
    isFetching,
    isError,
    error,
  } = usePrayerRequests(activeSegment);

  const setActiveSegment = useHomeStore((s) => s.setActiveSegment);
  const { data: inboxReqs, isFetching: isFetchingInbox } =
    usePrayerRequests('inbox');

  const deckQuery = useDeckQuery();
  const isActiveTab = activeSegment === 'active';

  // True from blur until the refetches kicked off elsewhere (pray, capture,
  // edit) settle, so Home shows a spinner instead of stale data on return.
  const [isReturning, setIsReturning] = useState(true);

  useFocusEffect(useCallback(() => () => setIsReturning(true), []));

  const returnSegment = inboxReqs?.length === 0 ? 'active' : 'inbox';

  useEffect(() => {
    if (isReturning && !isFetchingInbox) setActiveSegment(returnSegment);
  }, [isReturning, isFetchingInbox, returnSegment, setActiveSegment]);

  if (
    isReturning &&
    !isFetchingInbox &&
    activeSegment === returnSegment &&
    !isFetching &&
    !(isActiveTab && deckQuery.isFetching)
  ) {
    setIsReturning(false);
  }

  useEffect(() => {
    if (!isFetchingInbox && inboxReqs?.length === 0) setActiveSegment('active');
  }, [inboxReqs, isFetchingInbox, setActiveSegment]);

  const { data: prayees } = usePrayeeQuery();
  const { data: categories } = useCategoriesQuery();

  const deckIds = useMemo(
    () => new Set(deckQuery.data?.cards.map((card) => card.id)),
    [deckQuery.data],
  );

  const visibleReqs = useMemo(
    () =>
      isActiveTab
        ? (prayReqs ?? []).filter((req) => deckIds.has(req.id))
        : (prayReqs ?? []),
    [isActiveTab, prayReqs, deckIds],
  );

  const prayeeNameById = useMemo(
    () => new Map((prayees ?? []).map((p) => [p.id, p.name])),
    [prayees],
  );

  const categoryById = useMemo(
    () => new Map((categories ?? []).map((c) => [c.id, c])),
    [categories],
  );

  if (isReturning || isPending || (isActiveTab && deckQuery.isPending)) {
    return (
      <View style={styles.container}>
        <ActivityIndicator style={styles.stateIndicator} />
      </View>
    );
  }

  const loadError = isError
    ? error
    : isActiveTab && !deckQuery.data
      ? deckQuery.error
      : null;

  if (loadError) {
    return (
      <View style={styles.container}>
        <Text style={styles.stateText}>{loadError.message}</Text>
      </View>
    );
  }

  if (visibleReqs.length === 0) {
    return (
      <View style={[styles.container, styles.containerNoRequest]}>
        <NoReq
          message={
            activeSegment === 'inbox'
              ? 'Your inbox is empty.'
              : 'Nothing in your active deck today.'
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {visibleReqs.map((item) => (
        <View key={item.id} style={styles.reqWrapper}>
          <CompactRequestcard
            prayReq={item}
            prayeeName={
              item.prayeeId ? prayeeNameById.get(item.prayeeId) : undefined
            }
            category={
              item.categoryId ? categoryById.get(item.categoryId) : undefined
            }
            onEditField={onEditField}
          />
        </View>
      ))}
    </View>
  );
};

export default RequestView;
