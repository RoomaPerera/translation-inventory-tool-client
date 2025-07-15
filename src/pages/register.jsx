import React, { useState } from "react";
import { useRegister } from "../hooks/useRegister";
import { useNavigate } from "react-router-dom";
import { useLanguages } from "../hooks/useLanguages";

const Register = () => {
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");
    const [languages, setLanguages] = useState([]);
    const [inputError, setInputError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const { registration, isLoading, error } = useRegister();
    const { languages: allLangs, loading: langsLoading, error: langsError } = useLanguages();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setInputError("Passwords do not match");
            return;
        }
        setInputError(null);

        const result = await registration(userName, email, password, role, languages);
        if (result) {
            setSuccessMessage("Registration submitted successfully. Your account is pending admin approval.");
            setTimeout(() => navigate("/login"), 3000);
        }
    };

    return (
        <section className="max-w-md mx-auto p-8 border rounded-lg shadow-md bg-white">
            <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700">Create an Account</h2>
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* User Info */}
                <div>
                    <label htmlFor="userName" className="block mb-2 font-semibold text-gray-700">User Name</label>
                    <input
                        id="userName"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your full name"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block mb-2 font-semibold text-gray-700">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="you@example.com"
                    />
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="password" className="block mb-2 font-semibold text-gray-700">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter password"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block mb-2 font-semibold text-gray-700">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Re-enter password"
                        />
                    </div>
                </div>

                {/* Role selector */}
                <div>
                    <label htmlFor="role" className="block mb-2 font-semibold text-gray-700">Role</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="" disabled>
                            Select Role
                        </option>
                        <option value="Translator">Translator</option>
                        <option value="Developer">Developer</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>

                {role === "Translator" && (
                    <fieldset className="border border-gray-300 rounded-md p-4">
                        <legend className="font-semibold text-gray-700 mb-3">Select Languages</legend>
                        {langsLoading ? (
                            <p>Loading languages…</p>
                        ) : langsError ? (
                            <p className="text-red-600">Error: {langsError}</p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-auto">
                                {allLangs.map(({ code, name }) => (
                                    <label key={code} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            value={code}
                                            checked={languages.includes(code)}
                                            onChange={e => {
                                                if (e.target.checked) {
                                                    setLanguages(prev => [...prev, code]);
                                                } else {
                                                    setLanguages(prev => prev.filter(lang => lang !== code));
                                                }
                                            }}
                                            className="form-checkbox"
                                        />
                                        <span>{name}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </fieldset>
                )}

                {/* Error and success messages */}
                {(inputError || error) && (
                    <p className="text-red-600 font-semibold">{inputError || error}</p>
                )}

                {successMessage && (
                    <p className="text-green-600 font-semibold">{successMessage}</p>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition"
                >
                    {isLoading ? "Registering..." : "Register"}
                </button>
            </form>
        </section>
    );
};

export default Register;