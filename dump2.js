
import * as XLSX from 'xlsx';
import fs from 'fs';

const wb = XLSX.read(fs.readFileSync('c:\\vassu\\subway-sales-purchase\\data\\Book1.xlsx'), { type: 'buffer' });

const sheet = wb.Sheets['2026 Sale Analysis'];
const data = XLSX.utils.sheet_to_json(sheet);

let hasData = false;
for (let row of data) {
    if (parseFloat(row['\r\nNET SALE ']) !== 0 || parseFloat(row['INCOME']) !== 0) {
        console.log("NON-ZERO ROW:", row);
        hasData = true;
        break;
    }
}
if (!hasData) console.log("NO NON-ZERO DATA FOUND IN '2026 Sale Analysis'.");
