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

import { styles } from './LoginScreen.styles';

const LoginScreen = () => {
  const email = useOnboardingStore((s) => s.email);
  const setEmail = useOnboardingStore((s) => s.setEmail);
  const isValidEmail = (s: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

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
            {"We'll send you a code to confirm it's you"}
          </Text>
        </View>

        <OnBoardingButton
          onPress={() => router.push('/verify')}
          buttonText="Get verification code"
          style={styles.primaryButton}
          disabled={!isValidEmail(email)}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
