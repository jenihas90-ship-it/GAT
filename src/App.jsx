import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';
import CandidateForm from './components/CandidateForm';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { authService } from './services/api';
import { Plane, ShieldCheck, UserCheck, LogOut, FileText, LayoutDashboard } from 'lucide-react';

function App() {
  const { t, i18n } = useTranslation();
  const [currentView, setCurrentView] = useState('apply'); // 'apply' | 'admin'
  const [user, setUser] = useState(authService.getCurrentUser());

  // RTL Automation requirement from System Documentation
  useEffect(() => {
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <div className="app-layout">
      {/* Top Navigation Bar */}
      <header className="navbar">
        <div className="nav-container">
          <div className="brand" onClick={() => setCurrentView('apply')}>
            <div className="brand-logo">
              <Plane size={24} className="plane-icon" />
            </div>
            <div className="brand-text">
              <span className="brand-title">{t('nav.agencyTitle')}</span>
              <span className="brand-subtitle">{t('nav.subTitle')}</span>
            </div>
          </div>

          <div className="nav-right">
            <LanguageSwitcher />

            <div className="view-switcher">
              <button
                type="button"
                className={`nav-tab-btn ${currentView === 'apply' ? 'active' : ''}`}
                onClick={() => setCurrentView('apply')}
              >
                <FileText size={16} />
                <span>{t('nav.apply')}</span>
              </button>

              <button
                type="button"
                className={`nav-tab-btn ${currentView === 'admin' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin')}
              >
                <LayoutDashboard size={16} />
                <span>{t('nav.admin')}</span>
              </button>
            </div>

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-secondary logout-btn"
                title={t('nav.logout')}
              >
                <LogOut size={16} />
                <span className="logout-text">{t('nav.logout')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {currentView === 'apply' ? (
          <div className="apply-view">
            {/* Hero Section */}
            <section className="hero-banner">
              <span className="badge-pill">{t('hero.badge')}</span>
              <h1 className="hero-headline">{t('hero.title')}</h1>
              <p className="hero-subtext">{t('hero.description')}</p>
              
              <div className="destinations-strip">
                <span className="dest-tag">🇪🇹 Ethiopia</span>
                <span className="dest-arrow">➔</span>
                <span className="dest-tag">🇯🇴 Jordan</span>
                <span className="dest-arrow">➔</span>
                <span className="dest-tag">🇸🇦 Saudi Arabia</span>
                <span className="dest-arrow">➔</span>
                <span className="dest-target">🇦🇪 Dubai UAE</span>
              </div>
            </section>

            {/* Application Form */}
            <div className="form-wrapper">
              <CandidateForm />
            </div>
          </div>
        ) : (
          <div className="admin-view">
            {user ? (
              <AdminDashboard />
            ) : (
              <div className="login-wrapper">
                <AdminLogin onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>© {new Date().getFullYear()} Galo Travel Agency. Cross-Border Recruitment Operations &middot; Dubai Placement Portal.</p>
          <div className="footer-languages">
            <span>Afaan Oromo</span> &middot;
            <span>አማርኛ</span> &middot;
            <span>English</span> &middot;
            <span>العربية</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
