import { useState, useEffect, useRef } from 'react'

interface Street {
    id: string;
    street_name: string;
    neighborhood: string;
    city: string;
    type: string;
    zip_code: string;
}

enum StreetFields {
    NAME = 'שם רחוב',
    NEIGHBORHOOD = 'שכונה',
    CITY = 'עיר',
    TYPE = 'סוג',
    ZIP = 'מיקוד'
}

function App() {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState('free');
    const [results, setResults] = useState<Street[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showNoResultsToast, setShowNoResultsToast] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
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
                setToastMessage('לא נמצאו תוצאות לחיפוש שלך');
                setShowNoResultsToast(true);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-hide toasts
    useEffect(() => {
        if (showNoResultsToast || showSuccessToast) {
            const timer = setTimeout(() => {
                setShowNoResultsToast(false);
                setShowSuccessToast(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showNoResultsToast, showSuccessToast]);

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
            setToastMessage('סוג הקובץ אינו מתאים (CSV/TXT בלבד)');
            setShowNoResultsToast(true); // Re-using "warning" toast behavior
            fileInputRef.current!.value = '';
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/streets/upload', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                setToastMessage('הקובץ הועלה בהצלחה!');
                setShowSuccessToast(true);
            } else {
                setToastMessage('שגיאה בעיבוד הקובץ');
                setShowNoResultsToast(true);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setToastMessage('שגיאה בתקשורת עם השרת');
            setShowNoResultsToast(true);
        } finally {
            setUploading(false);
            fileInputRef.current!.value = '';
        }
    };

    return (
        <div className="container">
            {/* Toast Notifications */}
            <div className="toast-container">
                {showNoResultsToast && (
                    <div className="toast">{toastMessage}</div>
                )}
                {showSuccessToast && (
                    <div className="toast toast-success">{toastMessage}</div>
                )}
            </div>

            {/* Header + Upload Aligned */}
            <div className="section-box">
                <div className="header-upload-row">
                    <h1>חיפוש רחובות - באר שבע</h1>
                    <div className="upload-actions">
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
                </div>
            </div>

            {/* Search Box */}
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
                        <input type="radio" name="searchType" value="free" checked={searchType === 'free'} onChange={() => setSearchType('free')} />
                        חיפוש חופשי (שם ראשי)
                    </label>
                    <label className="radio-option">
                        <input type="radio" name="searchType" value="at-least-one" checked={searchType === 'at-least-one'} onChange={() => setSearchType('at-least-one')} />
                        חיפוש לפחות מילה אחת בכל השדות
                    </label>
                    <label className="radio-option">
                        <input type="radio" name="searchType" value="full-phrase" checked={searchType === 'full-phrase'} onChange={() => setSearchType('full-phrase')} />
                        חיפוש ביטוי שלם בכל השדות
                    </label>
                </div>
            </div>

            {/* Results Window */}
            <div className="results-window">
                <table className="results-table">
                    {results.length > 0 && (
                        <thead>
                            <tr>
                                <th className="col-name">{StreetFields.NAME}</th>
                                <th className="col-neighborhood">{StreetFields.NEIGHBORHOOD}</th>
                                <th className="col-city">{StreetFields.CITY}</th>
                                <th className="col-type">{StreetFields.TYPE}</th>
                                <th className="col-zip">{StreetFields.ZIP}</th>
                                <th className="col-action"></th>
                            </tr>
                        </thead>
                    )}
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
