import { TouchableOpacity, View, Alert } from "react-native";
import styles from "./styles";
import GoogleMap from "~components/GoogleMap";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigation } from "@react-navigation/native";
import ChooseVehicle from "./ChooseVehicle";
import ChooseeMethod from "./ChooseMethod";
import CustomBtn from "~components/Button/CustomBtn";
import { useState, useEffect } from "react";
import DriverInfo from "./DriverInfo";
import { useSelector, useDispatch } from "react-redux";
import {
  selectVehicleType,
  selectTravelTime,
  setTravelTime,
  setDriver,
  setTrip,
  selectOrigin,
  selectDestination,
  selectToken,
  selectOriginAddress,
  selectDestinationAddress,
  selectUserInfo,
} from "~/slices/navSlice";
import { decode } from "@googlemaps/polyline-codec";
import { GOONG_APIKEY } from "@env";
import Loading from "~components/Loading";
import { Parallelogram } from "~components/Shape";
import { colors } from "~utils/colors";
import { request, baseURL } from "~utils/request";
import io from "socket.io-client";

const BookVehicle = () => {
  const navigation = useNavigation();
  const [confirmBtnTitle, setConfirmBtnTitle] = useState("Tiếp tục");
  const [content, setContent] = useState("ChooseVehicle");
  const vehicleType = useSelector(selectVehicleType);
  const travelTime = useSelector(selectTravelTime);
  const origin = useSelector(selectOrigin);
  const originAddress = useSelector(selectOriginAddress);
  const destination = useSelector(selectDestination);
  const destinationAddress = useSelector(selectDestinationAddress);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [polylineMotocycle, setPolylineMotocycle] = useState();
  const [distanceMotocycle, setDistanceMotocycle] = useState();
  const [durationTxtMotocycle, setDurationTxtMotocycle] = useState();
  const [polylineCar, setPolylineCar] = useState();
  const [distanceCar, setDistanceCar] = useState();
  const [durationTxtCar, setDurationTxtCar] = useState();
  const [vehiclechoose, setVehicleChoose] = useState(vehicleType);
  const token = useSelector(selectToken);
  const userInfo = useSelector(selectUserInfo);
  const socket = io(`${baseURL}:3014`);
  const [tripId, setTripId] = useState();
  const [driverInfo, setDriverInfo] = useState();
  const [price, setPrice] = useState(0);
  const [surcharge, setSurcharge] = useState(0);

  const headers = {
    Authorization: "Bearer " + token,
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setLoadingMap(true);
        const polylineMotocycleTmp = await getPolyline(
          origin.latitude,
          origin.longitude,
          destination.latitude,
          destination.longitude,
          "bike"
        );
        setPolylineMotocycle(polylineMotocycleTmp.polyline);
        setDistanceMotocycle(polylineMotocycleTmp.distance);
        setDurationTxtMotocycle(polylineMotocycleTmp.durationTxt);

        const polylineCarTmp = await getPolyline(
          origin.latitude,
          origin.longitude,
          destination.latitude,
          destination.longitude,
          "car"
        );
        setPolylineCar(polylineCarTmp.polyline);
        setDistanceCar(polylineCarTmp.distance);
        setDurationTxtCar(polylineCarTmp.durationTxt);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setLoadingMap(false);
      }
    })();
  }, []);

  const getPolyline = async (oriLat, oriLng, desLat, desLng, vehicle) => {
    try {
      const url = `https://rsapi.goong.io/Direction?origin=${oriLat},${oriLng}&destination=${desLat},${desLng}&vehicle=${vehicle}&api_key=${GOONG_APIKEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.geocoded_waypoints[0].geocoder_status === "OK") {
        const polyline = decode(data.routes[0].overview_polyline.points).map((point) => {
          return {
            latitude: point[0],
            longitude: point[1],
          };
        });
        const distance = data.routes[0].legs[0].distance.value;
        const durationTxt = data.routes[0].legs[0].duration.text;
        return {
          distance: distance,
          polyline: polyline,
          durationTxt: durationTxt,
        };
      } else {
        console.error("getPolyline No results found.");
        return null;
      }
    } catch (error) {
      console.error("getPolyline Error:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (tripId) {
      socket.on(tripId, (data) => {
        if (data.content.status === "Pending" || data.content.status === "Picking Up") {
          console.log("Accept trip data:", data);
          setDriverInfo(data.content.driver);
          dispatch(setDriver(data.content.driver));
          setConfirmBtnTitle("Hủy chuyến");
          setContent("DriverIsComing");
        } else if (data.content.status === "Arriving") {
          console.log("Arriving");
          setContent("Arriving");
        } else if (data.content.status === "Arrived") {
          console.log("Arrived");
          navigation.reset({
            index: 1,
            routes: [{ name: "MainScreen" }, { name: "Feedback" }],
          });
        }
      });
    } else socket.off(tripId);

    return () => {
      socket.off(tripId);
    };
  }, [tripId]);

  const handleBookNow = async () => {
    setLoading(true);
    const body = {
      phone: userInfo.phone,
      address_pickup: originAddress,
      lat_pickup: origin.latitude,
      long_pickup: origin.longitude,
      address_destination: destinationAddress,
      lat_destination: destination.latitude,
      long_destination: destination.longitude,
      vehicleType: vehiclechoose === "motorcycle" ? 1 : vehiclechoose === "car4" ? 4 : 7,
      price: price,
      surcharge: surcharge,
    };
    await request
      .post("create-trip", body, {
        headers: headers,
      })
      .then(function (res) {
        console.log("Create trip data", res.data);
        setTripId(res.data.elements._id);
        dispatch(setTrip(res.data.elements._id));
        setConfirmBtnTitle("Hủy tìm kiếm");
        setContent("FindingDriver");
      })
      .catch(function (error) {
        console.log(error);
      })
      .then(function () {
        setLoading(false);
      });
  };

  const handlecancelTrip = async () => {
    setLoading(true);
    await request
      .patch(
        `cancel-trip/${tripId}`,
        {},
        {
          headers: headers,
        }
      )
      .then(function (res) {
        console.log("Cancel trip successfully!", tripId);
        dispatch(setDriver(null));
      })
      .catch(function (error) {
        console.log("Cancel trip error: ", error);
      })
      .then(function () {
        setLoading(false);
      });
  };

  function handleConfirm() {
    if (content === "ChooseVehicle") {
      setConfirmBtnTitle("Đặt xe");
      setContent("BookNow");
    } else if (content === "BookNow") {
      handleBookNow();
    } else if (content === "FindingDriver") {
      setConfirmBtnTitle("Đặt xe");
      setContent("BookNow");
      handlecancelTrip();
      setDriverInfo();
    } else if (content === "DriverIsComing") {
      Alert.alert("Hủy chuyến", "Bạn có chắc muốn hủy chuyến?", [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: () => {
            setConfirmBtnTitle("Đặt xe");
            setContent("BookNow");
            handlecancelTrip();
            setDriverInfo();
          },
        },
      ]);
    } else if (content === "Scheduling") {
      if (!travelTime) Alert.alert("Lỗi", "Vui lòng chọn thời gian đặt xe.");
      else if (string2Date(travelTime) <= new Date()) Alert.alert("Lỗi", "Thời gian đặt xe không hợp lệ!");
      else {
        dispatch(setTravelTime(null));
        Alert.alert(
          "Đã đặt xe vào " + travelTime,
          "Chúng tôi sẽ báo cho bạn biết thông tin tài xế khi gần đến giờ đón.",
          [
            {
              text: "Đã hiểu",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "MainScreen" }],
                });
              },
            },
          ]
        );
      }
    }
  }

  function string2Date(date) {
    if (!date) return null;
    const [datePart, timePart] = date.split(" ");
    const [day, month, year] = datePart.split("/").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute);
  }

  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.map}>
        {!loadingMap && <GoogleMap polyline={vehiclechoose === "motorcycle" ? polylineMotocycle : polylineCar} />}
      </View>
      <View style={styles.backBtn}>
        <TouchableOpacity
          onPress={() => {
            if (content === "ChooseVehicle") navigation.goBack();
            else {
              setContent("ChooseVehicle");
              setConfirmBtnTitle("Tiếp tục");
            }
          }}
        >
          <FontAwesomeIcon icon={faAngleLeft} color={"rgba(0, 0, 0, 0.8)"} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.distanceLabel}
        onPress={() =>
          Alert.alert(
            "Chi tiết chuyến đi",
            `Quãng đường: ${((vehiclechoose === "motorcycle" ? distanceMotocycle : distanceCar) / 1000).toFixed(
              1
            )} km.\nThời gian: ${vehiclechoose === "motorcycle" ? durationTxtMotocycle : durationTxtCar}.`
          )
        }
      >
        <Parallelogram
          bgColor={`rgba(${hexToRgb(colors.primary_300)}, ${0.9})`}
          w={
            (((vehiclechoose === "motorcycle" ? distanceMotocycle : distanceCar) / 1000).toFixed(1) + " km").length * 7
          }
          h={25}
          label={((vehiclechoose === "motorcycle" ? distanceMotocycle : distanceCar) / 1000).toFixed(1) + " km"}
          labelStyle={{
            color: "white",
            fontSize: 12,
          }}
        />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <View style={styles.pullBarContainer}>
          <View style={styles.pullBar} />
        </View>
        <View style={styles.content}>
          {driverInfo ? (
            <DriverInfo
              originAddress={content === "Arriving" || content === "Arrived" ? "" : originAddress}
              notification={content === "Arriving" || content === "Arrived" ? "Đang di chuyển" : "Tài xế sắp đến"}
              driverInfo={driverInfo}
            />
          ) : (
            <>
              {content === "ChooseVehicle" ? (
                <ChooseVehicle
                  setVehicleChoose={setVehicleChoose}
                  distanceMotocycle={distanceMotocycle}
                  distanceCar={distanceCar}
                  origin={origin}
                  setLoading={setLoading}
                  setPrice={setPrice}
                  setSurcharge={setSurcharge}
                />
              ) : (
                <ChooseeMethod
                  setConfirmBtnTitle={setConfirmBtnTitle}
                  vehicleType={vehicleType}
                  content={content}
                  setContent={setContent}
                />
              )}
            </>
          )}

          <View style={styles.confirmBtn}>
            {content === "Arriving" || content === "Arrived" ? (
              <CustomBtn title={confirmBtnTitle} disable />
            ) : (
              <TouchableOpacity onPress={handleConfirm}>
                <CustomBtn title={confirmBtnTitle} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      <Loading loading={loading} />
    </View>
  );
};

export default BookVehicle;
