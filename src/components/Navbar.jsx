import { useAuth } from '../context/AuthContext';

export default function Navbar({ pageTitle }) {
    const { user } = useAuth();

    return (
        <div className="navbar-top">
            <span style={{ fontWeight: 500, color: '#003087' }}>
                {pageTitle}
            </span>
            <span className="user-badge">
                <i className="bi bi-person-circle"></i> {user?.nom} — {user?.role}
            </span>
        </div>
    );
}
