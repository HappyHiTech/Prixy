import { View, Text } from 'react-native';
import { router } from 'expo-router';

import OnBoardingButton from '@/components/OnBoardingButton/OnBoardingButton';

import { styles } from './WelcomeScreen.styles';

const WelcomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prixy</Text>
      <OnBoardingButton
        onPress={() => router.push('/login')}
        buttonText="Get Started"
      />
    </View>
  );
};

export default WelcomeScreen;
