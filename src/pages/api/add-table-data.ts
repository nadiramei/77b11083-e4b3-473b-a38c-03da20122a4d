import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type TableRow = {
    id: number;
    [key: string]: string | number;
};

type Data = TableRow[];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const newRows: TableRow[] = req.body;

        if (!Array.isArray(newRows)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        const filePath = path.join(process.cwd(), 'public', 'data.json');
        let jsonData: Data;

        try {
            jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (error) {
            console.error("Error reading data file:", error);
            return res.status(500).json({ error: 'Error reading data file' });
        }

        jsonData = [...newRows, ...jsonData];

        try {
            fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
        } catch (error) {
            console.error("Error writing data file:", error);
            return res.status(500).json({ error: 'Error writing data file' });
        }

        res.status(200).json({ message: 'New rows added successfully' });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
