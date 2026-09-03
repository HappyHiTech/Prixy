import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    gap: 20,

    paddingHorizontal: 22,
    paddingTop: 70,
  },

  header: {
    alignItems: "center",
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
    borderStyle: "dashed",
    // borderWidth: 2,
  },

  title: {
    borderWidth: 2,
    fontSize: 48,
    fontWeight: "600",
    lineHeight: 52,
  },

  body: {
    alignSelf: "stretch",
    flex: 1,
    // borderWidth: 2,
  },
});
