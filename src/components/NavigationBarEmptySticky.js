import Logo from "../assets/images/logo.png";
import Lini from "../assets/images/LINI6.png";
import { Navbar } from "react-bootstrap";

export default function NavigationBarEmptySticky() {
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark" fixed="top">
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
    </Navbar>
  );
}
