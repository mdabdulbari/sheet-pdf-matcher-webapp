"use client";
import React from "react";
import { Button, Typography, Paper } from "@mui/material";

const PdfViewer = ({ pdfFile, setPdfFile }) => {
	const handlePdfUpload = (e) => {
		const file = e.target.files[0];
		setPdfFile(file);
	};

	return (
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
			<Paper
				variant="outlined"
				sx={{ p: 2, mt: 2, height: 400, overflow: "auto" }}
			>
				<Typography variant="subtitle1" gutterBottom>
					PDF Viewer
				</Typography>
				{pdfFile ? (
					<iframe
						src={URL.createObjectURL(pdfFile)}
						title="PDF Viewer"
						style={{ width: "100%", height: "100%" }}
					/>
				) : (
					<Typography>No PDF uploaded yet.</Typography>
				)}
			</Paper>
		</>
	);
};

export default PdfViewer;
