import React, { useState } from "react";
import { useRegister } from "../hooks/useRegister";
import { Link, useNavigate } from "react-router-dom";
import { useLanguages } from "../hooks/useLanguages";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import Button from "../components/Button";
import gtnLogo from '../assets/images/gtn-logo.png';

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

    const filteredLanguages = allLangs?.filter(lang =>
        lang.name.toLowerCase().includes(languageSearch.toLowerCase())
    ) || [];

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
        const result = await registration(username, email, password, role, languages);
        if (result) {
            setSuccessMessage("Registration submitted successfully. Please wait for admin approval before attempting to log in.");
            setIsRegistered(true);
        }
    };

    const roleOptions = [
        { value: "", label: "Select Role", disabled: true },
        { value: "Translator", label: "Translator" },
        { value: "Developer", label: "Developer" },
        { value: "Admin", label: "Admin" }
    ];

    return (
        <div className="flex h-screen w-full m-0 p-0 overflow-hidden">
            {/* Left Panel */}
            <div className="w-2/5 bg-gradient-to-b from-purple-800 to-teal-500 text-white flex flex-col items-center justify-center p-10">
                <img src={gtnLogo} alt="Company Logo" className="w-32 h-auto mb-2" />
                <h1 className="text-2xl font-semibold w-30 text-center">GTN Portal</h1>
            </div>

            {/* Right Panel */}
            <div className="w-3/5 bg-gray-100 flex items-center justify-center min-h-screen py-8 overflow-y-auto">
                <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
                    <h2 className="text-xl font-semibold text-center text-purple-700 mb-6">
                        Create an Account
                    </h2>
                    {successMessage ? (
                        <div className="text-center">
                            <p className="text-green-600 font-semibold mb-4">{successMessage}</p>
                            <Link to="/login" className="font-semibold text-purple-700 hover:underline">
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <Input label="User Name" id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                        <Input label="Email Address" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        <Input label="Password" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <Input label="Confirm New Password" id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        <Select label="Select Role" options={roleOptions} selected={role} onSelect={setRole} />

                        {role === "Translator" && (
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Languages</label>
                                {langsLoading ? <p>Loading...</p> : langsError ? <p className="text-red-500">{langsError}</p> : (
                                <div>
                                    <div className="w-full p-2 border border-gray-300 rounded-md bg-white cursor-pointer min-h-[38px] flex flex-wrap gap-1 items-center text-sm" onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}>
                                        {selectedLanguageNames.length > 0 ? selectedLanguageNames.map(name => <span key={name} className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">{name}</span>) : <span className="text-gray-500">Select languages...</span>}
                                    </div>
                                    {isLanguageDropdownOpen && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                        <div className="p-2 border-b"><input type="text" placeholder="Search..." value={languageSearch} onChange={(e) => setLanguageSearch(e.target.value)} className="w-full p-1.5 text-sm border rounded" /></div>
                                        <div className="max-h-32 overflow-y-auto">
                                            {filteredLanguages.map(({ code, name }) => (
                                            <div key={code} className="flex items-center p-2 hover:bg-gray-100 cursor-pointer" onClick={() => toggleLanguage(code)}>
                                                <input type="checkbox" checked={languages.includes(code)} readOnly className="mr-2 h-4 w-4" />
                                                <span className="text-sm">{name}</span>
                                            </div>
                                            ))}
                                        </div>
                                    </div>
                                    )}
                                </div>
                                )}
                            </div>
                        )}
                        {(error || registrationError) && <p className="text-red-600 font-semibold text-sm">{error || registrationError}</p>}
                        <div className="pt-2">
                          <Button type="submit" disabled={isLoading || isRegistered} className="w-full bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 py-2.5 disabled:opacity-50">
                              {isLoading ? "Creating Account..." : "Create Account"}
                          </Button>
                        </div>
                        <p className="text-sm text-center pt-2">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-purple-700 hover:underline">Log In</Link>
                        </p>
                    </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;