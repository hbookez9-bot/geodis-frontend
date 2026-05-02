import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';

export default function ReceptionScan() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { flash } = useFlash();

    const [reception, setReception] = useState(null);
    const [emplacements, setEmplacements] = useState([]);
    const [loading, setLoading] = useState(true);

    // Article scanné
    const [codeManuel, setCodeManuel] = useState('');
    const [articleResult, setArticleResult] = useState(null);

    // Form scan
    const [scanForm, setScanForm] = useState({
        id_emplacement: '', quantite_recue: '', badge: '',
        prix_unitaire: '', date_fabrication: '', date_expiration: ''
    });

    const scannerRef = useRef(null);

    const load = async () => {
        try {
            const [recResp, empResp] = await Promise.all([
                api.get(`/api/receptions/${id}`),
                api.get('/api/emplacements')
            ]);
            setReception(recResp.data);
            setEmplacements(empResp.data);
        } catch {
            flash('danger', 'Erreur de chargement.');
            navigate('/reception');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [id]);

    // Initialise le scanner QR (html5-qrcode)
    useEffect(() => {
        if (loading) return;

        // Charger le script html5-qrcode dynamiquement
        if (!window.Html5QrcodeScanner) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
            script.onload = () => initScanner();
            document.body.appendChild(script);
        } else {
            initScanner();
        }

        return () => {
            if (scannerRef.current) {
                try { scannerRef.current.clear(); } catch (e) { /* ignore */ }
            }
        };
    }, [loading]);

    const initScanner = () => {
        if (!window.Html5QrcodeScanner) return;
        try {
            scannerRef.current = new window.Html5QrcodeScanner('reader', {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            });
            scannerRef.current.render(
                (decoded) => {
                    setCodeManuel(decoded);
                    rechercherArticle(decoded);
                },
                () => {}
            );
        } catch (e) {
            console.error('Scanner init error:', e);
        }
    };

    const rechercherArticle = async (code) => {
        const codeVal = code || codeManuel.trim();
        if (!codeVal) return;
        try {
            const resp = await api.get(`/api/api/article/${codeVal}/${id}`);
            setArticleResult(resp.data);
        } catch {
            setArticleResult({ found: false, message: 'Erreur de recherche.' });
        }
    };

    const handleSubmitScan = async (e) => {
        e.preventDefault();
        if (!articleResult || !articleResult.found) {
            flash('danger', 'Veuillez scanner ou saisir un code-barres valide.');
            return;
        }
        try {
            await api.post(`/api/scan/${id}`, {
                id_article: articleResult.id_article,
                id_emplacement: parseInt(scanForm.id_emplacement),
                quantite_recue: parseInt(scanForm.quantite_recue || 0),
                code_qr: codeManuel,
                badge: scanForm.badge,
                prix_unitaire: parseFloat(scanForm.prix_unitaire || 0),
                date_expiration: scanForm.date_expiration || null
            });
            flash('success', 'Article scanné et ajouté au stock !');
            // Reset partiel
            setArticleResult(null);
            setCodeManuel('');
            setScanForm({
                id_emplacement: '', quantite_recue: '', badge: '',
                prix_unitaire: '', date_fabrication: '', date_expiration: ''
            });
            load();
        } catch (err) {
            flash('danger', err.response?.data?.error || 'Erreur lors du scan.');
        }
    };

    const validerReception = async () => {
        if (!window.confirm('Valider et clôturer cette réception ?')) return;
        try {
            await api.post(`/api/receptions/${id}/valider`);
            flash('success', 'Réception validée avec succès !');
            navigate('/reception');
        } catch {
            flash('danger', 'Erreur lors de la validation.');
        }
    };

    if (loading || !reception) return <Spinner />;

    return (
        <>
            <h4 style={{ color: '#003087' }} className="mb-3">
                Réception #{id} — {reception.client_nom} ({reception.entrepot_nom})
            </h4>

            <div className="row g-4">
                {/* Colonne gauche : scanner */}
                <div className="col-md-5">
                    <div className="card" style={{ borderRadius: 12 }}>
                        <div className="card-body p-4">
                            <h6 className="mb-3" style={{ color: '#003087' }}>
                                <i className="bi bi-upc-scan"></i> Scanner un article
                            </h6>

                            <div id="reader" style={{ borderRadius: 10, overflow: 'hidden' }}></div>

                            <div className="mt-3">
                                <label className="form-label" style={{ fontSize: 12 }}>
                                    Ou saisir manuellement le code-barres
                                </label>
                                <div className="input-group">
                                    <input type="text" value={codeManuel}
                                           onChange={(e) => setCodeManuel(e.target.value)}
                                           className="form-control"
                                           placeholder="ex: 3017620422003" />
                                    <button onClick={() => rechercherArticle()}
                                            className="btn btn-outline-primary" type="button">
                                        <i className="bi bi-search"></i>
                                    </button>
                                </div>
                            </div>

                            {articleResult && articleResult.found && !articleResult.warning && (
                                <div className="alert alert-success p-3 mt-3" style={{ borderRadius: 10 }}>
                                    <i className="bi bi-check-circle"></i>{' '}
                                    <strong>{articleResult.designation}</strong><br />
                                    <small>Client : {articleResult.client} — Unité : {articleResult.unite}</small><br />
                                    <small className="text-info">{articleResult.message}</small>
                                </div>
                            )}

                            {articleResult && articleResult.found && articleResult.warning && (
                                <div className="alert alert-warning p-3 mt-3" style={{ borderRadius: 10 }}>
                                    <i className="bi bi-exclamation-triangle"></i>{' '}
                                    <strong>{articleResult.designation}</strong><br />
                                    <small>Client : {articleResult.client}</small><br />
                                    <small className="text-danger">{articleResult.message}</small>
                                </div>
                            )}

                            {articleResult && !articleResult.found && (
                                <div className="alert alert-danger p-3 mt-3" style={{ borderRadius: 10 }}>
                                    <i className="bi bi-x-circle"></i>{' '}
                                    <strong>Article introuvable</strong><br />
                                    <small>Code scanné : <code>{codeManuel}</code></small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Colonne droite : enregistrement + liste */}
                <div className="col-md-7">
                    <div className="card mb-3" style={{ borderRadius: 12 }}>
                        <div className="card-body p-4">
                            <h6 className="mb-3" style={{ color: '#003087' }}>
                                <i className="bi bi-clipboard-check"></i> Enregistrer la réception
                            </h6>

                            <form onSubmit={handleSubmitScan}>
                                <div className="row g-2">
                                    <div className="col-md-6 mb-2">
                                        <label className="form-label" style={{ fontSize: 12 }}>
                                            Emplacement <span className="text-danger">*</span>
                                        </label>
                                        <select value={scanForm.id_emplacement}
                                                onChange={(e) => setScanForm({ ...scanForm, id_emplacement: e.target.value })}
                                                className="form-select form-select-sm" required>
                                            <option value="">-- Sélectionner --</option>
                                            {emplacements.map((emp) => (
                                                <option key={emp.id_emplacement} value={emp.id_emplacement}>
                                                    {emp.code} — {emp.type} ({emp.statut})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <label className="form-label" style={{ fontSize: 12 }}>
                                            Quantité reçue <span className="text-danger">*</span>
                                        </label>
                                        <input type="number" min="1" value={scanForm.quantite_recue}
                                               onChange={(e) => setScanForm({ ...scanForm, quantite_recue: e.target.value })}
                                               className="form-control form-control-sm" required />
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <label className="form-label" style={{ fontSize: 12 }}>Badge</label>
                                        <input type="text" value={scanForm.badge}
                                               onChange={(e) => setScanForm({ ...scanForm, badge: e.target.value })}
                                               className="form-control form-control-sm" />
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <label className="form-label" style={{ fontSize: 12 }}>Prix unitaire</label>
                                        <input type="number" step="0.01" value={scanForm.prix_unitaire}
                                               onChange={(e) => setScanForm({ ...scanForm, prix_unitaire: e.target.value })}
                                               className="form-control form-control-sm" />
                                    </div>
                                    <div className="col-md-6 mb-2">
                                        <label className="form-label" style={{ fontSize: 12 }}>Date expiration</label>
                                        <input type="date" value={scanForm.date_expiration}
                                               onChange={(e) => setScanForm({ ...scanForm, date_expiration: e.target.value })}
                                               className="form-control form-control-sm" />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary w-100 mt-3"
                                        disabled={!articleResult || !articleResult.found}>
                                    <i className="bi bi-check-circle"></i> Valider le scan
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="card" style={{ borderRadius: 12 }}>
                        <div className="card-body p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0" style={{ color: '#003087' }}>
                                    Articles reçus ({(reception.details || []).length})
                                </h6>
                                {(reception.details || []).length > 0 && (
                                    <button onClick={validerReception} className="btn btn-sm btn-success">
                                        <i className="bi bi-check-all"></i> Valider réception
                                    </button>
                                )}
                            </div>

                            {(reception.details || []).length === 0 ? (
                                <div className="text-center text-muted py-3" style={{ fontSize: 13 }}>
                                    Aucun article scanné pour le moment
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-sm mb-0">
                                        <thead style={{ background: '#f8f9fa' }}>
                                            <tr>
                                                <th style={{ fontSize: 12 }}>Article</th>
                                                <th style={{ fontSize: 12 }}>Qté</th>
                                                <th style={{ fontSize: 12 }}>Emplacement</th>
                                                <th style={{ fontSize: 12 }}>Expiration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reception.details.map((d, i) => (
                                                <tr key={i}>
                                                    <td style={{ fontSize: 12 }}>{d.designation}</td>
                                                    <td style={{ fontSize: 12 }}>{d.quantite_recue}</td>
                                                    <td style={{ fontSize: 12 }}><code>{d.emplacement}</code></td>
                                                    <td style={{ fontSize: 12 }}>{d.date_expiration || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-3">
                <Link to="/reception" className="btn btn-outline-secondary">
                    <i className="bi bi-arrow-left"></i> Retour à la liste
                </Link>
            </div>
        </>
    );
}
