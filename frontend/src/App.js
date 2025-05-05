import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Matches from './pages/Matches';
import Partnerships from './pages/Partnerships';
import PartnershipDetails from './pages/PartnershipDetails';
import AgreementForm from './pages/AgreementForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <main className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/matches" element={<Matches />} />
            <Route path="/partnerships" element={<Partnerships />} />
            <Route path="/partnerships/:id" element={<PartnershipDetails />} />
            <Route path="/partnerships/:id/agreement" element={<AgreementForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 