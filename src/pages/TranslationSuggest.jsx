import React, { useState } from "react";
import axios from "axios";

function TranslationSuggest() {
    const [text, setText] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [glossary, setGlossary] = useState([]);
    const [error, setError] = useState("");

    const handleSuggest = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/nlp/suggest", {
                text,
                translations: [] // you can optionally include previous translations
            });
            setSuggestions(response.data.suggestions || []);
            setError("");
        } catch (err) {
            setError("Failed to get suggestions");
            console.error(err);
        }
    };

    const handleGlossary = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/nlp/glossary", { text });
            setGlossary(response.data.glossary || []);
            setError("");
        } catch (err) {
            setError("Failed to extract glossary");
            console.error(err);
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h2>Semantic Translation & Glossary</h2>
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                placeholder="Enter source text here..."
                style={{ width: "100%", padding: "10px", fontSize: "16px", marginBottom: "10px" }}
            />
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button onClick={handleSuggest} style={{ padding: "8px 16px" }}>Get Suggestions</button>
                <button onClick={handleGlossary} style={{ padding: "8px 16px" }}>Get Glossary</button>
            </div>

            {error && <div style={{ color: "red" }}>{error}</div>}

            {suggestions.length > 0 && (
                <div>
                    <h4>Translation Suggestions:</h4>
                    <ul>
                        {suggestions.map((s, i) => (
                            <li key={i}>{s.translatedText}</li>
                        ))}
                    </ul>
                </div>
            )}

            {glossary.length > 0 && (
                <div>
                    <h4>Glossary Terms:</h4>
                    <ul>
                        {glossary.map((g, i) => (
                            <li key={i}>
                                <strong>{g.term}</strong>: {g.translation}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default TranslationSuggest;