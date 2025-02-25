/* eslint-disable react/prop-types */
import { createContext, useContext, useState } from "react";

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

  const handleClick = (clicked) => {
    setIsClicked((prev) => ({
      chat: clicked === "chat" ? !prev.chat : false,
      notification: clicked === "notification" ? !prev.notification : false,
      userProfile: clicked === "userProfile" ? !prev.userProfile : false,
    }));
  };

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
      }}
    >
      {children}
    </stateContext.Provider>
  );
};

export const useStateContext = () => useContext(stateContext);
