import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';
import usePagination from '../../services/usePagination';
import Pagination from '../../components/Pagination';

export default function ClientsListe() {
    const { flash } = useFlash();

    const {
        items: clients, total, page, pages, perPage,
        search, loading,
        setPage, setPerPage, setSearch, refresh
    } = usePagination('/api/clients_paginated');

    const supprimer = async (client) => {
        if (!window.confirm(`Supprimer ${client.nom} ?`)) return;
        try {
            await api.delete(`/api/clients/${client.id_client}`);
            flash('warning', 'Client supprimé.');
            refresh();
        } catch {
            flash('danger', 'Erreur lors de la suppression.');
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="card px-4 py-2" style={{ borderRadius: 10, minWidth: 120 }}>
                    <div className="text-muted" style={{ fontSize: 12 }}>Total clients</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: '#003087' }}>
                        {total}
                    </div>
                </div>
                <Link to="/clients/ajouter" className="btn btn-primary">
                    <i className="bi bi-plus-circle"></i> Nouveau client
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
                           placeholder="Rechercher un client..." />
                </div>
            </div>

            {loading ? (
                <Spinner />
            ) : (
                <>
                    <div className="row g-3">
                        {clients.length === 0 ? (
                            <div className="col-12 text-center py-5 text-muted">
                                <i className="bi bi-people" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3">
                                    {search ? 'Aucun résultat pour cette recherche' : 'Aucun client'}
                                </p>
                                {!search && (
                                    <Link to="/clients/ajouter" className="btn btn-primary mt-2">
                                        Ajouter le premier client
                                    </Link>
                                )}
                            </div>
                        ) : clients.map((c) => (
                            <div key={c.id_client} className="col-md-6 col-lg-4">
                                <div className="card hover-card h-100">
                                    <div className="card-body p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div style={{
                                                    width: 48, height: 48, borderRadius: '50%',
                                                    background: '#003087', color: 'white',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontWeight: 600, fontSize: 16
                                                }}>
                                                    {(c.nom || '').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 15 }}>{c.nom}</div>
                                                    <div className="text-muted" style={{ fontSize: 12 }}>
                                                        ID : {c.id_client}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="badge" style={{
                                                background: '#e8f0fe', color: '#003087', fontSize: 11
                                            }}>Actif</span>
                                        </div>

                                        <hr style={{ opacity: 0.1 }} />

                                        <div className="d-flex flex-column gap-2 mb-3">
                                            {c.email && (
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-envelope text-muted" style={{ fontSize: 13 }}></i>
                                                    <span style={{ fontSize: 13, color: '#555' }}>{c.email}</span>
                                                </div>
                                            )}
                                            {c.telephone && (
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-telephone text-muted" style={{ fontSize: 13 }}></i>
                                                    <span style={{ fontSize: 13, color: '#555' }}>{c.telephone}</span>
                                                </div>
                                            )}
                                            {c.adresse && (
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-geo-alt text-muted" style={{ fontSize: 13 }}></i>
                                                    <span style={{ fontSize: 13, color: '#555' }}>{c.adresse}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="d-flex align-items-center gap-2 mt-2">
                                            <i className="bi bi-box text-muted" style={{ fontSize: 13 }}></i>
                                            <span style={{ fontSize: 12, color: '#888' }}>
                                                {c.nb_articles || 0} article(s)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-transparent d-flex gap-2 px-4 pb-3">
                                        <Link to={`/clients/modifier/${c.id_client}`}
                                              className="btn btn-sm btn-outline-primary flex-fill">
                                            <i className="bi bi-pencil"></i> Modifier
                                        </Link>
                                        <button onClick={() => supprimer(c)}
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
