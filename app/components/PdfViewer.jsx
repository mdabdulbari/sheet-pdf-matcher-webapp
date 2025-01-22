"use client";
import React, { useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { getDocument } from "pdfjs-dist";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Button, TextField, Typography } from "@mui/material";

const PdfViewer = ({ searchTerm, setSearchTerm, pdfData, setPdfData }) => {
	const [pdfFile, setPdfFile] = useState(null);
	//   // Text Extraction
	//   const handlePdfUpload = async (e) => {
	//     const file = e.target.files[0];
	//     if (file) {
	//       const fileUrl = URL.createObjectURL(file);
	//       setPdfFile(fileUrl);

	//       // Parse the PDF and log its content
	//       const pdf = await getDocument(fileUrl).promise;
	//       let fullText = "";

	//       for (let i = 0; i < pdf.numPages; i++) {
	//         const page = await pdf.getPage(i + 1);
	//         const textContent = await page.getTextContent();

	//         // Group text items by their Y-coordinate (line by line)
	//         const lines = {};
	//         textContent.items.forEach((item) => {
	//           const y = item.transform[5]; // Y-coordinate
	//           if (!lines[y]) {
	//             lines[y] = [];
	//           }
	//           lines[y].push(item.str);
	//         });

	//         // Convert the lines object into an array sorted by Y-coordinate
	//         const sortedLines = Object.keys(lines)
	//           .sort((a, b) => b - a) // Sort lines by Y-coordinate descending (top to bottom)
	//           .map((y) => lines[y].join(" ")); // Join all items in the same line

	//         // Combine all lines for the current page
	//         fullText += `Page ${i + 1}:\n${sortedLines.join("\n")}\n\n`;
	//       }

	//       setParsedContent(fullText);
	//       console.log("Parsed PDF Content Line by Line:\n", fullText);
	//     }
	//   };

	// Table Array Extraction line by line
	const handlePdfUpload = async (e) => {
		const file = e.target.files[0];
		if (file) {
			const fileUrl = URL.createObjectURL(file);
			setPdfFile(fileUrl);

			const pdf = await getDocument(fileUrl).promise;
			let extractedTables = [];

			for (let i = 0; i < pdf.numPages; i++) {
				const page = await pdf.getPage(i + 1);
				const textContent = await page.getTextContent();

				const rows = {};
				textContent.items.forEach((item) => {
					const y = item.transform[5];
					if (!rows[y]) {
						rows[y] = [];
					}
					rows[y].push(item);
				});

				const sortedRows = Object.keys(rows)
					.sort((a, b) => b - a)
					.map((y) => rows[y]);

				const table = sortedRows.map((rowItems) => {
					return rowItems
						.sort((a, b) => a.transform[4] - b.transform[4])
						.map((item) => item.str);
				});

				const structuredTable = table.map((row) => {
					let date = "";
					let credit = "";
					let debit = "";
					let balance = "";
					let description = [];

					row.forEach((item) => {
						// Check if the item matches a date format (MM/DD/YYYY)
						if (/^\d{2}\/\d{2}\/\d{4}$/.test(item)) {
							date = item;
						}
						// Check if the item matches a credit/debit/balance format
						else if (/^\d{1,3}(?:,\d{3})*(?:\.\d{2})$/.test(item)) {
							if (credit === "") {
								credit = item;
							} else {
								balance = item;
							}
						} else {
							description.push(item);
						}
					});

					description = description.join(" ").trim();

					return {
						date: date,
						description: description,
						credit: credit,
						debit: debit,
						balance: balance,
						page: i + 1,
					};
				});

				extractedTables = [...extractedTables, ...structuredTable];
			}

			setPdfData(extractedTables);
		}
	};

	//   const handleSearch = () => {
	//     if (searchTerm.trim()) {
	//       console.log(`Searching for: ${searchTerm}`);
	//       if (parsedContent) {
	//         const occurrences =
	//           parsedContent.match(new RegExp(searchTerm, "gi")) || [];
	//         console.log(
	//           `Found ${occurrences.length} occurrence(s) of "${searchTerm}"`
	//         );
	//       } else {
	//         console.log("No parsed content to search within.");
	//       }
	//     }
	//   };

	const handleSearch = () => {
		if (searchTerm.trim()) {
			if (pdfData && Array.isArray(pdfData)) {
				let totalOccurrences = 0;

				pdfData.forEach((page) => {
					page.table.forEach((row, rowIndex) => {
						row.forEach((cell, columnIndex) => {
							if (
								cell
									.toLowerCase()
									.includes(searchTerm.toLowerCase())
							) {
								totalOccurrences++;
							}
						});
					});
				});
			}
		}
	};

	return (
		<>
			{pdfFile ? (
				<>
					<TextField
						label="Search Text"
						variant="outlined"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						sx={{ mr: 2 }}
					/>
					<Button
						variant="contained"
						color="primary"
						onClick={handleSearch}
						disabled={!pdfFile}
					>
						Search
					</Button>
					<Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
						<Viewer fileUrl={pdfFile} />
					</Worker>
				</>
			) : (
				<>
					<Typography variant="h6" gutterBottom>
						Upload PDF File
					</Typography>
					<Button
						variant="contained"
						color="secondary"
						component="label"
						sx={{ mb: 2 }}
					>
						Choose PDF File
						<input
							type="file"
							accept=".pdf"
							onChange={handlePdfUpload}
							hidden
						/>
					</Button>
				</>
			)}
		</>
	);
};

export default PdfViewer;
