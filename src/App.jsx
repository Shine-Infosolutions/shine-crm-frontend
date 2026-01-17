import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { registerFCM } from "./utils/registerFCM";
import { AppProvider, useAppContext } from "./context/AppContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout and components
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import DownloadContract from "./components/DownloadContract";

// Pages
import Login from "./pages/Login";
import LeadManagement from "./pages/LeadManagement";
import AddLead from "./pages/AddLead";
import ProjectManagement from "./pages/ProjectManagement";
import AddProject from "./pages/AddProject";
import EmployeeManagement from "./pages/EmployeeManagement";
import AddEmployee from "./pages/AddEmployee";
import ContractManagement from "./pages/ContractManagement";
import EditContract from "./pages/EditContract";
import AddContract from "./pages/AddContract";
import InvoiceManagement from "./pages/InvoiceManagement";
import AddInvoice from "./pages/AddInvoice";
import CreateInvoice from "./pages/CreateInvoice";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import EmployeeTimesheet from "./pages/EmployeeTimesheet";
import WorkHistory from "./pages/WorkHistory";
import WorkSummary from "./pages/WorkSummary";
import TasksManagement from "./pages/TasksManagement";
import TaskManagement from "./pages/TaskManagement";
import TaskAssignment from "./pages/TaskAssignment";
import Settings from "./pages/Settings";

// FCM registration component
function PushManagerInitializer() {
  const { API_URL } = useAppContext();

  useEffect(() => {
    if (API_URL) registerFCM(API_URL);
  }, [API_URL]);

  return null;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route index element={<Dashboard />} />
      
      {/* Lead Management */}
      <Route path="leads" element={<LeadManagement />} />
      <Route path="leads/add" element={<AddLead />} />
      
      {/* Project Management */}
      <Route path="projects" element={<ProjectManagement />} />
      <Route path="projects/add" element={<AddProject />} />
      
      {/* Employee Management */}
      <Route path="employees" element={<EmployeeManagement />} />
      <Route path="employees/add" element={<AddEmployee />} />
      
      {/* Contract Management */}
      <Route path="contracts" element={<ContractManagement />} />
      <Route path="contracts/create" element={<EditContract />} />
      <Route path="contracts/create/:id" element={<AddContract />} />
      <Route path="contracts/edit/:id" element={<EditContract />} />
      <Route path="contracts/download/:id" element={<DownloadContract />} />
      
      <Route path="invoices" element={<InvoiceManagement />} />
      <Route path="invoices/add" element={<AddInvoice />} />
      <Route path="invoices/edit/:id" element={<AddInvoice />} />
      <Route path="invoices/view/:id" element={<CreateInvoice />} />
      
      <Route path="attendance" element={<EmployeeAttendance />} />
      <Route path="timesheet" element={<EmployeeTimesheet />} />
      <Route path="work-history" element={<WorkHistory />} />
      <Route path="work-summary" element={<WorkSummary />} />
      
      <Route path="tasks" element={<TasksManagement />} />
      <Route path="task-management" element={<TaskManagement />} />
      <Route path="task-assignment" element={<TaskAssignment />} />
      
      <Route path="settings" element={<Settings />} />
    </Route>
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AppProvider>
      <PushManagerInitializer />
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </AppProvider>
  </BrowserRouter>
);

export default App;
