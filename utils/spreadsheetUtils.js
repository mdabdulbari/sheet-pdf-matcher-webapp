import * as XLSX from "xlsx";

export const parseSpreadsheet = async (file) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			const data = new Uint8Array(event.target.result);
			const workbook = XLSX.read(data, { type: "array" });
			const sheetName = workbook.SheetNames[0];
			const sheet = workbook.Sheets[sheetName];

			try {
				const rawSheetData = XLSX.utils.sheet_to_json(sheet, {
					header: 1,
				});

				const headerRowIndex = findHeaderRow(rawSheetData);
				if (headerRowIndex === -1) {
					reject("No valid header row found in the uploaded file.");
					return;
				}

				const { headers, dataRows } = processData(
					rawSheetData,
					headerRowIndex
				);
				const cols = generateColumns(headers);
				const formattedRows = formatRows(headers, dataRows);

				resolve({ cols, formattedRows });
			} catch (error) {
				reject(
					"Failed to parse the Spreadsheet. Please check its format."
				);
			}
		};

		reader.readAsArrayBuffer(file);
	});
};

const findHeaderRow = (rawSheetData) => {
	return rawSheetData.findIndex(
		(row) =>
			Array.isArray(row) &&
			row.some(
				(cell) => typeof cell === "string" && cell.trim() === "Date"
			)
	);
};

const processData = (rawSheetData, headerRowIndex) => {
	const rawHeaders = rawSheetData[headerRowIndex];
	const headers = rawHeaders.map((header, index) =>
		header && header.trim() ? header.trim() : `Column ${index + 1}`
	);

	const dataRows = rawSheetData
		.slice(headerRowIndex + 1)
		.filter(
			(row) =>
				Array.isArray(row) &&
				row.some(
					(cell) => cell !== null && cell !== undefined && cell !== ""
				)
		);

	return { headers, dataRows };
};

const generateColumns = (headers) => {
	return headers.map((col, index) => ({
		key: `col_${index}`,
		name: col,
		editable: true,
	}));
};

const formatRows = (headers, dataRows) => {
	return dataRows.map((row, rowIndex) => {
		const rowObject = {};
		headers.forEach((header, colIndex) => {
			rowObject[`col_${colIndex}`] = row[colIndex] || null;
		});
		return { id: rowIndex + 1, ...rowObject };
	});
};
