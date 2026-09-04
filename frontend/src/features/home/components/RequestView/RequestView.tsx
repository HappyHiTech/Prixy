import { View, ActivityIndicator, Text } from "react-native";

import CompactRequestcard from "@/components/CompactRequestCard/CompactRequestCard";

import { usePrayerRequests } from "@/hooks/TanStack/usePrayerRequests";

import { styles } from "./RequestView.styles";

const RequestView = () => {
  const { data: prayReqs, isPending, isError, error } = usePrayerRequests();

  if (isPending) {
    return (
      <View style={styles.container}>
        <ActivityIndicator style={styles.stateIndicator} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Text style={styles.stateText}>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {prayReqs.map((item) => (
        <CompactRequestcard key={item.id} prayReq={item} />
      ))}
    </View>
  );
};

export default RequestView;
