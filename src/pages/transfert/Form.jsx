import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';

export default function TransfertForm() {
    const navigate = useNavigate();
    const { flash } = useFlash();

    const [articles, setArticles] = useState([]);
    const [emplacements, setEmplacements] = useState([]);
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        id_article: '', id_empl_source: '', id_empl_destination: '',
        quantite: 1, motif: ''
    });

    useEffect(() => {
        Promise.all([
            api.get('/api/articles'),
            api.get('/api/emplacements'),
            api.get('/api/stock')
        ]).then(([a, e, s]) => {
            setArticles(a.data);
            setEmplacements(e.data);
            setStocks(s.data);
        }).catch(() => flash('danger', 'Erreur de chargement.'))
          .finally(() => setLoading(false));
    }, []);

    // Stock disponible pour l'article + emplacement source choisis
    const stockDispo = useMemo(() => {
        if (!form.id_article || !form.id_empl_source) return null;
        const article = articles.find((a) => a.id_article == form.id_article);
        const empl = emplacements.find((e) => e.id_emplacement == form.id_empl_source);
        if (!article || !empl) return null;
        const s = stocks.find((s) =>
            s.designation === article.designation && s.emplacement === empl.code
        );
        return s ? s.quantite : 0;
    }, [form.id_article, form.id_empl_source, articles, emplacements, stocks]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.id_empl_source === form.id_empl_destination) {
            flash('danger', 'Source et destination identiques !');
            return;
        }
        if (stockDispo !== null && parseInt(form.quantite) > stockDispo) {
            flash('danger', `Stock insuffisant ! Disponible : ${stockDispo}`);
            return;
        }
        setSaving(true);
        try {
            await api.post('/api/transferts', {
                id_article: parseInt(form.id_article),
                id_empl_source: parseInt(form.id_empl_source),
                id_empl_destination: parseInt(form.id_empl_destination),
                quantite: parseInt(form.quantite),
                motif: form.motif
            });
            flash('success', 'Transfert effectué avec succès !');
            navigate('/transfert');
        } catch (err) {
            flash('danger', err.response?.data?.error || 'Erreur lors du transfert.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="card" style={{ maxWidth: 700, borderRadius: 12 }}>
            <div className="card-body p-4">
                <h5 className="mb-4" style={{ color: '#003087' }}>Nouveau transfert</h5>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Article <span className="text-danger">*</span></label>
                        <select value={form.id_article}
                                onChange={(e) => setForm({ ...form, id_article: e.target.value })}
                                className="form-select" required>
                            <option value="">-- Sélectionner --</option>
                            {articles.map((a) => (
                                <option key={a.id_article} value={a.id_article}>
                                    {a.designation} ({a.unite})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label className="form-label">
                                Emplacement source <span className="text-danger">*</span>
                            </label>
                            <select value={form.id_empl_source}
                                    onChange={(e) => setForm({ ...form, id_empl_source: e.target.value })}
                                    className="form-select" required>
                                <option value="">-- Sélectionner --</option>
                                {emplacements.map((e) => (
                                    <option key={e.id_emplacement} value={e.id_emplacement}>
                                        {e.code} ({e.statut})
                                    </option>
                                ))}
                            </select>
                            {stockDispo !== null && (
                                <div className="form-text">
                                    Stock disponible : <strong>{stockDispo}</strong>
                                </div>
                            )}
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">
                                Emplacement destination <span className="text-danger">*</span>
                            </label>
                            <select value={form.id_empl_destination}
                                    onChange={(e) => setForm({ ...form, id_empl_destination: e.target.value })}
                                    className="form-select" required>
                                <option value="">-- Sélectionner --</option>
                                {emplacements.map((e) => (
                                    <option key={e.id_emplacement} value={e.id_emplacement}>
                                        {e.code} ({e.statut})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Quantité <span className="text-danger">*</span>
                        </label>
                        <input type="number" min="1"
                               max={stockDispo || undefined}
                               value={form.quantite}
                               onChange={(e) => setForm({ ...form, quantite: e.target.value })}
                               className="form-control" required />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Motif</label>
                        <textarea value={form.motif}
                                  onChange={(e) => setForm({ ...form, motif: e.target.value })}
                                  className="form-control" rows={2}
                                  placeholder="Raison du transfert (optionnel)" />
                    </div>

                    <div className="d-flex gap-2 mt-4">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <i className="bi bi-arrow-left-right"></i>{' '}
                            {saving ? 'Transfert en cours...' : 'Effectuer le transfert'}
                        </button>
                        <Link to="/transfert" className="btn btn-outline-secondary">Annuler</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
