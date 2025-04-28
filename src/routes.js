import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashPage from './pages/SplashPage';
import GetStartedPage from './pages/GetStartedPage';
import SignInPage from './pages/SignInPage' ; 
import  SignUpPage from './pages/SignUpPage' ; 
import UsersPage from './pages/UsersPage' ; 
import ChatPage from './pages/ChatPage' ; 
import ProductPage from './pages/ProductPage';
import NotificationsPage from './pages/notificationsPage' ; 
import SignupRequestsPage from './pages/RequestPage';

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<SplashPage />} />
      <Route path="/get-started" element={<GetStartedPage />} />
      <Route path="/product" element={<ProductPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/notification" element={<NotificationsPage/>} />
      <Route path="/Request" element={<SignupRequestsPage/>} />
    </Routes>
  </Router>
);

export default AppRoutes;