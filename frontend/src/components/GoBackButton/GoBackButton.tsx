import { Pressable } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

import { styles } from './GoBackButton.styles';

type GoBackButtonProp = {
  onPress: () => void;
};

const GoBackButton = ({ onPress }: GoBackButtonProp) => {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <ChevronLeft size={30} color="#FFFFFF" />
    </Pressable>
  );
};

export default GoBackButton;
