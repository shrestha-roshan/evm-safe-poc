import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'
import { EthereumProviderProvider } from './context/EthreumContextProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <EthereumProviderProvider>
    <App />
    </EthereumProviderProvider>
  </React.StrictMode>
);