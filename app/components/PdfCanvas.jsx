import React, { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

const PdfCanvas = ({ pdfBuffer, setViewport }) => {
  const pdfCanvasRef = useRef(null);

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
      } catch (error) {
        console.error("Error rendering PDF:", error);
      }
    };

    renderPDF();
  }, [pdfBuffer]);

  return (
    <canvas ref={pdfCanvasRef} style={{ width: "100%", height: "auto" }} />
  );
};

export default PdfCanvas;
