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

import { COLORS } from '@/constants';

import { styles } from './VerificationScreen.styles';

const VerificationScreen = () => {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View>
          <GoBackButton onPress={() => router.push('/')} />
          <View style={styles.header}>
            <Text style={styles.headerText}>
              We sent you a Verification Code
            </Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              maxLength={1}
              selectionColor={COLORS.primaryText}
            />
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              maxLength={1}
              selectionColor={COLORS.primaryText}
            />
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              maxLength={1}
              selectionColor={COLORS.primaryText}
            />
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              maxLength={1}
              selectionColor={COLORS.primaryText}
            />
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              maxLength={1}
              selectionColor={COLORS.primaryText}
            />
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              maxLength={1}
              selectionColor={COLORS.primaryText}
            />
          </View>
          <Text style={styles.subtitle}>
            {'Enter the 6-digit code sent to your email'}
          </Text>
        </View>

        <OnBoardingButton
          onPress={() => router.push('/home')}
          buttonText="Verify"
          style={styles.primaryButton}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default VerificationScreen;
