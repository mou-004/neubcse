import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

import Notices from "./pages/Notices.jsx";
import NoticeDetails from "./pages/NoticeDetails.jsx";
import StudyMaterials from "./pages/StudyMaterials.jsx";
import StudyMaterialDetails from "./pages/StudyMaterialDetails.jsx";
import Assignments from "./pages/Assignments.jsx";
import AssignmentDetails from "./pages/AssignmentDetails.jsx";
import ClassRoutine from "./pages/ClassRoutine.jsx";
import Payment from "./pages/Payment.jsx";
import Profile from "./pages/Profile.jsx";

import AppLayout from "./assets/components/AppLayout.jsx";

const WithLayout = ({ children }) => {
  return <AppLayout>{children}</AppLayout>;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <WithLayout>
            <Dashboard />
          </WithLayout>
        }
      />

      <Route
        path="/notices"
        element={
          <WithLayout>
            <Notices />
          </WithLayout>
        }
      />

      <Route
        path="/notices/:id"
        element={
          <WithLayout>
            <NoticeDetails />
          </WithLayout>
        }
      />

      <Route
        path="/study-materials"
        element={
          <WithLayout>
            <StudyMaterials />
          </WithLayout>
        }
      />

      <Route
        path="/study-materials/:id"
        element={
          <WithLayout>
            <StudyMaterialDetails />
          </WithLayout>
        }
      />

      <Route
        path="/assignments"
        element={
          <WithLayout>
            <Assignments />
          </WithLayout>
        }
      />

      <Route
        path="/assignments/:id"
        element={
          <WithLayout>
            <AssignmentDetails />
          </WithLayout>
        }
      />

      <Route
        path="/class-routine"
        element={
          <WithLayout>
            <ClassRoutine />
          </WithLayout>
        }
      />

      <Route
        path="/payment"
        element={
          <WithLayout>
            <Payment />
          </WithLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <WithLayout>
            <Profile />
          </WithLayout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;