import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

export default function StockDetail() {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [aResp, sResp] = await Promise.all([
                    api.get('/api/articles'),
                    api.get('/api/stock')
                ]);
                const a = aResp.data.find((x) => x.id_article == id);
                setArticle(a);
                if (a) {
                    setStocks(sResp.data.filter((s) => s.designation === a.designation));
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) return <Spinner />;
    if (!article) return <div className="alert alert-danger">Article introuvable.</div>;

    const totalQte = stocks.reduce((sum, s) => sum + s.quantite, 0);

    return (
        <>
            <Link to="/stock" className="btn btn-outline-secondary mb-3">
                <i className="bi bi-arrow-left"></i> Retour au stock
            </Link>

            <div className="card mb-4" style={{ borderRadius: 12 }}>
                <div className="card-body p-4">
                    <h4 style={{ color: '#003087' }}>{article.designation}</h4>
                    <div className="text-muted mb-3">
                        <i className="bi bi-person"></i> Client : {article.client_nom}
                        {article.code_barre && <> — <code>{article.code_barre}</code></>}
                    </div>
                    <div className="row g-3">
                        <div className="col-md-3">
                            <div className="card p-3" style={{ background: '#e8f0fe', borderRadius: 10 }}>
                                <div style={{ fontSize: 11, color: '#003087' }}>Stock total</div>
                                <div style={{ fontSize: 24, fontWeight: 600, color: '#003087' }}>
                                    {totalQte} <small>{article.unite}</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card p-3" style={{ background: '#f8f9fa', borderRadius: 10 }}>
                                <div style={{ fontSize: 11, color: '#888' }}>Stock sécurité</div>
                                <div style={{ fontSize: 24, fontWeight: 600 }}>
                                    {article.stock_securite || '—'}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card p-3" style={{ background: '#f8f9fa', borderRadius: 10 }}>
                                <div style={{ fontSize: 11, color: '#888' }}>Stock réappro</div>
                                <div style={{ fontSize: 24, fontWeight: 600 }}>
                                    {article.stock_reappro || '—'}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card p-3" style={{ background: '#f8f9fa', borderRadius: 10 }}>
                                <div style={{ fontSize: 11, color: '#888' }}>Vitesse conso</div>
                                <div style={{ fontSize: 24, fontWeight: 600 }}>
                                    {article.vitesse_consommation || 0}/j
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <h5 style={{ color: '#003087' }}>Répartition par emplacement</h5>
            <div className="card" style={{ borderRadius: 12 }}>
                <div className="card-body p-0">
                    <table className="table mb-0">
                        <thead style={{ background: '#f8f9fa' }}>
                            <tr>
                                <th>Emplacement</th>
                                <th>Zone</th>
                                <th>Quantité</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocks.length === 0 ? (
                                <tr><td colSpan="4" className="text-center text-muted py-4">
                                    Aucun stock pour cet article
                                </td></tr>
                            ) : stocks.map((s) => (
                                <tr key={s.id_stock}>
                                    <td><code>{s.emplacement}</code></td>
                                    <td>{s.zone}</td>
                                    <td><strong>{s.quantite}</strong> {s.unite}</td>
                                    <td>
                                        <span className={`badge ${
                                            s.statut === 'critique' ? 'bg-danger' :
                                            s.statut === 'alerte' ? 'bg-warning text-dark' : 'bg-success'
                                        }`}>{s.statut}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
