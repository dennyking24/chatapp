import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { sendMessageRoute, receiveMessageRoute } from "../utils/ApiRoutes";
import CryptoJS from "crypto-js"; 
import ChatInput from './ChatInput';
import { v4 as uuidv4 } from "uuid";

const ChatContainer = ({ currentChat, socket }) => {
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();

  const secretKey = "your_secret_key"; // Same secret key used for encryption and decryption

  // Encrypt message using AES
  const encryptMessage = (message) => {
    return CryptoJS.AES.encrypt(message, secretKey).toString();
  };

  // Decrypt message using AES
  const decryptMessage = (encryptedMessage) => {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8); // Converts the bytes back to a string
  };

  useEffect(() => {
    const fetchData = async () => {
      if (currentChat) {
        const data = await JSON.parse(localStorage.getItem("chat-app-user"));
        const response = await axios.post(receiveMessageRoute, {
          from: data._id,
          to: currentChat._id,
        });

        // Decrypt all received messages
        const decryptedMessages = response.data.map((msg) => ({
          fromSelf: msg.fromSelf,
          message: decryptMessage(msg.message), // Decrypt the message
        }));

        setMessages(decryptedMessages);
      }
    };
    fetchData();
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(localStorage.getItem("chat-app-user"));

    // Encrypt the message before sending
    const encryptedMsg = encryptMessage(msg);

    socket.current.emit("send-msg", {
      from: data._id,
      to: currentChat._id,
      msg: encryptedMsg, // Send encrypted message
    });

    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: encryptedMsg, // Send encrypted message
    });

    // Update the UI with the encrypted message (for the current user)
    setMessages((prev) => [...prev, { fromSelf: true, message: msg }]);
  };

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-receive", (msg) => {
        const decryptedMessage = decryptMessage(msg); // Decrypt the received message
        setArrivalMessage({ fromSelf: false, message: decryptedMessage });
      });
    }
  }, []);

  useEffect(() => {
    if (arrivalMessage) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center px-20 md:px-8 py-4 gap-4 shadow-md">
        <img
          className="w-16"
          src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
          alt="avatar"
        />
        <h3 className="text-white text-2xl">{currentChat.username}</h3>
      </div>

      <div className="flex-grow overflow-auto p-6 text-white">
        {messages.map((message) => (
          <div
            ref={scrollRef}
            key={uuidv4()}
            className={`flex ${
              message.fromSelf ? "justify-end" : "justify-start"
            } mb-4`}
          >
            <div
              className={`max-w-xs p-4 rounded-lg shadow-lg ${
                message.fromSelf
                  ? "bg-teal-500 text-white" // Current user's message
                  : "bg-gray-700 text-white" // Other user's message
              }`}
            >
              <p>{message.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <ChatInput handleSendMsg={handleSendMsg} />
      </div>
    </div>
  );
};

export default ChatContainer;

