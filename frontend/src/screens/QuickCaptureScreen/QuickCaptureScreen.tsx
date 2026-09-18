import { View } from 'react-native';
import QuickCaptureHeader from '@/features/quickCapture/components/QuickCaptureHeader/QuickCaptureHeader';
import TextBody from '@/features/quickCapture/components/TextBody/TextBody';
import { styles } from './QuickCaptureScreen.styles';

const QuickCaptureScreen = () => {
  return (
    <View style={styles.container}>
      <QuickCaptureHeader />
      <TextBody />
    </View>
  );
};

export default QuickCaptureScreen;
