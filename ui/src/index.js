import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { AppProvider } from './AppProvider';
import { Provider } from 'react-redux';
import store from './jsx/redux/store';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <div className="no-select">
      <Provider store={store}>
        <AppProvider>
          <App />
        </AppProvider>
      </Provider>
    </div>
  </React.StrictMode>
);
