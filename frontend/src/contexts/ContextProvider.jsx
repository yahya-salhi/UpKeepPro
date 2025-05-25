import { createContext, useContext, useState, useEffect } from "react";

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

  // Close all dropdowns when URL changes
  useEffect(() => {
    const closeDropdownsOnNavigation = () => {
      setIsClicked(initialState);
    };

    // Listen for history changes
    window.addEventListener('popstate', closeDropdownsOnNavigation);
    
    // Clean up
    return () => {
      window.removeEventListener('popstate', closeDropdownsOnNavigation);
    };
  }, []);

  // Handle clicks outside of dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Skip if no dropdowns are open
      if (!isClicked.chat && !isClicked.notification && !isClicked.userProfile) {
        return;
      }
      
      // Check if the click was on a NavButton (which has its own click handler)
      if (event.target.closest('[data-dropdown-toggle]')) {
        return;
      }
      
      // If click was outside dropdown content, close all dropdowns
      if (!event.target.closest('[data-dropdown-content]')) {
        setIsClicked(initialState);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClicked]);

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
    setIsClicked((prev) => {
      // If clicking the same item that's already open, close it
      if (prev[clicked]) {
        return { ...initialState };
      }
      
      // Otherwise, close all other items and open the clicked one
      return {
        ...initialState,
        [clicked]: true
      };
    });
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
