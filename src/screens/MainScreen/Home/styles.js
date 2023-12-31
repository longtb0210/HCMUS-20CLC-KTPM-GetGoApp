import { StyleSheet } from "react-native";
import { colors, text } from "~utils/colors.js";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary_50,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    width: "100%",
  },
  content: {
    flex: 1,
    alignItems: "center",
    width: "100%",
  },
  header: {
    backgroundColor: colors.primary_200,
    height: 175,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  titleContainer: {
    display: "flex",
    flexDirection: "column",
  },
  text1: {
    fontSize: 20,
    fontWeight: 500,
    color: "rgba(0, 0, 0, 0.8)",
  },
  text2: {
    fontSize: 32,
    fontWeight: "bold",
    color: "rgba(0, 0, 0, 0.8)",
  },
  headerImage: {
    flex: 0.8,
    resizeMode: "contain",
    alignSelf: "center",
  },
  body: {
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  searchBar: {
    position: "relative",
    top: -20,
  },
  bookingBtn: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  bookingBtnContainer: {
    width: "90%",
  },
  carousel: {
    width: "100%",
    marginTop: 30,
  },
});

export default styles;
