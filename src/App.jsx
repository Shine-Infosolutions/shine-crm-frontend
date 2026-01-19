import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { registerFCM } from "./utils/registerFCM";
import { AppProvider, useAppContext } from "./context/AppContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout and components
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Loader from "./components/Loader";

// Lazy load pages
const Login = lazy(() => import("./pages/Login"));
const LeadManagement = lazy(() => import("./pages/LeadManagement"));
const AddLead = lazy(() => import("./pages/AddLead"));
const ProjectManagement = lazy(() => import("./pages/ProjectManagement"));
const AddProject = lazy(() => import("./pages/AddProject"));
const EmployeeManagement = lazy(() => import("./pages/EmployeeManagement"));
const AddEmployee = lazy(() => import("./pages/AddEmployee"));
const ContractManagement = lazy(() => import("./pages/ContractManagement"));
const EditContract = lazy(() => import("./pages/EditContract"));
const AddContract = lazy(() => import("./pages/AddContract"));
const InvoiceManagement = lazy(() => import("./pages/InvoiceManagement"));
const AddInvoice = lazy(() => import("./pages/AddInvoice"));
const CreateInvoice = lazy(() => import("./pages/CreateInvoice"));
const EmployeeAttendance = lazy(() => import("./pages/EmployeeAttendance"));
const EmployeeTimesheet = lazy(() => import("./pages/EmployeeTimesheet"));
const WorkHistory = lazy(() => import("./pages/WorkHistory"));
const WorkSummary = lazy(() => import("./pages/WorkSummary"));
const TasksManagement = lazy(() => import("./pages/TasksManagement"));
const TaskManagement = lazy(() => import("./pages/TaskManagement"));
const TaskAssignment = lazy(() => import("./pages/TaskAssignment"));
const Settings = lazy(() => import("./pages/Settings"));
const DownloadContract = lazy(() => import("./components/DownloadContract"));

// FCM registration component
function PushManagerInitializer() {
  const { API_URL } = useAppContext();

  useEffect(() => {
    if (API_URL) registerFCM(API_URL);
  }, [API_URL]);

  return null;
}

const AppRoutes = () => (
  <Suspense fallback={<Loader />}>
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
  </Suspense>
);

const App = () => (
  <BrowserRouter>
    <AppProvider>
      <PushManagerInitializer />
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
        pauseOnHover={false}
        theme="light"
        limit={3}
      />
    </AppProvider>
  </BrowserRouter>
);

export default App;
