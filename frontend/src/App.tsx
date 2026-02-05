import { useState, useEffect, useRef } from 'react'

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
    const [uploadStatus, setUploadStatus] = useState<string>('');
    const [showNoResultsToast, setShowNoResultsToast] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        const isCompatible = fileName.endsWith('.csv') || fileName.endsWith('.txt') || file.type === 'text/csv' || file.type === 'text/plain';

        if (!isCompatible) {
            setUploadStatus('סוג הקובץ אינו מתאים. אנא העלה קובץ טקסט/CSV.');
            fileInputRef.current!.value = '';
            return;
        }

        setUploading(true);
        setUploadStatus('מעלה...');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/streets/upload', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                setUploadStatus('הקובץ הועלה בהצלחה!');
            } else {
                setUploadStatus('שגיאה בעיבוד הקובץ בשרת');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadStatus('שגיאה בתקשורת עם השרת');
        } finally {
            setUploading(false);
            fileInputRef.current!.value = '';
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

            {/* Separate Box for Upload */}
            <div className="section-box">
                <span className="section-title">העלאת נתונים</span>
                <div className="upload-row">
                    <div className="upload-input-group">
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <button
                            className="btn btn-secondary"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? 'מעלה...' : 'בחר קובץ להעלאה'}
                        </button>
                    </div>
                    {uploadStatus && <span className="status-text">{uploadStatus}</span>}
                </div>
            </div>

            {/* Separate Box for Search */}
            <div className="section-box">
                <span className="section-title">חיפוש רחובות</span>
                <div className="search-row">
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            placeholder="הכנס שם רחוב..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
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

            {/* Results Window */}
            <div className="results-window">
                <table className="results-table">
                    <tbody>
                        {results.map((street) => (
                            <tr key={street.id}>
                                <td className="col-name">{street.street_name}</td>
                                <td className="col-neighborhood">{street.neighborhood}</td>
                                <td className="col-city">{street.city}</td>
                                <td className="col-type">{street.type}</td>
                                <td className="col-zip">{street.zip_code}</td>
                                <td className="col-action">
                                    <button className="row-delete-btn" onClick={() => handleDelete(street.id)}>מחק</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {results.length === 0 && !loading && (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                        אין נתונים להצגה. בצע חיפוש.
                    </div>
                )}
            </div>
        </div>
    )
}

export default App
