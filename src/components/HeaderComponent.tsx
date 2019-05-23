import React from 'react';
import { Link } from 'react-router-dom';
import {
  isAuthenticated,
  login,
  logout,
} from '../authorization/authentication';
import {AppContextConsumer} from "../context/AppContext";

export class HeaderComponent extends React.PureComponent {
  render() {
    return (
      <>
        <nav className="app-menu">
          <Link to="/">Home</Link>
          <Link to="/landing-page">Landing page</Link>
          <Link to="/product">Product</Link>
        </nav>

        <div>
          {isAuthenticated()
            ? <p>Logged in <button onClick={logout}>Log out</button></p>
            : <p>Logged out <button onClick={login}>Log in</button></p>
          }
        </div>
      </>
    );
  }
}

