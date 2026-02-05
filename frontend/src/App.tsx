import { useState, useEffect } from 'react'

interface Street {
    id: string;
    street_name: string;
    neighborhood: string;
    city: string;
    type: string;
    zip_code: string;
    street_code?: string;
}

const SkeletonLoader = () => (
    <div className="results-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-card" />
        ))}
    </div>
);

function App() {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('free');
    const [results, setResults] = useState<Street[]>([]);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [showToast, setShowToast] = useState<{ show: boolean, msg: string }>({ show: false, msg: '' });

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${searchType}`);
            const data = await response.json();
            setResults(data);
            if (data.length === 0) {
                triggerToast('לא נמצאו תוצאות לחיפוש שלך');
            }
        } catch (error) {
            console.error('Search failed:', error);
            triggerToast('שגיאה בחיפוש הנתונים');
        } finally {
            setLoading(false);
        }
    };

    const triggerToast = (msg: string) => {
        setShowToast({ show: true, msg });
        setTimeout(() => setShowToast({ show: false, msg: '' }), 3000);
    };

    const handleDelete = async (id: string) => {
        // Start animation
        setDeletingIds(prev => new Set(prev).add(id));

        try {
            const response = await fetch(`/api/streets/${id}`, { method: 'DELETE' });
            if (response.ok) {
                // Wait for animation to finish then remove from state
                setTimeout(() => {
                    setResults(prev => prev.filter(r => r.id !== id));
                    setDeletingIds(prev => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                    });
                }, 500);
            } else {
                triggerToast('שגיאה במחיקת הרשומה');
                setDeletingIds(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }
        } catch (error) {
            console.error('Delete failed:', error);
            triggerToast('שגיאה בתקשורת עם השרת');
        }
    };

    return (
        <div className="dashboard">
            {showToast.show && <div className="status-toast">{showToast.msg}</div>}

            <header className="app-header">
                <div className="search-container">
                    <div className="search-input-group">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="main-search-input"
                            placeholder="חפש רחוב, שכונה או מיקוד..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="search-btn" onClick={handleSearch} disabled={loading}>
                            חיפוש
                        </button>
                    </div>

                    <div className="search-controls">
                        <label className="radio-control">
                            <input type="radio" name="searchType" value="free" checked={searchType === 'free'} onChange={() => setSearchType('free')} />
                            חיפוש חופשי
                        </label>
                        <label className="radio-control">
                            <input type="radio" name="searchType" value="at-least-one" checked={searchType === 'at-least-one'} onChange={() => setSearchType('at-least-one')} />
                            חיפוש מדויק
                        </label>
                        <label className="radio-control">
                            <input type="radio" name="searchType" value="full-phrase" checked={searchType === 'full-phrase'} onChange={() => setSearchType('full-phrase')} />
                            ביטוי שלם
                        </label>
                    </div>
                </div>
            </header>

            <main>
                {loading ? (
                    <SkeletonLoader />
                ) : (
                    <div className="results-grid">
                        {results.map((street) => (
                            <div
                                key={street.id}
                                className={`street-card ${deletingIds.has(street.id) ? 'fade-out' : ''}`}
                            >
                                <div className="card-header">
                                    <h3 className="street-name-title">{street.street_name}</h3>
                                </div>
                                <div className="card-body">
                                    <div className="field-group">
                                        <span className="field-label">קוד רחוב</span>
                                        <span className="field-value">{street.street_code || '---'}</span>
                                    </div>
                                    <div className="field-group">
                                        <span className="field-label">שכונה</span>
                                        <span className="field-value">{street.neighborhood || '---'}</span>
                                    </div>
                                    <div className="field-group">
                                        <span className="field-label">סוג רחוב</span>
                                        <span className="field-value">{street.type || '---'}</span>
                                    </div>
                                    <div className="field-group">
                                        <span className="field-label">עיר</span>
                                        <span className="field-value">{street.city}</span>
                                    </div>
                                    <div className="field-group">
                                        <span className="field-label">מיקוד</span>
                                        <span className="field-value">{street.zip_code || '---'}</span>
                                    </div>
                                    <div className="field-group">
                                        <span className="field-label">מזהה מערכת</span>
                                        <span className="field-value">{street.id.substring(0, 8)}</span>
                                    </div>
                                </div>
                                <div className="card-footer">
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(street.id)}
                                        disabled={deletingIds.has(street.id)}
                                    >
                                        🗑️ מחיקה
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {!loading && results.length === 0 && query && (
                    <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
                        לא תואמו תוצאות לחיפוש שלך.
                    </div>
                )}
            </main>
        </div>
    )
}

export default App
