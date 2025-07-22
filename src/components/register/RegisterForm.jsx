import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRegister } from '../../hooks/useRegister';
import { useLanguages } from '../../hooks/useLanguages';
import { Input } from '../reusableComponents/Input';
import { Select } from '../reusableComponents/Select';
import Button from '../reusableComponents/Button';

const RegisterForm = () => {
    // All state and logic from the original Register page
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

    const filteredLanguages = allLangs?.filter(lang => lang.name.toLowerCase().includes(languageSearch.toLowerCase())) || [];
    const selectedLanguageNames = languages.map(code => allLangs?.find(lang => lang.code === code)?.name).filter(Boolean);

    const toggleLanguage = (code) => {
        setLanguages(prev => prev.includes(code) ? prev.filter(l => l !== code) : [...prev, code]);
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
            setSuccessMessage("Registration submitted successfully. Please wait for admin approval.");
            setIsRegistered(true);
        }
    };

    const roleOptions = [
        { value: "", label: "Select Role", disabled: true },
        { value: "Translator", label: "Translator" },
        { value: "Developer", label: "Developer" },
        { value: "Admin", label: "Admin" }
    ];

    if (successMessage) {
        return (
            <div className="text-center">
                <p className="text-green-600 font-semibold mb-4">{successMessage}</p>
                <Link to="/login" className="font-semibold text-purple-700 hover:underline">
                    Return to Login
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <Input label="User Name" id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <Input label="Email Address" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Password" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input label="Confirm New Password" id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <Select label="Select Role" options={roleOptions} selected={role} onSelect={setRole} />

            {role === "Translator" && (
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Languages</label>
                    {langsLoading ? <p>Loading...</p> : (
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
            {(error || registrationError || langsError) && <p className="text-red-600 font-semibold text-sm">{error || registrationError || langsError}</p>}
            <div className="pt-2">
                <Button type="submit" disabled={isLoading || isRegistered} className="w-full bg-teal-600 hover:bg-teal-700 text-white focus:ring-teal-500 !py-2.5 disabled:opacity-50">
                    {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
            </div>
            <p className="text-sm text-center pt-2">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-purple-700 hover:underline">Log In</Link>
            </p>
        </form>
    );
};

export default RegisterForm;