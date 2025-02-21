/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect, useRef } from "react";

const stateContext = createContext();

const initialState = {
  chat: false,
  cart: false,
  userProfile: false,
  notification: false,
};

export const ContextProvider = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);
  const [screenSize, setScreenSize] = useState(undefined);
  const [activePanel, setActivePanel] = useState(null);
  const panelRef = useRef(null);

  const handleClick = (clicked) => {
    setIsClicked((prev) => ({
      chat: clicked === "chat" ? !prev.chat : false,
      notification: clicked === "notification" ? !prev.notification : false,
      userProfile: clicked === "userProfile" ? !prev.userProfile : false,
    }));
  };
  // Function to close panels when clicking outside
  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsClicked(initialState);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <stateContext.Provider
      value={{
        activeMenu,
        setActiveMenu,
        isClicked,
        setIsClicked,
        handleClick,
        screenSize,
        setScreenSize,
        activePanel,
        setActivePanel,
        panelRef,
      }}
    >
      {children}
    </stateContext.Provider>
  );
};

export const useStateContext = () => useContext(stateContext);
