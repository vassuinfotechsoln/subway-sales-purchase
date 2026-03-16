
import * as XLSX from 'xlsx';
import fs from 'fs';

const wb = XLSX.read(fs.readFileSync('c:\\vassu\\subway-sales-purchase\\data\\Book1.xlsx'), { type: 'buffer' });

const sheet = wb.Sheets['Weekly Sale 2026'];
const data = XLSX.utils.sheet_to_json(sheet);

let hasData = false;
for (let row of data) {
    if (parseFloat(row['Net']) !== 0 || parseFloat(row['Income']) !== 0) {
        if (!Number.isNaN(parseFloat(row['Net'])) || !Number.isNaN(parseFloat(row['Income']))) {
            console.log("NON-ZERO ROW:", row);
            hasData = true;
            break;
        }
    }
}
if (!hasData) console.log("NO NON-ZERO DATA FOUND IN 'Weekly Sale 2026'.");
