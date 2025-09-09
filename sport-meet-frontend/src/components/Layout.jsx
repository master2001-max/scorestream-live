import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext.jsx';
import {
    HomeIcon,
    TrophyIcon,
    ChartBarIcon,
    SpeakerWaveIcon,
    UserIcon,
    Cog6ToothIcon,
    Bars3Icon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const { t, lang, setLang } = useI18n();

    const navigation = [
        { name: t('nav.dashboard'), href: '/dashboard', icon: HomeIcon, roles: ['admin', 'score_uploader', 'captain', 'student', 'guest'] },
        { name: t('nav.leaderboard'), href: '/leaderboard', icon: TrophyIcon, roles: ['admin', 'score_uploader', 'captain', 'student', 'guest'] },
        { name: t('nav.scoreboard'), href: '/scoreboard', icon: ChartBarIcon, roles: ['admin', 'score_uploader', 'captain', 'student', 'guest'] },
        { name: t('nav.announcements'), href: '/announcements', icon: SpeakerWaveIcon, roles: ['admin', 'score_uploader', 'captain', 'student', 'guest'] },
        { name: t('nav.profile'), href: '/profile', icon: UserIcon, roles: ['admin', 'score_uploader', 'captain', 'student', 'guest'] },
    ];

    const adminNavigation = [
        { name: t('nav.adminDashboard'), href: '/admin', icon: Cog6ToothIcon },
        { name: t('nav.manageHouses'), href: '/admin/houses', icon: HomeIcon },
        { name: t('nav.manageUsers'), href: '/admin/users', icon: UserIcon },
        { name: t('nav.manageMatches'), href: '/admin/matches', icon: ChartBarIcon },
        { name: t('nav.manageAnnouncements'), href: '/admin/announcements', icon: SpeakerWaveIcon },
    ];

    const filteredNavigation = navigation.filter(item =>
        item.roles.includes(user?.role)
    );

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getRoleColor = (role) => {
        const colors = {
            admin: 'bg-red-100 text-red-800',
            score_uploader: 'bg-blue-100 text-blue-800',
            captain: 'bg-green-100 text-green-800',
            student: 'bg-gray-100 text-gray-800',
            guest: 'bg-yellow-100 text-yellow-800',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="min-h-screen bg-[rgb(var(--bg))]">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
                <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-[rgb(var(--bg))] text-slate-200">
                    <div className="flex h-16 items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <img src="/strivo.png" alt="Strivo" className="h-6 w-6 rounded" />
                            <h1 className="text-xl font-bold heading-light">{t('appName')}</h1>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        {filteredNavigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === item.href
                                    ? 'bg-white/10 text-white'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </a>
                        ))}
                        {user?.role === 'admin' && (
                            <>
                                <div className="border-t border-white/10 my-4"></div>
                                <div className="px-2 py-1">
                                    <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                        {t('nav.admin')}
                                    </h3>
                                </div>
                                {adminNavigation.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === item.href
                                            ? 'bg-white/10 text-white'
                                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <item.icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </a>
                                ))}
                            </>
                        )}
                    </nav>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
                <div className="flex flex-col flex-grow bg-[rgb(var(--bg))] text-slate-200 border-r border-white/10">
                    <div className="flex h-16 items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <img src="/strivo.png" alt="Strivo" className="h-6 w-6 rounded" />
                            <h1 className="text-xl font-bold text-white">{t('appName')}</h1>
                        </div>
                        <div className="hidden lg:block">
                            <select
                                value={lang}
                                onChange={(e) => setLang(e.target.value)}
                                className="text-sm bg-white text-gray-900 border-white/20 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                aria-label="Language selector"
                            >
                                <option value="en">EN</option>
                                <option value="si">සිං</option>
                                <option value="ta">த</option>
                            </select>
                        </div>
                    </div>
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        {filteredNavigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === item.href
                                    ? 'bg-white/10 text-white'
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.name}
                            </a>
                        ))}
                        {user?.role === 'admin' && (
                            <>
                                <div className="border-t border-white/10 my-4"></div>
                                <div className="px-2 py-1">
                                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('nav.admin')}</h3>
                                </div>
                                {adminNavigation.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${location.pathname === item.href
                                            ? 'bg-white/10 text-white'
                                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <item.icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </a>
                                ))}
                            </>
                        )}
                    </nav>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/10 bg-[rgb(var(--bg))] text-slate-200 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>

                    <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                        <div className="flex flex-1"></div>
                        <div className="flex items-center gap-x-4 lg:gap-x-6">
                            {/* User info */}
                            <div className="flex items-center gap-x-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium heading-light">{user?.name}</p>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user?.role)}`}>
                                        {user?.role?.replace('_', ' ')}
                                    </span>
                                </div>
                                {user?.house && (
                                    <div className="flex items-center gap-x-2">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: user.house.color }}
                                        ></div>
                                        <span className="text-sm text-slate-200">{user.house.name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Logout button */}
                            <button
                                onClick={handleLogout}
                                className="text-sm text-slate-300 hover:text-white"
                            >
                                {t('common.logout')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="py-6">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;

