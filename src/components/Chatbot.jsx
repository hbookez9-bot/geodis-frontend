import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Chatbot() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([]);
    const messagesRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages]);

    const send = async () => {
        const text = input.trim();
        if (!text) return;

        const newUserMsg = { role: 'user', content: text };
        setMessages((prev) => [...prev, newUserMsg]);
        setInput('');

        const newHistory = [...history, newUserMsg];
        setHistory(newHistory);

        // Affichage typing
        setMessages((prev) => [...prev, { role: 'typing', content: '...' }]);

        try {
            const resp = await api.post('/api/chatbot/message', {
                message: text,
                history: newHistory.slice(-10)
            });
            const reply = resp.data.response || resp.data.error || 'Erreur';
            setMessages((prev) => prev.filter((m) => m.role !== 'typing').concat({
                role: 'assistant',
                content: reply
            }));
            setHistory((prev) => [...prev, { role: 'assistant', content: reply }]);
        } catch (err) {
            setMessages((prev) => prev.filter((m) => m.role !== 'typing').concat({
                role: 'assistant',
                content: 'Erreur de connexion — réessayez.'
            }));
        }
    };

    const onKey = (e) => {
        if (e.key === 'Enter') send();
    };

    return (
        <>
            <div onClick={() => setOpen(!open)}
                 style={{
                     position: 'fixed', bottom: 24, right: 24,
                     width: 56, height: 56, borderRadius: '50%',
                     background: '#003087', color: 'white',
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,48,135,0.4)',
                     fontSize: 24, zIndex: 1000
                 }}>
                <i className="bi bi-robot"></i>
            </div>

            {open && (
                <div style={{
                    position: 'fixed', bottom: 90, right: 24,
                    width: 360, height: 500, borderRadius: 16,
                    background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    zIndex: 1000, display: 'flex', flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        background: '#003087', padding: '14px 18px',
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ color: 'white' }}>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>
                                <i className="bi bi-robot"></i> Assistant Geodis
                            </div>
                            <div style={{ fontSize: 11, opacity: 0.8 }}>
                                Posez vos questions sur le stock
                            </div>
                        </div>
                        <span onClick={() => setOpen(false)}
                              style={{ color: 'white', cursor: 'pointer', fontSize: 18 }}>✕</span>
                    </div>

                    <div ref={messagesRef} style={{
                        flex: 1, overflowY: 'auto', padding: 16,
                        display: 'flex', flexDirection: 'column', gap: 10,
                        height: 370
                    }}>
                        <div style={{
                            background: '#f0f4ff', borderRadius: '12px 12px 12px 4px',
                            padding: '10px 14px', fontSize: 13, maxWidth: '85%'
                        }}>
                            Bonjour {user?.nom} ! Je suis votre assistant logistique.
                            Posez-moi des questions sur le stock, les réceptions ou les alertes.
                        </div>

                        {messages.map((m, i) => {
                            const isUser = m.role === 'user';
                            const isTyping = m.role === 'typing';
                            return (
                                <div key={i} style={{
                                    background: isUser ? '#003087' : '#f0f4ff',
                                    color: isUser ? 'white' : '#000',
                                    borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                                    padding: '10px 14px',
                                    fontSize: 13,
                                    maxWidth: '85%',
                                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                                    marginLeft: isUser ? 'auto' : 0,
                                    lineHeight: 1.5,
                                    opacity: isTyping ? 0.6 : 1
                                }}
                                     dangerouslySetInnerHTML={{
                                         __html: m.content.replace(/\n/g, '<br>')
                                     }}
                                />
                            );
                        })}
                    </div>

                    <div style={{
                        padding: 12, borderTop: '1px solid #f0f0f0',
                        display: 'flex', gap: 8
                    }}>
                        <input ref={inputRef} type="text" value={input}
                               onChange={(e) => setInput(e.target.value)}
                               onKeyPress={onKey}
                               placeholder="Votre question..."
                               style={{
                                   flex: 1, border: '1px solid #e0e0e0',
                                   borderRadius: 20, padding: '8px 14px',
                                   fontSize: 13, outline: 'none'
                               }} />
                        <button onClick={send}
                                style={{
                                    background: '#003087', color: 'white',
                                    border: 'none', borderRadius: '50%',
                                    width: 36, height: 36,
                                    cursor: 'pointer', fontSize: 16
                                }}>
                            <i className="bi bi-send"></i>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
