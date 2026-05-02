export default function Spinner() {
    return (
        <div className="text-center mt-5">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-2">Chargement...</p>
        </div>
    );
}
