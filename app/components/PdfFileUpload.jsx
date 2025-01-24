import React from "react";
import { Button, Typography } from "@mui/material";
import { extractPdfData } from "@/utils/canvasUtils";

const PdfFileUpload = ({ setPdfFile, setPdfBuffer, setPdfData }) => {
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileBuffer = await file.arrayBuffer();
      setPdfFile(URL.createObjectURL(file));
      setPdfBuffer(fileBuffer);

      const extractedTables = await extractPdfData(file);
      setPdfData(extractedTables);
    }
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
        <input type="file" accept=".pdf" onChange={handlePdfUpload} hidden />
      </Button>
    </>
  );
};

export default PdfFileUpload;
