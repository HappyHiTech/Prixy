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
import { answerCode } from '@/apis/auth.api';
import { useAuthStore } from '@/stores/useAuthStore';

import { COLORS } from '@/constants';

import { styles } from './VerificationScreen.styles';

const VerificationScreen = () => {
  const email = useOnboardingStore((s) => s.email);
  const code = useOnboardingStore((s) => s.code);
  const setCode = useOnboardingStore((s) => s.setCode);
  const sendPromise = useOnboardingStore((s) => s.sendPromise);
  const setSendPromise = useOnboardingStore((s) => s.setSendPromise);
  const isSubmitting = useOnboardingStore((s) => s.isSubmitting);
  const setIsSubmitting = useOnboardingStore((s) => s.setIsSubmitting);
  const error = useOnboardingStore((s) => s.error);
  const setError = useOnboardingStore((s) => s.setError);
  const reset = useOnboardingStore((s) => s.reset);

  const signIn = useAuthStore((s) => s.signIn);

  const handleChangeCode = (text: string) => {
    setCode(text);
    if (text.length === 6) {
      Keyboard.dismiss();
    }
  };

  const handleVerify = async () => {
    if (!sendPromise) {
      setError('That session expired. Go back and request a new code.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    try {
      const user = await sendPromise;
      const tokens = await answerCode(user, code);
      await signIn(tokens);
      reset();
      router.replace('/home');
    } catch (err) {
      setCode('');
      setError(err instanceof Error ? err.message : 'That code did not work.');
      if (!useOnboardingStore.getState().pendingUser) {
        setSendPromise(null);
      }
    } finally {
      setIsSubmitting(false);
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
            {error ?? `Enter the 6-digit code sent to\n${email}`}
          </Text>
        </View>

        <OnBoardingButton
          onPress={handleVerify}
          buttonText={isSubmitting ? 'Verifying…' : 'Verify'}
          disabled={code.length !== 6 || isSubmitting}
          style={styles.primaryButton}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default VerificationScreen;
