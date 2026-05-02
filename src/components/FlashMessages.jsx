import { useFlash } from '../context/FlashContext';

export default function FlashMessages() {
    const { messages, dismiss } = useFlash();

    if (messages.length === 0) return null;

    return (
        <>
            {messages.map((msg) => (
                <div key={msg.id}
                     className={`alert alert-${msg.category} alert-dismissible fade show`}>
                    {msg.text}
                    <button type="button" className="btn-close"
                            onClick={() => dismiss(msg.id)}></button>
                </div>
            ))}
        </>
    );
}
