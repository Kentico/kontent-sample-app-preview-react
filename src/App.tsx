import React from 'react';
import './App.css';
import { Route, Switch } from 'react-router-dom';
import { NavigationBar } from './components/NavigationBar';
import { ProductDetailsPage } from './components/Product/ProductDetailsPage';
import { ProductsPage } from './components/Product/ProductsPage';
import { ProductDetailsRoute, ProductsRoute, ProjectRoute } from './constants/routePaths';
import { WelcomePage } from './components/WelcomePage';
import { ProgressBar } from './components/ProgressBar';

export class App extends React.PureComponent {
  render() {
    return (
      <div className="app">
        <ProgressBar/>
        <Route
          path={ProjectRoute}
          component={NavigationBar}
        />
        <div className="app__content-wrapper">
          <Switch>
            <Route
              path={ProjectRoute}
              exact
              component={WelcomePage}
            />
            <Route
              path={ProductDetailsRoute}
              component={ProductDetailsPage}
            />
            <Route
              path={ProductsRoute}
              component={ProductsPage}
            />
            <Route
              render={() => (
                <p>Ooops, missing page!</p>
              )}
            />
          </Switch>
        </div>
      </div>
    );
  }
}
