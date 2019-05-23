import auth0, {
  Auth0DecodedHash,
  } from 'auth0-js';
import {
  accessTokenKey,
  expiresAtKey,
  silentLoginKey,
} from '../constants/localStorageKeys';
import {
  authOptions,
  logoutOptions,
} from './authOptions';


const webAuth = new auth0.WebAuth(authOptions);

export function login(): void {
  webAuth.authorize();
}

export function silentLogin(): void {
  webAuth.authorize({
    prompt: 'none'
  });
}

export function logout(): void {
  localStorage.removeItem(expiresAtKey);
  localStorage.removeItem(accessTokenKey);

  webAuth.logout(logoutOptions);
}

export function handleAuthentication(): void {
  webAuth.parseHash((err, authResult) => {
    if (authResult && authResult.accessToken && authResult.idToken) {
      setSession(authResult);
    }
    else if (err) {
      if (err.error === 'login_required' || err.error === 'consent_required') {
        localStorage.setItem(silentLoginKey, err.error);
        login();
      } else {
        window.location.replace('/');
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    }
  });
}

export function setSession(authResult: Auth0DecodedHash): void {
  // Set the time that the access token will expire at
  const expiresAt = JSON.stringify(((authResult.expiresIn || 0) * 1000) + new Date().getTime());
  localStorage.setItem(expiresAtKey, expiresAt);
  localStorage.setItem(accessTokenKey, authResult.accessToken || '');
  localStorage.removeItem(silentLoginKey);

  // navigate to the home route
  window.location.replace('/');
}

export function renewSession(): void {
  webAuth.checkSession({}, (err, authResult) => {
    if (authResult && authResult.accessToken && authResult.idToken) {
      setSession(authResult);
    } else if (err) {
      logout();
      console.log(err);
      alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
    }
  });
}

export function isAuthenticated(): boolean {
  // Check whether the current time is past the
  // access token's expiry time
  const expiresAt = localStorage.getItem(expiresAtKey) || '';
  const expiresAtTime = (expiresAt.length > 0) ? JSON.parse(expiresAt) : 0;
  return new Date().getTime() < expiresAtTime;
}
