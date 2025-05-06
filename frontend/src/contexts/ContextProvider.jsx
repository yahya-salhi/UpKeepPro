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
  const [activePanel, setActivePanel] = useState(null); //handel the profile panel

  const [currentColor, setCurrentColor] = useState("#03C9D7");
  const [currentMode, setCurrentMode] = useState("Light");
  const [themeSettings, setThemeSettings] = useState(false);

  const setMode = (e) => {
    setCurrentMode(e.target.value);
    localStorage.setItem("themeMode", e.target.value);
    setThemeSettings(false);
  };
  const setColor = (color) => {
    setCurrentColor(color);
    localStorage.setItem("colorMode", color);
    setThemeSettings(false);
  };

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
        currentColor,
        currentMode,
        activeMenu,
        screenSize,
        setScreenSize,
        handleClick,
        isClicked,
        initialState,
        setIsClicked,
        setActiveMenu,
        setMode,
        setColor,
        themeSettings,
        setThemeSettings,
        activePanel,
        setActivePanel,
      }}
    >
      {children}
    </stateContext.Provider>
  );
};

export const useStateContext = () => useContext(stateContext);
