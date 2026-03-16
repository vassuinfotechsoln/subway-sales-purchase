import * as XLSX from 'xlsx';
import fs from 'fs';

try {
    const fileBuffer = fs.readFileSync('c:/Users/Prince/Music/subway-sales-purchase/data/Book1.xlsx');
    const wb = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log('HEADERS:', JSON.stringify(data[0]));
    console.log('SAMPLE ROW:', JSON.stringify(data[1]));
} catch (e) {
    console.error('ERROR:', e.message);
}
