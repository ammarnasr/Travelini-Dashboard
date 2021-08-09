import React from "react"
import PropTypes from "prop-types";
import { Route, Redirect } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function PrivateRoute({ component: Component, admin, ...rest }) {
  const { currentUser, privileges } = useAuth();

  return (
    <Route
      {...rest}
      render={props => (
        !currentUser ||
        privileges === "None" ||
        (admin && ["Owner", "Admin"].indexOf(privileges) === -1)
      )
        ? <Redirect to="/login" />
        : <Component {...props} />
      }
    ></Route>
  )
}

PrivateRoute.defaultProps = {
  admin: false,
};

PrivateRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  admin: PropTypes.bool.isRequired,
};