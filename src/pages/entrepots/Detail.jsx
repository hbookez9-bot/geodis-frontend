import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';

const TYPE_ICONS = {
    etagere: 'bi-grid-3x3',
    frigo: 'bi-snow',
    sol: 'bi-layers',
    picking: 'bi-hand-index'
};

const STATUT_BADGE = {
    libre: 'bg-success',
    occupe: 'bg-danger',
    reserve: 'bg-warning text-dark'
};

export default function EntrepotDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { flash } = useFlash();
    const [entrepot, setEntrepot] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modale ajout magasin
    const [showMagasinModal, setShowMagasinModal] = useState(false);
    const [magasinForm, setMagasinForm] = useState({ nom: '', description: '' });

    // Modale ajout emplacement
    const [showEmplacementModal, setShowEmplacementModal] = useState(false);
    const [empForm, setEmpForm] = useState({
        id_magasin: null, code: '', type: 'etagere', statut: 'libre', zone: 'stockage'
    });

    const load = async () => {
        try {
            const resp = await api.get('/api/entrepots');
            const e = resp.data.find((x) => x.id_entrepot == id);
            if (e) setEntrepot(e);
            else {
                flash('danger', 'Entrepôt introuvable.');
                navigate('/entrepots');
            }
        } catch {
            flash('danger', 'Erreur de chargement.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]);

    const handleAjouterMagasin = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/magasins', { ...magasinForm, id_entrepot: parseInt(id) });
            flash('success', 'Magasin ajouté !');
            setShowMagasinModal(false);
            setMagasinForm({ nom: '', description: '' });
            load();
        } catch (err) {
            flash('danger', err.response?.data?.error || 'Erreur.');
        }
    };

    const supprimerMagasin = async (m) => {
        if (!window.confirm(`Supprimer ${m.nom} ?`)) return;
        try {
            await api.delete(`/api/magasins/${m.id_magasin}`);
            flash('warning', 'Magasin supprimé.');
            load();
        } catch {
            flash('danger', 'Erreur.');
        }
    };

    const ouvrirAjoutEmplacement = (id_magasin) => {
        setEmpForm({ id_magasin, code: '', type: 'etagere', statut: 'libre', zone: 'stockage' });
        setShowEmplacementModal(true);
    };

    const handleAjouterEmplacement = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/emplacements', empForm);
            flash('success', 'Emplacement ajouté !');
            setShowEmplacementModal(false);
            load();
        } catch (err) {
            flash('danger', err.response?.data?.error || 'Erreur.');
        }
    };

    const supprimerEmplacement = async (emp) => {
        if (!window.confirm(`Supprimer ${emp.code} ?`)) return;
        try {
            await api.delete(`/api/emplacements/${emp.id_emplacement}`);
            flash('warning', 'Emplacement supprimé.');
            load();
        } catch {
            flash('danger', 'Erreur.');
        }
    };

    if (loading || !entrepot) return <Spinner />;

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex gap-3">
                    <div className="card px-4 py-2" style={{ borderRadius: 10, minWidth: 120 }}>
                        <div className="text-muted" style={{ fontSize: 12 }}>Magasins</div>
                        <div style={{ fontSize: 22, fontWeight: 600, color: '#003087' }}>
                            {entrepot.nb_magasins}
                        </div>
                    </div>
                    <div className="card px-4 py-2" style={{ borderRadius: 10, minWidth: 120 }}>
                        <div className="text-muted" style={{ fontSize: 12 }}>Emplacements</div>
                        <div style={{ fontSize: 22, fontWeight: 600, color: '#0066cc' }}>
                            {entrepot.nb_emplacements}
                        </div>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <button onClick={() => setShowMagasinModal(true)} className="btn btn-primary">
                        <i className="bi bi-plus-circle"></i> Ajouter un magasin
                    </button>
                    <Link to="/entrepots" className="btn btn-outline-secondary">
                        <i className="bi bi-arrow-left"></i> Retour
                    </Link>
                </div>
            </div>

            <h4 style={{ color: '#003087' }}>{entrepot.nom}</h4>
            <div className="mb-4 d-flex align-items-center gap-2 text-muted">
                <i className="bi bi-geo-alt"></i>
                <span>{entrepot.ville || '—'} — {entrepot.adresse || '—'}</span>
            </div>

            <div className="row g-3">
                {(entrepot.magasins || []).length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted">
                        <i className="bi bi-shop" style={{ fontSize: '3rem' }}></i>
                        <p className="mt-3">Aucun magasin dans cet entrepôt</p>
                        <button onClick={() => setShowMagasinModal(true)} className="btn btn-primary mt-2">
                            Ajouter le premier magasin
                        </button>
                    </div>
                ) : entrepot.magasins.map((m) => (
                    <div key={m.id_magasin} className="col-12">
                        <div className="card" style={{ borderRadius: 12, border: '1px solid #e8ecf0' }}>
                            <div className="card-header d-flex justify-content-between align-items-center py-3 px-4"
                                 style={{ background: 'white', borderRadius: '12px 12px 0 0' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10,
                                        background: '#e8f0fe', color: '#003087',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', fontSize: 18
                                    }}>
                                        <i className="bi bi-shop"></i>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 15 }}>{m.nom}</div>
                                        <div className="text-muted" style={{ fontSize: 12 }}>
                                            {m.description || 'Aucune description'} — {(m.emplacements || []).length} emplacement(s)
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2">
                                    <button onClick={() => ouvrirAjoutEmplacement(m.id_magasin)}
                                            className="btn btn-sm btn-success">
                                        <i className="bi bi-plus"></i> Emplacement
                                    </button>
                                    <button onClick={() => supprimerMagasin(m)}
                                            className="btn btn-sm btn-outline-danger">
                                        <i className="bi bi-trash"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="card-body p-0">
                                {(m.emplacements || []).length === 0 ? (
                                    <div className="text-center text-muted py-4">
                                        <i className="bi bi-inbox" style={{ fontSize: '2rem' }}></i>
                                        <p className="mt-2" style={{ fontSize: 13 }}>
                                            Aucun emplacement — clique sur "+ Emplacement"
                                        </p>
                                    </div>
                                ) : (
                                    <div className="row g-3 p-3">
                                        {m.emplacements.map((emp) => (
                                            <div key={emp.id_emplacement} className="col-md-3 col-sm-6">
                                                <div className="card h-100" style={{ borderRadius: 10 }}>
                                                    <div className="card-body p-3">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <code style={{ fontSize: 14, fontWeight: 600, color: '#003087' }}>
                                                                {emp.code}
                                                            </code>
                                                            <span className={`badge ${STATUT_BADGE[emp.statut] || 'bg-secondary'}`}
                                                                  style={{ fontSize: 10 }}>
                                                                {emp.statut}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-1 mb-1">
                                                            <i className={`bi ${TYPE_ICONS[emp.type] || 'bi-box'} text-muted`}
                                                               style={{ fontSize: 12 }}></i>
                                                            <span style={{ fontSize: 12, color: '#555' }}>{emp.type}</span>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <i className="bi bi-diagram-2 text-muted" style={{ fontSize: 12 }}></i>
                                                            <span style={{ fontSize: 12, color: '#888' }}>
                                                                Zone : {emp.zone || 'stockage'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="card-footer bg-transparent p-2">
                                                        <button onClick={() => supprimerEmplacement(emp)}
                                                                className="btn btn-sm btn-outline-danger w-100"
                                                                style={{ fontSize: 11 }}>
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modale Ajout Magasin */}
            {showMagasinModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleAjouterMagasin}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Nouveau magasin</h5>
                                    <button type="button" className="btn-close"
                                            onClick={() => setShowMagasinModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Nom <span className="text-danger">*</span></label>
                                        <input type="text" value={magasinForm.nom}
                                               onChange={(e) => setMagasinForm({ ...magasinForm, nom: e.target.value })}
                                               className="form-control" required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea value={magasinForm.description}
                                                  onChange={(e) => setMagasinForm({ ...magasinForm, description: e.target.value })}
                                                  className="form-control" rows={2} />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline-secondary"
                                            onClick={() => setShowMagasinModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-primary">Ajouter</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modale Ajout Emplacement */}
            {showEmplacementModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleAjouterEmplacement}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Nouvel emplacement</h5>
                                    <button type="button" className="btn-close"
                                            onClick={() => setShowEmplacementModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Code <span className="text-danger">*</span></label>
                                        <input type="text" value={empForm.code}
                                               onChange={(e) => setEmpForm({ ...empForm, code: e.target.value })}
                                               className="form-control" placeholder="ex: A-01-01" required />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Type</label>
                                            <select value={empForm.type}
                                                    onChange={(e) => setEmpForm({ ...empForm, type: e.target.value })}
                                                    className="form-select">
                                                <option value="etagere">Étagère</option>
                                                <option value="frigo">Frigo</option>
                                                <option value="sol">Sol</option>
                                                <option value="picking">Picking</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Statut</label>
                                            <select value={empForm.statut}
                                                    onChange={(e) => setEmpForm({ ...empForm, statut: e.target.value })}
                                                    className="form-select">
                                                <option value="libre">Libre</option>
                                                <option value="occupe">Occupé</option>
                                                <option value="reserve">Réservé</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Zone</label>
                                        <input type="text" value={empForm.zone}
                                               onChange={(e) => setEmpForm({ ...empForm, zone: e.target.value })}
                                               className="form-control" />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline-secondary"
                                            onClick={() => setShowEmplacementModal(false)}>Annuler</button>
                                    <button type="submit" className="btn btn-primary">Ajouter</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
