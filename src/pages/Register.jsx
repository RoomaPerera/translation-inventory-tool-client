import React, { useState } from "react";
import { useRegister } from "../hooks/useRegister";
import { useNavigate } from "react-router-dom";
import { useLanguages } from "../hooks/useLanguages";
import { Input } from "../components/RegisterLoginComponents/Input";
import { Select } from "../components/reusableComponents/Select";
import Button from "../components/reusableComponents/Button";
import GTNLogo from "../assets/images/gtn-logo.png"

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("");
    const [languages, setLanguages] = useState([]);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
    const [languageSearch, setLanguageSearch] = useState("");

    const { registration, isLoading, error: registrationError } = useRegister();
    const { languages: allLangs, loading: langsLoading, error: langsError } = useLanguages();
    const navigate = useNavigate();

    // Filter languages based on search
    const filteredLanguages = allLangs?.filter(lang =>
        lang.name.toLowerCase().includes(languageSearch.toLowerCase())
    ) || [];

    // Get selected language names for display
    const selectedLanguageNames = languages.map(code =>
        allLangs?.find(lang => lang.code === code)?.name
    ).filter(Boolean);

    const toggleLanguage = (code) => {
        if (languages.includes(code)) {
            setLanguages(prev => prev.filter(lang => lang !== code));
        } else {
            setLanguages(prev => [...prev, code]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError(null);
        // Pass username as userName and email as email
        const result = await registration(username, email, password, role, languages);
        if (result) {
            setSuccessMessage("Registration submitted successfully. Your account is pending admin approval. Please wait for approval before attempting to log in.");
            setIsRegistered(true);
        }
    };

    // Role options for the Select component
    const roleOptions = [
        { value: "", label: "Select Role" },
        { value: "Translator", label: "Translator" },
        { value: "Developer", label: "Developer" },
        { value: "Admin", label: "Admin" }
    ];

    return (
        <div className="flex min-h-screen w-full m-0 p-0 overflow-hidden">
            {/* Left Panel */}
            <div className="w-2/5 min-w-0 bg-gradient-to-b from-purple-800 to-teal-500 text-white flex flex-col 
            items-center justify-center p-10 overflow-hidden">
                <img src={GTNLogo} alt="Company Logo" className="w-32 h-auto mb-2" />
                <h1 className="text-2xl font-semibold w-30 text-center">GTN Portal</h1>
            </div>

            {/* Right Panel */}
            <div className="w-3/5 min-w-0 bg-gray-100 flex items-center justify-center min-h-screen py-8 overflow-hidden">
                <div className={`bg-white p-6 rounded shadow-md w-full max-w-sm transition-all duration-200 ${isLanguageDropdownOpen && role === "Translator"
                    ? 'h-full max-h-full'
                    : 'max-h-fit'
                    }`}>
                    <h2 className="text-xl font-semibold text-center text-purple-700 mb-6">
                        Create an Account
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <Input
                            label="User Name"
                            id="username"
                            name="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />

                        <Input
                            label="Email Address"
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />

                        <Input
                            label="Password"
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />

                        <Input
                            label="Confirm New Password"
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your new password"
                            required
                        />

                        <Select
                            label="Select Role"
                            options={roleOptions}
                            selected={role}
                            onSelect={setRole}
                        />

                        {role === "Translator" && (
                            <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Languages
                                </label>

                                {langsLoading ? (
                                    <p className="text-gray-500 text-sm">Loading languages...</p>
                                ) : langsError ? (
                                    <p className="text-red-600 text-sm">Error: {langsError}</p>
                                ) : (
                                    <div className="relative">
                                        {/* Selected languages display */}
                                        <div
                                            className="w-full p-2 border border-gray-300 rounded-md bg-white cursor-pointer min-h-[36px] flex flex-wrap gap-1 items-center text-sm"
                                            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                                        >
                                            {selectedLanguageNames.length > 0 ? (
                                                selectedLanguageNames.map((name, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs"
                                                    >
                                                        {name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-500">Select languages...</span>
                                            )}
                                            <div className="ml-auto">
                                                <svg className={`w-4 h-4 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Dropdown */}
                                        {isLanguageDropdownOpen && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden">
                                                {/* Search input */}
                                                <div className="p-2 border-b">
                                                    <input
                                                        type="text"
                                                        placeholder="Search languages..."
                                                        value={languageSearch}
                                                        onChange={(e) => setLanguageSearch(e.target.value)}
                                                        className="w-full p-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>

                                                {/* Language options - Show only 3 items with scroll */}
                                                <div className="max-h-24 overflow-y-auto">
                                                    {filteredLanguages.length > 0 ? (
                                                        filteredLanguages.map(({ code, name }) => (
                                                            <div
                                                                key={code}
                                                                className="flex items-center p-2 hover:bg-gray-100 cursor-pointer h-8"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleLanguage(code);
                                                                }}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={languages.includes(code)}
                                                                    onChange={() => { }}
                                                                    className="mr-2 h-3 w-3 text-purple-600 rounded"
                                                                />
                                                                <span className="text-sm">{name}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-2 text-gray-500 text-sm h-8 flex items-center">No languages found</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {(error || registrationError) && (
                            <p className="text-red-600 font-semibold text-sm mb-2">{error || registrationError}</p>
                        )}

                        {successMessage && (
                            <p className="text-green-600 font-semibold text-sm mb-2">{successMessage}</p>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading || isRegistered}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Creating Account..." : isRegistered ? "Registration Submitted" : "Create Account"}
                        </Button>

                        <p className="text-sm text-center mt-4">
                            Already have an account?{' '}
                            <a href="/login" className="text-purple-700 font-medium">
                                Log In
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;