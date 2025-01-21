"use client";
import React, { useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { getDocument } from "pdfjs-dist";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { Button, TextField, Typography, Box } from "@mui/material";

const PdfViewer = ({ pdfFile, setPdfFile }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [parsedContent, setParsedContent] = useState(null);

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPdfFile(fileUrl);

      // Parse the PDF and log its content
      const pdf = await getDocument(fileUrl).promise;
      let fullText = "";
      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += `Page ${i + 1}: ${pageText}\n`;
      }
      setParsedContent(fullText);
      console.log("Parsed PDF Content:\n", fullText);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      console.log(`Searching for: ${searchTerm}`);
      if (parsedContent) {
        const occurrences =
          parsedContent.match(new RegExp(searchTerm, "gi")) || [];
        console.log(
          `Found ${occurrences.length} occurrence(s) of "${searchTerm}"`
        );
      } else {
        console.log("No parsed content to search within.");
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
