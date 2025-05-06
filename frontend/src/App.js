import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import Wallet from './pages/Wallet';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import MyTasks from './pages/MyTasks';
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
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/partnerships/:partnershipId/tasks" element={<Tasks />} />
            <Route path="/tasks/:taskId" element={<TaskDetail />} />
            <Route path="/my-tasks" element={<MyTasks />} />
          </Routes>
        </main>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </div>
    </Router>
  );
}

export default App; 