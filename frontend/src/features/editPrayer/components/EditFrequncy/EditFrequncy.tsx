import { View, Text, Pressable } from 'react-native';

import { useEditPrayerDraftStore } from '../../stores/useEditPrayerDraftStore';

import type { PrayerRequestFrequencyType } from '@/types/prayerRequest';

import { styles } from './EditFrequncy.styles';

const ONE_TIME = 'One time';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const OPTIONS = [ONE_TIME, ...DAYS] as const;

type Option = (typeof OPTIONS)[number];

const EditFrequncy = () => {
  const frequencyType = useEditPrayerDraftStore((s) => s.frequencyType);
  const recurringDays = useEditPrayerDraftStore((s) => s.recurringDays);
  const setFrequency = useEditPrayerDraftStore((s) => s.setFrequency);

  const selected: Option[] =
    frequencyType === 'one_time'
      ? [ONE_TIME]
      : (recurringDays.filter((day) =>
          DAYS.includes(day as (typeof DAYS)[number]),
        ) as Option[]);

  const toggle = (item: Option) => {
    if (item === ONE_TIME) {
      if (frequencyType === 'one_time') return;

      setFrequency('one_time', []);
      return;
    }

    const current = frequencyType === 'one_time' ? [] : selected;
    const isSelected = current.includes(item);
    const next = isSelected
      ? current.filter((value) => value !== item)
      : [...current, item];

    const nextDays = DAYS.filter((day) => next.includes(day));

    setFrequency(
      nextDays.length === 0 ? 'one_time' : 'recurring',
      nextDays.length === 0 ? [] : [...nextDays],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Set Frequncy</Text>
      <View style={styles.card}>
        {OPTIONS.map((item, index) => {
          const isSelected = selected.includes(item);

          return (
            <Pressable
              key={item}
              onPress={() => toggle(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.option,
                index % 4 !== 3 && styles.optionBorderRight,
                index < 4 && styles.optionBorderBottom,
                isSelected && styles.optionSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default EditFrequncy;
