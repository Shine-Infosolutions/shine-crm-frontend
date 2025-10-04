import { useAppContext } from "../context/AppContext";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const { darkMode, sidebarOpen, toggleSidebar } = useAppContext();

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 dark:text-white">
        <Sidebar />



        <div className={`flex-1 flex flex-col transition-all duration-300 overflow-hidden ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}>
          <Header />
          <main
            className="flex-1 overflow-y-auto overflow-x-hidden"
            style={{ scrollbarWidth: "none" }}
          >
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
