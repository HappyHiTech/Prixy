import { useState } from 'react';
import { View, Pressable, type LayoutChangeEvent } from 'react-native';

import { CATEGORY_ICONS, COLORS } from '@/constants';
import { styles, COLUMNS, GAP } from './IconPicker.styles';

type IconPickerProp = {
  value: string;
  onChange: (name: string) => void;
  disabled?: boolean;
};

const IconPicker = ({ value, onChange, disabled }: IconPickerProp) => {
  const [width, setWidth] = useState(0);

  const handleLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };


  const size = width > 0 ? (width - GAP * (COLUMNS - 1)) / COLUMNS : 0;

  return (
    <View style={styles.grid} onLayout={handleLayout}>
      {size > 0 &&
        CATEGORY_ICONS.map(({ name, label, Icon }) => {
          const isSelected = name === value;

          return (
            <Pressable
              key={name}
              style={[
                styles.option,
                { width: size, height: size, borderRadius: size / 2 },
                isSelected && styles.optionSelected,
              ]}
              onPress={() => onChange(name)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={label}
              accessibilityState={{ selected: isSelected }}
            >
              <Icon
                size={Math.round(size * 0.45)}
                color={isSelected ? COLORS.accent : COLORS.primaryText}
              />
            </Pressable>
          );
        })}
    </View>
  );
};

export default IconPicker;
