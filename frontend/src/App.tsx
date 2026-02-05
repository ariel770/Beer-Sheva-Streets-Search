import { useState, useEffect, useRef } from 'react'

interface Street {
    id: string;
    street_name: string;
    neighborhood: string;
    city: string;
    type: string;
    zip_code: string;
    street_code?: string;
}

const ShimmerLoader = () => (
    <div className="results-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-box" />
        ))}
    </div>
);

function App() {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('free');
    const [results, setResults] = useState<Street[]>([]);
    const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState<{ show: boolean, msg: string }>({ show: false, msg: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const showMessage = (msg: string) => {
        setToast({ show: true, msg });
        setTimeout(() => setToast({ show: false, msg: '' }), 3000);
    };

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${searchType}`);
            const data = await response.json();
            setResults(data);
            if (data.length === 0) {
                showMessage('לא נמצאו תוצאות לחיפוש שלך');
            }
        } catch (error) {
            console.error('Search error:', error);
            showMessage('שגיאה בביצוע החיפוש');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/streets/upload', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                showMessage('הקובץ הועלה בהצלחה!');
            } else {
                showMessage('שגיאה בהעלאת הקובץ');
            }
        } catch (error) {
            showMessage('שגיאה בתקשורת עם השרת');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        setDeletingIds(prev => new Set(prev).add(id));

        try {
            const response = await fetch(`/api/streets/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setTimeout(() => {
                    setResults(prev => prev.filter(r => r.id !== id));
                    setDeletingIds(prev => {
                        const next = new Set(prev);
                        next.delete(id);
                        return next;
                    });
                }, 400); // Wait for fade-out animation
            } else {
                showMessage('שגיאה במחיקת הרשומה');
                setDeletingIds(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }
        } catch (error) {
            showMessage('שגיאה בחיבור לשרת');
        }
    };

    return (
        <div className="app-layout">
            {toast.show && <div className="toast-bar"><span>✨ {toast.msg}</span></div>}

            <nav className="navbar">
                <h1 className="navbar-title">חיפוש רחובות - באר שבע</h1>

                <div className="top-actions">
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleUpload}
                    />
                    <button
                        className="btn-outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        <span>{uploading ? 'מעלה...' : 'העלאת נתונים'}</span>
                        <span>☁️</span>
                    </button>
                </div>
            </nav>

            <section className="search-hero">
                <div className="search-box-unified">
                    <div className="input-integrated-group">
                        <span className="search-icon-fixed">🔍</span>
                        <input
                            type="text"
                            className="unified-input"
                            placeholder="הקלד שם רחוב או שכונה לחיפוש..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="unified-btn" onClick={handleSearch} disabled={loading}>
                            {loading ? '...' : 'חיפוש'}
                        </button>
                    </div>

                    <div className="radio-row">
                        <label className="radio-item">
                            <input type="radio" value="free" checked={searchType === 'free'} onChange={() => setSearchType('free')} />
                            <span>חיפוש חופשי</span>
                        </label>
                        <label className="radio-item">
                            <input type="radio" value="at-least-one" checked={searchType === 'at-least-one'} onChange={() => setSearchType('at-least-one')} />
                            <span>חיפוש מדויק</span>
                        </label>
                        <label className="radio-item">
                            <input type="radio" value="full-phrase" checked={searchType === 'full-phrase'} onChange={() => setSearchType('full-phrase')} />
                            <span>ביטוי שלם</span>
                        </label>
                    </div>
                </div>
            </section>

            <main className="results-container">
                {loading ? (
                    <ShimmerLoader />
                ) : (
                    <div className="results-grid">
                        {results.map((street) => (
                            <div
                                key={street.id}
                                className={`record-card ${deletingIds.has(street.id) ? 'fade-out' : ''}`}
                            >
                                <h3 className="card-title">{street.street_name}</h3>

                                <div className="card-fields-grid">
                                    <div className="field-box">
                                        <span className="label-text">שם רחוב</span>
                                        <span className="value-text">{street.street_name}</span>
                                    </div>
                                    <div className="field-box">
                                        <span className="label-text">קוד רחוב</span>
                                        <span className="value-text">{street.street_code || 'ללא קוד'}</span>
                                    </div>
                                    <div className="field-box">
                                        <span className="label-text">שכונה</span>
                                        <span className="value-text">{street.neighborhood || 'כללית'}</span>
                                    </div>
                                    <div className="field-box">
                                        <span className="label-text">סוג רחוב</span>
                                        <span className="value-text">{street.type || 'רחוב'}</span>
                                    </div>
                                    <div className="field-box">
                                        <span className="label-text">עיר</span>
                                        <span className="value-text">{street.city}</span>
                                    </div>
                                    <div className="field-box">
                                        <span className="label-text">מיקוד</span>
                                        <span className="value-text">{street.zip_code || '---'}</span>
                                    </div>
                                </div>

                                <div className="card-footer">
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(street.street_name + ' באר שבע')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-map"
                                    >
                                        <span>📍 מפה</span>
                                    </a>

                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(street.id)}
                                        disabled={deletingIds.has(street.id)}
                                    >
                                        <span>🗑️</span>
                                        <span>מחיקה</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && results.length === 0 && query && (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>לא נמצאו רשומות תואמות.</p>
                    </div>
                )}
            </main>
        </div>
    )
}

export default App
