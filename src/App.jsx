import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FlashProvider } from './context/FlashContext';

import Layout from './components/Layout';
import Spinner from './components/Spinner';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import ClientsListe from './pages/clients/Liste';
import ClientForm from './pages/clients/Form';

import ArticlesListe from './pages/articles/Liste';
import ArticleForm from './pages/articles/Form';

import UtilisateursListe from './pages/utilisateurs/Liste';
import UtilisateurForm from './pages/utilisateurs/Form';

import EntrepotsListe from './pages/entrepots/Liste';
import EntrepotForm from './pages/entrepots/Form';
import EntrepotDetail from './pages/entrepots/Detail';

import ReceptionListe from './pages/reception/Liste';
import ReceptionForm from './pages/reception/Form';
import ReceptionScan from './pages/reception/Scan';

import StockListe from './pages/stock/Liste';
import StockDetail from './pages/stock/Detail';

import TransfertListe from './pages/transfert/Liste';
import TransfertForm from './pages/transfert/Form';

import RapportsIndex from './pages/rapports/Index';
import RapportStock from './pages/rapports/Stock';
import RapportReceptions from './pages/rapports/Receptions';
import RapportTransferts from './pages/rapports/Transferts';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <Spinner />;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />

                <Route path="/clients" element={<ClientsListe />} />
                <Route path="/clients/ajouter" element={<ClientForm />} />
                <Route path="/clients/modifier/:id" element={<ClientForm />} />

                <Route path="/articles" element={<ArticlesListe />} />
                <Route path="/articles/ajouter" element={<ArticleForm />} />
                <Route path="/articles/modifier/:id" element={<ArticleForm />} />

                <Route path="/utilisateurs" element={<UtilisateursListe />} />
                <Route path="/utilisateurs/ajouter" element={<UtilisateurForm />} />
                <Route path="/utilisateurs/modifier/:id" element={<UtilisateurForm />} />

                <Route path="/entrepots" element={<EntrepotsListe />} />
                <Route path="/entrepots/ajouter" element={<EntrepotForm />} />
                <Route path="/entrepots/:id" element={<EntrepotDetail />} />

                <Route path="/reception" element={<ReceptionListe />} />
                <Route path="/reception/ajouter" element={<ReceptionForm />} />
                <Route path="/reception/scan/:id" element={<ReceptionScan />} />

                <Route path="/stock" element={<StockListe />} />
                <Route path="/stock/:id" element={<StockDetail />} />

                <Route path="/transfert" element={<TransfertListe />} />
                <Route path="/transfert/ajouter" element={<TransfertForm />} />

                <Route path="/rapports" element={<RapportsIndex />} />
                <Route path="/rapports/stock" element={<RapportStock />} />
                <Route path="/rapports/receptions" element={<RapportReceptions />} />
                <Route path="/rapports/transferts" element={<RapportTransferts />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <FlashProvider>
                    <AppRoutes />
                </FlashProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}
