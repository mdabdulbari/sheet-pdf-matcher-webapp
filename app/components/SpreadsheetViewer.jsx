"use client";
import React from "react";
import { Button, Typography } from "@mui/material";
import { parseSpreadsheet } from "@/utils/spreadsheetUtils";
import HandsontableWrapper from "./Table/HandsontableWrapper";

const SpreadsheetViewer = ({
	spreadsheetData,
	setSpreadsheetData,
	setHoverRowId,
}) => {
	const handleFileSelection = (e) => {
		const file = e.target.files[0];
		if (file) {
			handleFileReading(file);
		} else {
			alert("No file selected.");
		}
	};

	const handleFileReading = (file) => {
		parseSpreadsheet(file)
			.then((dataRows) => {
				updateRows(dataRows);
			})
			.catch((error) => {
				console.error(error);
				alert(error);
			});
	};

	const updateRows = (formattedRows) => {
		setSpreadsheetData(formattedRows);
	};

	return (
		<>
			{spreadsheetData.length > 0 ? (
				<HandsontableWrapper
					data={spreadsheetData}
					setHoverRowId={setHoverRowId}
				/>
			) : (
				<>
					<Typography variant="h6" gutterBottom>
						Upload Spreadsheet
					</Typography>
					<Button
						variant="contained"
						component="label"
						sx={{ mb: 2 }}
					>
						Choose Spreadhseet
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
