
import * as XLSX from 'xlsx';
import fs from 'fs';

const filePath = 'c:\\vassu\\subway-sales-purchase\\data\\Book1.xlsx';

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets['2026 Sale Analysis'];
    const data = XLSX.utils.sheet_to_json(sheet);

    const storeMap = {
        'BAKER ST': 'S1',
        'SWISS COTTAGE': 'S2',
        'CAMDEN': 'S3',
        'HARINGEY': 'S4',
        'EXCEL': 'S5',
        'TOTTENHAM': 'S6',
        'GALLIONS': 'S7',
        'VICTORIA': 'S8',
        '17 & CENTRAL': 'S9',
        'HOESTREET': 'S10'
    };

    let storePerformance = [];

    data.forEach((row, idx) => {
        let shopName = row['SHOP NAME'] ? row['SHOP NAME'].toString().trim().toUpperCase() : '';
        let storeId = storeMap[shopName] || null;

        if (storeId && row['WEEK']) {
            let sales = parseFloat(row['\r\nNET SALE '] || 0);
            let net = sales - parseFloat(row['VAT'] || 0);
            let labour = parseFloat(row['LABOUR %'] || 0);
            let vat = parseFloat(row['VAT'] || 0);
            let royalties = parseFloat(row['8 % ROYLTY'] || 0);
            let foodCost = parseFloat(row['ESTIMATED 33% FOOD COST'] || 0);
            let comm = parseFloat(row['15%COMM ON DELV'] || 0);
            let income = parseFloat(row['INCOME'] || 0);

            storePerformance.push({
                id: idx + 1,
                storeId: storeId,
                week: row['WEEK'].toString().substring(0, 15),
                sales, net, labour, vat, royalties, foodCost, comm, income
            });
        }
    });

    fs.writeFileSync('c:\\vassu\\subway-sales-purchase\\src\\data\\storePerformance.json', JSON.stringify(storePerformance, null, 2));
    console.log(`Generated ${storePerformance.length} performance records.`);

} catch (error) {
    console.error('Error reading Excel file:', error.message);
}
