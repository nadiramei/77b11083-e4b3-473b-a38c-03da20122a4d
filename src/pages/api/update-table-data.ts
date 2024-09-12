import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type Data = {
    rowIndex: number;
    colKey: string;
    value: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'PUT') {
        const { rowIndex, colKey, value }: Data = req.body;

        const filePath = path.join(process.cwd(), 'public', 'data.json');
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        jsonData[rowIndex][colKey] = value;

        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));

        res.status(200).json({ message: 'Data updated successfully' });
    } else {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
