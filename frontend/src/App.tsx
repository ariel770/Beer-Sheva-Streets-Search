import { useState, useEffect } from 'react'

interface Street {
    id: string;
    street_name: string;
    neighborhood: string;
    city: string;
    type: string;
    zip_code: string;
}

function App() {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('free');
    const [results, setResults] = useState<Street[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [showNoResultsToast, setShowNoResultsToast] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setShowNoResultsToast(false);
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${searchType}`);
            const data = await response.json();
            setResults(data);

            if (data.length === 0) {
                setShowNoResultsToast(true);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (showNoResultsToast) {
            const timer = setTimeout(() => {
                setShowNoResultsToast(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showNoResultsToast]);

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/streets/${id}`, { method: 'DELETE' });
            if (response.ok) {
                setResults(results.filter(r => r.id !== id));
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setUploadStatus('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/streets/upload', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                setUploadStatus('הקובץ הועלה ונשמר בהצלחה!');
            } else {
                setUploadStatus('שגיאה בהעלאת הקובץ');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadStatus('שגיאה בתקשורת עם השרת');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container">
            {showNoResultsToast && (
                <div className="toast-container">
                    <div className="toast">לא נמצאו תוצאות לחיפוש שלך</div>
                </div>
            )}

            <header>
                <h1>חיפוש רחובות - באר שבע</h1>
            </header>

            <div className="upload-section">
                <h3>העלאת קובץ רחובות (CSV)</h3>
                <div className="upload-controls">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="upload-btn"
                    >
                        {uploading ? 'מעלה...' : 'העלאת קובץ'}
                    </button>
                </div>
                {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
            </div>

            <div className="search-container">
                <div className="search-field">
                    <input
                        type="text"
                        placeholder="הכנס שם רחוב..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="search-btn" onClick={handleSearch} disabled={loading}>
                        {loading ? 'מחפש...' : 'חיפוש'}
                    </button>
                </div>

                <div className="radio-group">
                    <label className="radio-option">
                        <input
                            type="radio"
                            name="searchType"
                            value="free"
                            checked={searchType === 'free'}
                            onChange={() => setSearchType('free')}
                        />
                        חיפוש חופשי (שם ראשי)
                    </label>
                    <label className="radio-option">
                        <input
                            type="radio"
                            name="searchType"
                            value="at-least-one"
                            checked={searchType === 'at-least-one'}
                            onChange={() => setSearchType('at-least-one')}
                        />
                        חיפוש לפחות מילה אחת בכל השדות
                    </label>
                    <label className="radio-option">
                        <input
                            type="radio"
                            name="searchType"
                            value="full-phrase"
                            checked={searchType === 'full-phrase'}
                            onChange={() => setSearchType('full-phrase')}
                        />
                        חיפוש ביטוי שלם בכל השדות
                    </label>
                </div>
            </div>

            <div className="results-window">
                <table className="results-table">
                    <tbody>
                        {results.map((street) => (
                            <tr key={street.id}>
                                <td>
                                    <strong>{street.street_name}</strong> | {street.neighborhood} | {street.city} | {street.type} | {street.zip_code}
                                </td>
                                <td style={{ textAlign: 'left', width: '60px' }}>
                                    <button className="row-delete-btn" onClick={() => handleDelete(street.id)}>מחק</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {results.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
                        אין נתונים להצגה. בצע חיפוש.
                    </div>
                )}
            </div>
        </div>
    )
}

export default App
