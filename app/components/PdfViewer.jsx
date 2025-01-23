"use client";
import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Button, Typography, Box, IconButton } from "@mui/material";
import BrushIcon from "@mui/icons-material/Brush";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { jsPDF } from "jspdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfViewer = ({ searchTermXYZ, pdfData, setPdfData }) => {
  const [pdfBuffer, setPdfBuffer] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("Web Payment WIRE5120906114"); // Default search term
  const pdfCanvasRef = useRef(null); // PDF rendering canvas
  const annotationCanvasRef = useRef(null); // Annotation canvas
  const [activeTool, setActiveTool] = useState(null);

  //   let searchTerm = searchTermRAW;
  //   console.log("searchTerm", searchTerm);

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
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });

        const pdfCanvas = pdfCanvasRef.current;
        const pdfContext = pdfCanvas.getContext("2d");
        pdfCanvas.width = viewport.width;
        pdfCanvas.height = viewport.height;

        // Render the PDF page
        await page.render({
          canvasContext: pdfContext,
          viewport,
        }).promise;

        // Highlight the search term
        if (searchTerm) {
          highlightSearchTerm(page, searchTerm, pdfContext, viewport);
        }

        // Set the annotation canvas size to match the PDF canvas
        const annotationCanvas = annotationCanvasRef.current;
        annotationCanvas.width = pdfCanvas.width;
        annotationCanvas.height = pdfCanvas.height;
      } catch (error) {
        console.error("Error rendering PDF:", error);
      }
    };

    const highlightSearchTerm = async (page, term, context, viewport) => {
      const textContent = await page.getTextContent();
      const matches = [];

      textContent.items.forEach((item) => {
        if (item.str.toLowerCase().includes(term.toLowerCase())) {
          const transform = pdfjsLib.Util.transform(
            viewport.transform,
            item.transform
          );
          const x = transform[4];
          const y = transform[5] - 10; // Adjust height for highlight
          const width = item.width * viewport.scale;
          const height = 10; // Approximate height

          matches.push({ x, y, width, height });
        }
      });

      // Draw highlights
      context.fillStyle = "rgba(255, 255, 0, 0.4)"; // Search term highlight color
      matches.forEach(({ x, y, width, height }) => {
        context.fillRect(x, y, width, height);
      });
    };

    renderPDF();
  }, [pdfBuffer, searchTerm]);

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

  const handleCanvasMouseDown = (e) => {
    if (
      activeTool === "draw" ||
      activeTool === "drawVariant" ||
      activeTool === "eraser"
    ) {
      const annotationCanvas = annotationCanvasRef.current;
      const context = annotationCanvas.getContext("2d");

      const rect = annotationCanvas.getBoundingClientRect();
      const scaleX = annotationCanvas.width / rect.width;
      const scaleY = annotationCanvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      if (activeTool === "eraser") {
        context.clearRect(x - 10, y - 10, 20, 20); // Eraser size: 20x20
      } else {
        context.beginPath();
        context.moveTo(x, y);
      }

      annotationCanvas.addEventListener("mousemove", handleCanvasMouseMove);
    }
  };

  const handleCanvasMouseMove = (e) => {
    const annotationCanvas = annotationCanvasRef.current;
    const context = annotationCanvas.getContext("2d");

    const rect = annotationCanvas.getBoundingClientRect();
    const scaleX = annotationCanvas.width / rect.width;
    const scaleY = annotationCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (activeTool === "draw") {
      context.strokeStyle = "red";
      context.lineWidth = 2;
      context.lineTo(x, y);
      context.stroke();
    } else if (activeTool === "drawVariant") {
      context.strokeStyle = "rgba(255, 255, 0, 0.6)";
      context.lineWidth = 8;
      context.lineTo(x, y);
      context.stroke();
    } else if (activeTool === "eraser") {
      context.clearRect(x - 10, y - 10, 20, 20); // Eraser size: 20x20
    }
  };

  const handleCanvasMouseUp = () => {
    const annotationCanvas = annotationCanvasRef.current;
    annotationCanvas.removeEventListener("mousemove", handleCanvasMouseMove);
  };

  return (
    <>
      {pdfFile ? (
        <Box
          sx={{
            position: "fixed",
            top: "100px",
            left: "1600px",
            background: "#fff",
            boxShadow: 2,
            padding: "8px",
            borderRadius: "8px",
            zIndex: 1000,
            display: "flex",
            gap: "8px",
          }}
        >
          {/* Original Draw Tool */}
          <IconButton
            color={activeTool === "draw" ? "primary" : "default"}
            onClick={() => setActiveTool("draw")}
          >
            <BrushIcon />
          </IconButton>

          {/* New Draw Variant Tool */}
          <IconButton
            color={activeTool === "drawVariant" ? "primary" : "default"}
            onClick={() => setActiveTool("drawVariant")}
          >
            <ColorLensIcon style={{ color: "rgba(229, 255, 0, 0.99)" }} />
          </IconButton>

          {/* Eraser Tool */}
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
      ) : null}
      {pdfFile ? (
        <div style={{ position: "relative" }}>
          {/* PDF Canvas */}
          <canvas
            ref={pdfCanvasRef}
            style={{ position: "absolute", zIndex: 1 }}
          />

          {/* Annotation Canvas */}
          <canvas
            ref={annotationCanvasRef}
            style={{
              position: "absolute",
              zIndex: 2,
              border: "1px solid #ccc",
              width: "100%",
              height: "auto",
              marginTop: "16px",
            }}
            onMouseDown={handleCanvasMouseDown}
            onMouseUp={handleCanvasMouseUp}
          />
        </div>
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
