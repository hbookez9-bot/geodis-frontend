import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';
import usePagination from '../../services/usePagination';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';

export default function ArticlesListe() {
    const { flash } = useFlash();

    const {
        items: articles, total, page, pages, perPage,
        search, loading,
        setPage, setPerPage, setSearch, refresh
    } = usePagination('/api/articles_paginated');

    const supprimer = async (a) => {
        if (!window.confirm(`Supprimer ${a.designation} ?`)) return;
        try {
            await api.delete(`/api/articles/${a.id_article}`);
            flash('warning', 'Article supprimé.');
            refresh();
        } catch {
            flash('danger', 'Erreur lors de la suppression.');
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="card px-4 py-2" style={{ borderRadius: 10, minWidth: 120 }}>
                    <div className="text-muted" style={{ fontSize: 12 }}>Total articles</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: '#003087' }}>
                        {total}
                    </div>
                </div>
                <Link to="/articles/ajouter" className="btn btn-primary">
                    <i className="bi bi-plus-circle"></i> Nouvel article
                </Link>
            </div>

            <div className="mb-4 d-flex gap-3 align-items-center">
                <div className="input-group" style={{ maxWidth: 400 }}>
                    <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search text-muted"></i>
                    </span>
                    <input type="text" value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           className="form-control border-start-0"
                           placeholder="Rechercher (désignation, code-barres, catégorie)..." />
                </div>
            </div>

            {loading ? (
                <Spinner />
            ) : (
                <>
                    <div className="row g-3">
                        {articles.length === 0 ? (
                            <div className="col-12 text-center py-5 text-muted">
                                <i className="bi bi-box" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3">
                                    {search ? 'Aucun résultat pour cette recherche' : 'Aucun article'}
                                </p>
                                {!search && (
                                    <Link to="/articles/ajouter" className="btn btn-primary mt-2">
                                        Ajouter le premier article
                                    </Link>
                                )}
                            </div>
                        ) : articles.map((a) => (
                            <div key={a.id_article} className="col-md-6 col-lg-4">
                                <div className="card hover-card h-100">
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div style={{
                                                    width: 48, height: 48, borderRadius: 12,
                                                    background: '#e8f0fe', color: '#003087',
                                                    display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', fontSize: 20
                                                }}>
                                                    <i className="bi bi-box"></i>
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 15 }}>{a.designation}</div>
                                                    <div className="text-muted" style={{ fontSize: 12 }}>{a.client_nom}</div>
                                                </div>
                                            </div>
                                            {a.categorie && (
                                                <span className="badge" style={{
                                                    background: '#e8f0fe', color: '#003087', fontSize: 11
                                                }}>{a.categorie}</span>
                                            )}
                                        </div>

                                        <hr style={{ opacity: 0.1 }} />

                                        <div className="d-flex flex-column gap-2 mb-3">
                                            {a.code_barre && (
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-upc-scan text-muted" style={{ fontSize: 13 }}></i>
                                                    <code style={{ fontSize: 12 }}>{a.code_barre}</code>
                                                </div>
                                            )}
                                            <div className="d-flex align-items-center gap-2">
                                                <i className="bi bi-rulers text-muted" style={{ fontSize: 13 }}></i>
                                                <span style={{ fontSize: 13, color: '#555' }}>
                                                    Unité : {a.unite}{a.poids ? ` — ${a.poids} kg` : ''}
                                                </span>
                                            </div>
                                        </div>

                                        <hr style={{ opacity: 0.1 }} />

                                        <div className="row g-2">
                                            <div className="col-4 text-center">
                                                <div style={{ fontSize: 11, color: '#888' }}>Prix achat</div>
                                                <div style={{ fontWeight: 600, fontSize: 13, color: '#003087' }}>
                                                    {a.prix_achat} TND
                                                </div>
                                            </div>
                                            <div className="col-4 text-center"
                                                 style={{ borderLeft: '1px solid #eee', borderRight: '1px solid #eee' }}>
                                                <div style={{ fontSize: 11, color: '#888' }}>Prix vente</div>
                                                <div style={{ fontWeight: 600, fontSize: 13, color: '#0066cc' }}>
                                                    {a.prix_vente} TND
                                                </div>
                                            </div>
                                            <div className="col-4 text-center">
                                                <div style={{ fontSize: 11, color: '#888' }}>Stock min</div>
                                                <div style={{
                                                    fontWeight: 600, fontSize: 13,
                                                    color: a.stock_min > 0 ? '#e74c3c' : '#888'
                                                }}>
                                                    {a.stock_min || '—'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-transparent d-flex gap-2 px-4 pb-3">
                                        <Link to={`/articles/modifier/${a.id_article}`}
                                              className="btn btn-sm btn-outline-primary flex-fill">
                                            <i className="bi bi-pencil"></i> Modifier
                                        </Link>
                                        <button onClick={() => supprimer(a)}
                                                className="btn btn-sm btn-outline-danger flex-fill">
                                            <i className="bi bi-trash"></i> Suppr.
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
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
