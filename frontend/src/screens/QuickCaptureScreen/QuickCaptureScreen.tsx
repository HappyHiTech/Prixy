import { View } from 'react-native';
import QCHeader from '@/features/quickCapture/components/QCHeader/QCHeader';
import TextBody from '@/features/quickCapture/components/TextBody/TextBody';
import QCSaveButton from '@/features/quickCapture/components/QCSaveButton/QCSaveButton';
import { styles } from './QuickCaptureScreen.styles';

const QuickCaptureScreen = () => {
  return (
    <View style={styles.container}>
      <QCHeader />
      <TextBody />
      <QCSaveButton />
    </View>
  );
};

export default QuickCaptureScreen;
