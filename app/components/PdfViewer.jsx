"use client";
import React from "react";
import { Button, Typography } from "@mui/material";

const PdfViewer = ({ pdfFile, setPdfFile }) => {
	const handlePdfUpload = (e) => {
		const file = e.target.files[0];
		setPdfFile(file);
	};

	return (
		<>
			{pdfFile ? (
				<iframe
					src={URL.createObjectURL(pdfFile)}
					title="PDF Viewer"
					style={{ width: "100%", height: "100%" }}
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
