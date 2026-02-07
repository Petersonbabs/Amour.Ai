import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './context/ToastContext';
import { VoiceProvider } from './context/VoiceContext';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Create } from './pages/Create';
import { Preview } from './pages/Preview';
import { Payment } from './pages/Payment';
import { Result } from './pages/Result';
import { Profile } from './pages/Profile';
import { Generating } from './pages/Generating';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ToastProvider>
        <VoiceProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="login" element={<Login />} />
              <Route path="create" element={<Create />} />
              <Route path="preview" element={<Preview />} />
              <Route path="payment" element={<Payment />} />
              <Route path="generating" element={<Generating />} />
              <Route path="result" element={<Result />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<Landing />} />
            </Route>
          </Routes>
        </VoiceProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}