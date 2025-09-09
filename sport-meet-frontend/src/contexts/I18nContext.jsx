import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const I18nContext = createContext({ t: (k) => k, lang: 'en', setLang: () => { } });

const translations = {
    en: {
        appName: 'Strivo',
        nav: {
            dashboard: 'Dashboard',
            leaderboard: 'Leaderboard',
            scoreboard: 'Scoreboard',
            announcements: 'Announcements',
            profile: 'Profile',
            admin: 'Admin',
            adminDashboard: 'Admin Dashboard',
            manageHouses: 'Manage Houses',
            manageUsers: 'Manage Users',
            manageMatches: 'Manage Matches',
            manageAnnouncements: 'Manage Announcements'
        },
        auth: {
            signInTo: 'Sign in to Strivo',
            createAccountTitle: 'Create your Strivo account',
            or: 'Or',
            createNewAccount: 'create a new account',
            signInExisting: 'sign in to your existing account',
            email: 'Email address',
            password: 'Password',
            fullName: 'Full Name',
            confirmPassword: 'Confirm Password',
            createAccount: 'Create account',
            creatingAccount: 'Creating account...',
            signingIn: 'Signing in...',
            signIn: 'Sign in',
            demoCreds: 'Demo Credentials'
        },
        common: {
            logout: 'Logout'
        }
    },
    si: {
        appName: 'ස්ට්‍රිවෝ',
        nav: {
            dashboard: 'ප්‍රධාන මඟ',
            leaderboard: 'ඉසව් පුවරුව',
            scoreboard: 'ආකුල පුවරුව',
            announcements: 'දැන්විම්',
            profile: 'පැතිකඩ',
            admin: 'පරිපාලක',
            adminDashboard: 'පරිපාලන පුවරුව',
            manageHouses: 'ගෘහ කළමනාකරණය',
            manageUsers: 'පරිශීලක කළමනාකරණය',
            manageMatches: 'මැච් කළමනාකරණය',
            manageAnnouncements: 'දැන්වීම් කළමනාකරණය'
        },
        auth: {
            signInTo: 'ස්ට්‍රිවෝ වෙත පිවිසෙන්න',
            createAccountTitle: 'ඔබගේ ස්ට්‍රිවෝ ගිණුම තනන්න',
            or: 'හෝ',
            createNewAccount: 'නව ගිණුමක් සාදන්න',
            signInExisting: 'පවතින ගිණුමකට පිවිසෙන්න',
            email: 'ඊමේල් ලිපිනය',
            password: 'මුරපදය',
            fullName: 'සම්පූර්ණ නම',
            confirmPassword: 'මුරපදය තහවුරු කරන්න',
            createAccount: 'ගිණුම තනන්න',
            creatingAccount: 'ගිණුම සාදමින්...',
            signingIn: 'පිවිසෙමින්...',
            signIn: 'පිවිසෙන්න',
            demoCreds: 'උදාහරණ විස්තර'
        },
        common: {
            logout: 'පිටවෙන්න'
        }
    },
    ta: {
        appName: 'ஸ்ட்ரிவோ',
        nav: {
            dashboard: 'டாஷ்போர்டு',
            leaderboard: 'முன்னணி பலகை',
            scoreboard: 'ஸ்கோர்போர்டு',
            announcements: 'அறிவிப்புகள்',
            profile: 'சுயவிவரம்',
            admin: 'நிர்வாகம்',
            adminDashboard: 'நிர்வாக டாஷ்போர்டு',
            manageHouses: 'வீடுகளை நிர்வகிக்க',
            manageUsers: 'பயனர்களை நிர்வகிக்க',
            manageMatches: 'போட்டிகளை நிர்வகிக்க',
            manageAnnouncements: 'அறிவிப்புகளை நிர்வகிக்க'
        },
        auth: {
            signInTo: 'ஸ்ட்ரிவோவில் உள்நுழைக',
            createAccountTitle: 'உங்கள் ஸ்ட்ரிவோ கணக்கை உருவாக்கவும்',
            or: 'அல்லது',
            createNewAccount: 'புதிய கணக்கு உருவாக்கவும்',
            signInExisting: 'உங்களின் கணக்கில் உள்நுழைக',
            email: 'மின்னஞ்சல் முகவரி',
            password: 'கடவுச்சொல்',
            fullName: 'முழுப்பெயர்',
            confirmPassword: 'கடவுச்சொல்லை உறுதிசெய்க',
            createAccount: 'கணக்கு உருவாக்கவும்',
            creatingAccount: 'கணக்கை உருவாக்குகிறது...',
            signingIn: 'உள்நுழைகிறது...',
            signIn: 'உள்நுழைக',
            demoCreds: 'டெமோ அங்கீகாரங்கள்'
        },
        common: {
            logout: 'வெளியேறு'
        }
    }
};

export const I18nProvider = ({ children }) => {
    const [lang, setLang] = useState(() => localStorage.getItem('strivo.lang') || 'en');

    useEffect(() => {
        localStorage.setItem('strivo.lang', lang);
        const html = document.documentElement;
        html.lang = lang;
    }, [lang]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'strivo.lang' && e.newValue && e.newValue !== lang) {
                setLang(e.newValue);
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, [lang]);

    const t = useMemo(() => {
        const dict = translations[lang] || translations.en;
        return (key) => {
            const parts = key.split('.');
            let cur = dict;
            for (const p of parts) {
                cur = cur?.[p];
            }
            return cur || key;
        };
    }, [lang]);

    const value = useMemo(() => ({ t, lang, setLang }), [t, lang]);
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => useContext(I18nContext);


