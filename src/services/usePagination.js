import { useState, useEffect, useCallback } from 'react';
import api from './api';

/**
 * Hook personnalisé pour gérer la pagination + recherche.
 *
 * Usage :
 *   const {
 *     items, total, page, pages, perPage, loading,
 *     setPage, setPerPage, setSearch, search, refresh
 *   } = usePagination('/api/articles_paginated', { id_client: 5 });
 *
 * @param {string} endpoint - URL de l'API paginée
 * @param {object} extraParams - Paramètres supplémentaires (ex: { id_client: 5 })
 */
export default function usePagination(endpoint, extraParams = {}) {
    const [items, setItems]     = useState([]);
    const [total, setTotal]     = useState(0);
    const [pages, setPages]     = useState(0);
    const [page, setPage]       = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [search, setSearch]   = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(null);

    // Sérialise les extraParams en string stable pour le useEffect
    const extraParamsKey = JSON.stringify(extraParams);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                per_page: perPage,
                ...(search ? { search } : {}),
                ...extraParams
            };
            const resp = await api.get(endpoint, { params });
            setItems(resp.data.items || []);
            setTotal(resp.data.total || 0);
            setPages(resp.data.pages || 0);
        } catch (err) {
            console.error('Erreur pagination:', err);
            setError(err.response?.data?.error || 'Erreur de chargement');
            setItems([]);
            setTotal(0);
            setPages(0);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint, page, perPage, search, extraParamsKey]);

    // Recharge à chaque changement de page/perPage/search/extraParams
    useEffect(() => {
        load();
    }, [load]);

    // Quand la recherche change, retourner à la page 1
    const handleSearchChange = useCallback((newSearch) => {
        setSearch(newSearch);
        setPage(1);
    }, []);

    // Quand le perPage change, retourner à la page 1
    const handlePerPageChange = useCallback((newPerPage) => {
        setPerPage(newPerPage);
        setPage(1);
    }, []);

    return {
        items,
        total,
        pages,
        page,
        perPage,
        search,
        loading,
        error,
        setPage,
        setPerPage: handlePerPageChange,
        setSearch: handleSearchChange,
        refresh: load
    };
}
