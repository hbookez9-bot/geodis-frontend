import { Link } from 'react-router-dom';
import usePagination from '../../services/usePagination';
import Pagination from '../../components/Pagination';

export default function TransfertListe() {
    const {
        items: transferts, total, page, pages, perPage,
        search, loading,
        setPage, setPerPage, setSearch
    } = usePagination('/api/transferts_paginated');

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="card px-4 py-2" style={{ borderRadius: 10 }}>
                    <div className="text-muted" style={{ fontSize: 12 }}>Total transferts</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: '#003087' }}>
                        {total}
                    </div>
                </div>
                <Link to="/transfert/ajouter" className="btn btn-primary">
                    <i className="bi bi-arrow-left-right"></i> Nouveau transfert
                </Link>
            </div>

            <div className="mb-4">
                <div className="input-group" style={{ maxWidth: 400 }}>
                    <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search text-muted"></i>
                    </span>
                    <input type="text" value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           className="form-control border-start-0"
                           placeholder="Rechercher un article..." />
                </div>
            </div>

            {loading ? (
                <Spinner />
            ) : (
                <>
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
                                        <tr>
                                            <td colSpan="8" className="text-center text-muted py-4">
                                                {search ? 'Aucun résultat' : 'Aucun transfert effectué'}
                                            </td>
                                        </tr>
                                    ) : transferts.map((t) => (
                                        <tr key={t.id_transfert}>
                                            <td style={{ fontSize: 12, color: '#888' }}>
                                                {t.date_transfert
                                                    ? new Date(t.date_transfert).toLocaleString('fr-FR', {
                                                        day: '2-digit', month: '2-digit', year: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                      })
                                                    : '—'}
                                            </td>
                                            <td><strong style={{ fontSize: 13 }}>{t.article_designation}</strong></td>
                                            <td><code style={{ color: '#dc3545' }}>{t.emplacement_source}</code></td>
                                            <td><code style={{ color: '#28a745' }}>{t.emplacement_dest}</code></td>
                                            <td>
                                                <strong>{t.quantite}</strong>{' '}
                                                <span className="text-muted" style={{ fontSize: 12 }}>{t.unite}</span>
                                            </td>
                                            <td style={{ fontSize: 13 }}>{t.motif || '—'}</td>
                                            <td style={{ fontSize: 13 }}>{t.utilisateur_nom || '—'}</td>
                                            <td>
                                                {t.statut === 'termine' && <span className="badge bg-success">Terminé</span>}
                                                {t.statut === 'en_cours' && <span className="badge bg-warning text-dark">En cours</span>}
                                                {t.statut === 'annule' && <span className="badge bg-danger">Annulé</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Pagination
                        page={page}
                        perPage={perPage}
                        total={total}
                        pages={pages}
                        onPageChange={setPage}
                        onPerPageChange={setPerPage}
                    />
                </>
            )}
        </>
    );
}
