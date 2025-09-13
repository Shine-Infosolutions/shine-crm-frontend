import { useAppContext } from "../context/AppContext";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const { darkMode } = useAppContext();

  return (
    <div className={`min-h-screen ${darkMode ? "dark" : ""}`}>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 dark:text-white">
        <Sidebar />

        <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
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
