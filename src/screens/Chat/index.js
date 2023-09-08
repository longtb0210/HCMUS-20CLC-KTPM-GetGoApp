import { View, Image, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useRef, useEffect, useState } from "react";
import { faChevronLeft, faPaperPlane, faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { colors, text } from "~utils/colors";
import { useNavigation } from "@react-navigation/native";
import styles from "./styles";
import socketServcies from "~utils/websocketContext";
import { useSelector } from "react-redux";
import { selectToken, selectUserInfo, selectDriver } from "~/slices/navSlice";
import { request } from "~utils/request";
import Loading from "~components/Loading";

export default () => {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const [chatBuffers, setChatBuffers] = useState([]);
  const token = useSelector(selectToken);
  const headers = {
    Authorization: "Bearer " + token,
  };
  const userInfo = useSelector(selectUserInfo);
  const [textInput, setTextInput] = useState();
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [gettingMsg, setGettingMsg] = useState(false);
  // const driverId = "64f9820a37f9084f94624c15";
  const driverId = useSelector(selectDriver);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    try {
      socketServcies.initializeSocket("chatting");
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    setGettingMsg(true);
    try {
      socketServcies.on(`message_${userInfo._id}_${driverId}`, (msg) => {
        setChatBuffers((chatBuffers) => [...chatBuffers, msg.content]);
      });
    } catch (error) {
      console.log(error);
    } finally {
      setGettingMsg(false);
    }
  }, []);

  useEffect(() => {
    if (gettingMsg) return;
    (async () => {
      setLoading(true);
      await request
        .get(`get-messages-driver/${driverId}`, { headers: headers })
        .then((response) => {
          setChatBuffers(response.data);
        })
        .catch((err) => {
          console.log(err);
        })
        .then(function () {
          setLoading(false);
        });
    })();
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const formattedTime = `${(hours < 10 ? "0" : "") + hours}:${(minutes < 10 ? "0" : "") + minutes}`;
    return formattedTime;
  };

  const handleSendMessage = async () => {
    if (!textInput) return;
    setSending(true);
    const body = {
      driver_receive: driverId,
      content: textInput,
    };
    await request
      .post("create-message", body, {
        headers: headers,
      })
      .then(function (res) {
        setTextInput();
        setChatBuffers((chatBuffers) => [...chatBuffers, res.data]);
      })
      .catch(function (error) {
        console.log("Send message error: ", error);
      })
      .then(function () {
        setSending(false);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.heading_container}>
        <View style={styles.heading_left}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <FontAwesomeIcon icon={faChevronLeft} size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.heading_left_infor}>
            <Image style={styles.infor_image} source={require("~assets/no-avatar.png")} />
            <Text style={styles.infor_text}>Nguyễn Văn A</Text>
          </View>
        </View>
        <TouchableOpacity>
          <FontAwesomeIcon icon={faPhone} size={24} color="white" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.mess_container}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollToBottom()}
        onLayout={() => scrollToBottom()}
      >
        {chatBuffers.map((item, index) => (
          <View key={index}>
            <View style={item.customer_receive ? styles.mess_receive : styles.mess_send}>
              <Text style={styles.mess_txt}>{item.content}</Text>
              <Text style={styles.mess_time}>{formatTime(item.createdAt)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.chat_container}>
        <View style={styles.chat_input_container}>
          <TextInput
            style={styles.chat_input}
            placeholder="Nhập tin nhắn..."
            onChangeText={setTextInput}
            value={textInput}
          />
          <View style={[styles.loading, { display: sending ? "flex" : "none" }]}>
            <ActivityIndicator color={colors.primary_300} animating hidesWhenStopped />
          </View>
        </View>
        <TouchableOpacity onPress={handleSendMessage}>
          <FontAwesomeIcon icon={faPaperPlane} size={24} color={colors.primary_300} />
        </TouchableOpacity>
      </View>
      <Loading loading={loading} />
    </View>
  );
};
