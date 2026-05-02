import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useFlash } from '../../context/FlashContext';
import Spinner from '../../components/Spinner';

export default function RapportReceptions() {
    const { flash } = useFlash();
    const [attendus, setAttendus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');

    useEffect(() => {
        api.get('/api/attendus')
            .then((resp) => setAttendus(resp.data))
            .catch(() => flash('danger', 'Erreur de chargement.'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        return attendus.filter((a) => {
            if (a.statut !== 'recu' && a.statut !== 'partiel') return false;
            if (dateDebut && a.date_attendue < dateDebut) return false;
            if (dateFin && a.date_attendue > dateFin) return false;
            return true;
        });
    }, [attendus, dateDebut, dateFin]);

    const totalArticles = filtered.reduce((sum, a) =>
        sum + (a.details || []).reduce((s, d) => s + (d.quantite_attendue || 0), 0), 0);

    const imprimer = () => window.print();

    if (loading) return <Spinner />;

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <Link to="/rapports" className="btn btn-outline-secondary">
                    <i className="bi bi-arrow-left"></i> Retour
                </Link>
                <button onClick={imprimer} className="btn btn-outline-primary">
                    <i className="bi bi-printer"></i> Imprimer
                </button>
            </div>

            <h4 style={{ color: '#003087' }} className="mb-4">
                <i className="bi bi-truck"></i> Rapport Réceptions
            </h4>

            <div className="card mb-4" style={{ borderRadius: 12 }}>
                <div className="card-body p-3">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-4">
                            <label className="form-label">Date début</label>
                            <input type="date" value={dateDebut}
                                   onChange={(e) => setDateDebut(e.target.value)}
                                   className="form-control" />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Date fin</label>
                            <input type="date" value={dateFin}
                                   onChange={(e) => setDateFin(e.target.value)}
                                   className="form-control" />
                        </div>
                        <div className="col-md-4">
                            <button onClick={() => { setDateDebut(''); setDateFin(''); }}
                                    className="btn btn-outline-secondary">
                                Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-md-4">
                    <div className="card p-3" style={{ background: '#e8f0fe', borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: '#003087' }}>Réceptions</div>
                        <div style={{ fontSize: 24, fontWeight: 600, color: '#003087' }}>
                            {filtered.length}
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card p-3" style={{ background: '#d1e7dd', borderRadius: 10 }}>
                        <div style={{ fontSize: 11, color: '#0f5132' }}>Articles reçus</div>
                        <div style={{ fontSize: 24, fontWeight: 600, color: '#0f5132' }}>
                            {totalArticles}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ borderRadius: 12 }}>
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead style={{ background: '#f8f9fa' }}>
                            <tr>
                                <th>N° Dossier</th>
                                <th>Client</th>
                                <th>Entrepôt</th>
                                <th>Date</th>
                                <th>Articles</th>
                                <th>Total qté</th>
                                <th>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan="7" className="text-center text-muted py-4">
                                    Aucune réception sur cette période
                                </td></tr>
                            ) : filtered.map((a) => {
                                const totalQte = (a.details || []).reduce(
                                    (s, d) => s + (d.quantite_attendue || 0), 0);
                                return (
                                    <tr key={a.id_attendu}>
                                        <td>{a.num_dossier || `#${a.id_attendu}`}</td>
                                        <td>{a.client_nom}</td>
                                        <td>{a.entrepot_nom}</td>
                                        <td style={{ fontSize: 13 }}>{a.date_attendue}</td>
                                        <td>{(a.details || []).length}</td>
                                        <td><strong>{totalQte}</strong></td>
                                        <td>
                                            <span className={`badge ${
                                                a.statut === 'recu' ? 'bg-success' : 'bg-info'
                                            }`}>{a.statut}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
