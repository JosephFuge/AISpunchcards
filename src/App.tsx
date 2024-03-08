import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Header } from "./shared/header";
import "./App.css";
import "./css/styles.css";
import "./css/form.css";
import { Login } from "./shared/auth/login";
import { EventCheckInPage } from "./member/eventCheckInPage";
import ProtectedRoute from "./officer/protectedRoute";
import CreateEvent from "./officer/createEditEvent";
import { UserHome } from "./member/userHome";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <div className="body bg-dark text-light">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/event/:eventId" element={<EventCheckInPage />} />

          {/* Routes containing a ProtectedRoute are meant to ensure the user is authenticated before being able to visit them */}
          {/* In cases where isOfficerOnly is true, these routes also ensure the user is an officer before being able to visit them */}

          <Route
            path="/createEvent"
            element={
              <ProtectedRoute isOfficerOnly={true} element={<CreateEvent />} />
            }
          />
          <Route
            path="/adminHome"
            element={
              <ProtectedRoute isOfficerOnly={true} element={<UserHome />} />
            }
          />
          <Route
            path="/userHome"
            element={
              <ProtectedRoute isOfficerOnly={false} element={<UserHome />} />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
