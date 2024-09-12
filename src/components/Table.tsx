"use client";

import React, { useState } from 'react';
import { FaLongArrowAltDown, FaLongArrowAltUp, FaTrashAlt } from 'react-icons/fa';

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
    handleDelete: (rowIndex: number) => void;
}

const Table: React.FC<TableProps> = ({ data, setData, loadingCells, onErrorMessagesUpdate, handleDelete }) => {
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

        let errorColor = "bg-red-100 dark:bg-red-600";
        let successColor = "bg-green-100 dark:bg-green-600";

        if (value == "") {
            color = errorColor;
            errorMessage = 'This field cannot be empty';
            setCellColors(prev => {
                const updated = new Map(prev);
                updated.set(cellId, color);
                return updated;
            });
        } else if (value !== originalValue) {
            if (colKey === 'email') {
                if (!isValidEmail(value)) {
                    color = errorColor;
                    errorMessage = 'Email is invalid';
                } else {
                    const emailExists = data.some((row, index) => row.email === value && index !== rowIndex);
                    if (emailExists) {
                        color = errorColor;
                        errorMessage = 'Email address is not unique';
                    } else {
                        color = successColor;
                    }
                }
            } else if (colKey === 'phone') {
                const phoneRegex = /^[0-9\s\(\)-]+$/;

                if (!phoneRegex.test(value)) {
                    color = errorColor;
                    errorMessage = 'Phone number contains invalid characters';
                } else {
                    const digitCount = (value.match(/\d/g) || []).length;

                    if (digitCount < 7) {
                        color = errorColor;
                        errorMessage = 'Phone number must contain at least 7 digits';
                    } else {
                        color = successColor;
                    }
                }
            } else {
                color = successColor;
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

            if (errorMessage === '') {
                updated.delete(cellId);
            } else {
                updated.set(cellId, errorMessage);
            }

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
                    <tr className="bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-50 text-left border border-gray-300 dark:border-gray-600">
                        {Object.keys(data[0] || {}).filter(key => key !== 'id').map((key, index) => (
                            <th
                                key={index}
                                className={`p-4 relative hover:bg-gray-200 hover:dark:bg-slate-600 group w-1/5 ${cellColors.size > 0 ? 'cursor-not-allowed' : 'hover:cursor-pointer'}`}
                                onClick={() => {
                                    if (cellColors.size === 0) {
                                        handleSort(key as keyof TableRow);
                                    }
                                }}
                                style={{ pointerEvents: cellColors.size > 0 ? 'none' : 'auto' }}
                            >
                                <span className="flex items-center">
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
                        <tr key={rowIndex} className="border border-gray-300 dark:border-gray-600 h-16 group relative">
                            {(['firstName', 'lastName', 'position', 'phone', 'email'] as (keyof TableRow)[]).map((colKey) => {
                                const cellId = getCellId(rowIndex, colKey);
                                const cellColor = cellColors.get(cellId) || '';
                                const errorMessage = errorMessages.get(cellId) || '';
                                const isLoading = loadingCells.has(cellId);

                                return (
                                    <td
                                        key={colKey}
                                        className={`relative p-4 cursor-pointer group dark:bg-slate-900 ${editingCell?.row === rowIndex && editingCell.col === colKey ? 'border-b-2 border-sky-400' : ''} ${cellColor}`}
                                        onClick={() => handleCellClick(rowIndex, colKey)}
                                    >
                                        {editingCell?.row === rowIndex && editingCell.col === colKey ? (
                                            <input
                                                type="text"
                                                value={row[colKey]}
                                                onChange={(e) => handleInputChange(e, rowIndex, colKey)}
                                                onBlur={() => handleBlur(rowIndex, colKey, String(row[colKey]))}
                                                className={`w-full h-full outline-none bg-transparent ${cellColor}`}
                                                autoFocus
                                            />
                                        ) : (
                                            <div className="group">
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
                                                        <div className="w-5 h-5 border-4 border-t-4 border-blue-500 dark:border-blue-200 border-t-transparent border-solid rounded-full animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                            <td className="absolute right-0 top-1/2 transform -translate-y-1/2 w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={() => handleDelete(rowIndex)}
                                    className="text-red-500 dark:bg-white hover:dark:bg-slate-200 bg-stone-50 mr-2 p-2 rounded-full hover:text-red-700"
                                >
                                    <FaTrashAlt className="text-lg" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
