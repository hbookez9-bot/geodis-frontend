import { useState, useEffect } from 'react';
import api from '../services/api';
import { useFlash } from '../context/FlashContext';

/**
 * Modale de régulation du stock.
 *
 * Props :
 *   - show         : bool  — afficher ou non
 *   - onClose      : ()    — fermer
 *   - stockData    : { id_stock, designation, quantite, ... }  — stock à réguler
 *   - onSuccess    : ()    — callback après succès
 */
export default function ModalRegulation({ show, onClose, stockData, onSuccess }) {
    const { flash } = useFlash();
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        regule: '',
        motif: 'Inventaire',
        justification: '',
        num_ligne: '',
        poids_carton: ''
    });

    // Reset à chaque ouverture
    useEffect(() => {
        if (show) {
            setForm({
                regule: '',
                motif: 'Inventaire',
                justification: '',
                num_ligne: '',
                poids_carton: ''
            });
        }
    }, [show, stockData]);

    if (!show || !stockData) return null;

    const regule = parseInt(form.regule || 0);
    const nouvelleQte = stockData.quantite + regule;
    const isNegative = nouvelleQte < 0;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.regule || regule === 0) {
            flash('danger', 'Indique une quantité différente de zéro.');
            return;
        }
        if (!form.motif) {
            flash('danger', 'Le motif est obligatoire.');
            return;
        }
        if (isNegative) {
            flash('danger', `Régulation impossible : la quantité passerait à ${nouvelleQte}.`);
            return;
        }

        setSaving(true);
        try {
            const payload = {
                regule        : regule,
                motif         : form.motif,
                justification : form.justification,
                num_ligne     : form.num_ligne ? parseInt(form.num_ligne) : null,
                poids_carton  : form.poids_carton ? parseFloat(form.poids_carton) : null
            };

            await api.post(`/api/stock/${stockData.id_stock}/reguler`, payload);
            flash('success', `Régulation effectuée : ${stockData.quantite} → ${nouvelleQte}`);
            onSuccess && onSuccess();
            onClose();
        } catch (err) {
            flash('danger', err.response?.data?.error || 'Erreur lors de la régulation.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>

            {/* Modale */}
            <div className="modal fade show d-block" style={{ zIndex: 1050 }} tabIndex="-1">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content" style={{ borderRadius: 12 }}>

                        {/* Header */}
                        <div className="modal-header" style={{ background: '#003087', color: 'white', borderRadius: '12px 12px 0 0' }}>
                            <h5 className="modal-title">
                                <i className="bi bi-gear-wide-connected"></i>{' '}
                                Régulation du stock
                            </h5>
                            <button type="button"
                                    className="btn-close btn-close-white"
                                    onClick={onClose}
                                    disabled={saving}></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body p-4">
                            {/* Info article */}
                            <div className="alert alert-light p-3 mb-3" style={{ borderRadius: 10 }}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <div style={{ fontSize: 13, color: '#888' }}>Article</div>
                                        <div style={{ fontWeight: 600, fontSize: 16, color: '#003087' }}>
                                            {stockData.designation}
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <div style={{ fontSize: 13, color: '#888' }}>Stock actuel</div>
                                        <div style={{ fontWeight: 600, fontSize: 24, color: '#003087' }}>
                                            {stockData.quantite}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Quantité régulée */}
                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Régulation (+/-) <span className="text-danger">*</span>
                                        </label>
                                        <input type="number"
                                               value={form.regule}
                                               onChange={(e) => setForm({...form, regule: e.target.value})}
                                               className="form-control form-control-lg"
                                               placeholder="ex: -5 ou +10"
                                               required />
                                        <small className="text-muted">
                                            Négatif pour retirer, positif pour ajouter
                                        </small>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Nouvelle quantité (calculée)</label>
                                        <div className={`form-control form-control-lg text-center ${isNegative ? 'text-danger' : ''}`}
                                             style={{
                                                 background: isNegative ? '#f8d7da' : '#d1e7dd',
                                                 fontWeight: 600,
                                                 fontSize: 22,
                                                 color: isNegative ? '#842029' : '#0f5132'
                                             }}>
                                            {nouvelleQte}
                                        </div>
                                        {isNegative && (
                                            <small className="text-danger">⚠️ Quantité négative impossible</small>
                                        )}
                                    </div>
                                </div>

                                {/* Motif */}
                                <div className="mb-3">
                                    <label className="form-label">
                                        Motif de régulation <span className="text-danger">*</span>
                                    </label>
                                    <select value={form.motif}
                                            onChange={(e) => setForm({...form, motif: e.target.value})}
                                            className="form-select"
                                            required>
                                        <option value="Inventaire">📊 Inventaire physique</option>
                                        <option value="Casse">💔 Casse</option>
                                        <option value="Vol">🚨 Vol</option>
                                        <option value="Erreur de saisie">⌨️ Erreur de saisie</option>
                                        <option value="Autre">❓ Autre</option>
                                    </select>
                                </div>

                                {/* Justification */}
                                <div className="mb-3">
                                    <label className="form-label">Justification détaillée</label>
                                    <textarea value={form.justification}
                                              onChange={(e) => setForm({...form, justification: e.target.value})}
                                              className="form-control"
                                              rows="3"
                                              placeholder="ex: 5 unités cassées lors de l'inventaire du 30/04/2026..."></textarea>
                                </div>

                                {/* Champs optionnels */}
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Numéro de ligne</label>
                                        <input type="number"
                                               value={form.num_ligne}
                                               onChange={(e) => setForm({...form, num_ligne: e.target.value})}
                                               className="form-control"
                                               placeholder="optionnel" />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Poids du carton (kg)</label>
                                        <input type="number"
                                               step="0.01"
                                               value={form.poids_carton}
                                               onChange={(e) => setForm({...form, poids_carton: e.target.value})}
                                               className="form-control"
                                               placeholder="optionnel" />
                                    </div>
                                </div>

                                {/* Info traçabilité */}
                                <div className="alert alert-info mt-3 p-2" style={{ fontSize: 12 }}>
                                    <i className="bi bi-info-circle"></i>{' '}
                                    Le profil régulateur et la date sont remplis automatiquement.
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={onClose}
                                    disabled={saving}>
                                Annuler
                            </button>
                            <button type="button"
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                    disabled={saving || isNegative}>
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle"></i>{' '}
                                        Valider la régulation
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
