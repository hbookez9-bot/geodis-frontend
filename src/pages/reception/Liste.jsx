import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';
import usePagination from '../../services/usePagination';
import Pagination from '../../components/Pagination';

const STATUT_BADGE = {
    en_attente: { bg: '#fff3cd', color: '#856404' },
    recu:       { bg: '#d1e7dd', color: '#0f5132' },
    partiel:    { bg: '#cfe2ff', color: '#084298' },
    annule:     { bg: '#f8d7da', color: '#842029' }
};

export default function ReceptionListe() {
    const { flash } = useFlash();
    const navigate = useNavigate();

    const {
        items: attendus, total, page, pages, perPage,
        search, loading,
        setPage, setPerPage, setSearch
    } = usePagination('/api/attendus_paginated');

    const demarrer = async (a) => {
        try {
            const resp = await api.post(`/api/attendus/${a.id_attendu}/demarrer`);
            flash('success', 'Réception démarrée !');
            navigate(`/reception/scan/${resp.data.id_reception}`);
        } catch {
            flash('danger', 'Erreur lors du démarrage.');
        }
    };

    const continuer = (a) => {
        const recEnCours = (a.receptions || []).find(r => r.statut === 'en_cours');
        if (recEnCours) {
            navigate(`/reception/scan/${recEnCours.id_reception}`);
        } else if (a.receptions && a.receptions.length > 0) {
            navigate(`/reception/scan/${a.receptions[a.receptions.length - 1].id_reception}`);
        } else {
            flash('danger', 'Aucune réception en cours pour cet attendu.');
        }
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="card px-4 py-2" style={{ borderRadius: 10 }}>
                    <div className="text-muted" style={{ fontSize: 12 }}>Total attendus</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: '#003087' }}>
                        {total}
                    </div>
                </div>
                <Link to="/reception/ajouter" className="btn btn-primary">
                    <i className="bi bi-plus-circle"></i> Nouvel attendu
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
                           placeholder="Rechercher (client, n° dossier)..." />
                </div>
            </div>

            {loading ? (
                <Spinner />
            ) : (
                <>
                    <div className="row g-3">
                        {attendus.length === 0 ? (
                            <div className="col-12 text-center py-5 text-muted">
                                <i className="bi bi-truck" style={{ fontSize: '3rem' }}></i>
                                <p className="mt-3">
                                    {search ? 'Aucun résultat' : 'Aucun attendu'}
                                </p>
                                {!search && (
                                    <Link to="/reception/ajouter" className="btn btn-primary mt-2">
                                        Créer le premier attendu
                                    </Link>
                                )}
                            </div>
                        ) : attendus.map((a) => {
                            const badge = STATUT_BADGE[a.statut] || { bg: '#eee', color: '#000' };
                            return (
                                <div key={a.id_attendu} className="col-12">
                                    <div className="card" style={{ borderRadius: 12, border: '1px solid #e8ecf0' }}>
                                        <div className="card-body p-4">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="d-flex gap-3 align-items-center">
                                                    <div style={{
                                                        width: 48, height: 48, borderRadius: 12,
                                                        background: '#e8f0fe', color: '#003087',
                                                        display: 'flex', alignItems: 'center',
                                                        justifyContent: 'center', fontSize: 20
                                                    }}>
                                                        <i className="bi bi-truck"></i>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 15 }}>
                                                            Attendu #{a.id_attendu}
                                                            {a.num_dossier && ` (${a.num_dossier})`}
                                                        </div>
                                                        <div className="text-muted" style={{ fontSize: 13 }}>
                                                            <i className="bi bi-person"></i> {a.client_nom}
                                                            {' '}—{' '}
                                                            <i className="bi bi-building"></i> {a.entrepot_nom}
                                                        </div>
                                                        <div className="text-muted" style={{ fontSize: 12 }}>
                                                            <i className="bi bi-calendar"></i> Date prévue : {a.date_attendue}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center gap-3">
                                                    <span className="badge px-3 py-2" style={{
                                                        fontSize: 12, background: badge.bg, color: badge.color
                                                    }}>
                                                        {a.statut.replace('_', ' ').toUpperCase()}
                                                    </span>

                                                    {a.statut === 'en_attente' && (
                                                        <button onClick={() => demarrer(a)} className="btn btn-sm btn-success">
                                                            <i className="bi bi-play-circle"></i> Démarrer
                                                        </button>
                                                    )}
                                                    {a.statut === 'partiel' && (
                                                        <button onClick={() => continuer(a)} className="btn btn-sm btn-primary">
                                                            <i className="bi bi-arrow-right-circle"></i> Continuer
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {a.details && a.details.length > 0 && (
                                                <>
                                                    <hr style={{ opacity: 0.1, margin: '12px 0' }} />
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {a.details.map((d, i) => (
                                                            <span key={i} className="badge" style={{
                                                                background: '#f0f4ff', color: '#003087', fontSize: 11
                                                            }}>
                                                                {d.designation} × {d.quantite_attendue}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
