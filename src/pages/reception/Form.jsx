import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';

export default function ReceptionForm() {
    const navigate = useNavigate();
    const { flash } = useFlash();

    const [clients, setClients] = useState([]);
    const [entrepots, setEntrepots] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        // Informations générales
        id_client: '', id_entrepot: '', date_attendue: '',
        // Informations dossier
        num_dossier: '', dossier: '', titre: '', rubrique: '',
        escale: '', num_facture: '',
        date_sortie_magasin: '', date_entree_entrepot: '',
        // Quantités
        total_colis: 0, total_pieces: 0,
        total_colis_manquants: 0, total_pieces_manquants: 0
    });

    const [details, setDetails] = useState([
        { id_article: '', quantite: 1, prix_unitaire: 0,
          date_fabrication: '', date_expiration: '' }
    ]);

    useEffect(() => {
        Promise.all([
            api.get('/api/clients'),
            api.get('/api/entrepots'),
            api.get('/api/articles')
        ]).then(([c, e, a]) => {
            setClients(c.data);
            setEntrepots(e.data);
            setArticles(a.data);
        }).catch(() => {
            flash('danger', 'Erreur de chargement.');
        }).finally(() => setLoading(false));
    }, []);

    const ajouterLigne = () =>
        setDetails([...details, {
            id_article: '', quantite: 1, prix_unitaire: 0,
            date_fabrication: '', date_expiration: ''
        }]);

    const supprimerLigne = (i) =>
        setDetails(details.filter((_, idx) => idx !== i));

    const updateDetail = (i, field, value) => {
        const next = [...details];
        next[i][field] = value;
        setDetails(next);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                id_client: parseInt(form.id_client),
                id_entrepot: parseInt(form.id_entrepot),
                total_colis: parseInt(form.total_colis || 0),
                total_pieces: parseInt(form.total_pieces || 0),
                total_colis_manquants: parseInt(form.total_colis_manquants || 0),
                total_pieces_manquants: parseInt(form.total_pieces_manquants || 0),
                details: details
                    .filter((d) => d.id_article)
                    .map((d) => ({
                        id_article: parseInt(d.id_article),
                        quantite: parseInt(d.quantite || 0),
                        prix_unitaire: parseFloat(d.prix_unitaire || 0),
                        date_fabrication: d.date_fabrication || null,
                        date_expiration: d.date_expiration || null
                    }))
            };
            await api.post('/api/attendus', payload);
            flash('success', 'Attendu créé avec succès !');
            navigate('/reception');
        } catch (err) {
            flash('danger', err.response?.data?.error || 'Erreur lors de la création.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="card" style={{ maxWidth: 1100, borderRadius: 12 }}>
            <div className="card-body p-4">
                <h5 className="mb-4" style={{ color: '#003087' }}>Créer un attendu</h5>
                <form onSubmit={handleSubmit}>
                    {/* INFORMATIONS GÉNÉRALES */}
                    <h6 className="mb-3" style={{ color: '#003087' }}>
                        <i className="bi bi-info-circle"></i> Informations générales
                    </h6>
                    <div className="row mb-3">
                        <div className="col-md-4">
                            <label className="form-label">Client <span className="text-danger">*</span></label>
                            <select value={form.id_client}
                                    onChange={(e) => setForm({ ...form, id_client: e.target.value })}
                                    className="form-select" required>
                                <option value="">-- Sélectionner --</option>
                                {clients.map((c) => (
                                    <option key={c.id_client} value={c.id_client}>{c.nom}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Entrepôt <span className="text-danger">*</span></label>
                            <select value={form.id_entrepot}
                                    onChange={(e) => setForm({ ...form, id_entrepot: e.target.value })}
                                    className="form-select" required>
                                <option value="">-- Sélectionner --</option>
                                {entrepots.map((e) => (
                                    <option key={e.id_entrepot} value={e.id_entrepot}>{e.nom}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Date prévue <span className="text-danger">*</span></label>
                            <input type="date" value={form.date_attendue}
                                   onChange={(e) => setForm({ ...form, date_attendue: e.target.value })}
                                   className="form-control" required />
                        </div>
                    </div>

                    <hr style={{ opacity: 0.1 }} />

                    {/* INFORMATIONS DOSSIER */}
                    <h6 className="mb-3" style={{ color: '#003087' }}>
                        <i className="bi bi-folder"></i> Informations dossier
                    </h6>
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <label className="form-label">N° dossier</label>
                            <input type="text" value={form.num_dossier}
                                   onChange={(e) => setForm({ ...form, num_dossier: e.target.value })}
                                   className="form-control" placeholder="ex: DOS-2026-001" />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Dossier</label>
                            <input type="text" value={form.dossier}
                                   onChange={(e) => setForm({ ...form, dossier: e.target.value })}
                                   className="form-control" />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Titre importation</label>
                            <input type="text" value={form.titre}
                                   onChange={(e) => setForm({ ...form, titre: e.target.value })}
                                   className="form-control" />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Rubrique</label>
                            <input type="text" value={form.rubrique}
                                   onChange={(e) => setForm({ ...form, rubrique: e.target.value })}
                                   className="form-control" />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <label className="form-label">Escale</label>
                            <input type="text" value={form.escale}
                                   onChange={(e) => setForm({ ...form, escale: e.target.value })}
                                   className="form-control" />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">N° facture fournisseur</label>
                            <input type="text" value={form.num_facture}
                                   onChange={(e) => setForm({ ...form, num_facture: e.target.value })}
                                   className="form-control" />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Date sortie magasin</label>
                            <input type="date" value={form.date_sortie_magasin}
                                   onChange={(e) => setForm({ ...form, date_sortie_magasin: e.target.value })}
                                   className="form-control" />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Date entrée entrepôt</label>
                            <input type="date" value={form.date_entree_entrepot}
                                   onChange={(e) => setForm({ ...form, date_entree_entrepot: e.target.value })}
                                   className="form-control" />
                        </div>
                    </div>

                    <hr style={{ opacity: 0.1 }} />

                    {/* QUANTITÉS */}
                    <h6 className="mb-3" style={{ color: '#003087' }}>
                        <i className="bi bi-boxes"></i> Quantités
                    </h6>
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <label className="form-label">Total colis</label>
                            <input type="number" min="0" value={form.total_colis}
                                   onChange={(e) => setForm({ ...form, total_colis: e.target.value })}
                                   className="form-control" />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Total pièces</label>
                            <input type="number" min="0" value={form.total_pieces}
                                   onChange={(e) => setForm({ ...form, total_pieces: e.target.value })}
                                   className="form-control" />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Colis manquants</label>
                            <input type="number" min="0" value={form.total_colis_manquants}
                                   onChange={(e) => setForm({ ...form, total_colis_manquants: e.target.value })}
                                   className="form-control" />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Pièces manquantes</label>
                            <input type="number" min="0" value={form.total_pieces_manquants}
                                   onChange={(e) => setForm({ ...form, total_pieces_manquants: e.target.value })}
                                   className="form-control" />
                        </div>
                    </div>

                    <hr style={{ opacity: 0.1 }} />

                    {/* ARTICLES ATTENDUS */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0" style={{ color: '#003087' }}>
                            <i className="bi bi-list-check"></i> Articles attendus
                        </h6>
                        <button type="button" onClick={ajouterLigne}
                                className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-plus"></i> Ajouter un article
                        </button>
                    </div>

                    {details.map((d, i) => (
                        <div key={i} className="card p-3 mb-2"
                             style={{ borderRadius: 10, background: '#f8f9fa' }}>
                            <div className="row g-2 align-items-end">
                                <div className="col-md-3">
                                    <label className="form-label" style={{ fontSize: 12 }}>Article</label>
                                    <select value={d.id_article}
                                            onChange={(e) => updateDetail(i, 'id_article', e.target.value)}
                                            className="form-select form-select-sm">
                                        <option value="">-- Article --</option>
                                        {articles.map((a) => (
                                            <option key={a.id_article} value={a.id_article}>
                                                {a.designation}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label" style={{ fontSize: 12 }}>Quantité</label>
                                    <input type="number" min="1" value={d.quantite}
                                           onChange={(e) => updateDetail(i, 'quantite', e.target.value)}
                                           className="form-control form-control-sm" />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label" style={{ fontSize: 12 }}>Prix unitaire</label>
                                    <input type="number" step="0.01" value={d.prix_unitaire}
                                           onChange={(e) => updateDetail(i, 'prix_unitaire', e.target.value)}
                                           className="form-control form-control-sm" />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label" style={{ fontSize: 12 }}>Date fabrication</label>
                                    <input type="date" value={d.date_fabrication}
                                           onChange={(e) => updateDetail(i, 'date_fabrication', e.target.value)}
                                           className="form-control form-control-sm" />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label" style={{ fontSize: 12 }}>Date expiration</label>
                                    <input type="date" value={d.date_expiration}
                                           onChange={(e) => updateDetail(i, 'date_expiration', e.target.value)}
                                           className="form-control form-control-sm" />
                                </div>
                                <div className="col-md-1">
                                    {details.length > 1 && (
                                        <button type="button" onClick={() => supprimerLigne(i)}
                                                className="btn btn-sm btn-outline-danger w-100">
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="d-flex gap-2 mt-4">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <i className="bi bi-check-circle"></i>{' '}
                            {saving ? 'Création...' : "Créer l'attendu"}
                        </button>
                        <Link to="/reception" className="btn btn-outline-secondary">Annuler</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
