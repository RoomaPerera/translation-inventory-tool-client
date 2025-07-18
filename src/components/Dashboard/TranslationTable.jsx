import React from 'react';
const TranslationTable = ({ onEditClick }) => {
const data = [
{ no: 1, key: 'ABOUT', lang: 'EN', translation: 'About' },
{ no: 2, key: 'ABOUT', lang: 'AR', translation: 'حول' },
];
return (
<div className="bg-white rounded-lg shadow-sm overflow-hidden">
<table className="w-full">
<thead className="bg-brand-purple-base text-white">
<tr>
<th className="p-4 text-left font-semibold">No</th>
<th className="p-4 text-left font-semibold">Key</th>
<th className="p-4 text-left font-semibold">Language</th>
<th className="p-4 text-left font-semibold">Translation</th>
<th className="p-4 text-left font-semibold"></th>
</tr>
</thead>
<tbody>
{data.map((row) => (
<tr key={row.no} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
<td className="p-4">{row.no}</td>
<td className="p-4 font-medium">{row.key}</td>
<td className="p-4">{row.lang}</td>
<td className="p-4">{row.translation}</td>
<td className="p-4 text-right">
<button
className="py-1 px-3 rounded-md border border-gray-300 text-sm font-medium cursor-pointer ml-2 hover:bg-gray-100"
onClick={() => onEditClick(row)}
>
Edit
</button>
<button className="py-1 px-3 rounded-md border border-gray-300 text-sm font-medium cursor-pointer ml-2 bg-transparent text-gray-700 hover:bg-gray-100">
Delete
</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
);
};
export default TranslationTable;