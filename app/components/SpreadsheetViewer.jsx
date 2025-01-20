"use client";
import React, { useState } from "react";
import { Button, Typography, Paper } from "@mui/material";
import DataGrid from "react-data-grid";
import { parseExcelFile } from "@/utils/spreadsheetUtils";

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

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Upload Excel Sheet
      </Typography>
      <Button variant="contained" component="label" sx={{ mb: 2 }}>
        Choose Excel File
        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileSelection}
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
    </>
  );
};

export default SpreadsheetViewer;
