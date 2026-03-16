
import * as XLSX from 'xlsx';
import fs from 'fs';

const filePath = 'c:\\vassu\\subway-sales-purchase\\data\\Book1.xlsx';

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    console.log('Sheet Names:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        console.log(`\n--- Data for Sheet: ${sheetName} ---`);
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        console.log(`Rows: ${data.length}`);
        if (data.length > 0) {
            console.log('Sample Data (First 3 rows):');
            console.log(JSON.stringify(data.slice(0, 3), null, 2));
            console.log('Keys:', Object.keys(data[0]));
        }
    });

} catch (error) {
    console.error('Error reading Excel file:', error.message);
}
