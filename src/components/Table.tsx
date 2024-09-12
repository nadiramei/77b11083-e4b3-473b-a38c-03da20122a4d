"use client";

import React, { useState } from 'react';
import { FaLongArrowAltDown, FaLongArrowAltUp } from 'react-icons/fa';

interface TableRow {
    firstName: string;
    lastName: string;
    position: string;
    phone: string;
    email: string;
}

const initialTableData: TableRow[] = [
    { firstName: 'John', lastName: 'Doe', position: 'Developer', phone: '123-456-7890', email: 'john@example.com' },
    { firstName: 'Jane', lastName: 'Smith', position: 'Designer', phone: '987-654-3210', email: 'jane@example.com' },
    { firstName: 'Mike', lastName: 'Johnson', position: 'Manager', phone: '555-555-5555', email: 'mike@example.com' },
    { firstName: 'Emily', lastName: 'Davis', position: 'Analyst', phone: '111-222-3333', email: 'emily@example.com' },
    { firstName: 'David', lastName: 'Brown', position: 'Engineer', phone: '444-666-7777', email: 'david@example.com' },
];

const Table: React.FC = () => {
    const [tableData, setTableData] = useState<TableRow[]>(initialTableData);
    const [sortedColumn, setSortedColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (column: keyof TableRow) => {
        const isAscending = sortedColumn === column && sortDirection === 'asc';
        const newDirection = isAscending ? 'desc' : 'asc';

        const sortedData = [...tableData].sort((a, b) => {
            if (a[column] < b[column]) {
                return newDirection === 'asc' ? -1 : 1;
            }
            if (a[column] > b[column]) {
                return newDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });

        setTableData(sortedData);
        setSortedColumn(column);
        setSortDirection(newDirection);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-gray-500 text-left border border-gray-300">
                        {[
                            { header: 'First Name', key: 'firstName' },
                            { header: 'Last Name', key: 'lastName' },
                            { header: 'Position', key: 'position' },
                            { header: 'Phone', key: 'phone' },
                            { header: 'Email', key: 'email' },
                        ].map(({ header, key }, index) => (
                            <th
                                key={index}
                                className="p-4 hover:bg-gray-200 hover:cursor-pointer relative group"
                                onClick={() => handleSort(key as keyof TableRow)}
                            >
                                <span className="flex items-center text-gray-700">
                                    {header}
                                    {sortedColumn === key && (
                                        sortDirection === 'asc' ? (
                                            <FaLongArrowAltUp className="ml-2 group-hover:text-gray-400" />
                                        ) : (
                                            <FaLongArrowAltDown className="ml-2 group-hover:text-gray-400" />
                                        )
                                    )}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((row, index) => (
                        <tr key={index} className="border border-gray-300">
                            <td className="p-4">{row.firstName}</td>
                            <td className="p-4">{row.lastName}</td>
                            <td className="p-4">{row.position}</td>
                            <td className="p-4">{row.phone}</td>
                            <td className="p-4">{row.email}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
