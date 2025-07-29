// src/pages/AddTranslation.jsx
import React, { useState } from "react";
import axios from "axios";

function AddTranslation() {
    const [formData, setFormData] = useState({
        translationKey: "",
        language: "",
        translatedText: "",
        product: "",
        createdBy: ""  // this can be static like "admin123" or from login later
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/translations", formData);
            alert("Translation added successfully!");
            setFormData({
                translationKey: "",
                language: "",
                translatedText: "",
                product: "",
                createdBy: ""
            });
        } catch (error) {
            console.error("Error adding translation:", error);
            alert("Failed to add translation");
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Add New Translation</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input name="translationKey" value={formData.translationKey} onChange={handleChange} placeholder="Translation Key" className="border w-full p-2" required />
                <input name="language" value={formData.language} onChange={handleChange} placeholder="Language" className="border w-full p-2" required />
                <input name="translatedText" value={formData.translatedText} onChange={handleChange} placeholder="Translated Text" className="border w-full p-2" required />
                <input name="product" value={formData.product} onChange={handleChange} placeholder="Product" className="border w-full p-2" required />
                <input name="createdBy" value={formData.createdBy} onChange={handleChange} placeholder="Created By" className="border w-full p-2" required />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Translation</button>
            </form>
        </div>
    );
}

export default AddTranslation;
