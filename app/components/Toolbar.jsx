import React from "react";
import { IconButton, Button, Box } from "@mui/material";
import BrushIcon from "@mui/icons-material/Brush";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import jsPDF from "jspdf";

const Toolbar = ({
  activeTool,
  setActiveTool,
  pdfCanvasRef,
  annotationCanvasRef,
}) => {
  const handleDownloadPdf = () => {
    const pdfCanvas = pdfCanvasRef.current;
    const annotationCanvas = annotationCanvasRef.current;

    // Merge the annotation canvas onto the PDF canvas
    const pdfContext = pdfCanvas.getContext("2d");
    pdfContext.drawImage(annotationCanvas, 0, 0);

    const imgData = pdfCanvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [pdfCanvas.width, pdfCanvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, pdfCanvas.width, pdfCanvas.height);
    pdf.save("annotated.pdf");
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 80,
        right: 20,
        background: "#fff",
        boxShadow: 2,
        padding: "8px",
        borderRadius: "8px",
        zIndex: 1000,
        display: "flex",
        gap: "8px",
      }}
    >
      <IconButton
        color={activeTool === "red" ? "primary" : "default"}
        onClick={() => setActiveTool("red")}
      >
        <BrushIcon style={{ color: "red" }} />
      </IconButton>

      <IconButton
        color={activeTool === "blue" ? "primary" : "default"}
        onClick={() => setActiveTool("blue")}
      >
        <BrushIcon style={{ color: "blue" }} />
      </IconButton>

      <IconButton
        color={activeTool === "green" ? "primary" : "default"}
        onClick={() => setActiveTool("green")}
      >
        <BrushIcon style={{ color: "green" }} />
      </IconButton>

      <IconButton
        color={activeTool === "eraser" ? "primary" : "default"}
        onClick={() => setActiveTool("eraser")}
      >
        <DeleteIcon />
      </IconButton>

      <Button
        variant="contained"
        color="secondary"
        startIcon={<DownloadIcon />}
        onClick={handleDownloadPdf}
      >
        Download as PDF
      </Button>
    </Box>
  );
};

export default Toolbar;
