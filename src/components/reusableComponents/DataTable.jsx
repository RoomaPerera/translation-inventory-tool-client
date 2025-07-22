import React from 'react';

const data = [
  { id: 1, product: 'Product 1', role: 'Developer', user: 'Rubix' },
  { id: 2, product: 'Product 2', role: 'Admin', user: 'Admin' },
  { id: 3, product: 'Product 3', role: 'Translator', user: 'Translator' },
  { id: 4, product: 'Product 1', role: 'Translator', user: 'Jane Doe' },
];

export const DataTable = () => {
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Product
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Assigned Role
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              User
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Edit</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((item) => (
            <tr key={item.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {item.product}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.role}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.user}</td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <a href="#" className="text-blue-600 hover:text-blue-900">
                  Edit<span className="sr-only">, {item.user}</span>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 