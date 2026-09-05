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
import { startSignIn } from '@/apis/auth.api';
import { COLORS } from '@/constants';

import { styles } from './LoginScreen.styles';

const LoginScreen = () => {
  const email = useOnboardingStore((s) => s.email);
  const setEmail = useOnboardingStore((s) => s.setEmail);
  const setCode = useOnboardingStore((s) => s.setCode);
  const setPendingUser = useOnboardingStore((s) => s.setPendingUser);
  const setSendPromise = useOnboardingStore((s) => s.setSendPromise);
  const error = useOnboardingStore((s) => s.error);
  const setError = useOnboardingStore((s) => s.setError);

  const isValidEmail = (s: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

  const handleGetCode = () => {
    setError(null);
    setCode('');
    setPendingUser(null);

    const promise = startSignIn(email.trim().toLowerCase());
    setSendPromise(promise);

    promise.then(
      (user) => setPendingUser(user),
      () => {},
    );

    router.push('/verify');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View>
          <GoBackButton onPress={() => router.push('/')} />
          <View style={styles.header}>
            <Text style={styles.headerText}>
              Enter your email to sign in or get started
            </Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor={COLORS.secondaryText}
            value={email}
            onChangeText={setEmail}
            selectionColor={COLORS.primaryText}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
          />
          <Text style={styles.subtitle}>
            {error ?? "We'll send you a code to confirm it's you"}
          </Text>
        </View>

        <OnBoardingButton
          onPress={handleGetCode}
          buttonText="Get verification code"
          disabled={!isValidEmail(email)}
          style={styles.primaryButton}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
