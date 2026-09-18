import { View } from 'react-native';
import QuickCaptureHeader from '@/features/quickCapture/components/QuickCaptureHeader/QuickCaptureHeader';
import { styles } from './QuickCaptureScreen.styles';

const QuickCaptureScreen = () => {
  return (
    <View style={styles.container}>
      <QuickCaptureHeader />
    </View>
  );
};

export default QuickCaptureScreen;
