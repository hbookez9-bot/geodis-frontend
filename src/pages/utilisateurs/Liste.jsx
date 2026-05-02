import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';

export default function UtilisateursListe() {
    const { flash } = useFlash();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const resp = await api.get('/api/utilisateurs');
            setUsers(resp.data);
        } catch {
            flash('danger', 'Erreur de chargement des utilisateurs.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const toggleActif = async (u) => {
        try {
            await api.post(`/api/utilisateurs/${u.id_utilisateur}/toggle`);
            flash('success', `Utilisateur ${u.actif ? 'désactivé' : 'activé'}.`);
            load();
        } catch {
            flash('danger', 'Erreur.');
        }
    };

    if (loading) return <Spinner />;

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="card px-4 py-2" style={{ borderRadius: 10 }}>
                    <div className="text-muted" style={{ fontSize: 12 }}>Total utilisateurs</div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: '#003087' }}>
                        {users.length}
                    </div>
                </div>
                <Link to="/utilisateurs/ajouter" className="btn btn-primary">
                    <i className="bi bi-plus-circle"></i> Nouvel utilisateur
                </Link>
            </div>

            <div className="row g-3">
                {users.length === 0 ? (
                    <div className="col-12 text-center py-5 text-muted">
                        <i className="bi bi-people" style={{ fontSize: '3rem' }}></i>
                        <p className="mt-3">Aucun utilisateur</p>
                    </div>
                ) : users.map((u) => (
                    <div key={u.id_utilisateur} className="col-md-6 col-lg-4">
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
                                            {(u.nom || '').substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 15 }}>{u.nom}</div>
                                            <div className="text-muted" style={{ fontSize: 12 }}>{u.email}</div>
                                        </div>
                                    </div>
                                    {u.actif ? (
                                        <span className="badge" style={{
                                            background: '#d1e7dd', color: '#0f5132'
                                        }}>Actif</span>
                                    ) : (
                                        <span className="badge" style={{
                                            background: '#f8d7da', color: '#842029'
                                        }}>Inactif</span>
                                    )}
                                </div>

                                <hr style={{ opacity: 0.1 }} />

                                <div className="d-flex flex-column gap-1 mb-3">
                                    <div style={{ fontSize: 12, color: '#555' }}>
                                        <i className="bi bi-shield text-muted"></i>{' '}
                                        Rôle : <strong>{u.role}</strong>
                                    </div>
                                    {u.service && (
                                        <div style={{ fontSize: 12, color: '#555' }}>
                                            <i className="bi bi-building text-muted"></i> Service : {u.service}
                                        </div>
                                    )}
                                    {u.type_utilisateur && (
                                        <div style={{ fontSize: 12, color: '#555' }}>
                                            <i className="bi bi-person-badge text-muted"></i> Type : {u.type_utilisateur}
                                        </div>
                                    )}
                                    {u.tache && (
                                        <div style={{ fontSize: 12, color: '#555' }}>
                                            <i className="bi bi-list-task text-muted"></i> Tâche : {u.tache}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="card-footer bg-transparent d-flex gap-2 px-4 pb-3">
                                <Link to={`/utilisateurs/modifier/${u.id_utilisateur}`}
                                      className="btn btn-sm btn-outline-primary flex-fill">
                                    <i className="bi bi-pencil"></i> Modifier
                                </Link>
                                <button onClick={() => toggleActif(u)}
                                        className={`btn btn-sm ${u.actif ? 'btn-outline-danger' : 'btn-outline-success'} flex-fill`}>
                                    <i className={`bi ${u.actif ? 'bi-toggle-on' : 'bi-toggle-off'}`}></i>{' '}
                                    {u.actif ? 'Désactiver' : 'Activer'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
