import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';
import Spinner from '../../components/Spinner';

export default function RapportStock() {
    const { flash } = useFlash();
    const [stocks, setStocks] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/api/stock'), api.get('/api/articles')])
            .then(([s, a]) => {
                setStocks(s.data);
                setArticles(a.data);
            })
            .catch(() => flash('danger', 'Erreur de chargement.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner />;

    // Map article par désignation (pour récupérer prix d'achat)
    const articleMap = {};
    articles.forEach((a) => { articleMap[a.designation] = a; });

    // Valeur totale
    const valeurTotale = stocks.reduce((sum, s) => {
        const a = articleMap[s.designation];
        return sum + (s.quantite * (a?.prix_achat || 0));
    }, 0);

    // Alertes
    const alertes = stocks.filter((s) => s.statut === 'critique' || s.statut === 'alerte');

    // Imprimer
    const imprimer = () => window.print();

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Link to="/rapports" className="btn btn-outline-secondary">
                    <i className="bi bi-arrow-left"></i> Retour
                </Link>
                <button onClick={imprimer} className="btn btn-outline-primary">
                    <i className="bi bi-printer"></i> Imprimer
                </button>
            </div>

            <h4 style={{ color: '#003087' }} className="mb-4">
                <i className="bi bi-archive"></i> Rapport Stock
            </h4>

            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <div className="card p-3" style={{ background: '#e8f0fe', borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: '#003087' }}>Total lignes</div>
                        <div style={{ fontSize: 24, fontWeight: 600, color: '#003087' }}>
                            {stocks.length}
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card p-3" style={{ background: '#d1e7dd', borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: '#0f5132' }}>Valeur totale</div>
                        <div style={{ fontSize: 24, fontWeight: 600, color: '#0f5132' }}>
                            {valeurTotale.toFixed(2)} TND
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card p-3" style={{
                        background: alertes.length > 0 ? '#f8d7da' : '#d1e7dd',
                        borderRadius: 10
                    }}>
                        <div style={{ fontSize: 11 }}>Alertes</div>
                        <div style={{
                            fontSize: 24, fontWeight: 600,
                            color: alertes.length > 0 ? '#842029' : '#0f5132'
                        }}>
                            {alertes.length}
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card p-3" style={{ background: '#f8f9fa', borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: '#888' }}>Date</div>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>
                            {new Date().toLocaleDateString('fr-FR')}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ borderRadius: 12 }}>
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead style={{ background: '#f8f9fa' }}>
                            <tr>
                                <th>Article</th>
                                <th>Emplacement</th>
                                <th>Zone</th>
                                <th>Quantité</th>
                                <th>Prix achat</th>
                                <th>Valeur</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocks.length === 0 ? (
                                <tr><td colSpan="7" className="text-center text-muted py-4">
                                    Aucun stock
                                </td></tr>
                            ) : stocks.map((s) => {
                                const a = articleMap[s.designation];
                                const valeur = s.quantite * (a?.prix_achat || 0);
                                return (
                                    <tr key={s.id_stock}>
                                        <td><strong>{s.designation}</strong></td>
                                        <td><code>{s.emplacement}</code></td>
                                        <td>{s.zone}</td>
                                        <td>
                                            <strong>{s.quantite}</strong>{' '}
                                            <span className="text-muted" style={{ fontSize: 12 }}>{s.unite}</span>
                                        </td>
                                        <td style={{ fontSize: 13 }}>{a?.prix_achat || 0} TND</td>
                                        <td style={{ fontSize: 13, fontWeight: 600 }}>
                                            {valeur.toFixed(2)} TND
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                s.statut === 'critique' ? 'bg-danger' :
                                                s.statut === 'alerte' ? 'bg-warning text-dark' : 'bg-success'
                                            }`}>{s.statut}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
