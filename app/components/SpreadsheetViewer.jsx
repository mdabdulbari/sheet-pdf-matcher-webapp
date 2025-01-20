"use client";
import React, { useState } from "react";
import { Button, Typography } from "@mui/material";
import { parseExcelFile } from "@/utils/spreadsheetUtils";
import HandsontableWrapper from "./Table/HandsontableWrapper";

const SpreadsheetViewer = () => {
	const [rows, setRows] = useState([]);
	const [columns, setColumns] = useState([]);

	const handleFileSelection = (e) => {
		const file = e.target.files[0];
		if (file) {
			handleFileReading(file);
		} else {
			alert("No file selected.");
		}
	};

	const handleFileReading = (file) => {
		parseExcelFile(file)
			.then(({ cols, formattedRows }) => {
				updateColumns(cols);
				updateRows(formattedRows);
			})
			.catch((error) => {
				console.error(error);
				alert(error);
			});
	};

	const updateColumns = (cols) => {
		setColumns(cols);
	};

	const updateRows = (formattedRows) => {
		setRows(formattedRows);
	};

	const createHandsontableData = (columns, rows) => {
		// Ensure columns and rows are defined
		if (!columns || !rows) return [];

		// Transform rows into a Handsontable-compatible 2D array
		return rows.map((row) => columns.map((col) => row[col.key || col]));
	};

	// Example usage
	const data = createHandsontableData(columns, rows);

	return (
		<>
			{columns.length > 0 && rows.length > 0 ? (
				<HandsontableWrapper data={data} />
			) : (
				<>
					<Typography variant="h6" gutterBottom>
						Upload Excel Sheet
					</Typography>
					<Button
						variant="contained"
						component="label"
						sx={{ mb: 2 }}
					>
						Choose Excel File
						<input
							type="file"
							accept=".xls,.xlsx"
							onChange={handleFileSelection}
							hidden
						/>
					</Button>
				</>
			)}
		</>
	);
};

export default SpreadsheetViewer;
