import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ProviderDetail from './pages/ProviderDetail';
import SavedProviders from './pages/SavedProviders';
import EditProvider from './pages/EditProvider';
import ProviderDashboard from './pages/ProviderDashboard';
import withAdminAuth from './hoc/withAdminAuth';
import withProviderAuth from './hoc/withProviderAuth';

const AdminDashboardWithAuth = withAdminAuth(AdminDashboard);
const EditProviderWithAuth = withAdminAuth(EditProvider);
const ProviderDashboardWithAuth = withProviderAuth(ProviderDashboard);

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<AdminDashboardWithAuth />} />
        <Route path="/admin/edit-provider/:id" element={<EditProviderWithAuth />} />
        <Route path="/provider/:id" element={<ProviderDetail />} />
        <Route path="/saved" element={<SavedProviders />} />
        <Route path="/dashboard" element={<ProviderDashboardWithAuth />} />
      </Routes>
    </Layout>
  );
};

export default App;