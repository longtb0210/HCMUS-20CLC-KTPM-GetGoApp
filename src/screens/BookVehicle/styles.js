import { StyleSheet } from "react-native";
import { colors, text } from "~utils/colors.js";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary_50,
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  },
  map: {
    width: "100%",
    height: "50%",
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "white",
    borderRadius: 100,
    padding: 5,
    elevation: 10,
  },
  contentContainer: {
    width: "100%",
    display: "flex",
    flex: 1,
    borderTopWidth: 5,
    borderColor: "rgba(0, 0, 0, 0.05)",
    position: "relative",
    bottom: 5,
  },
  content: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 30,
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
  chooseVehicleContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  confirmBtn: {
    width: "90%",
    position: "absolute",
    bottom: 0,
  },
  pullBarContainer: {
    display: "flex",
    width: "100%",
    marginVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  pullBar: {
    width: 50,
    height: 3,
    backgroundColor: text.color_300,
  },
  distanceLabel: {
    position: "absolute",
    top: 50,
    right: 20,
  },
});

export default styles;
