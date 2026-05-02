import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';
import ContactsTable from '../../components/ContactsTable';

export default function ClientForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { flash } = useFlash();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        nom: '',
        adresse: '',
        adresse_livraison: '',
        pays: 'Tunisie',
        code_postal: '',
        telephone: '',
        email: '',
        contact_principal: ''
    });
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isEdit) return;
        api.get('/api/clients').then((resp) => {
            const c = resp.data.find((x) => x.id_client == id);
            if (c) {
                setForm({
                    nom: c.nom || '',
                    adresse: c.adresse || '',
                    adresse_livraison: c.adresse_livraison || '',
                    pays: c.pays || 'Tunisie',
                    code_postal: c.code_postal || '',
                    telephone: c.telephone || '',
                    email: c.email || '',
                    contact_principal: c.contact_principal || ''
                });
            } else {
                flash('danger', 'Client introuvable.');
                navigate('/clients');
            }
        }).finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await api.put(`/api/clients/${id}`, form);
                flash('success', 'Client modifié avec succès !');
            } else {
                const resp = await api.post('/api/clients', form);
                flash('success', 'Client ajouté avec succès !');
                // Pour un nouveau client, on redirige vers l'édition pour gérer les contacts
                if (resp.data?.id_client) {
                    navigate(`/clients/modifier/${resp.data.id_client}`);
                    return;
                }
            }
            navigate('/clients');
        } catch (err) {
            flash('danger', err.response?.data?.error || 'Erreur lors de l\'enregistrement.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div style={{ maxWidth: 1000 }}>
            {/* Carte 1 : Informations générales */}
            <div className="card" style={{ borderRadius: 12 }}>
                <div className="card-body p-4">
                    <h5 className="mb-4" style={{ color: '#003087' }}>
                        {isEdit ? 'Modifier' : 'Ajouter'} un client
                    </h5>
                    <form onSubmit={handleSubmit}>
                        <h6 className="mb-3" style={{ color: '#003087' }}>
                            <i className="bi bi-person"></i> Informations générales
                        </h6>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Nom <span className="text-danger">*</span></label>
                                <input type="text" name="nom" value={form.nom}
                                       onChange={handleChange} className="form-control" required />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Pays</label>
                                <input type="text" name="pays" value={form.pays}
                                       onChange={handleChange} className="form-control" />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label">Code postal</label>
                                <input type="text" name="code_postal" value={form.code_postal}
                                       onChange={handleChange} className="form-control" />
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Adresse</label>
                                <input type="text" name="adresse" value={form.adresse}
                                       onChange={handleChange} className="form-control" />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Adresse de livraison</label>
                                <input type="text" name="adresse_livraison" value={form.adresse_livraison}
                                       onChange={handleChange} className="form-control" />
                            </div>
                        </div>

                        <div className="row mb-3">
                            <div className="col-md-4">
                                <label className="form-label">Téléphone</label>
                                <input type="text" name="telephone" value={form.telephone}
                                       onChange={handleChange} className="form-control" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Email</label>
                                <input type="email" name="email" value={form.email}
                                       onChange={handleChange} className="form-control" />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Contact principal (Directeur)</label>
                                <input type="text" name="contact_principal" value={form.contact_principal}
                                       onChange={handleChange} className="form-control"
                                       placeholder="Nom du directeur" />
                            </div>
                        </div>

                        <div className="d-flex gap-2 mt-4">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                <i className="bi bi-check-circle"></i>{' '}
                                {saving ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Ajouter')}
                            </button>
                            <Link to="/clients" className="btn btn-outline-secondary">Annuler</Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Carte 2 : Table des contacts (visible seulement si on édite) */}
            {isEdit && (
                <ContactsTable idClient={parseInt(id)} />
            )}

            {!isEdit && (
                <div className="alert alert-info mt-3" style={{ borderRadius: 12 }}>
                    <i className="bi bi-info-circle"></i>{' '}
                    Une fois le client créé, tu pourras gérer ses contacts ici.
                </div>
            )}
        </div>
    );
}
