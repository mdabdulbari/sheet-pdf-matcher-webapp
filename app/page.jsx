"use client";
import React, { useEffect, useState } from "react";
import { Box, Grid2 as Grid, Paper } from "@mui/material";
import SpreadsheetViewer from "./components/SpreadsheetViewer";
import PdfViewer from "./components/PdfViewer";
import Header from "./components/Header";

const FileUploadPage = () => {
	const [spreadsheetData, setSpreadsheetData] = useState([]);
	const [pdfData, setPdfData] = useState(null);
	const [matchedData, setMatchedData] = useState(null);

	const [searchTerm, setSearchTerm] = useState("");

	const normalizeValue = (value) => Math.floor(value);

	// Function to parse values as numbers
	const parseToNumber = (value) => {
		if (!value) return 0;
		const sanitizedValue = value.toString().replace(/,/g, "");
		return parseFloat(sanitizedValue);
	};

	// Function to compare balance values
	const compareBalances = (spreadsheetBalance, pdfBalance) => {
		const normalizedBalanceSpreadsheet = normalizeValue(spreadsheetBalance);
		const normalizedBalancePdf = pdfBalance
			? normalizeValue(parseToNumber(pdfBalance))
			: null;
		return (
			normalizedBalanceSpreadsheet === normalizedBalancePdf &&
			normalizedBalanceSpreadsheet !== 0
		);
	};

	// Function to compare credits and debits
	const compareCreditsDebits = (
		spreadsheetCredit,
		spreadsheetDebit,
		pdfCredit
	) => {
		const normalizedCreditSpreadsheet = normalizeValue(
			spreadsheetCredit || 0
		);
		const normalizedDebitSpreadsheet = normalizeValue(
			spreadsheetDebit || 0
		);
		const normalizedCreditPdf = normalizeValue(
			parseToNumber(pdfCredit || 0)
		);

		return (
			(normalizedDebitSpreadsheet !== 0 &&
				normalizedDebitSpreadsheet === normalizedCreditPdf) ||
			(normalizedCreditSpreadsheet !== 0 &&
				normalizedCreditSpreadsheet === normalizedCreditPdf)
		);
	};

	// Function to find matched data based on comparison functions
	const findMatchedData = (spreadsheetData, pdfData) => {
		return spreadsheetData.filter((spreadsheetRecord) => {
			return pdfData.some((pdfRecord) => {
				const balanceMatch = compareBalances(
					spreadsheetRecord.balance,
					pdfRecord.balance
				);
				const creditDebitMatch = compareCreditsDebits(
					spreadsheetRecord.Credits,
					spreadsheetRecord.Debits,
					pdfRecord.credit
				);

				return balanceMatch || creditDebitMatch;
			});
		});
	};

	// Main useEffect hook
	useEffect(() => {
		if (!matchedData && spreadsheetData.length !== 0 && pdfData) {
			const matched = findMatchedData(spreadsheetData, pdfData);
			if (matched.length) {
				setMatchedData(matched);
			}
		}
	}, [spreadsheetData, pdfData]);

	return (
		<Box
			sx={{
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Header title="Ledger & Statement Matcher" />
			<Grid container spacing={2} sx={{ padding: 2, flexGrow: 1 }}>
				<Grid sx={{ overflowX: "hidden" }} size={6}>
					<Paper
						variant="outlined"
						sx={{
							height: "100%",
							padding: 2,
							boxSizing: "border-box",
						}}
					>
						<SpreadsheetViewer
							spreadsheetData={spreadsheetData}
							setSpreadsheetData={setSpreadsheetData}
						/>
					</Paper>
				</Grid>
				<Grid size={6}>
					<Paper
						variant="outlined"
						sx={{
							height: "100%",
							padding: 2,
							boxSizing: "border-box",
						}}
					>
						<PdfViewer
							searchTerm={searchTerm}
							setSearchTerm={setSearchTerm}
							pdfData={pdfData}
							setPdfData={setPdfData}
						/>
					</Paper>
				</Grid>
			</Grid>
		</Box>
	);
};

export default FileUploadPage;
