import React from 'react';
import './App.css';
import {
  Route,
  Switch,
} from 'react-router-dom';
import { HeaderComponent } from './components/HeaderComponent';
import { HomePage } from './components/HomePage';
import { LandingPage } from './components/LandingPage';
import { ProductDetailsPage } from './components/ProductDetailsPage';

export class App extends React.PureComponent {
  render() {
    return (
      <div className="App">
        <Route
          path="/"
          render={props =>
            <HeaderComponent {...props} />
          }
        />
        <div className="app-content-wrapper">
          <Switch>
            <Route
              path="/"
              exact
              component={HomePage}
            />
            <Route
              path="/landing-page"
              component={LandingPage}
            />
            <Route
              path="/product"
              component={ProductDetailsPage}
            />
          </Switch>
        </div>
      </div>
    );
  }
}
