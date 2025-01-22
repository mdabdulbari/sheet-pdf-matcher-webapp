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

				const rows = processData(rawSheetData, headerRowIndex);

				resolve(rows);
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

	// Add 'Match Status' to the headers if not present
	if (!headers.includes("Match Status")) {
		headers.push("Match Status");
	}

	const dataRows = rawSheetData
		.slice(headerRowIndex + 1)
		.filter(
			(row) =>
				Array.isArray(row) &&
				row.some(
					(cell) => cell !== null && cell !== undefined && cell !== ""
				)
		);

	const formattedRows = dataRows.map((row, rowIndex) => {
		const rowObject = headers.reduce((acc, header, index) => {
			acc[header] = row[index] || null;
			return acc;
		}, {});

		if (!rowObject["Match Status"]) {
			rowObject["Match Status"] = "";
		}

		return { id: rowIndex + 1, ...rowObject };
	});

	return formattedRows;
};

const generateColumns = (headers) => {
	return headers.map((col, index) => ({
		key: `col_${index}`,
		name: col,
		editable: true,
	}));
};
