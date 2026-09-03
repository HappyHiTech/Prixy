import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={"#ffffff"}
      indicatorColor={"#F0F0F3"}
      labelStyle={{ selected: { color: "#3D5A6C" } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/home.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
