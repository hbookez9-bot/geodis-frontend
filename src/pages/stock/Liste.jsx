import { useState } from 'react';
import usePagination from '../../services/usePagination';
import Pagination from '../../components/Pagination';
import ModalRegulation from '../../components/ModalRegulation';

const STATUT_BADGE = {
    critique: { class: 'bg-danger',           label: 'Critique' },
    alerte:   { class: 'bg-warning text-dark', label: 'Alerte' },
    ok:       { class: 'bg-success',          label: 'OK' }
};

export default function StockListe() {
    const {
        items: stocks, total, page, pages, perPage,
        search, loading,
        setPage, setPerPage, setSearch, refresh
    } = usePagination('/api/stock_paginated');

    // État de la modale de régulation
    const [showModal, setShowModal] = useState(false);
    const [stockSelected, setStockSelected] = useState(null);

    const ouvrirRegulation = (stock) => {
        setStockSelected(stock);
        setShowModal(true);
    };

    const fermerRegulation = () => {
        setShowModal(false);
        setStockSelected(null);
    };

    const apresRegulation = () => {
        refresh();   // Recharge la liste
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex gap-3">
                    <div className="card px-4 py-2" style={{ borderRadius: 10 }}>
                        <div className="text-muted" style={{ fontSize: 12 }}>Total lignes stock</div>
                        <div style={{ fontSize: 22, fontWeight: 600, color: '#003087' }}>
                            {total}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <div className="input-group" style={{ maxWidth: 400 }}>
                    <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search text-muted"></i>
                    </span>
                    <input type="text" value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           className="form-control border-start-0"
                           placeholder="Rechercher un article ou emplacement..." />
                </div>
            </div>

            {loading ? (
                <Spinner />
            ) : (
                <>
                    <div className="card" style={{ borderRadius: 12 }}>
                        <div className="card-body p-0">
                            <table className="table table-hover mb-0">
                                <thead style={{ background: '#f8f9fa' }}>
                                    <tr>
                                        <th>Article</th>
                                        <th>Emplacement</th>
                                        <th>Zone</th>
                                        <th>Quantité</th>
                                        <th>Statut</th>
                                        <th style={{ width: 110 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stocks.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center text-muted py-4">
                                                Aucun stock
                                            </td>
                                        </tr>
                                    ) : stocks.map((s) => {
                                        const badge = STATUT_BADGE[s.statut] || { class: 'bg-secondary', label: s.statut };
                                        return (
                                            <tr key={s.id_stock}>
                                                <td><strong>{s.designation}</strong></td>
                                                <td><code>{s.emplacement}</code></td>
                                                <td>
                                                    <span className="badge" style={{
                                                        background: s.zone === 'picking' ? '#fff3cd' : '#e8f0fe',
                                                        color: s.zone === 'picking' ? '#856404' : '#003087'
                                                    }}>
                                                        {s.zone === 'picking' ? 'Picking' : 'Stockage'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong style={{ fontSize: 15 }}>{s.quantite}</strong>{' '}
                                                    <span className="text-muted" style={{ fontSize: 12 }}>{s.unite}</span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${badge.class}`}>{badge.label}</span>
                                                </td>
                                                <td>
                                                    <button onClick={() => ouvrirRegulation(s)}
                                                            className="btn btn-sm btn-outline-primary"
                                                            title="Réguler ce stock">
                                                        <i className="bi bi-gear-wide-connected"></i> Réguler
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <Pagination
                        page={page}
                        perPage={perPage}
                        total={total}
                        pages={pages}
                        onPageChange={setPage}
                        onPerPageChange={setPerPage}
                    />
                </>
            )}

            {/* Modale de régulation */}
            <ModalRegulation
                show={showModal}
                onClose={fermerRegulation}
                stockData={stockSelected}
                onSuccess={apresRegulation}
            />
        </>
    );
}
