import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { App } from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppContextComponent } from './context/AppContext';
import { AuthContext } from './context/AuthContext';
import { AppContextInitialization } from './context/AppContextInitialization';
import { DeployedProjectRootRoute } from './constants/routePaths';
// import KontentSmartLink from '@kentico/kontent-smart-link';
// import '@kentico/kontent-smart-link/dist/kontent-smart-link.styles.css';

// KontentSmartLink.initializeOnLoad({
//   projectId: '220af705-8621-00d0-2f33-97101edbf600',
//   languageCodename: 'default',
//   queryParam: 'preview',
// }).then(() => {
//   console.log('Kontent Smart Link SDK initialized');
// });

ReactDOM.render(
  <Router basename={DeployedProjectRootRoute}>
    <AuthContext>
      <AppContextComponent>
        <AppContextInitialization>
          <App/>
        </AppContextInitialization>
      </AppContextComponent>
    </AuthContext>
  </Router>
  , document.getElementById('root'));
