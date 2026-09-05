import {
  View,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import { router } from 'expo-router';
import GoBackButton from '@/components/GoBackButton/GoBackButton';
import OnBoardingButton from '@/components/OnBoardingButton/OnBoardingButton';

import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { COLORS } from '@/constants';

import { styles } from './VerificationScreen.styles';

const VerificationScreen = () => {
  const email = useOnboardingStore((s) => s.email);
  const code = useOnboardingStore((s) => s.code);
  const setCode = useOnboardingStore((s) => s.setCode);

  const handleChangeCode = (text: string) => {
    setCode(text);
    if (text.length === 6) {
      Keyboard.dismiss();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View>
          <GoBackButton onPress={() => router.push('/login')} />
          <View style={styles.header}>
            <Text style={styles.headerText}>
              We sent you a Verification Code
            </Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="6-digit code"
            placeholderTextColor={COLORS.secondaryText}
            selectionColor={COLORS.primaryText}
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={handleChangeCode}
          />
          <Text style={styles.subtitle}>
            {`Enter the 6-digit code sent to\n${email}`}
          </Text>
        </View>

        <OnBoardingButton
          onPress={() => router.push('/home')}
          buttonText="Verify"
          disabled={code.length !== 6}
          style={styles.primaryButton}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default VerificationScreen;
