import React, { useState } from "react";
import axios from "axios";

const TranslationForm = () => {
    const [form, setForm] = useState({
        translationKey: "",
        language: "",
        translatedText: "",
        product: "",
        createdBy: "", // later from auth
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/translations", form);
            alert("Translation added successfully!");
            setForm({
                translationKey: "",
                language: "",
                translatedText: "",
                product: "",
                createdBy: "",
            });
        } catch (error) {
            alert("Error: " + error.response?.data?.message || error.message);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Add Translation</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="translationKey" placeholder="Translation Key" value={form.translationKey} onChange={handleChange} className="input" required />
                <input type="text" name="language" placeholder="Language (e.g., fr, en)" value={form.language} onChange={handleChange} className="input" required />
                <input type="text" name="translatedText" placeholder="Translated Text" value={form.translatedText} onChange={handleChange} className="input" required />
                <input type="text" name="product" placeholder="Product (e.g., Website)" value={form.product} onChange={handleChange} className="input" required />
                <input type="text" name="createdBy" placeholder="Creator ID" value={form.createdBy} onChange={handleChange} className="input" required />

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
            </form>
        </div>
    );
};

export default TranslationForm;
