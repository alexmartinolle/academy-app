import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Import styles
import './styles/globals.css';

// Import components (will be created in Phase 2)
import Layout from './components/common/Layout';
import Dashboard from './pages/Dashboard';
import StudentsList from './pages/StudentsList';
import StudentDetails from './pages/StudentDetails';
import PlansList from './pages/PlansList';
import PaymentsList from './pages/PaymentsList';
import ModalitiesList from './pages/ModalitiesList';
import Analytics from './pages/Analytics';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<StudentsList />} />
              <Route path="students/:id" element={<StudentDetails />} />
              <Route path="plans" element={<PlansList />} />
              <Route path="payments" element={<PaymentsList />} />
              <Route path="modalities" element={<ModalitiesList />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
          
          {/* Global toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
