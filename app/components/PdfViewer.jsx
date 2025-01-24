"use client";
import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  drawCheckmarksOnCanvas,
  highlightTermOnCanvas,
  removeHighlightedTermFromCanvas,
  renderPageToCanvas,
  renderPdfPage,
  setCanvasSize,
} from "@/utils/canvasUtils";
import Toolbar from "./Toolbar";
import PdfFileUpload from "./PdfFileUpload";
import AnnotationCanvas from "./AnnotationCanvas";

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
        drawCheckmarksOnCanvas(matchedData, savedViewport, annotationCanvasRef);
      }, 100);
    }
  }, [matchedData]);

  const highlightSearchTerm = async () => {
    removeHighlight();
    highlightTermOnCanvas(itemToHighlight, savedViewport, annotationCanvasRef);
    setOldItemToHighlight(itemToHighlight);
  };

  const removeHighlight = () => {
    if (oldItemToHighlight) {
      removeHighlightedTermFromCanvas(
        oldItemToHighlight,
        savedViewport,
        annotationCanvasRef
      );
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
        const { page, viewport } = await renderPdfPage(pdfBuffer);
        setViewport(viewport);

        const pdfCanvas = pdfCanvasRef.current;
        const pdfContext = pdfCanvas.getContext("2d");
        setCanvasSize(pdfCanvas, viewport);

        await renderPageToCanvas(page, pdfContext, viewport);

        const annotationCanvas = annotationCanvasRef.current;
        setCanvasSize(annotationCanvas, viewport);
      } catch (error) {
        console.error("Error rendering PDF:", error);
      }
    };

    renderPDF();
  }, [pdfBuffer]);

  return (
    <>
      {pdfFile && (
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          pdfCanvasRef={pdfCanvasRef}
          annotationCanvasRef={annotationCanvasRef}
        />
      )}
      {pdfFile && (
        <div style={{ position: "relative" }}>
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

          <AnnotationCanvas
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            annotationCanvasRef={annotationCanvasRef}
          />
        </div>
      )}
      {!pdfFile && (
        <PdfFileUpload
          setPdfFile={setPdfFile}
          setPdfBuffer={setPdfBuffer}
          setPdfData={setPdfData}
        />
      )}
    </>
  );
};

export default PdfViewer;
