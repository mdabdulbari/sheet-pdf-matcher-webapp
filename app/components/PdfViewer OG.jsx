"use client";
import React, { useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { Button, Typography } from "@mui/material";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfViewer = ({ searchTerm, pdfData, setPdfData }) => {
	const [pdfFile, setPdfFile] = useState(null);
	const [pdfBuffer, setPdfBuffer] = useState(null);
	const canvasRef = useRef(null);

	const handleSearch = () => {
		const isFound = pdfData.some((row) => {
			return Object.values(row).some((value) => {
				return (
					typeof value === "string" &&
					value.toLowerCase().includes(searchTerm.toLowerCase())
				);
			});
		});
		console.log(`Search Result: ${isFound ? "Found" : "Not Found"}`);
	};

	useEffect(() => {
		if (pdfData && searchTerm && searchTerm !== "") {
			handleSearch();
		}
	}, [searchTerm]);

	useEffect(() => {
		const renderPDF = async () => {
			if (!pdfBuffer) return;

			try {
				const pdfjsDoc = await pdfjsLib.getDocument({ data: pdfBuffer })
					.promise;

				// Render the first page on the canvas
				const page = await pdfjsDoc.getPage(1);
				const viewport = page.getViewport({ scale: 1.5 });
				const canvas = canvasRef.current;
				const context = canvas.getContext("2d");
				canvas.width = viewport.width;
				canvas.height = viewport.height;

				await page.render({
					canvasContext: context,
					viewport,
				}).promise;
			} catch (error) {
				console.error("Error rendering PDF:", error);
			}
		};

		renderPDF();
	}, [pdfBuffer]);

	const handlePdfUpload = async (e) => {
		const file = e.target.files[0];
		if (file) {
			const fileBuffer = await file.arrayBuffer();
			const fileUrl = URL.createObjectURL(file);
			setPdfFile(fileUrl);
			setPdfBuffer(fileBuffer);

			const pdf = await pdfjsLib.getDocument(fileUrl).promise;
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

	return (
		<>
			{pdfFile ? (
				<canvas
					ref={canvasRef}
					style={{ border: "1px solid #ccc", marginTop: "16px" }}
				/>
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
