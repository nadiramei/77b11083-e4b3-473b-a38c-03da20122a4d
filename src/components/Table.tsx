"use client";

import React, { useState } from 'react';
import { FaLongArrowAltDown, FaLongArrowAltUp } from 'react-icons/fa';

interface TableRow {
    id: number;
    firstName: string;
    lastName: string;
    position: string;
    phone: string;
    email: string;
}

interface TableProps {
    data: TableRow[];
    setData: React.Dispatch<React.SetStateAction<TableRow[]>>;
    loadingCells: Set<string>;
    onErrorMessagesUpdate: (errorMessages: Map<string, string>) => void;
}

const Table: React.FC<TableProps> = ({ data, setData, loadingCells, onErrorMessagesUpdate }) => {
    const [sortedColumn, setSortedColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [editingCell, setEditingCell] = useState<{ row: number; col: keyof TableRow } | null>(null);
    const [cellColors, setCellColors] = useState<Map<string, string>>(new Map());
    const [errorMessages, setErrorMessages] = useState<Map<string, string>>(new Map());
    const [originalValues, setOriginalValues] = useState<Map<string, string>>(new Map());

    const convertKeyToLabel = (key: string) => {
        return key
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
            .replace(/^\w/, c => c.toUpperCase());
    };

    const getCellId = (rowIndex: number, colKey: keyof TableRow) => `${rowIndex}-${colKey}`;

    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleCellClick = (rowIndex: number, colKey: keyof TableRow) => {
        setEditingCell({ row: rowIndex, col: colKey });
        const cellId = getCellId(rowIndex, colKey);
        setOriginalValues(prev => new Map(prev).set(cellId, data[rowIndex][colKey] as string));
    };

    const handleBlur = (rowIndex: number, colKey: keyof TableRow, value: string) => {
        setEditingCell(null);
        const cellId = getCellId(rowIndex, colKey);
        const originalValue = originalValues.get(cellId) || '';
        let color = '';
        let errorMessage = '';

        if (value == "") {
            color = 'bg-red-100';
            errorMessage = 'This field cannot be empty';
            setCellColors(prev => {
                const updated = new Map(prev);
                updated.set(cellId, color);
                return updated;
            });
        } else if (value !== originalValue) {
            if (colKey === 'email') {
                if (!isValidEmail(value)) {
                    color = 'bg-red-100';
                    errorMessage = 'Email is invalid';
                } else {
                    const emailExists = data.some((row, index) => row.email === value && index !== rowIndex);
                    if (emailExists) {
                        color = 'bg-red-100';
                        errorMessage = 'Email address is not unique';
                    } else {
                        color = 'bg-green-100';
                    }
                }
            } else {
                color = 'bg-green-100';
            }

            setCellColors(prev => {
                const updated = new Map(prev);
                updated.set(cellId, color);
                return updated;
            });
        } else {
            setCellColors(prev => {
                const updated = new Map(prev);
                updated.delete(cellId);
                return updated;
            });
        }

        setErrorMessages(prev => {
            const updated = new Map(prev);
            updated.set(cellId, errorMessage);
            onErrorMessagesUpdate(updated);
            return updated;
        });
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

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, rowIndex: number, colKey: keyof TableRow) => {
        const newValue = event.target.value;
        const newData = [...data];
        newData[rowIndex] = { ...newData[rowIndex], [colKey]: newValue };
        setData(newData);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-gray-500 text-left border border-gray-300">
                        {Object.keys(data[0] || {}).filter(key => key !== 'id').map((key, index) => (
                            <th
                                key={index}
                                className="p-4 hover:bg-gray-200 hover:cursor-pointer relative group w-1/5"
                                onClick={() => handleSort(key as keyof TableRow)}
                            >
                                <span className="flex items-center text-gray-700">
                                    {convertKeyToLabel(key)}
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
                        <tr key={rowIndex} className="border border-gray-300 h-16">
                            {(['firstName', 'lastName', 'position', 'phone', 'email'] as (keyof TableRow)[]).map((colKey) => {
                                const cellId = getCellId(rowIndex, colKey);
                                const cellColor = cellColors.get(cellId) || '';
                                const errorMessage = errorMessages.get(cellId) || '';
                                const isLoading = loadingCells.has(cellId);

                                return (
                                    <td
                                        key={colKey}
                                        className={`relative p-4 cursor-pointer group ${editingCell?.row === rowIndex && editingCell.col === colKey ? 'border-b-2 border-sky-400' : ''} ${cellColor}`}
                                        onClick={() => handleCellClick(rowIndex, colKey)}
                                    >
                                        {editingCell?.row === rowIndex && editingCell.col === colKey ? (
                                            <input
                                                type="text"
                                                value={row[colKey]}
                                                onChange={(e) => handleInputChange(e, rowIndex, colKey)}
                                                onBlur={() => handleBlur(rowIndex, colKey, String(row[colKey]))}
                                                className={`w-full h-full outline-none ${cellColor}`}
                                                autoFocus
                                            />
                                        ) : (
                                            <>
                                                {row[colKey]}
                                                {errorMessage && (
                                                    <div
                                                        className={`absolute left-0 bg-red-500 text-white text-xs p-1 rounded z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                                                        style={{ whiteSpace: 'nowrap', top: '100%' }}
                                                    >
                                                        {errorMessage}
                                                    </div>
                                                )}
                                                {isLoading && (
                                                    <div className="absolute right-2 inset-0 flex items-center justify-end">
                                                        <div className="w-5 h-5 border-4 border-t-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin" />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
