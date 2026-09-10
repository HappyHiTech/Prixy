import { View, Pressable } from 'react-native';

import { CATEGORY_ICONS, COLORS } from '@/constants';
import { styles } from './IconPicker.styles';

type IconPickerProp = {
  value: string;
  onChange: (name: string) => void;
  disabled?: boolean;
};

const IconPicker = ({ value, onChange, disabled }: IconPickerProp) => {
  return (
    <View style={styles.grid}>
      {CATEGORY_ICONS.map(({ name, label, Icon }) => {
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
    </View>
  );
};

export default IconPicker;
