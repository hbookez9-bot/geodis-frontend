import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const linkClass = ({ isActive }) =>
        'nav-link' + (isActive ? ' active' : '');

    return (
        <div className="sidebar">
            <div className="logo">GEODIS</div>

            <NavLink to="/" end className={linkClass}>
                <i className="bi bi-speedometer2"></i> Dashboard
            </NavLink>

            <div className="section-title">Référentiel</div>
            <NavLink to="/clients" className={linkClass}>
                <i className="bi bi-people"></i> Clients
            </NavLink>
            <NavLink to="/utilisateurs" className={linkClass}>
                <i className="bi bi-person-gear"></i> Utilisateurs
            </NavLink>
            <NavLink to="/articles" className={linkClass}>
                <i className="bi bi-box"></i> Articles
            </NavLink>
            <NavLink to="/entrepots" className={linkClass}>
                <i className="bi bi-building"></i> Entrepôts
            </NavLink>

            <div className="section-title">Opérations</div>
            <NavLink to="/reception" className={linkClass}>
                <i className="bi bi-truck"></i> Réceptions
            </NavLink>
            <NavLink to="/stock" className={linkClass}>
                <i className="bi bi-archive"></i> Stock
            </NavLink>
            <NavLink to="/transfert" className={linkClass}>
                <i className="bi bi-arrow-left-right"></i> Transferts
            </NavLink>

            <div className="section-title">Reporting</div>
            <NavLink to="/rapports" className={linkClass}>
                <i className="bi bi-bar-chart"></i> Rapports
            </NavLink>

            <div style={{ position: 'absolute', bottom: 20, width: '100%' }}>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}
                   className="nav-link text-danger">
                    <i className="bi bi-box-arrow-left"></i> Déconnexion
                </a>
            </div>
        </div>
    );
}
