import { StyleSheet } from "react-native";
import { colors, text } from "~utils/colors.js";

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: "100%",
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: text.color_500,
  },
  titleContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
  },
  title: {
    marginLeft: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: text.color_800,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: text.color_800,
  },
  icon: {
    height: 50,
    width: 50,
    resizeMode: "contain",
  },
});

export default styles;