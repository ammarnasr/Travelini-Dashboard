import { Button, Form, Nav, Navbar } from "react-bootstrap";
import { useHistory } from "react-router";
import { LinkContainer } from "react-router-bootstrap";
import Lini from "../assets/images/LINI6.png";
import Logo from "../assets/images/logo.png";
import { useAuth } from "../contexts/AuthContext.js";
import { FaSignOutAlt } from "react-icons/fa";
import React, { useEffect, useState } from 'react';
import { auth } from "../firebase";


export default function NavigationBar() {
  const { logout } = useAuth();
  const history = useHistory();
  const { getPrivileges } = useAuth();
  const [prevs, setPrevs] = useState("None")


  async function handleLogout() {
    await logout();
    history.push("/login");
  }
  useEffect(() => {
    async function getPrevs() {
      setPrevs(await getPrivileges())
    }
    getPrevs()
  }, [getPrivileges]);
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Navbar.Brand href="/">
        <img
          src={Lini}
          height="50"
          className="d-inline-block align-top"
          alt="React Bootstrap logo"
        />
        <img
          src={Logo}
          height="35"
          className="d-inline-block align-top"
          alt="React Bootstrap logo"
        />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="mr-auto">
          {prevs === "Owner" || prevs === "Admin" ? <>
            <LinkContainer to="/admin/staycation-categories">
              <Nav.Link>Categories</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/admin/staycations">
              <Nav.Link>Staycations</Nav.Link>
            </LinkContainer>

            <LinkContainer to="/admin/admins">
              <Nav.Link>Admins</Nav.Link>
            </LinkContainer></> : <></>}

        </Nav>

        <div style={{ color: "cyan", marginRight: "2%" }}>{auth.currentUser?.displayName}</div>
        <Form inline>
          <Button variant="dark" onClick={handleLogout}><FaSignOutAlt />&nbsp;Sign Out</Button>
        </Form>
      </Navbar.Collapse>
    </Navbar>
  );
}
