import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Loader from "../assets/loader.gif";
import { setAvatarRoute } from "../utils/ApiRoutes";
import multiavatar from "@multiavatar/multiavatar";

const SetAvatar = () => {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 3000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    if (!localStorage.getItem("chat-app-user")) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchAvatars = () => {
      try {
        const avatarsData = [];
        for (let i = 0; i < 4; i++) {
          const randomNumber = Math.round(Math.random() * 1000);
          avatarsData.push(btoa(multiavatar(`${randomNumber}`))); // Convert SVG to Base64
        }
        setAvatars(avatarsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading avatars:", error.message);
        toast.error("Failed to load avatars. Please try again.", toastOptions);
      }
    };

    fetchAvatars();
  }, []);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
      return;
    }

    const user = JSON.parse(localStorage.getItem("chat-app-user"));
    if (!user || !user._id) {
      toast.error("User not found. Please log in again.", toastOptions);
      return;
    }

    try {
      const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: avatars[selectedAvatar],
      });

      if (data.isSet) {
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem("chat-app-user", JSON.stringify(user));
        navigate("/");
      } else {
        toast.error("Error setting avatar. Please try again.", toastOptions);
      }
    } catch (error) {
      console.error("Error setting avatar:", error.message);
      toast.error("Failed to set avatar. Please try again.", toastOptions);
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="h-screen flex items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900">
          <img src={Loader} alt="loader" className="w-36 sm:w-42" />
        </div>
      ) : (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900 px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 bg-opacity-60 backdrop-blur-md border border-gray-700 shadow-lg rounded-lg p-8 w-full max-w-lg lg:max-w-4xl text-center flex flex-col gap-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">
              Pick Your Avatar
            </h1>
            <div className="flex flex-wrap justify-center lg:justify-between gap-8 mb-8">
              {avatars.map((avatar, index) => (
                <div
                  key={index}
                  className={`border-4 rounded-full ${
                    selectedAvatar === index
                      ? "border-teal-400"
                      : "border-transparent"
                  } cursor-pointer hover:scale-105 transition-transform duration-300`}
                  onClick={() => setSelectedAvatar(index)}
                >
                  <img
                    src={`data:image/svg+xml;base64,${avatar}`}
                    alt="avatar"
                    className="w-28 rounded-full"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={setProfilePicture}
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-lg shadow-lg transition duration-150"
            >
              Set as Profile Picture
            </button>
          </div>
          <ToastContainer />
        </div>
      )}
    </>
  );
};

export default SetAvatar;
