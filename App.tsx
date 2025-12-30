import React, { useState, useEffect } from 'react';
import EcpmCalculator from './components/EcpmCalculator';

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Dark mode listener - receives theme changes from parent window
  useEffect(() => {
    const handleThemeMessage = (event: MessageEvent) => {
      if (event.data?.type === 'THEME_CHANGE') {
        setTheme(event.data.theme);
      }
    };

    window.addEventListener('message', handleThemeMessage);
    
    // Request current theme from parent on mount
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'REQUEST_THEME' }, '*');
    }

    return () => window.removeEventListener('message', handleThemeMessage);
  }, []);

  // Apply dark class to document root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen w-full flex justify-center items-start pt-6 pb-12 px-4 bg-white dark:bg-black font-sans transition-colors duration-300">
      <EcpmCalculator />
    </div>
  );
}

export default App;
