import { Pressable, Text, StyleProp, ViewStyle } from 'react-native';

import { styles } from './OnBoardingButton.styles';

type OnBoardingButtonProp = React.ComponentProps<typeof Pressable> & {
  buttonText: string;
  style?: StyleProp<ViewStyle>;
};
const OnBoardingButton = ({
  buttonText,
  style,
  disabled,
  ...pressableProps
}: OnBoardingButtonProp) => {
  return (
    <Pressable
      style={[styles.container, disabled && styles.disabledButton, style]}
      disabled={disabled}
      {...pressableProps}
    >
      <Text style={styles.buttonText}>{buttonText}</Text>
    </Pressable>
  );
};

export default OnBoardingButton;
