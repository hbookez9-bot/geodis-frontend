import { createContext, useContext, useState, useCallback } from 'react';

const FlashContext = createContext(null);

export function FlashProvider({ children }) {
    const [messages, setMessages] = useState([]);

    const flash = useCallback((category, text) => {
        const id = Date.now() + Math.random();
        setMessages((prev) => [...prev, { id, category, text }]);
        // Auto-dismiss après 5s
        setTimeout(() => {
            setMessages((prev) => prev.filter((m) => m.id !== id));
        }, 5000);
    }, []);

    const dismiss = useCallback((id) => {
        setMessages((prev) => prev.filter((m) => m.id !== id));
    }, []);

    return (
        <FlashContext.Provider value={{ messages, flash, dismiss }}>
            {children}
        </FlashContext.Provider>
    );
}

export function useFlash() {
    const ctx = useContext(FlashContext);
    if (!ctx) throw new Error('useFlash doit être utilisé dans FlashProvider');
    return ctx;
}
