import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface ErrorResponse {
    message: string;
}

interface TableRow {
    firstName: string;
    lastName: string;
    position: string;
    phone: string;
    email: string;
}

type DataResponse = TableRow[] | ErrorResponse;

export default function handler(req: NextApiRequest, res: NextApiResponse<DataResponse>) {
    if (req.method === 'GET') {
        const filePath = path.join(process.cwd(), 'public', 'data.json');

        try {
            const fileContents = fs.readFileSync(filePath, 'utf8');
            const data: TableRow[] = JSON.parse(fileContents);
            res.status(200).json(data);
        } catch (error) {
            console.error('Error reading or parsing JSON file:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
