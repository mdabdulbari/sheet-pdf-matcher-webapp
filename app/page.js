"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import DataGrid from "react-data-grid";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
} from "@mui/material";

const FileUploadPage = () => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);

  // Handle Excel Upload and Parsing
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
  
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0]; // Get the first sheet
      const sheet = workbook.Sheets[sheetName];
  
      try {
        // Extract data as an array of arrays
        const rawSheetData = XLSX.utils.sheet_to_json(sheet, {
          header: 1, // Extract data row-by-row (raw format)
        });
  
        console.log("Raw Sheet Data:", rawSheetData);
  
        // Find the row with valid headers (e.g., containing "Date", "Comment", etc.)
        const headerRowIndex = rawSheetData.findIndex(
          (row) =>
            Array.isArray(row) &&
            row.some((cell) => typeof cell === "string" && cell.trim() === "Date")
        );
  
        if (headerRowIndex === -1) {
          alert("No valid header row found in the uploaded file.");
          return;
        }
  
        // Extract the header row and sanitize column names
        const rawHeaders = rawSheetData[headerRowIndex];
        const headers = rawHeaders.map((header, index) =>
          header && header.trim() ? header.trim() : `Column ${index + 1}`
        );
  
        console.log("Sanitized Headers:", headers);
  
        // Filter and format data rows
        const dataRows = rawSheetData
          .slice(headerRowIndex + 1) // Rows below the header
          .filter(
            (row) =>
              Array.isArray(row) &&
              row.some((cell) => cell !== null && cell !== undefined && cell !== "")
          );
  
        console.log("Filtered Data Rows:", dataRows);
  
        // Dynamically generate columns
        const cols = headers.map((col, index) => ({
          key: `col_${index}`,
          name: col,
          editable: true,
        }));
  
        // Map data rows to objects using the headers
        const formattedRows = dataRows.map((row, rowIndex) => {
          const rowObject = {};
          headers.forEach((header, colIndex) => {
            rowObject[`col_${colIndex}`] = row[colIndex] || null; // Ensure all keys are present
          });
          return { id: rowIndex + 1, ...rowObject }; // Add a unique ID for each row
        });
  
        console.log("Formatted Rows:", formattedRows);
  
        setColumns(cols); // Update state with columns
        setRows(formattedRows); // Update state with rows
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert("Failed to parse the uploaded Excel file. Please check its format.");
      }
    };
  
    reader.readAsArrayBuffer(file);
  };
  
  
  // Handle PDF Upload
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    setPdfFile(file); // Set the selected PDF file for rendering
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        File Upload and Viewer
      </Typography>
      <Grid container spacing={4}>
        {/* Left Column: Excel Viewer */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
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
                onChange={handleExcelUpload}
                hidden
              />
            </Button>
            <Paper
              variant="outlined"
              sx={{ p: 2, mt: 2, height: 400, overflow: "auto" }}
            >
              <Typography variant="subtitle1" gutterBottom>
                Editable Excel Viewer
              </Typography>
              {columns.length > 0 && rows.length > 0 ? (
                <DataGrid
                  columns={columns}
                  rows={rows}
                  onRowsChange={setRows}
                  style={{ height: "100%", width: "100%" }}
                />
              ) : (
                <Typography>No Excel file uploaded yet.</Typography>
              )}
            </Paper>
          </Paper>
        </Grid>

        {/* Right Column: PDF Viewer */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
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
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FileUploadPage;
