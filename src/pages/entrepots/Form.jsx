import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';
import Spinner from '../../components/Spinner';

export default function EntrepotForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { flash } = useFlash();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({ nom: '', adresse: '', ville: '' });
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isEdit) return;
        api.get('/api/entrepots').then((resp) => {
            const e = resp.data.find((x) => x.id_entrepot == id);
            if (e) {
                setForm({
                    nom: e.nom || '',
                    adresse: e.adresse || '',
                    ville: e.ville || ''
                });
            } else {
                flash('danger', 'Entrepôt introuvable.');
                navigate('/entrepots');
            }
        }).finally(() => setLoading(false));
    }, [id]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await api.put(`/api/entrepots/${id}`, form);
                flash('success', 'Entrepôt modifié !');
            } else {
                await api.post('/api/entrepots', form);
                flash('success', 'Entrepôt ajouté !');
            }
            navigate('/entrepots');
        } catch (err) {
            flash('danger', err.response?.data?.error || 'Erreur.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Spinner />;

    return (
        <div className="card" style={{ maxWidth: 600, borderRadius: 12 }}>
            <div className="card-body p-4">
                <h5 className="mb-4" style={{ color: '#003087' }}>
                    {isEdit ? 'Modifier' : 'Ajouter'} un entrepôt
                </h5>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Nom <span className="text-danger">*</span></label>
                        <input type="text" name="nom" value={form.nom}
                               onChange={handleChange} className="form-control" required />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Ville</label>
                        <input type="text" name="ville" value={form.ville}
                               onChange={handleChange} className="form-control"
                               placeholder="ex: Tunis, Sfax..." />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Adresse</label>
                        <textarea name="adresse" value={form.adresse}
                                  onChange={handleChange} className="form-control" rows={2} />
                    </div>
                    <div className="d-flex gap-2 mt-4">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            <i className="bi bi-check-circle"></i>{' '}
                            {saving ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Ajouter')}
                        </button>
                        <Link to="/entrepots" className="btn btn-outline-secondary">Annuler</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
