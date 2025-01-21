"use client";
import React, { useState } from "react";
import { Box, Grid2 as Grid, Paper } from "@mui/material";
import SpreadsheetViewer from "./components/SpreadsheetViewer";
import PdfViewer from "./components/PdfViewer";
import Header from "./components/Header";

const FileUploadPage = () => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);

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
      <Grid container spacing={2} sx={{  padding: 2, flexGrow: 1 }}>
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
              rows={rows}
              setRows={setRows}
              columns={columns}
              setColumns={setColumns}
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
            <PdfViewer pdfFile={pdfFile} setPdfFile={setPdfFile} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FileUploadPage;
