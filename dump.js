
import * as XLSX from 'xlsx';
import fs from 'fs';

const wb = XLSX.read(fs.readFileSync('c:\\vassu\\subway-sales-purchase\\data\\Book1.xlsx'), { type: 'buffer' });

for (let name of wb.SheetNames) {
    console.log("\nSheet:", name);
    let data = XLSX.utils.sheet_to_json(wb.Sheets[name]);
    if (data.length > 0) {
        console.log("Cols:", Object.keys(data[0]));
        for (let i = 0; i < Math.min(5, data.length); i++) {
            console.log("  Row", i, JSON.stringify(data[i]));
        }
    }
}
