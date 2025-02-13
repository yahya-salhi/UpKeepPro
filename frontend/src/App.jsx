import "./App.css";

import { Routes, Route } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { Loader } from "lucide-react";

import { NavBar, Footer, Sidebar, ThemeSettings } from "./components";
import {
  Dashboard,
  SingUp,
  Calendar,
  Employees,
  Stacked,
  Pyramid,
  Customers,
  Kanban,
  Area,
  Bar,
  Pie,
  Financial,
  ColorPicker,
  ColorMapping,
  Editor,
  Line,
  Chat,
  Login,
  Profile,
} from "./pages";
import { useStateContext } from "./contexts/ContextProvider";

import { Toaster } from "react-hot-toast";

function App() {
  // const activeMenu = true;
  const { activeMenu } = useStateContext();

  return (
    <div>
      <div className="flex relative dark:bg-main-dark-bg">
        <div className="fixed right-4 bottom-4" style={{ zIndex: "1000" }}>
          <TooltipComponent content="Settings" position="Top">
            <button
              type="button"
              className="text-3xl p-3 hover:drop-shadow-xl hover:bg-light-gray text-white"
              style={{ background: "blue", borderRadius: "50%" }}
            >
              <FiSettings />
            </button>
          </TooltipComponent>
        </div>
        {activeMenu ? (
          <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white">
            <Sidebar />
          </div>
        ) : (
          <div className="w-0 dark:bg-secondary-dark-bg">
            <Sidebar />
          </div>
        )}
        <div
          className={
            activeMenu
              ? "dark:bg-main-dark-bg  bg-main-bg min-h-screen md:ml-72 w-full  "
              : "bg-main-bg dark:bg-main-dark-bg  w-full min-h-screen flex-2 "
          }
        >
          <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbars w-full ">
            <NavBar />
          </div>

          <div>
            <Routes>
              {/* Dashboard HOMEPage  */}
              <Route path="/" element={<Dashboard />} />

              {/* {login  and homepages} */}
              <Route path="/login" element={<Login />} />
              {/* Dashboard  */}
              <Route path="/Home" element={<Dashboard />} />
              {/* Create Users */}
              <Route path="/signup" element={<SingUp />} />
              <Route path="/profile/:username" element={<Profile />} />
              {/* <Route
                path="/somthing3"
                element={authUser ? <Employees /> : <Navigate to="/login" />}
              />
              <Route
                path="/somthing4"
                element={authUser ? <Customers /> : <Navigate to="/login" />}
              /> */}
              {/* Apps  */}
              {/* <Route
                path="/kanban"
                element={authUser ? <Kanban /> : <Navigate to="/login" />}
              /> */}
              {/* <Route
                path="/editor"
                element={authUser ? <Editor /> : <Navigate to="/login" />}
              /> */}
              {/* <Route
                path="/calendar"
                element={authUser ? <Calendar /> : <Navigate to="/login" />}
              /> */}
              {/* <Route
                path="/color-picker"
                element={authUser ? <ColorPicker /> : <Navigate to="/login" />}
              /> */}
              {/* <Route
                path="chat-app"
                element={authUser ? <Chat /> : <Navigate to="/login" />}
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
        </div>
      </div>
    </div>
  );
}

export default App;
