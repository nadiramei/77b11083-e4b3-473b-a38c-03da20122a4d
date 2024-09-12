import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'public', 'data.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        try {
            const { rowIndex }: { rowIndex: number } = req.body;

            const fileContents = fs.readFileSync(dataFilePath, 'utf-8');
            const data = JSON.parse(fileContents);

            data.splice(rowIndex, 1);

            fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));

            res.status(200).json({ message: 'Row deleted successfully' });
        } catch (error) {
            console.error('Error deleting row:', error);
            res.status(500).json({ error: 'Failed to delete row' });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
