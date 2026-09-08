import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';

import { styles } from './EditFrequncy.styles';

const ONE_TIME = 'One time';

const FREQUENCY = [
  ONE_TIME,
  'Mon',
  'Tues',
  'Wed',
  'Thurs',
  'Fri',
  'Sat',
  'Sun',
] as const;

type Frequency = (typeof FREQUENCY)[number];

const EditFrequncy = () => {
  const [selected, setSelected] = useState<Frequency[]>([ONE_TIME]);

  const toggle = (item: Frequency) => {
    setSelected((current) => {
      if (item === ONE_TIME) return [ONE_TIME];

      const withoutOneTime = current.filter((value) => value !== ONE_TIME);
      const isSelected = withoutOneTime.includes(item);
      const next = isSelected
        ? withoutOneTime.filter((value) => value !== item)
        : [...withoutOneTime, item];

      return next.length === 0 ? [ONE_TIME] : next;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Set Frequncy</Text>
      <View style={styles.card}>
        {FREQUENCY.map((item, index) => {
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
