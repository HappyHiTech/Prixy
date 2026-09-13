import { View, Text } from 'react-native';
import { HandHeart } from 'lucide-react-native';

import { COLORS } from '@/constants';

import { styles } from './NoReq.styles';

type NoReqProp = {
  message?: string;
};

const NoReq = ({ message = 'No prayer requests yet.' }: NoReqProp) => {
  return (
    <View style={styles.container}>
      <HandHeart size={32} color={COLORS.secondaryText} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

export default NoReq;
