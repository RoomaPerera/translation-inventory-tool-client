import React from 'react';

const GlossaryPanel = ({ glossary, isLoading }) => {
    return (
        <div className="border border-gray-200 bg-white rounded-lg shadow-sm p-2 h-full">
            <h1 className="text-lg font-semibold text-gray-800 mb-8 border-b pb-2">
                Glossary Terms
            </h1>
            {isLoading && <p className="text-sm text-gray-500">Extracting terms...</p>}
            {!isLoading && (
                <div>
                    {glossary.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {glossary.map((g, i) => (
                                <div key={i} className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                                    <span className="font-bold">{g.term}</span>
                                    {g.translation && `: ${g.translation}`}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400">No key terms found.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlossaryPanel;