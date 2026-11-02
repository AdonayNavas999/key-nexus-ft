import React, { createContext, useContext, useState, useEffect } from 'react';

type Tema = 'claro' | 'oscuro';

interface ThemeContextType {
  tema: Tema;
  toggleTema: () => void;
  esOscuro: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tema, setTema] = useState<Tema>(() => {
    const guardado = localStorage.getItem('tema_key_nexus') as Tema | null;
    if (guardado === 'oscuro' || guardado === 'claro') return guardado;
    // Detectar preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
  });

  useEffect(() => {
    const html = document.documentElement;
    if (tema === 'oscuro') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('tema_key_nexus', tema);
  }, [tema]);

  const toggleTema = () => {
    setTema((prev) => (prev === 'claro' ? 'oscuro' : 'claro'));
  };

  return (
    <ThemeContext.Provider value={{ tema, toggleTema, esOscuro: tema === 'oscuro' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};
