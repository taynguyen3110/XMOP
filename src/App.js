import React, { useEffect } from 'react';
import logo from './logo.svg';
import './App.css'; // App.css 대신 App.scss 사용
import HighlyAvailableDeploymentForm from './components/HighlyAvailableDeploymentForm';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import ConfirmSignup from './components/ConfirmSignup';
import WorkspacePanel from './components/WorkspacePanel';
import userpool from './userpool';
import Monitoring from './components/Monitor';

function App() {

  useEffect(() => {
    let user = userpool.getCurrentUser();
    if (user) {
      <Navigate to="/dashboard" replace />
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <nav className="App-nav">
          <a href="/workspace">Workspaces</a>
          <a href="/deploy-form">Deployment Form</a>
          <a href="/dashboard">Deployment History</a>
        </nav>
      </header>
      <main className="App-body">
        <Router>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/login' element={<Login />} />
            <Route path="/confirm-signup" element={<ConfirmSignup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/deploy-form" element={<HighlyAvailableDeploymentForm />} />
            <Route path="/workspace" element={<WorkspacePanel />} />
            <Route path="/monitor" element={<Monitoring />} />
          </Routes>
        </Router>
      </main>
      <footer className="App-footer">
        <p>© 2024 Swinburne TIP X-MOP Team. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
