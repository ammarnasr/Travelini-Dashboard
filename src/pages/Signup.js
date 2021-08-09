import "../assets/css/Auth.css";
import React, { useRef, useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import NavigationBarEmpty from "../components/NavigationBarEmpty";

export default function Signup() {
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup, uploadAdminData } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    }

    try {
      setError("");
      setMessage("");
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value, nameRef.current.value);
      setMessage("Signup successful, please wait for your account to be approved");
    } catch (e){
      console.log(e)
      setError("Failed to create an account");
    }

    setLoading(false);
  }

  return (
    <div className="auth-wrapper">
      <NavigationBarEmpty />
      <div className="auth-inner">
        <h2 className="text-center mb-4">Sign Up</h2>
        {error && <Alert variant="danger">{error}</Alert>}
        {message && <Alert variant="success">{message}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group id="name">
            <Form.Label>Name</Form.Label>
            <Form.Control type="name" ref={nameRef} required />
          </Form.Group>
          <Form.Group id="email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" ref={emailRef} required />
          </Form.Group>
          <Form.Group id="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" ref={passwordRef} required />
          </Form.Group>
          <Form.Group id="password-confirm">
            <Form.Label>Password Confirmation</Form.Label>
            <Form.Control type="password" ref={passwordConfirmRef} required />
          </Form.Group>
          <Button disabled={loading} className="w-100" type="submit">
            Sign Up
          </Button>
        </Form>
      </div>
      <div className="w-100 text-center mt-2">
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </div>
  );
}
