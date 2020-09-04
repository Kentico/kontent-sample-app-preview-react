import React from 'react';
import { IAccessToken, WebAuth } from "../authentication/WebAuth";
import { Redirect, Route, RouteComponentProps, Switch, withRouter } from "react-router";
import { Loading } from "../components/Loading";
import { CallbackRoute, RootRoute } from "../constants/routePaths";

interface IAuthContextState {
  readonly accessToken: string;
  readonly expiresAt: number;
  readonly isLoggedIn: boolean;
}

export interface IAuthContext extends IAuthContextState {
  readonly logout: () => void;
}

const defaultAuthContext: IAuthContext = {
  accessToken: '',
  expiresAt: 0,
  isLoggedIn: false,
  logout: () => undefined,
};

const context = React.createContext<IAuthContext>(defaultAuthContext);
const AuthContextProvider = context.Provider;
export const AuthContextConsumer = context.Consumer;

class AuthContext extends React.Component<RouteComponentProps, IAuthContextState> {

  private webAuth = new WebAuth();

  constructor(props: RouteComponentProps) {
    super(props);

    this.state = {
      accessToken: '',
      isLoggedIn: false,
      expiresAt: 0,
    };
  }

  private isAuthUrlHash = (hash: string): boolean => /access_token|id_token|error/.test(hash);

  handleAuthCallback = ({ location }: any) => {
    if (this.isAuthUrlHash(location.hash)) {
      this.webAuth.handleAuthentication(this.onSuccessLogin, this.onFailedLogin);
    }
  };

  onSuccessLogin = (accessToken: IAccessToken, redirectUri: string) => {
    this.setState({
      accessToken: accessToken.accessToken,
      expiresAt: accessToken.expiresAt,
      isLoggedIn: true,
    });
    this.props.history.push(redirectUri + "?preview");
  };

  onFailedLogin = () => {
    console.warn('on failed login');
  };

  componentDidMount() {
    const {silentLogin} = this.webAuth;
    if (!this.isAuthUrlHash(window.location.hash)) {
      silentLogin();
    }
  }

  render() {
    const context: IAuthContext = {
      ...this.state,
      logout: this.webAuth.logout,
    };

    const { isLoggedIn } = this.state;

    return (
      <Switch>
        {isLoggedIn ?
          <Redirect
            from={CallbackRoute}
            to={RootRoute}
          /> :
          <Route
            path={CallbackRoute}
            render={props => {
              this.handleAuthCallback(props);
              return <Loading />;
            }}
          />
        }

        {isLoggedIn && (
          <Route render={() => (
            <AuthContextProvider value={context}>
              {this.props.children}
            </AuthContextProvider>
          )}/>
        )}
      </Switch>
    )
  }
}

const AuthContextWithRouter = withRouter(AuthContext);
export { AuthContextWithRouter as AuthContext };
