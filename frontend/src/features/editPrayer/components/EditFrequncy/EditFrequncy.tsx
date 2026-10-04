import { View, Text, Pressable } from 'react-native';

import { daysSince } from '@/utils';

import { useEditPrayerDraftStore } from '../../stores/useEditPrayerDraftStore';

import { styles } from './EditFrequncy.styles';

const ONE_TIME = 'Once';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const OPTIONS = [ONE_TIME, ...DAYS] as const;

type Option = (typeof OPTIONS)[number];

type OnceState = 'normal' | 'dormant' | 'rearmed' | 'unselected';

const EditFrequncy = () => {
  const frequencyType = useEditPrayerDraftStore((s) => s.frequencyType);
  const recurringDays = useEditPrayerDraftStore((s) => s.recurringDays);
  const setFrequency = useEditPrayerDraftStore((s) => s.setFrequency);
  const isDormant = useEditPrayerDraftStore((s) => s.isDormant);
  const lastPrayedAt = useEditPrayerDraftStore((s) => s.lastPrayedAt);
  const prayAgain = useEditPrayerDraftStore((s) => s.prayAgain);
  const togglePrayAgain = useEditPrayerDraftStore((s) => s.togglePrayAgain);

  let onceState: OnceState = 'unselected';
  if (frequencyType === 'one_time') {
    if (!isDormant) onceState = 'normal';
    else onceState = prayAgain ? 'rearmed' : 'dormant';
  }

  let onceSubtext: string | null = null;
  if (lastPrayedAt && onceState === 'dormant') {
    onceSubtext = `Prayed ${new Date(lastPrayedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })}`;
  } else if (lastPrayedAt && onceState === 'rearmed') {
    onceSubtext = `In deck ${daysSince(lastPrayedAt) === 0 ? 'tomorrow' : 'today'}`;
  }

  const selected: Option[] =
    frequencyType === 'one_time'
      ? [ONE_TIME]
      : (recurringDays.filter((day) =>
          DAYS.includes(day as (typeof DAYS)[number]),
        ) as Option[]);

  const toggle = (item: Option) => {
    if (item === ONE_TIME) {
      if (frequencyType === 'one_time') {
        if (isDormant) togglePrayAgain();
        return;
      }

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
      <Text style={styles.header}>Set Frequency</Text>
      <View style={styles.card}>
        {OPTIONS.map((item, index) => {
          const isOnce = item === ONE_TIME;
          const isSelected = isOnce
            ? onceState === 'normal' || onceState === 'rearmed'
            : selected.includes(item);
          const isDormantOnce = isOnce && onceState === 'dormant';
          const subtext = isOnce ? onceSubtext : null;

          return (
            <Pressable
              key={item}
              onPress={() => toggle(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityHint={
                isDormantOnce
                  ? 'Adds this request back to your prayer deck'
                  : undefined
              }
              style={[
                styles.option,
                index % 4 !== 3 && styles.optionBorderRight,
                index < 4 && styles.optionBorderBottom,
                isSelected && styles.optionSelected,
                isDormantOnce && styles.optionDormant,
                subtext !== null && styles.optionWithSubtext,
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                  isDormantOnce && styles.optionTextDormant,
                ]}
              >
                {item}
              </Text>
              {subtext !== null && (
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.8}
                  style={[
                    styles.optionSubtext,
                    isSelected && styles.optionSubtextSelected,
                  ]}
                >
                  {subtext}
                </Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default EditFrequncy;
