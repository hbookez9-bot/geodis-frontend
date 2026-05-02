import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Chatbot from './Chatbot';
import FlashMessages from './FlashMessages';

export default function Layout() {
    const location = useLocation();

    // Déduit le titre de la page depuis l'URL
    const titles = {
        '/': 'Tableau de bord',
        '/clients': 'Gestion des clients',
        '/articles': 'Gestion des articles',
        '/utilisateurs': 'Gestion des utilisateurs',
        '/entrepots': 'Gestion des entrepôts',
        '/reception': 'Réceptions',
        '/stock': 'Stock',
        '/transfert': 'Transferts',
        '/rapports': 'Rapports'
    };
    const pageTitle = titles[location.pathname] ||
        Object.keys(titles).find((k) => k !== '/' && location.pathname.startsWith(k))
            ?.split('/').filter(Boolean)[0] || '';

    const displayTitle = titles[Object.keys(titles).find((k) =>
        k === '/' ? location.pathname === '/' : location.pathname.startsWith(k)
    )] || '';

    return (
        <>
            <Sidebar />
            <Navbar pageTitle={displayTitle} />
            <div className="main-content">
                <FlashMessages />
                <Outlet />
            </div>
            <Chatbot />
        </>
    );
}
