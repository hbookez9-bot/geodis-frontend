import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';
import Spinner from '../../components/Spinner';

export default function RapportTransferts() {
    const { flash } = useFlash();
    const [transferts, setTransferts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/transferts')
            .then((resp) => setTransferts(resp.data))
            .catch(() => flash('danger', 'Erreur de chargement.'))
            .finally(() => setLoading(false));
    }, []);

    const imprimer = () => window.print();

    if (loading) return <Spinner />;

    const termines = transferts.filter((t) => t.statut === 'termine').length;

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

            <h4 style={{ color: '#856404' }} className="mb-4">
                <i className="bi bi-arrow-left-right"></i> Rapport Transferts
            </h4>

            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card p-3" style={{ background: '#fff3cd', borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: '#856404' }}>Total</div>
                        <div style={{ fontSize: 24, fontWeight: 600, color: '#856404' }}>
                            {transferts.length}
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card p-3" style={{ background: '#d1e7dd', borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: '#0f5132' }}>Terminés</div>
                        <div style={{ fontSize: 24, fontWeight: 600, color: '#0f5132' }}>
                            {termines}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ borderRadius: 12 }}>
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead style={{ background: '#f8f9fa' }}>
                            <tr>
                                <th>Date</th>
                                <th>Article</th>
                                <th>De</th>
                                <th>Vers</th>
                                <th>Quantité</th>
                                <th>Motif</th>
                                <th>Utilisateur</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transferts.length === 0 ? (
                                <tr><td colSpan="8" className="text-center text-muted py-4">
                                    Aucun transfert
                                </td></tr>
                            ) : transferts.map((t) => (
                                <tr key={t.id_transfert}>
                                    <td style={{ fontSize: 12, color: '#888' }}>
                                        {t.date_transfert
                                            ? new Date(t.date_transfert).toLocaleString('fr-FR')
                                            : '—'}
                                    </td>
                                    <td><strong>{t.article_nom}</strong></td>
                                    <td><code style={{ color: '#dc3545' }}>{t.source_code}</code></td>
                                    <td><code style={{ color: '#28a745' }}>{t.dest_code}</code></td>
                                    <td><strong>{t.quantite}</strong> {t.unite}</td>
                                    <td style={{ fontSize: 13 }}>{t.motif || '—'}</td>
                                    <td style={{ fontSize: 13 }}>{t.utilisateur_nom || '—'}</td>
                                    <td>
                                        <span className={`badge ${
                                            t.statut === 'termine' ? 'bg-success' :
                                            t.statut === 'en_cours' ? 'bg-warning text-dark' : 'bg-danger'
                                        }`}>
                                            {t.statut === 'termine' ? 'Terminé' :
                                             t.statut === 'en_cours' ? 'En cours' : 'Annulé'}
                                        </span>
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
