import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';
import Spinner from '../../components/Spinner';

const UNITES = ['unite', 'kg', 'litre', 'carton', 'palette'];

export default function ArticleForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { flash } = useFlash();
    const isEdit = Boolean(id);

    const [clients, setClients] = useState([]);
    const [form, setForm] = useState({
        id_client: '',
        code_barre: '',
        designation: '',
        unite: 'unite',
        poids: '',
        prix_achat: '0',
        prix_vente: '0',
        stock_min: '0',
        description: '',
        categorie: '',
        vitesse_consommation: '0',
        delai_livraison: '0',
        stock_securite: '0',
        stock_reappro: '0'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                const cResp = await api.get('/api/clients');
                setClients(cResp.data);
                if (isEdit) {
                    const aResp = await api.get('/api/articles');
                    const a = aResp.data.find((x) => x.id_article == id);
                    if (a) {
                        setForm({
                            id_client: a.id_client || '',
                            code_barre: a.code_barre || '',
                            designation: a.designation || '',
                            unite: a.unite || 'unite',
                            poids: a.poids || '',
                            prix_achat: a.prix_achat ?? '0',
                            prix_vente: a.prix_vente ?? '0',
                            stock_min: a.stock_min ?? '0',
                            description: a.description || '',
                            categorie: a.categorie || '',
                            vitesse_consommation: a.vitesse_consommation ?? '0',
                            delai_livraison: a.delai_livraison ?? '0',
                            stock_securite: a.stock_securite ?? '0',
                            stock_reappro: a.stock_reappro ?? '0'
                        });
                    } else {
                        flash('danger', 'Article introuvable.');
                        navigate('/articles');
                    }
                }
            } catch {
                flash('danger', 'Erreur de chargement.');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id]);

    // Calcul auto SR = (vitesse × délai) + SS
    useEffect(() => {
        const vitesse = parseFloat(form.vitesse_consommation) || 0;
        const delai = parseInt(form.delai_livraison) || 0;
        const ss = parseInt(form.stock_securite) || 0;
        const sr = Math.round((vitesse * delai) + ss);
        if (String(sr) !== form.stock_reappro) {
            setForm((f) => ({ ...f, stock_reappro: String(sr) }));
        }
    }, [form.vitesse_consommation, form.delai_livraison, form.stock_securite]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                id_client: parseInt(form.id_client),
                poids: form.poids ? parseFloat(form.poids) : null,
                prix_achat: parseFloat(form.prix_achat || 0),
                prix_vente: parseFloat(form.prix_vente || 0),
                stock_min: parseInt(form.stock_min || 0),
                vitesse_consommation: parseFloat(form.vitesse_consommation || 0),
                delai_livraison: parseInt(form.delai_livraison || 0),
                stock_securite: parseInt(form.stock_securite || 0),
                stock_reappro: parseInt(form.stock_reappro || 0)
            };
            if (isEdit) {
                await api.put(`/api/articles/${id}`, payload);
                flash('success', 'Article modifié avec succès !');
            } else {
                await api.post('/api/articles', payload);
                flash('success', 'Article ajouté avec succès !');
            }
            navigate('/articles');
        } catch (err) {
            flash('danger', err.response?.data?.error || 'Erreur.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    const showSR = (parseFloat(form.vitesse_consommation) > 0 ||
                    parseInt(form.delai_livraison) > 0 ||
                    parseInt(form.stock_securite) > 0);

    return (
        <div className="card" style={{ maxWidth: 700, borderRadius: 12 }}>
            <div className="card-body p-4">
                <h5 className="mb-4" style={{ color: '#003087' }}>
                    {isEdit ? 'Modifier' : 'Ajouter'} un article
                </h5>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Client <span className="text-danger">*</span></label>
                            <select name="id_client" value={form.id_client}
                                    onChange={handleChange} className="form-select" required>
                                <option value="">-- Sélectionner --</option>
                                {clients.map((c) => (
                                    <option key={c.id_client} value={c.id_client}>{c.nom}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Catégorie</label>
                            <input type="text" name="categorie" value={form.categorie}
                                   onChange={handleChange} className="form-control"
                                   placeholder="ex: Alimentaire, Électronique..." />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Désignation <span className="text-danger">*</span></label>
                        <input type="text" name="designation" value={form.designation}
                               onChange={handleChange} className="form-control" required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea name="description" value={form.description}
                                  onChange={handleChange} className="form-control" rows={2}
                                  placeholder="Description optionnelle..." />
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">Code-barres</label>
                            <input type="text" name="code_barre" value={form.code_barre}
                                   onChange={handleChange} className="form-control"
                                   placeholder="ex: 3017620422003" />
                        </div>
                        <div className="col-md-3 mb-3">
                            <label className="form-label">Unité</label>
                            <select name="unite" value={form.unite}
                                    onChange={handleChange} className="form-select">
                                {UNITES.map((u) => (
                                    <option key={u} value={u}>
                                        {u.charAt(0).toUpperCase() + u.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3 mb-3">
                            <label className="form-label">Poids (kg)</label>
                            <input type="number" name="poids" value={form.poids}
                                   onChange={handleChange} className="form-control"
                                   step="0.01" min="0" placeholder="0.00" />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label className="form-label">Prix achat (TND)</label>
                            <input type="number" name="prix_achat" value={form.prix_achat}
                                   onChange={handleChange} className="form-control"
                                   step="0.01" min="0" />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label">Prix vente (TND)</label>
                            <input type="number" name="prix_vente" value={form.prix_vente}
                                   onChange={handleChange} className="form-control"
                                   step="0.01" min="0" />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label">Stock minimum</label>
                            <input type="number" name="stock_min" value={form.stock_min}
                                   onChange={handleChange} className="form-control" min="0" />
                            <div className="form-text">Seuil alerte général</div>
                        </div>
                    </div>

                    <hr style={{ opacity: 0.1 }} />
                    <h6 className="mb-3" style={{ color: '#003087' }}>
                        <i className="bi bi-graph-up"></i> Paramètres de stock
                    </h6>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Vitesse de consommation <small className="text-muted">(unités/jour)</small>
                            </label>
                            <input type="number" name="vitesse_consommation"
                                   value={form.vitesse_consommation}
                                   onChange={handleChange} className="form-control"
                                   step="0.1" min="0" />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Délai livraison <small className="text-muted">(jours)</small>
                            </label>
                            <input type="number" name="delai_livraison"
                                   value={form.delai_livraison}
                                   onChange={handleChange} className="form-control" min="0" />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Stock de sécurité (SS) <small className="text-muted">(unités)</small>
                            </label>
                            <input type="number" name="stock_securite"
                                   value={form.stock_securite}
                                   onChange={handleChange} className="form-control" min="0" />
                            <div className="form-text">Protection contre les imprévus</div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label className="form-label">
                                Stock réappro (SR) <small className="text-muted">(calculé auto)</small>
                            </label>
                            <input type="number" name="stock_reappro"
                                   value={form.stock_reappro}
                                   onChange={handleChange} className="form-control" min="0"
                                   style={{ background: '#f0f4ff', fontWeight: 600, color: '#003087' }} />
                            <div className="form-text">SR = (Vitesse × Délai) + SS</div>
                        </div>
                    </div>

                    {showSR && (
                        <div className="alert p-3 mt-2" style={{
                            background: '#fff3cd', borderRadius: 10, fontSize: 13
                        }}>
                            <i className="bi bi-calculator"></i>{' '}
                            <strong>Calcul SR :</strong>{' '}
                            ({form.vitesse_consommation} × {form.delai_livraison}) + {form.stock_securite} = {form.stock_reappro} unités
                        </div>
                    )}

                    <div className="d-flex gap-2 mt-4">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <i className="bi bi-check-circle"></i>{' '}
                            {saving ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Ajouter')}
                        </button>
                        <Link to="/articles" className="btn btn-outline-secondary">Annuler</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
