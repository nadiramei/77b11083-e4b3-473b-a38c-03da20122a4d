"use client";

import React, { useState, useEffect } from 'react';
import { FaLongArrowAltDown, FaLongArrowAltUp } from 'react-icons/fa';

interface TableRow {
    firstName: string;
    lastName: string;
    position: string;
    phone: string;
    email: string;
}

const Table: React.FC = () => {
    const [data, setData] = useState<TableRow[]>([]);
    const [sortedColumn, setSortedColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [editingCell, setEditingCell] = useState<{ row: number; col: keyof TableRow } | null>(null);

    const handleCellClick = (rowIndex: number, colKey: keyof TableRow) => {
        setEditingCell({ row: rowIndex, col: colKey });
    };

    const handleBlur = () => {
        setEditingCell(null);
    };

    const handleSort = (column: keyof TableRow) => {
        const isAscending = sortedColumn === column && sortDirection === 'asc';
        const newDirection = isAscending ? 'desc' : 'asc';

        const sortedData = [...data].sort((a, b) => {
            if (a[column] < b[column]) {
                return newDirection === 'asc' ? -1 : 1;
            }
            if (a[column] > b[column]) {
                return newDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });

        setData(sortedData);
        setSortedColumn(column);
        setSortDirection(newDirection);
    };

    const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>, rowIndex: number, colKey: keyof TableRow) => {
        const newValue = event.target.value;

        const newData = [...data];
        newData[rowIndex] = { ...newData[rowIndex], [colKey]: newValue };
        setData(newData);

        try {
            const response = await fetch('/api/update-table-data', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rowIndex,
                    colKey,
                    value: newValue,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update data: ${errorText}`);
            }

            console.log('Data updated successfully');
        } catch (error) {
            console.error('Error updating data:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/table-data');
                if (!response.ok) throw new Error('Network response was not ok');
                const result: TableRow[] = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

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
                                className="p-4 hover:bg-gray-200 hover:cursor-pointer relative group w-1/5"
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
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border border-gray-300">
                            {(['firstName', 'lastName', 'position', 'phone', 'email'] as (keyof TableRow)[]).map((colKey) => (
                                <td
                                    key={colKey}
                                    className={`p-4 cursor-pointer ${editingCell?.row === rowIndex && editingCell.col === colKey ? 'border-b-2 border-sky-400' : ''}`}
                                    onClick={() => handleCellClick(rowIndex, colKey)}
                                >
                                    {editingCell?.row === rowIndex && editingCell.col === colKey ? (
                                        <input
                                            type="text"
                                            value={row[colKey]}
                                            onChange={(e) => handleInputChange(e, rowIndex, colKey)}
                                            onBlur={handleBlur}
                                            className="w-full h-full outline-none"
                                            autoFocus
                                        />
                                    ) : (
                                        row[colKey]
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
