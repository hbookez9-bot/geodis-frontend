import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';
import Spinner from '../../components/Spinner';

export default function EntrepotsListe() {
    const { flash } = useFlash();
    const [entrepots, setEntrepots] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const resp = await api.get('/api/entrepots');
            setEntrepots(resp.data);
        } catch {
            flash('danger', 'Erreur de chargement.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const supprimer = async (e) => {
        if (!window.confirm(`Supprimer ${e.nom} ?`)) return;
        try {
            await api.delete(`/api/entrepots/${e.id_entrepot}`);
            flash('warning', 'Entrepôt supprimé.');
            load();
        } catch {
            flash('danger', 'Erreur lors de la suppression.');
        }
    };

    const filtered = entrepots.filter((e) =>
        JSON.stringify(e).toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Spinner />;

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="card px-4 py-2" style={{ borderRadius: 10, minWidth: 120 }}>
                    <div className="text-muted" style={{ fontSize: 12 }}>Total entrepôts</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: '#003087' }}>
                        {entrepots.length}
                    </div>
                </div>
                <Link to="/entrepots/ajouter" className="btn btn-primary">
                    <i className="bi bi-plus-circle"></i> Nouvel entrepôt
                </Link>
            </div>

            <div className="mb-4">
                <div className="input-group" style={{ maxWidth: 400 }}>
                    <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search text-muted"></i>
                    </span>
                    <input type="text" value={search}
                           onChange={(ev) => setSearch(ev.target.value)}
                           className="form-control border-start-0"
                           placeholder="Rechercher un entrepôt..." />
                </div>
            </div>

            <div className="row g-3">
                {filtered.length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted">
                        <i className="bi bi-building" style={{ fontSize: '3rem' }}></i>
                        <p className="mt-3">Aucun entrepôt</p>
                        <Link to="/entrepots/ajouter" className="btn btn-primary mt-2">
                            Ajouter le premier entrepôt
                        </Link>
                    </div>
                ) : filtered.map((e) => (
                    <div key={e.id_entrepot} className="col-md-6 col-lg-4">
                        <div className="card hover-card h-100">
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div style={{
                                            width: 48, height: 48, borderRadius: 12,
                                            background: '#e8f0fe', color: '#003087',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontSize: 22
                                        }}>
                                            <i className="bi bi-building"></i>
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 15 }}>{e.nom}</div>
                                            <div className="text-muted" style={{ fontSize: 12 }}>
                                                <i className="bi bi-geo-alt"></i> {e.ville || '—'}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="badge" style={{
                                        background: '#e8f0fe', color: '#003087', fontSize: 11
                                    }}>Actif</span>
                                </div>

                                <hr style={{ opacity: 0.1 }} />

                                {e.adresse && (
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <i className="bi bi-map text-muted" style={{ fontSize: 13 }}></i>
                                        <span style={{ fontSize: 13, color: '#555' }}>{e.adresse}</span>
                                    </div>
                                )}

                                <div className="row g-2 mt-2">
                                    <div className="col-6 text-center p-2"
                                         style={{ background: '#f8f9fa', borderRadius: 8 }}>
                                        <div style={{ fontSize: 11, color: '#888' }}>Magasins</div>
                                        <div style={{ fontWeight: 600, fontSize: 18, color: '#003087' }}>
                                            {e.nb_magasins}
                                        </div>
                                    </div>
                                    <div className="col-6 text-center p-2"
                                         style={{ background: '#f8f9fa', borderRadius: 8 }}>
                                        <div style={{ fontSize: 11, color: '#888' }}>Emplacements</div>
                                        <div style={{ fontWeight: 600, fontSize: 18, color: '#0066cc' }}>
                                            {e.nb_emplacements}
                                        </div>
                                    </div>
                                </div>

                                {e.magasins && e.magasins.length > 0 && (
                                    <div className="mt-3">
                                        <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>
                                            Magasins :
                                        </div>
                                        <div className="d-flex flex-wrap gap-1">
                                            {e.magasins.map((m) => (
                                                <span key={m.id_magasin} className="badge" style={{
                                                    background: '#f0f4ff', color: '#003087', fontSize: 11
                                                }}>{m.nom}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="card-footer bg-transparent d-flex gap-2 px-4 pb-3">
                                <Link to={`/entrepots/${e.id_entrepot}`}
                                      className="btn btn-sm btn-primary flex-fill">
                                    <i className="bi bi-eye"></i> Détail
                                </Link>
                                <button onClick={() => supprimer(e)}
                                        className="btn btn-sm btn-outline-danger">
                                    <i className="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
