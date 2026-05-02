import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';

export default function UtilisateurForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { flash } = useFlash();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        nom: '', email: '', mot_de_passe: '',
        role: 'operateur', service: '',
        type_utilisateur: '', tache: ''
    });
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isEdit) return;
        api.get('/api/utilisateurs').then((resp) => {
            const u = resp.data.find((x) => x.id_utilisateur == id);
            if (u) {
                setForm({
                    nom: u.nom || '',
                    email: u.email || '',
                    mot_de_passe: '',
                    role: u.role || 'operateur',
                    service: u.service || '',
                    type_utilisateur: u.type_utilisateur || '',
                    tache: u.tache || ''
                });
            } else {
                flash('danger', 'Utilisateur introuvable.');
                navigate('/utilisateurs');
            }
        }).finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form };
            // Pour la modification, ne pas envoyer le mot de passe s'il est vide
            if (isEdit && !payload.mot_de_passe) delete payload.mot_de_passe;
            if (isEdit) {
                await api.put(`/api/utilisateurs/${id}`, payload);
                flash('success', 'Utilisateur modifié avec succès !');
            } else {
                await api.post('/api/utilisateurs', payload);
                flash('success', 'Utilisateur ajouté avec succès !');
            }
            navigate('/utilisateurs');
        } catch (err) {
            flash('danger', err.response?.data?.error || 'Erreur.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="card" style={{ maxWidth: 700, borderRadius: 12 }}>
            <div className="card-body p-4">
                <h5 className="mb-4" style={{ color: '#003087' }}>
                    {isEdit ? 'Modifier' : 'Ajouter'} un utilisateur
                </h5>
                <form onSubmit={handleSubmit}>
                    <h6 className="mb-3" style={{ color: '#003087' }}>
                        <i className="bi bi-person"></i> Informations de connexion
                    </h6>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label className="form-label">Nom <span className="text-danger">*</span></label>
                            <input type="text" name="nom" value={form.nom}
                                   onChange={handleChange} className="form-control" required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Email <span className="text-danger">*</span></label>
                            <input type="email" name="email" value={form.email}
                                   onChange={handleChange} className="form-control" required />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label className="form-label">
                                Mot de passe{' '}
                                {isEdit ? (
                                    <span className="text-muted" style={{ fontSize: 11 }}>
                                        (vide = pas de changement)
                                    </span>
                                ) : (
                                    <span className="text-danger">*</span>
                                )}
                            </label>
                            <input type="password" name="mot_de_passe" value={form.mot_de_passe}
                                   onChange={handleChange} className="form-control"
                                   required={!isEdit} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Rôle</label>
                            <select name="role" value={form.role}
                                    onChange={handleChange} className="form-select">
                                <option value="operateur">Opérateur</option>
                                <option value="responsable">Responsable</option>
                            </select>
                        </div>
                    </div>

                    <hr style={{ opacity: 0.1 }} />
                    <h6 className="mb-3" style={{ color: '#003087' }}>
                        <i className="bi bi-briefcase"></i> Informations professionnelles
                    </h6>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label className="form-label">Service</label>
                            <input type="text" name="service" value={form.service}
                                   onChange={handleChange} className="form-control"
                                   placeholder="ex: Logistique, Import/Export" />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Type utilisateur</label>
                            <input type="text" name="type_utilisateur" value={form.type_utilisateur}
                                   onChange={handleChange} className="form-control"
                                   placeholder="ex: Gestionnaire, Opérateur" />
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Tâche</label>
                        <input type="text" name="tache" value={form.tache}
                               onChange={handleChange} className="form-control"
                               placeholder="ex: Réception, Inventaire" />
                    </div>

                    <div className="d-flex gap-2 mt-4">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <i className="bi bi-check-circle"></i>{' '}
                            {saving ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Ajouter')}
                        </button>
                        <Link to="/utilisateurs" className="btn btn-outline-secondary">Annuler</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
