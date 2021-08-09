import "../assets/css/Auth.css";
import React, { useRef, useState } from "react";
import { Alert, Form, Button } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import NavigationBarEmpty from "../components/NavigationBarEmpty";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, getPrivileges } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      const result = await login(emailRef.current.value, passwordRef.current.value);
      const prevs = await getPrivileges()
      if(prevs == "None"){
        setError("Your account is pending approval");
      }
      else{
        history.push("/");
      }
    } catch {
      setError("Failed to log in");
    }

    setLoading(false);
  }

  return (
    <div className="auth-wrapper">
      <NavigationBarEmpty />
      <div className="auth-inner">
        <h2 className="text-center mb-4">Log In</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group id="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" ref={emailRef} required />
          </Form.Group>
          <Form.Group id="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" ref={passwordRef} required />
          </Form.Group>
          <Button disabled={loading} className="w-100" type="submit">
            Log In
          </Button>
        </Form>
        <div className="w-100 text-center mt-3">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
      </div>
      <div className="w-100 text-center">
        Need an account? <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
}
