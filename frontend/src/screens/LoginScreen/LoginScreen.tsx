import { View, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import GoBackButton from '@/components/GoBackButton/GoBackButton';
import OnBoardingButton from '@/components/OnBoardingButton/OnBoardingButton';

import { COLORS } from '@/constants';

import { styles } from './LoginScreen.styles';

const LoginScreen = () => {
  return (
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
          selectionColor={COLORS.primaryText}
        />
        <Text style={styles.subtitle}>
          {"We'll send you a code to confirm it's you"}
        </Text>
      </View>

      <OnBoardingButton
        onPress={() => router.push('/verify')}
        buttonText="Get verification code"
        style={styles.primaryButton}
      />
    </View>
  );
};

export default LoginScreen;
