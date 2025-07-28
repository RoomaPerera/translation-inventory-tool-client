// import React, { useState, useEffect } from 'react';
// import CancelButton from './CancelButton';
// import SaveButton from './SaveButton';
// import { useLanguages } from '../../../hooks/useLanguages';

// export default function LanguageModal({
//     open,
//     userName = '',
//     initial = [],
//     onSave,
//     onCancel
// }) {
//     const { languages: allLangs, loading, error } = useLanguages();
//     const [search, setSearch] = useState('');
//     const [selected, setSelected] = useState(initial);

//     useEffect(() => {
//         setSelected(initial);
//     }, [initial, open]);

//     if (!open) return null;

//     const filtered = allLangs.filter(l =>
//         l.name.toLowerCase().includes(search.toLowerCase())
//     );

//     const toggle = code =>
//         setSelected(prev =>
//             prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
//         );

//     const handleSave = () => onSave(selected);

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//             {/* backdrop */}
//             <div
//                 className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
//                 onClick={onCancel}
//             />
//             {/* modal */}
//             <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4">
//                     Edit Languages for {userName}
//                 </h3>

//                 {loading ? (
//                     <p className="text-gray-500">Loading languages…</p>
//                 ) : error ? (
//                     <p className="text-red-600">{error}</p>
//                 ) : (
//                     <>
//                         <input
//                             type="text"
//                             placeholder="Search languages"
//                             value={search}
//                             onChange={e => setSearch(e.target.value)}
//                             className="w-full mb-3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
//                         />

//                         <div className="max-h-48 overflow-y-auto border rounded">
//                             {filtered.map(({ code, name }) => (
//                                 <label
//                                     key={code}
//                                     className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
//                                 >
//                                     <input
//                                         type="checkbox"
//                                         checked={selected.includes(code)}
//                                         onChange={() => toggle(code)}
//                                         className="mr-2 h-4 w-4 text-purple-600"
//                                     />
//                                     <span className="text-sm">{name}</span>
//                                 </label>
//                             ))}
//                             {filtered.length === 0 && (
//                                 <p className="p-2 text-gray-500 text-sm">No languages found.</p>
//                             )}
//                         </div>
//                     </>
//                 )}

//                 <div className="mt-6 flex justify-end space-x-3">
//                     <CancelButton onClick={onCancel} />
//                     <SaveButton onClick={handleSave} />
//                 </div>
//             </div>
//         </div>
//     );
// }