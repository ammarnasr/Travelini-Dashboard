import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";
import Admin from "./layouts/Admin.js";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import Signup from "./pages/Signup";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          {/* Dashboard Layout */}
          <PrivateRoute path="/admin" component={Admin} />

          {/* Login Page */}
          <Route exact path="/login"><Login /></Route>

          {/* Signup Page */}
          <Route exact path="/signup"><Signup /></Route>

          {/* Forgot Password Page */}
          <Route exact path="/forgot-password"><ForgotPassword /></Route>

          <Redirect to="/admin" />
        </Switch>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App;
