import { useMemo } from 'react';

/**
 * Composant Pagination réutilisable.
 *
 * Props :
 *  - page          : page courante (1-based)
 *  - perPage       : nombre d'items par page
 *  - total         : nombre total d'items
 *  - pages         : nombre total de pages
 *  - onPageChange  : (newPage) => void
 *  - onPerPageChange : (newPerPage) => void
 *
 * Affiche une barre type : « < 1 ... 4 [5] 6 ... 50 > »
 * + sélecteur 10 / 20 / 50 / 100 par page
 */
export default function Pagination({
    page,
    perPage,
    total,
    pages,
    onPageChange,
    onPerPageChange
}) {
    // Calcule la liste des numéros de page à afficher (avec ellipses)
    const pageNumbers = useMemo(() => {
        if (pages <= 7) {
            // Toutes les pages tiennent → on les affiche toutes
            return Array.from({ length: pages }, (_, i) => i + 1);
        }

        const result = [];
        const showLeftDots  = page > 4;
        const showRightDots = page < pages - 3;

        if (!showLeftDots && showRightDots) {
            // 1 2 3 4 5 ... 50
            for (let i = 1; i <= 5; i++) result.push(i);
            result.push('...');
            result.push(pages);
        } else if (showLeftDots && !showRightDots) {
            // 1 ... 46 47 48 49 50
            result.push(1);
            result.push('...');
            for (let i = pages - 4; i <= pages; i++) result.push(i);
        } else if (showLeftDots && showRightDots) {
            // 1 ... 4 5 6 ... 50
            result.push(1);
            result.push('...');
            for (let i = page - 1; i <= page + 1; i++) result.push(i);
            result.push('...');
            result.push(pages);
        }

        return result;
    }, [page, pages]);

    if (total === 0) return null;

    const start = (page - 1) * perPage + 1;
    const end   = Math.min(page * perPage, total);

    return (
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mt-4 p-3"
             style={{ background: 'white', borderRadius: 12, border: '1px solid #e8ecf0' }}>

            {/* Info à gauche */}
            <div style={{ fontSize: 13, color: '#555' }}>
                <strong>{start}</strong> à <strong>{end}</strong> sur <strong>{total}</strong> élément(s)
                {pages > 1 && (
                    <span className="text-muted ms-2">
                        — Page {page} sur {pages}
                    </span>
                )}
            </div>

            {/* Boutons de navigation au centre */}
            {pages > 1 && (
                <nav>
                    <ul className="pagination pagination-sm mb-0">
                        {/* Précédent */}
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                            <button
                                type="button"
                                className="page-link"
                                onClick={() => onPageChange(page - 1)}
                                disabled={page === 1}
                                title="Page précédente"
                            >
                                <i className="bi bi-chevron-left"></i>
                            </button>
                        </li>

                        {/* Numéros */}
                        {pageNumbers.map((p, idx) => p === '...' ? (
                            <li key={`dots-${idx}`} className="page-item disabled">
                                <span className="page-link">…</span>
                            </li>
                        ) : (
                            <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                                <button
                                    type="button"
                                    className="page-link"
                                    onClick={() => onPageChange(p)}
                                    style={p === page ? { background: '#003087', borderColor: '#003087' } : {}}
                                >
                                    {p}
                                </button>
                            </li>
                        ))}

                        {/* Suivant */}
                        <li className={`page-item ${page === pages ? 'disabled' : ''}`}>
                            <button
                                type="button"
                                className="page-link"
                                onClick={() => onPageChange(page + 1)}
                                disabled={page === pages}
                                title="Page suivante"
                            >
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            )}

            {/* Sélecteur per_page à droite */}
            <div className="d-flex align-items-center gap-2">
                <label style={{ fontSize: 13, color: '#555', whiteSpace: 'nowrap' }}>
                    Par page :
                </label>
                <select
                    value={perPage}
                    onChange={(e) => onPerPageChange(parseInt(e.target.value))}
                    className="form-select form-select-sm"
                    style={{ width: 80 }}
                >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
            </div>
        </div>
    );
}
