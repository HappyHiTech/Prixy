import { View, Pressable } from 'react-native';

import { CATEGORY_ICONS, COLORS } from '@/constants';
import { styles, COLUMNS } from './IconPicker.styles';

type IconPickerProp = {
  value: string;
  onChange: (name: string) => void;
  disabled?: boolean;
};

const rows = Array.from(
  { length: Math.ceil(CATEGORY_ICONS.length / COLUMNS) },
  (_, i) => CATEGORY_ICONS.slice(i * COLUMNS, (i + 1) * COLUMNS),
);

const IconPicker = ({ value, onChange, disabled }: IconPickerProp) => {
  return (
    <View style={styles.container}>
      {rows.map((row, index) => (
        <View key={index} style={styles.grid}>
          {row.map(({ name, label, Icon }) => {
            const isSelected = name === value;

            return (
              <Pressable
                key={name}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => onChange(name)}
                disabled={disabled}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected: isSelected }}
              >
                <Icon
                  size={24}
                  color={isSelected ? COLORS.accent : COLORS.primaryText}
                />
              </Pressable>
            );
          })}

          {/* Keep a short final row aligned to the grid instead of stretched. */}
          {Array.from({ length: COLUMNS - row.length }, (_, i) => (
            <View key={`spacer-${i}`} style={styles.spacer} />
          ))}
        </View>
      ))}
    </View>
  );
};

export default IconPicker;
