#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('Usage: node scripts/generate-vietnam-communes.js <address.json> <output.js>');
  process.exit(1);
}

const database = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const provincesTable = database.find(item => item.type === 'table' && item.name === 'provinces');
const wardsTable = database.find(item => item.type === 'table' && item.name === 'wards');

if (!provincesTable || !wardsTable) {
  throw new Error('Không tìm thấy bảng provinces/wards trong nguồn dữ liệu.');
}

const provinces = provincesTable.data
  .map(province => ({
    code: province.province_code,
    name: province.name,
    shortName: province.name.replace(/^Thành phố\s+/u, '')
  }))
  .sort((a, b) => a.code.localeCompare(b.code));

const communes = wardsTable.data
  .filter(unit => unit.name.startsWith('Xã '))
  .map(commune => ({
    code: commune.ward_code,
    provinceCode: commune.province_code,
    name: commune.name
  }))
  .sort((a, b) => a.provinceCode.localeCompare(b.provinceCode) || a.name.localeCompare(b.name, 'vi'));

if (provinces.length !== 34 || wardsTable.data.length !== 3321 || communes.length !== 2621) {
  throw new Error(`Số lượng dữ liệu không khớp: ${provinces.length} tỉnh, ${wardsTable.data.length} đơn vị cấp xã, ${communes.length} xã.`);
}

const content = `// Generated file — do not edit manually.\n` +
  `// Source: vietnam-address-database@1.0.0 (MIT), based on Vietnam's 2025 administrative reform.\n` +
  `// Filter rule for route locations: include all 2,621 communes; exclude wards and special zones.\n` +
  `const VN_ADMINISTRATIVE_VERSION = '2025-07-01';\n` +
  `const VN_PROVINCES_2025 = ${JSON.stringify(provinces, null, 2)};\n` +
  `const VN_COMMUNES_2025 = ${JSON.stringify(communes, null, 2)};\n`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, content);
console.log(`Generated ${outputPath}: ${provinces.length} provinces, ${communes.length} communes.`);
