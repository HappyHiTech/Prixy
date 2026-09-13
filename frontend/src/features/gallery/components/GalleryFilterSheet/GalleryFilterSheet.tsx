import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Check } from 'lucide-react-native';

import BottomSheet from '@/components/BottomSheet/BottomSheet';

import { usePrayeeQuery } from '@/hooks/TanStack/prayee/usePrayeesQuery';
import { useCategoriesQuery } from '@/hooks/TanStack/category/useCategoriesQuery';
import { useGalleryStore } from '../stores/useGalleryStore';

import { COLORS } from '@/constants';
import type { PrayerRequestStatus } from '@/types/prayerRequest';
import { styles } from './GalleryFilterSheet.style';

export type FilterType = 'Prayee' | 'Category' | 'Status';

const STATUS_OPTIONS: { id: PrayerRequestStatus; name: string }[] = [
  { id: 'inbox', name: 'Inbox' },
  { id: 'active', name: 'Active' },
  { id: 'answered', name: 'Answered' },
];

type GalleryFilterSheetProps = {
  type: FilterType;
  onClose: () => void;
};

const GalleryFilterSheet = ({ type, onClose }: GalleryFilterSheetProps) => {
  const prayeeId = useGalleryStore((s) => s.prayeeId);
  const categoryId = useGalleryStore((s) => s.categoryId);
  const status = useGalleryStore((s) => s.status);

  const setPrayeeId = useGalleryStore((s) => s.setPrayeeId);
  const setCategoryId = useGalleryStore((s) => s.setCategoryId);
  const setStatus = useGalleryStore((s) => s.setStatus);

  const committed =
    type === 'Prayee' ? prayeeId : type === 'Category' ? categoryId : status;

  const [pending, setPending] = useState<string | null>(committed);

  const prayees = usePrayeeQuery();
  const categories = useCategoriesQuery();

  const source =
    type === 'Prayee'
      ? prayees
      : type === 'Category'
        ? categories
        : { data: STATUS_OPTIONS, isPending: false, isError: false };

  const items = source.data ?? [];

  const handleSave = () => {
    if (type === 'Prayee') setPrayeeId(pending);
    else if (type === 'Category') setCategoryId(pending);
    else setStatus(pending as PrayerRequestStatus | null);

    onClose();
  };

  return (
    <BottomSheet
      title={type}
      saveLabel="Apply"
      canSave={pending !== committed}
      onClose={onClose}
      onSave={handleSave}
    >
      <ScrollView style={styles.list}>
        {source.isError ? (
          <Text style={styles.message}>{"Couldn't load"}</Text>
        ) : source.isPending ? (
          <ActivityIndicator style={styles.spinner} />
        ) : (
          <>
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              onPress={() => setPending(null)}
            >
              <Text style={styles.rowText}>{`All ${type}s`}</Text>
              {pending === null && <Check size={20} color={COLORS.accent} />}
            </Pressable>

            {items.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                onPress={() => setPending(item.id)}
              >
                <Text style={styles.rowText}>{item.name}</Text>

                <View style={styles.check}>
                  {pending === item.id && (
                    <Check size={20} color={COLORS.accent} />
                  )}
                </View>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </BottomSheet>
  );
};

export default GalleryFilterSheet;
