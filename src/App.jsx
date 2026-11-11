import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';

// Layout
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SubsidyList from './pages/SubsidyList';
import AddSubsidy from './pages/AddSubsidy';
import EngineChecker from './pages/EngineChecker';
import Farmers from './pages/Farmers';
import Products from './pages/Products';
import DuplicateAlerts from './pages/DuplicateAlerts';
import OfficesUsers from './pages/OfficesUsers';
import AuditLog from './pages/AuditLog';
import Profile from './pages/Profile';
import AccessDenied from './pages/AccessDenied';

function AppContent() {
  const { currentUser, isSuperAdmin, isOfficeAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If user is not authenticated, render Login view
  if (!currentUser) {
    return <Login />;
  }

  const navigateTo = (tab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActivePage = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case 'subsidies':
        return <SubsidyList onNavigate={navigateTo} />;
      case 'add_subsidy':
        return <AddSubsidy onNavigate={navigateTo} />;
      case 'engine_checker':
        return <EngineChecker onNavigate={navigateTo} />;
      case 'farmers':
        return <Farmers onNavigate={navigateTo} />;
      case 'products':
        return <Products onNavigate={navigateTo} />;
      case 'duplicate_alerts':
        return <DuplicateAlerts onNavigate={navigateTo} />;
      case 'offices_users':
        if (!isSuperAdmin && !isOfficeAdmin) {
          return <AccessDenied onNavigate={navigateTo} />;
        }
        return <OfficesUsers onNavigate={navigateTo} />;
      case 'audit_log':
        if (!isSuperAdmin && !isOfficeAdmin) {
          return <AccessDenied onNavigate={navigateTo} />;
        }
        return <AuditLog onNavigate={navigateTo} />;
      case 'profile':
        return <Profile onNavigate={navigateTo} />;
      default:
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans w-full">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNavigate={navigateTo}
      />

      <div className="flex-1 flex w-full">
        {/* Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={navigateTo}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Pane */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full min-w-0">
          {renderActivePage()}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

