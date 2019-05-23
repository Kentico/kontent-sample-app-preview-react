import React from 'react';
import {handleAuthentication, isAuthenticated, silentLogin} from "../../authorization/authentication";
import {silentLoginKey} from "../../constants/localStorageKeys";
import {Redirect, Route, Switch} from "react-router";
import {Callback} from "./Callback";

const handleAuth = ({location}: any) => {
  if (/access_token|id_token|error/.test(location.hash)) {
    handleAuthentication();
  }
};

export class Authenticate extends React.PureComponent {
  componentDidMount(): void {
    if (isAuthenticated()) {
      //renewSession();
    } else if (!localStorage.getItem(silentLoginKey)) {
      silentLogin();
    }
  }

  render() {
    const {children} = this.props;
    return (
      <>
        <Switch>
          <Route
            path="/callback"
            render={props => {
              handleAuth(props);
              return <Callback/>;
            }}
          />
          <Redirect
            from="/logout"
            to="/"
          />
        </Switch>
        {isAuthenticated() && (
          children
        )}
      </>
    )
  }
}
