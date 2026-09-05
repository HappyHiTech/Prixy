import { Redirect } from 'expo-router';

// import HomeScreen from "@/screens/HomeScreen/HomeScreen";
import WelcomeScreen from '@/screens/WelcomeScreen/WelcomeScreen';
import { useAuthStore } from '@/stores/useAuthStore';

export default function IndexRoute() {
  const idToken = useAuthStore((s) => s.idToken);

  if (idToken) return <Redirect href="/home" />;

  return <WelcomeScreen />;
}
