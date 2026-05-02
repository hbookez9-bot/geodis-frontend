import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) navigate('/');
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Email ou mot de passe incorrect.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="card login-card p-4">
                <div className="text-center mb-4">
                    <h2 className="logo-title">GEODIS</h2>
                    <p className="text-muted">Gestion Logistique Tunisie</p>
                </div>

                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               className="form-control"
                               placeholder="admin@geodis.tn" required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Mot de passe</label>
                        <input type="password" value={password}
                               onChange={(e) => setPassword(e.target.value)}
                               className="form-control"
                               placeholder="••••••••" required />
                    </div>
                    <div className="d-grid mt-4">
                        <button type="submit" className="btn btn-geodis"
                                disabled={loading}>
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
