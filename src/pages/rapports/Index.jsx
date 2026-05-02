import { Link } from 'react-router-dom';

export default function RapportsIndex() {
    const cards = [
        {
            to: '/rapports/receptions',
            icon: 'bi-truck',
            title: 'Rapport Réceptions',
            color: '#003087',
            bg: '#e8f0fe',
            btn: 'btn-primary',
            text: 'Historique de toutes les réceptions avec détail des articles reçus'
        },
        {
            to: '/rapports/stock',
            icon: 'bi-archive',
            title: 'Rapport Stock',
            color: '#0f5132',
            bg: '#d1e7dd',
            btn: 'btn-success',
            text: 'État actuel du stock avec valeur totale et alertes'
        },
        {
            to: '/rapports/transferts',
            icon: 'bi-arrow-left-right',
            title: 'Rapport Transferts',
            color: '#856404',
            bg: '#fff3cd',
            btn: 'btn-warning',
            text: 'Historique de tous les transferts entre emplacements'
        }
    ];

    return (
        <div className="row g-4">
            {cards.map((c) => (
                <div key={c.to} className="col-md-4">
                    <div className="card hover-card h-100">
                        <div className="card-body p-4 text-center">
                            <div style={{
                                width: 64, height: 64, borderRadius: 16,
                                background: c.bg, color: c.color,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 28, margin: '0 auto 16px'
                            }}>
                                <i className={`bi ${c.icon}`}></i>
                            </div>
                            <h5 style={{ color: c.color }}>{c.title}</h5>
                            <p className="text-muted" style={{ fontSize: 13 }}>{c.text}</p>
                            <Link to={c.to} className={`btn ${c.btn} w-100 mt-3`}>
                                <i className="bi bi-eye"></i> Voir le rapport
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
