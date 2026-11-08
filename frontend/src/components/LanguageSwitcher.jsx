import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'am', label: 'Amharic', native: 'አማርኛ' },
  { code: 'om', label: 'Afaan Oromo', native: 'Afaan Oromo' },
  { code: 'ar', label: 'Arabic', native: 'العربية', rtl: true }
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
  };

  return (
    <div className="language-switcher-container">
      <div className="globe-icon-wrapper">
        <Globe size={18} />
      </div>
      <div className="language-pills">
        {languages.map((lang) => {
          const isActive = i18n.language === lang.code || (i18n.language.startsWith(lang.code));
          return (
            <button
              key={lang.code}
              type="button"
              className={`lang-pill ${isActive ? 'active' : ''}`}
              onClick={() => handleLanguageChange(lang.code)}
              title={lang.label}
            >
              <span className="lang-code">{lang.code.toUpperCase()}</span>
              <span className="lang-native">{lang.native}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
