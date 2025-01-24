"use client";
import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Button, Typography, Box, IconButton } from "@mui/material";
import BrushIcon from "@mui/icons-material/Brush";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import { jsPDF } from "jspdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfViewer = ({ itemToHighlight, pdfData, setPdfData, matchedData }) => {
  const [pdfBuffer, setPdfBuffer] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const pdfCanvasRef = useRef(null);
  const annotationCanvasRef = useRef(null);
  const [activeTool, setActiveTool] = useState(null);
  const [savedViewport, setViewport] = useState(null);
  const [oldItemToHighlight, setOldItemToHighlight] = useState(null);

  useEffect(() => {
    if (matchedData) {
      setTimeout(() => {
        const rowsToMark = matchedData.map(
          (data) => data.pdfData.lastItemTransform
        );
        const annotationCanvas = annotationCanvasRef.current;
        const context = annotationCanvas.getContext("2d");

        context.fillStyle = "rgba(0, 0, 0, 0)";
        context.strokeStyle = "green";
        context.lineWidth = 2;

        rowsToMark.forEach((transform) => {
          const currentTransform = pdfjsLib.Util.transform(
            savedViewport.transform,
            transform
          );

          // Coordinates for the checkmark
          const x = currentTransform[4] + 10;
          const y = currentTransform[5] - 12;

          // Draw checkmark
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x + 5, y + 7);
          context.lineTo(x + 15, y - 3);
          context.stroke();
        });
      }, 100);
    }
  }, [matchedData]);

  const highlightSearchTerm = async () => {
    removeHighlight();
    const annotationCanvas = annotationCanvasRef.current;
    const context = annotationCanvas.getContext("2d");

    const transform = pdfjsLib.Util.transform(
      savedViewport.transform,
      itemToHighlight.transform
    );
    const x = transform[4];
    const y = transform[5] - 12;
    const width = itemToHighlight.width * savedViewport.scale;
    const height = 12;

    context.fillStyle = "rgba(255, 255, 0, 0.4)";
    context.fillRect(x, y, width, height);

    setOldItemToHighlight(itemToHighlight);
  };

  const removeHighlight = () => {
    if (oldItemToHighlight) {
      const annotationCanvas = annotationCanvasRef.current;
      const context = annotationCanvas.getContext("2d");

      const transform = pdfjsLib.Util.transform(
        savedViewport.transform,
        oldItemToHighlight.transform
      );
      const x = transform[4];
      const y = transform[5] - 12;
      const width = oldItemToHighlight.width * savedViewport.scale;
      const height = 12;

      context.clearRect(x, y, width, height);
      setOldItemToHighlight(null);
    }
  };

  useEffect(() => {
    if (
      pdfData &&
      itemToHighlight.description &&
      itemToHighlight.description !== ""
    ) {
      setOldItemToHighlight(itemToHighlight);
      highlightSearchTerm();
    } else {
      removeHighlight();
    }
  }, [itemToHighlight]);

  useEffect(() => {
    const renderPDF = async () => {
      if (!pdfBuffer) return;

      try {
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        setViewport(viewport);

        const pdfCanvas = pdfCanvasRef.current;
        const pdfContext = pdfCanvas.getContext("2d");
        pdfCanvas.width = viewport.width;
        pdfCanvas.height = viewport.height;

        await page.render({
          canvasContext: pdfContext,
          viewport,
        }).promise;

        // Set the annotation canvas size to match the PDF canvas
        const annotationCanvas = annotationCanvasRef.current;
        annotationCanvas.width = pdfCanvas.width;
        annotationCanvas.height = pdfCanvas.height;
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
          const y = item.transform[5]; // Use the original y-coordinate from the item's transform

          if (!rows[y]) {
            rows[y] = {
              items: [],
            };
          }

          // Push the item into the row
          rows[y].items.push({
            str: item.str,
            transform: item.transform,
            width: item.width,
          });
        });

        const sortedRows = Object.keys(rows)
          .sort((a, b) => b - a)
          .map((y) => ({
            items: rows[y].items
              .sort((a, b) => a.transform[4] - b.transform[4]) // Sort items by x-coordinate
              .map(({ str, width, transform }) => ({
                str,
                width,
                transform,
              })),
          }));

        const table = sortedRows.map((row) => ({
          items: row.items.map(({ str, width, transform }) => ({
            str,
            width,
            transform,
          })),
        }));

        const structuredTable = table.map((row) => {
          let date = "";
          let credit = "";
          let debit = "";
          let balance = "";
          let description = [];
          let totalWidth = 0;
          let transform = [];
          let lastItemTransform = [];

          row.items.forEach(
            ({ str, width, transform: currentTransform }, index) => {
              const isLastItem = index === row.items.length - 1;
              if (isLastItem) {
                const updatedCurrentTransform = [...currentTransform];
                updatedCurrentTransform[4] = updatedCurrentTransform[4] + width;
                lastItemTransform = updatedCurrentTransform;
              }
              // Check if the item matches a date format (MM/DD/YYYY)
              if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
                date = str;
              }
              // Check if the item matches a credit/debit/balance format
              else if (/^\d{1,3}(?:,\d{3})*(?:\.\d{2})$/.test(str)) {
                if (credit === "") {
                  credit = str;
                } else {
                  balance = str;
                }
              } else {
                description.push(str);
                if (str !== " ") {
                  totalWidth += width;
                }
                if (transform.length === 0 && str !== " " && str !== "") {
                  transform = currentTransform;
                }
              }
            }
          );

          description = description.join(" ").trim();

          return {
            date: date,
            description: description,
            credit: credit,
            debit: debit,
            balance: balance,
            page: i + 1,
            transform: transform,
            width: totalWidth,
            lastItemTransform,
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
      activeTool === "blue" ||
      activeTool === "green" ||
      activeTool === "red" ||
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
        context.clearRect(x - 50, y - 50, 100, 100); // Eraser size: 100x100
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

    if (activeTool === "red") {
      context.strokeStyle = "red";
      context.lineWidth = 2;
      context.lineTo(x, y);
      context.stroke();
    } else if (activeTool === "blue") {
      context.strokeStyle = "blue";
      context.lineWidth = 2;
      context.lineTo(x, y);
      context.stroke();
    } else if (activeTool === "green") {
      context.strokeStyle = "green";
      context.lineWidth = 2;
      context.lineTo(x, y);
      context.stroke();
    } else if (activeTool === "eraser") {
      context.clearRect(x - 10, y - 10, 20, 20);
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

          {/* Blue Pen */}
          <IconButton
            color={activeTool === "blue" ? "primary" : "default"}
            onClick={() => setActiveTool("blue")}
          >
            <BrushIcon style={{ color: "blue" }} />
          </IconButton>

          {/* Green Pen */}
          <IconButton
            color={activeTool === "green" ? "primary" : "default"}
            onClick={() => setActiveTool("green")}
          >
            <BrushIcon style={{ color: "green" }} />
          </IconButton>

          {/* Eraser */}
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
            style={{
              position: "absolute",
              zIndex: 1,
              border: "1px solid #ccc",
              width: "100%",
              height: "auto",
            }}
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
