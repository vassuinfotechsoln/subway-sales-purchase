
import * as XLSX from 'xlsx';
import fs from 'fs';

const filePath = 'c:\\vassu\\subway-sales-purchase\\data\\Book1.xlsx';

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    const sheetName = 'Monthly Sale 2026';
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // The data seems to have headers at row 1 or 2.
    // Let's print the first 20 rows to understand the structure better.
    console.log(JSON.stringify(data.slice(0, 20), null, 2));

} catch (error) {
    console.error('Error reading Excel file:', error.message);
}
