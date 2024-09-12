"use client";

import Table from "@/components/Table";
import { useEffect, useState } from "react";
import { FaPlus, FaSave, FaArrowLeft } from 'react-icons/fa';

interface TableRow {
    id: number;
    firstName: string;
    lastName: string;
    position: string;
    phone: string;
    email: string;
}

const Home: React.FC = () => {
    const [data, setData] = useState<TableRow[]>([]);
    const [localData, setLocalData] = useState<TableRow[]>([]);
    const [loadingCells, setLoadingCells] = useState<Set<string>>(new Set());
    const [errorMessages, setErrorMessages] = useState<Map<string, string>>(new Map());

    const handleErrorMessagesUpdate = (newErrorMessages: Map<string, string>) => {
        setErrorMessages(newErrorMessages);
    };

    const getCellId = (rowIndex: number, colKey: keyof TableRow) => `${rowIndex}-${colKey}`;

    const addRow = () => {
        const newRow: TableRow = {
            id: Date.now(),
            firstName: '',
            lastName: '',
            position: '',
            phone: '',
            email: '',
        };

        setLocalData(prevData => [newRow, ...prevData]);
    };

    const handleSave = async () => {
        const newRows: TableRow[] = [];
        const updates: { rowIndex: number; colKey: keyof TableRow; value: string }[] = [];

        localData.forEach((localRow, index) => {
            if (!data.some(originalRow => originalRow.id === localRow.id)) {
                newRows.push(localRow);
            } else {
                const originalRow = data.find(row => row.id === localRow.id);
                if (originalRow) {
                    (Object.keys(localRow) as (keyof TableRow)[]).forEach((colKey) => {
                        if (localRow[colKey] !== originalRow[colKey]) {
                            updates.push({
                                rowIndex: index,
                                colKey,
                                value: localRow[colKey] as string,
                            });
                        }
                    });
                }
            }
        });

        if (newRows.length > 0) {
            const newRowCellIds = newRows.map((row) => {
                const lastColKey = (Object.keys(row) as (keyof TableRow)[]).pop();
                return lastColKey ? getCellId(newRows.indexOf(row), lastColKey) : null;
            }).filter(id => id !== null);

            setLoadingCells(prev => new Set([...prev, ...newRowCellIds]));
            try {
                const response = await fetch("/api/add-table-data", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newRows),
                });

                if (!response.ok) {
                    throw new Error("Failed to add new rows");
                }

                console.log("New rows added successfully");
            } catch (error) {
                console.error("Error adding new rows:", error);
            } finally {
                setLoadingCells(new Set());
            }
        }

        if (updates.length > 0) {
            try {
                for (const update of updates) {
                    const cellId = getCellId(update.rowIndex, update.colKey);
                    setLoadingCells(prev => new Set(prev).add(cellId));

                    const response = await fetch("/api/update-table-data", {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(update),
                    });

                    if (!response.ok) {
                        throw new Error("Failed to update data");
                    }

                    console.log(`Updated: row ${update.rowIndex}, col ${update.colKey}`);
                }
            } catch (error) {
                console.error("Error updating data:", error);
            } finally {
                setLoadingCells(new Set());
            }
        }
    };


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/table-data");
                if (!response.ok) throw new Error("Network response was not ok");
                const result: TableRow[] = await response.json();
                setData(result);
                setLocalData(result);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="p-4">
            <div className="flex flex-row justify-end gap-8 m-8">
                <button onClick={addRow}>
                    <FaPlus className="text-lg" />
                </button>
                <button onClick={handleSave} disabled={errorMessages.size > 0}>
                    <FaSave className={`text-lg ${errorMessages.size > 0 ? "text-gray-400" : "text-black"}`} />
                </button>
                <button>
                    <FaArrowLeft className="text-lg" />
                </button>
            </div>
            <Table data={localData} setData={setLocalData} loadingCells={loadingCells} onErrorMessagesUpdate={handleErrorMessagesUpdate} />
        </div>
    );
};

export default Home;