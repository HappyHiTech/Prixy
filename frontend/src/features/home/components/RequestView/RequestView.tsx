import { View } from "react-native";

import CompactRequestcard from "@/components/CompactRequestCard/CompactRequestCard";

import { mockRequests } from "@/mockData/prayerRequest";
import { styles } from "./RequestView.styles";

const RequestView = () => {
  return (
    <View style={styles.container}>
      {mockRequests.map((item) => (
        <CompactRequestcard key={item.id} prayReq={item} />
      ))}
    </View>
  );
};

export default RequestView;
