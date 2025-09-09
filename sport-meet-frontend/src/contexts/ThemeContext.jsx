import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', toggle: () => { }, setTheme: () => { } });

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const saved = localStorage.getItem('strivo.theme');
        if (saved === 'dark' || saved === 'light') setTheme(saved);
    }, []);

    useEffect(() => {
        localStorage.setItem('strivo.theme', theme);
        const html = document.documentElement;
        html.setAttribute('data-theme', theme);
    }, [theme]);

    const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

    const value = useMemo(() => ({ theme, toggle, setTheme }), [theme]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);



