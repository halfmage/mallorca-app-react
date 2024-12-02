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
import withAdminAuth from './hoc/withAdminAuth';

const AdminDashboardWithAuth = withAdminAuth(AdminDashboard);
const EditProviderWithAuth = withAdminAuth(EditProvider);

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
      </Routes>
    </Layout>
  );
};

export default App;