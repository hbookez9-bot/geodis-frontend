import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import api from '../services/api';

Chart.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

export default function Dashboard() {
    const [data, setData] = useState({
        nb_clients: 0, nb_articles: 0, nb_receptions: 0, nb_stock: 0,
        alertes: [], graphique_mois: { labels: [], values: [] }
    });
    const [topStocks, setTopStocks] = useState([]);
    const [categories, setCategories] = useState({ labels: [], values: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [dashResp, stockResp, articlesResp] = await Promise.all([
                    api.get('/api/dashboard'),
                    api.get('/api/stock'),
                    api.get('/api/articles')
                ]);
                setData(dashResp.data);

                // Calcul top 5 stocks (agrégation par désignation)
                const aggMap = {};
                stockResp.data.forEach((s) => {
                    aggMap[s.designation] = (aggMap[s.designation] || 0) + s.quantite;
                });
                const top = Object.entries(aggMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
                setTopStocks(top);

                // Catégories : agrégation des stocks par catégorie d'article
                const articleMap = {};
                articlesResp.data.forEach((a) => {
                    articleMap[a.designation] = a.categorie || 'Sans catégorie';
                });
                const catAgg = {};
                stockResp.data.forEach((s) => {
                    const cat = articleMap[s.designation] || 'Sans catégorie';
                    catAgg[cat] = (catAgg[cat] || 0) + s.quantite;
                });
                setCategories({
                    labels: Object.keys(catAgg),
                    values: Object.values(catAgg)
                });
            } catch (err) {
                console.error('Erreur dashboard:', err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const alertesCritiques = data.alertes.filter((a) => a.niveau === 'critique').length;
    const alertesAlerte = data.alertes.filter((a) => a.niveau === 'alerte').length;

    if (loading) return <Spinner />;

    const lineData = {
        labels: data.graphique_mois?.labels || [],
        datasets: [{
            label: 'Réceptions',
            data: data.graphique_mois?.values || [],
            borderColor: '#003087',
            backgroundColor: 'rgba(0,48,135,0.1)',
            borderWidth: 2, fill: true, tension: 0.4,
            pointBackgroundColor: '#003087'
        }]
    };

    const doughnutData = {
        labels: categories.labels.length ? categories.labels : ['Aucun stock'],
        datasets: [{
            data: categories.values.length ? categories.values : [1],
            backgroundColor: ['#003087', '#0066cc', '#0099cc', '#00cc99', '#ffc107', '#dc3545'],
            borderWidth: 2, borderColor: '#fff'
        }]
    };

    const barData = {
        labels: topStocks.length ? topStocks.map((t) => t[0]) : ['Aucun stock'],
        datasets: [{
            label: 'Quantité en stock',
            data: topStocks.length ? topStocks.map((t) => t[1]) : [0],
            backgroundColor: ['#003087', '#0066cc', '#0099cc', '#00cc99', '#ffc107'],
            borderRadius: 6
        }]
    };

    return (
        <>
            {/* Cartes statistiques */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <Link to="/clients" style={{ textDecoration: 'none' }}>
                        <div className="card text-white h-100" style={{ background: '#003087', borderRadius: 12 }}>
                            <div className="card-body">
                                <h6 className="card-title opacity-75">Clients</h6>
                                <h2 className="card-text">{data.nb_clients}</h2>
                                <i className="bi bi-people" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="col-md-3">
                    <Link to="/articles" style={{ textDecoration: 'none' }}>
                        <div className="card text-white h-100" style={{ background: '#0066cc', borderRadius: 12 }}>
                            <div className="card-body">
                                <h6 className="card-title opacity-75">Articles</h6>
                                <h2 className="card-text">{data.nb_articles}</h2>
                                <i className="bi bi-box" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="col-md-3">
                    <Link to="/reception" style={{ textDecoration: 'none' }}>
                        <div className="card text-white h-100" style={{ background: '#0099cc', borderRadius: 12 }}>
                            <div className="card-body">
                                <h6 className="card-title opacity-75">Réceptions</h6>
                                <h2 className="card-text">{data.nb_receptions}</h2>
                                <i className="bi bi-truck" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                            </div>
                        </div>
                    </Link>
                </div>
                <div className="col-md-3">
                    <Link to="/stock" style={{ textDecoration: 'none' }}>
                        <div className="card text-white h-100" style={{ background: '#00cc99', borderRadius: 12 }}>
                            <div className="card-body">
                                <h6 className="card-title opacity-75">Lignes stock</h6>
                                <h2 className="card-text">{data.nb_stock}</h2>
                                <i className="bi bi-archive" style={{ fontSize: '2rem', opacity: 0.3 }}></i>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Alertes */}
            {(alertesCritiques > 0 || alertesAlerte > 0) && (
                <div className="row g-3 mb-4">
                    {alertesCritiques > 0 && (
                        <div className="col-md-6">
                            <div className="card p-3" style={{
                                borderRadius: 12,
                                borderLeft: '4px solid #dc3545',
                                background: '#fff5f5'
                            }}>
                                <div className="d-flex align-items-center gap-3">
                                    <i className="bi bi-exclamation-triangle-fill text-danger"
                                       style={{ fontSize: 24 }}></i>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#dc3545' }}>
                                            {alertesCritiques} article(s) en stock critique
                                        </div>
                                        <div className="text-muted" style={{ fontSize: 12 }}>
                                            Stock de sécurité atteint — Commander immédiatement
                                        </div>
                                    </div>
                                    <Link to="/stock" className="btn btn-sm btn-danger ms-auto">Voir</Link>
                                </div>
                            </div>
                        </div>
                    )}
                    {alertesAlerte > 0 && (
                        <div className="col-md-6">
                            <div className="card p-3" style={{
                                borderRadius: 12,
                                borderLeft: '4px solid #ffc107',
                                background: '#fffdf0'
                            }}>
                                <div className="d-flex align-items-center gap-3">
                                    <i className="bi bi-bell-fill text-warning"
                                       style={{ fontSize: 24 }}></i>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#856404' }}>
                                            {alertesAlerte} article(s) à réapprovisionner
                                        </div>
                                        <div className="text-muted" style={{ fontSize: 12 }}>
                                            Stock de réapprovisionnement atteint
                                        </div>
                                    </div>
                                    <Link to="/stock" className="btn btn-sm btn-warning ms-auto">Voir</Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Graphiques */}
            <div className="row g-4 mb-4">
                <div className="col-md-8">
                    <div className="card" style={{ borderRadius: 12 }}>
                        <div className="card-body p-4">
                            <h6 style={{ color: '#003087' }} className="mb-3">
                                <i className="bi bi-graph-up"></i> Réceptions des 6 derniers mois
                            </h6>
                            <div style={{ height: 220 }}>
                                <Line data={lineData} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card" style={{ borderRadius: 12 }}>
                        <div className="card-body p-4">
                            <h6 style={{ color: '#003087' }} className="mb-3">
                                <i className="bi bi-pie-chart"></i> Stock par catégorie
                            </h6>
                            <div style={{ height: 220 }}>
                                <Doughnut data={doughnutData} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } }
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-md-12">
                    <div className="card" style={{ borderRadius: 12 }}>
                        <div className="card-body p-4">
                            <h6 style={{ color: '#003087' }} className="mb-3">
                                <i className="bi bi-bar-chart"></i> Top 5 articles en stock
                            </h6>
                            <div style={{ height: 200 }}>
                                <Bar data={barData} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
