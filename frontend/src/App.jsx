import "./App.css";

import { Routes, Route, Navigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { Loader } from "lucide-react";

import { NavBar, Footer, Sidebar, ThemeSettings } from "./components";
import {
  Dashboard,
  SingUp,
  Scheduler,
  Employees,
  ToolingTracking,
  Kanban,
  Tooling,
  Editor,
  Chat,
  Login,
  Profile,
  ToolingExitForm,
  UserKanban,
} from "./pages";
import { useStateContext } from "./contexts/ContextProvider";

import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import SettingsChat from "./pages/chat/SettingsChat";
import CreateTask from "./pages/kanban/CreateTask";

function App() {
  const {
    activeMenu,
    themeSettings,
    setThemeSettings,
    currentColor,
    currentMode,
  } = useStateContext();
  const { data: authUser, isLoading } = useQuery({
    // we use queryKey to give a unique name to our query and refer to it later
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        console.log("authUser is here:", data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      <div className="flex relative dark:bg-main-dark-bg">
        <div className="fixed right-4 bottom-4" style={{ zIndex: "1000" }}>
          <TooltipComponent content="Settings" position="Top">
            <button
              type="button"
              className="text-3xl p-3 hover:drop-shadow-xl hover:bg-light-gray text-white"
              style={{ background: currentColor, borderRadius: "50%" }}
              onClick={() => setThemeSettings(true)}
            >
              <FiSettings />
            </button>
          </TooltipComponent>
        </div>
        {activeMenu ? (
          <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
            {authUser && <Sidebar />}
          </div>
        ) : (
          <div className="w-0 dark:bg-secondary-dark-bg">
            {authUser && <Sidebar />}
          </div>
        )}
        <div
          className={`dark:bg-main-dark-bg bg-main-bg min-h-screen w-full ${
            activeMenu ? "md:ml-72" : "flex-2"
          }`}
        >
          <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbars w-full ">
            {authUser && <NavBar />}
          </div>

          <div>
            {themeSettings && <ThemeSettings />}
            <Routes>
              {/* Dashboard HOMEPage  */}
              <Route
                path="/"
                element={authUser ? <Dashboard /> : <Navigate to="/login" />}
              />

              {/* {login  and homepages} */}
              <Route
                path="/login"
                element={!authUser ? <Login /> : <Navigate to="/" />}
              />
              {/* Dashboard  */}
              <Route
                path="/dashboard"
                element={authUser ? <Dashboard /> : <Navigate to="/login" />}
              />
              {/* Create Users */}
              <Route
                path="/signup"
                element={
                  authUser && authUser.isAdmin ? (
                    <SingUp />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/profile/:username"
                element={authUser ? <Profile /> : <Navigate to="/login" />}
              />
              <Route
                path="/Users"
                element={
                  authUser && authUser.isAdmin ? (
                    <Employees />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              <Route
                path="/tools"
                element={
                  authUser ? <ToolingTracking /> : <Navigate to="/login" />
                }
              />
              {/* Apps  */}
              <Route
                path="/kanban"
                element={
                  authUser && authUser.isAdmin ? (
                    <Kanban />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/Kanban/createtask"
                element={
                  authUser && authUser.isAdmin ? (
                    <CreateTask />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
              <Route
                path="/userkanban"
                element={authUser ? <UserKanban /> : <Navigate to="/login" />}
              />
              <Route
                path="/editor"
                element={authUser ? <Editor /> : <Navigate to="/login" />}
              />
              <Route
                path="/calendar"
                element={authUser ? <Scheduler /> : <Navigate to="/login" />}
              />
              {/* <Route
                path="/calendar"
                element={authUser ? <Calendar /> : <Navigate to="/login" />}
                /> */}
              <Route
                path="/tooling"
                element={authUser ? <Tooling /> : <Navigate to="/login" />}
              />
              <Route
                path="/ExitTooling"
                element={
                  authUser ? <ToolingExitForm /> : <Navigate to="/login" />
                }
              />

              <Route
                path="chat"
                element={authUser ? <Chat /> : <Navigate to="/login" />}
              />
              {/* <Route
                path="settings"
                element={authUser ? <SettingsChat /> : <Navigate to="/login" />}
              /> */}

              {/* Charts  */}
              {/* <Route
                path="/line"
                element={authUser ? <Line /> : <Navigate to="/login" />}
                /> */}
              {/* <Route
                path="/area"
                element={authUser ? <Area /> : <Navigate to="/login" />}
                /> */}
              {/* <Route
                path="/bar"
                element={authUser ? <Bar /> : <Navigate to="/login" />}
              /> */}
              {/* <Route
                path="/pie"
                element={authUser ? <Pie /> : <Navigate to="/login" />}
              /> */}
              {/* <Route
                path="/financial"
                element={authUser ? <Financial /> : <Navigate to="/login" />}
              /> */}
              {/* <Route
                path="/color-mapping"
                element={authUser ? <ColorMapping /> : <Navigate to="/login" />}
              /> */}
              {/* <Route
                path="/pyramid"
                element={authUser ? <Pyramid /> : <Navigate to="/login" />}
              /> */}
              {/* <Route
                path="/stacked"
                element={authUser ? <Stacked /> : <Navigate to="/login" />}
              /> */}
            </Routes>
            <Toaster />
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;
