import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/DashboardPage';
import { ContentEditorPage } from './components/ContentEditorPage';
import { ProjectsPage } from './components/ProjectsPage';
import { BlogsPage } from './components/BlogsPage';
import { TestimonialsPage } from './components/TestimonialsPage';
import { ServicesPage } from './components/ServicesPage';
import { SkillsPage } from './components/SkillsPage';
import { ExperiencePage } from './components/ExperiencePage';
import { SettingsPage } from './components/SettingsPage';
import { ContactMessagesPage } from './components/ContactMessagesPage';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { authAPI } from './services/api';

type Page = 'login' | 'dashboard' | 'content-editor' | 'projects' | 'blogs' | 'testimonials' | 'services' | 'skills' | 'experience' | 'contact-messages' | 'settings';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      if (authAPI.isAuthenticated()) {
        try {
          await authAPI.verify();
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token verification failed:', error);
          authAPI.logout();
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'content-editor' && <ContentEditorPage />}
          {currentPage === 'projects' && <ProjectsPage />}
          {currentPage === 'blogs' && <BlogsPage />}
          {currentPage === 'testimonials' && <TestimonialsPage />}
          {currentPage === 'services' && <ServicesPage />}
          {currentPage === 'skills' && <SkillsPage />}
          {currentPage === 'experience' && <ExperiencePage />}
          {currentPage === 'contact-messages' && <ContactMessagesPage />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}