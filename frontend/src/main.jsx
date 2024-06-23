import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { RouterProvider,createBrowserRouter,Link } from 'react-router-dom';
import Invoices from "./Invoices";
import Customers from "./Customers";
import Login from "./Login";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/invoices",
    element: <App />,
  },
]);
ReactDOM.createRoot(document.getElementById('root')).render(
  
  <React.StrictMode>
            <RouterProvider router={router} />
  </React.StrictMode>,
)
