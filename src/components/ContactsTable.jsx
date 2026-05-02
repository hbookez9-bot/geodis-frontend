import { useEffect, useState } from 'react';
import api from '../services/api';
import { useFlash } from '../context/FlashContext';

/**
 * Composant table des contacts d'un client.
 * Affiche, ajoute, modifie et supprime les contacts.
 *
 * Props:
 *   - idClient : ID du client (requis)
 */
export default function ContactsTable({ idClient }) {
    const { flash } = useFlash();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        nom: '', email: '', telephone: '', poste: '', est_principal: false
    });

    // Charger les contacts
    const loadContacts = async () => {
        if (!idClient) {
            setContacts([]);
            setLoading(false);
            return;
        }
        try {
            const resp = await api.get(`/api/clients/${idClient}/contacts`);
            setContacts(resp.data);
        } catch (err) {
            console.error('Erreur chargement contacts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadContacts();
    }, [idClient]);

    const reset = () => {
        setForm({ nom: '', email: '', telephone: '', poste: '', est_principal: false });
        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nom.trim()) {
            flash('danger', 'Le nom du contact est obligatoire.');
            return;
        }
        try {
            if (editingId) {
                await api.put(`/api/contacts/${editingId}`, form);
                flash('success', 'Contact modifié ✅');
            } else {
                await api.post(`/api/clients/${idClient}/contacts`, form);
                flash('success', 'Contact ajouté ✅');
            }
            reset();
            loadContacts();
        } catch (err) {
            flash('danger', err.response?.data?.error || 'Erreur lors de l\'enregistrement.');
        }
    };

    const handleEdit = (c) => {
        setForm({
            nom: c.nom || '',
            email: c.email || '',
            telephone: c.telephone || '',
            poste: c.poste || '',
            est_principal: c.est_principal
        });
        setEditingId(c.id_contact);
        setShowForm(true);
    };

    const handleDelete = async (c) => {
        if (!window.confirm(`Supprimer le contact ${c.nom} ?`)) return;
        try {
            await api.delete(`/api/contacts/${c.id_contact}`);
            flash('warning', 'Contact supprimé.');
            loadContacts();
        } catch {
            flash('danger', 'Erreur lors de la suppression.');
        }
    };

    if (!idClient) {
        return (
            <div className="alert alert-info">
                <i className="bi bi-info-circle"></i>{' '}
                Sauvegarde le client d'abord pour pouvoir gérer ses contacts.
            </div>
        );
    }

    return (
        <div className="card mt-3" style={{ borderRadius: 12 }}>
            <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0" style={{ color: '#003087' }}>
                        <i className="bi bi-people"></i> Contacts ({contacts.length})
                    </h6>
                    {!showForm && (
                        <button type="button"
                                onClick={() => setShowForm(true)}
                                className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-plus"></i> Ajouter un contact
                        </button>
                    )}
                </div>

                {/* Formulaire d'ajout/édition */}
                {showForm && (
                    <div className="card mb-3" style={{ background: '#f8f9fa', borderRadius: 10 }}>
                        <div className="card-body p-3">
                            <h6 className="mb-3" style={{ fontSize: 14 }}>
                                {editingId ? 'Modifier le contact' : 'Nouveau contact'}
                            </h6>
                            <div className="row g-2">
                                <div className="col-md-3">
                                    <label className="form-label" style={{ fontSize: 12 }}>
                                        Nom <span className="text-danger">*</span>
                                    </label>
                                    <input type="text"
                                           value={form.nom}
                                           onChange={(e) => setForm({...form, nom: e.target.value})}
                                           className="form-control form-control-sm"
                                           placeholder="ex: M. Ben Ali"
                                           required />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label" style={{ fontSize: 12 }}>Email</label>
                                    <input type="email"
                                           value={form.email}
                                           onChange={(e) => setForm({...form, email: e.target.value})}
                                           className="form-control form-control-sm"
                                           placeholder="email@exemple.com" />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label" style={{ fontSize: 12 }}>Téléphone</label>
                                    <input type="text"
                                           value={form.telephone}
                                           onChange={(e) => setForm({...form, telephone: e.target.value})}
                                           className="form-control form-control-sm"
                                           placeholder="+216..." />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label" style={{ fontSize: 12 }}>Poste</label>
                                    <input type="text"
                                           value={form.poste}
                                           onChange={(e) => setForm({...form, poste: e.target.value})}
                                           className="form-control form-control-sm"
                                           placeholder="Directeur..." />
                                </div>
                                <div className="col-md-2 d-flex align-items-end">
                                    <div className="form-check">
                                        <input type="checkbox"
                                               checked={form.est_principal}
                                               onChange={(e) => setForm({...form, est_principal: e.target.checked})}
                                               className="form-check-input"
                                               id="est_principal" />
                                        <label htmlFor="est_principal" className="form-check-label" style={{ fontSize: 12 }}>
                                            Principal
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2 mt-3">
                                <button type="button"
                                        onClick={handleSubmit}
                                        className="btn btn-sm btn-primary">
                                    <i className="bi bi-check-circle"></i>{' '}
                                    {editingId ? 'Modifier' : 'Ajouter'}
                                </button>
                                <button type="button"
                                        onClick={reset}
                                        className="btn btn-sm btn-outline-secondary">
                                    Annuler
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tableau des contacts */}
                {loading ? (
                    <Spinner />
                ) : contacts.length === 0 ? (
                    <div className="text-center text-muted py-3" style={{ fontSize: 13 }}>
                        <i className="bi bi-inbox"></i> Aucun contact pour ce client
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-sm mb-0">
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th style={{ fontSize: 12 }}>Nom</th>
                                    <th style={{ fontSize: 12 }}>Email</th>
                                    <th style={{ fontSize: 12 }}>Téléphone</th>
                                    <th style={{ fontSize: 12 }}>Poste</th>
                                    <th style={{ fontSize: 12, width: 100 }}>Type</th>
                                    <th style={{ fontSize: 12, width: 90 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contacts.map((c) => (
                                    <tr key={c.id_contact}>
                                        <td style={{ fontSize: 13, fontWeight: 600 }}>{c.nom}</td>
                                        <td style={{ fontSize: 12 }}>
                                            {c.email ? (
                                                <a href={`mailto:${c.email}`}>{c.email}</a>
                                            ) : '—'}
                                        </td>
                                        <td style={{ fontSize: 12 }}>{c.telephone || '—'}</td>
                                        <td style={{ fontSize: 12 }}>{c.poste || '—'}</td>
                                        <td>
                                            {c.est_principal ? (
                                                <span className="badge bg-success" style={{ fontSize: 10 }}>
                                                    <i className="bi bi-star-fill"></i> Principal
                                                </span>
                                            ) : (
                                                <span className="badge bg-light text-dark" style={{ fontSize: 10 }}>
                                                    Standard
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <button type="button"
                                                    onClick={() => handleEdit(c)}
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="Modifier"
                                                    style={{ padding: '2px 6px' }}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button type="button"
                                                    onClick={() => handleDelete(c)}
                                                    className="btn btn-sm btn-outline-danger ms-1"
                                                    title="Supprimer"
                                                    style={{ padding: '2px 6px' }}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
