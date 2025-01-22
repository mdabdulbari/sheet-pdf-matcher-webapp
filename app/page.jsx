"use client";
import React, { useEffect, useState } from "react";
import { Box, Button, Grid2 as Grid, Paper } from "@mui/material";
import SpreadsheetViewer from "./components/SpreadsheetViewer";
import PdfViewer from "./components/PdfViewer";
import Header from "./components/Header";

const FileUploadPage = () => {
	const [spreadsheetData, setSpreadsheetData] = useState([]);
	const [pdfData, setPdfData] = useState(null);
	const [matchedData, setMatchedData] = useState(null);
	const [hoverRowId, setHoverRowId] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [downloadSheet, setDownloadSheet] = useState(false);

	const normalizeNumber = (value) => Math.floor(value);

	useEffect(() => {
		if (hoverRowId && matchedData) {
			const matchedRow = matchedData.find((row) => row.id === hoverRowId);
			if (matchedRow) {
				setSearchTerm(matchedRow.pdfData.description);
			}
		} else {
			setSearchTerm("");
		}
	}, [hoverRowId]);

	// Function to parse values as numbers
	const parseToNumber = (value) => {
		if (!value) return 0;
		const sanitizedValue = value.toString().replace(/,/g, "");
		return parseFloat(sanitizedValue);
	};

	// Function to compare balance values
	const compareBalances = (spreadsheetBalance, pdfBalance) => {
		const normalizedBalanceSpreadsheet =
			normalizeNumber(spreadsheetBalance);
		const normalizedBalancePdf = pdfBalance
			? normalizeNumber(parseToNumber(pdfBalance))
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
		const normalizedCreditSpreadsheet = normalizeNumber(
			spreadsheetCredit || 0
		);
		const normalizedDebitSpreadsheet = normalizeNumber(
			spreadsheetDebit || 0
		);
		const normalizedCreditPdf = normalizeNumber(
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
		return spreadsheetData
			.map((spreadsheetRecord) => {
				// Find a matching pdfRecord based on your conditions
				const matchedPdfRecord = pdfData.find((pdfRecord) => {
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

				// If a match is found, return the combined object
				if (matchedPdfRecord) {
					return {
						...spreadsheetRecord,
						pdfData: { ...matchedPdfRecord },
					};
				}

				// If no match is found, return null (so it can be filtered out)
				return null;
			})
			.filter(Boolean); // Filter out null values, keeping only matched records
	};

	useEffect(() => {
		if (!matchedData && spreadsheetData.length !== 0 && pdfData) {
			const matched = findMatchedData(spreadsheetData, pdfData);
			if (matched.length) {
				setMatchedData(matched);

				const updatedSpreadsheetData = spreadsheetData.map((row) => {
					if (
						matched.some((matchedRow) => matchedRow.id === row.id)
					) {
						const updatedRow = { ...row };
						updatedRow["Match Status"] = "Matched";
						return updatedRow;
					}
					return row;
				});

				setSpreadsheetData(updatedSpreadsheetData);
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
						{spreadsheetData.length !== 0 && (
							<Button onClick={() => setDownloadSheet(true)}>
								Download Sheet
							</Button>
						)}
						<SpreadsheetViewer
							spreadsheetData={spreadsheetData}
							setSpreadsheetData={setSpreadsheetData}
							setHoverRowId={setHoverRowId}
							downloadSheet={downloadSheet}
							setDownloadSheet={setDownloadSheet}
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
