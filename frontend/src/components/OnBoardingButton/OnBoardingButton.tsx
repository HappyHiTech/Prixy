import { Pressable, Text, StyleProp, ViewStyle } from 'react-native';

import { styles } from './OnBoardingButton.styles';

type OnBoardingButtonProp = {
  buttonText: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

const OnBoardingButton = ({
  buttonText,
  onPress,
  style,
}: OnBoardingButtonProp) => {
  return (
    <Pressable style={[styles.container, style]} onPress={onPress}>
      <Text style={styles.buttonText}>{buttonText}</Text>
    </Pressable>
  );
};

export default OnBoardingButton;
