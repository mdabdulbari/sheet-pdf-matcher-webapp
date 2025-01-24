import React, { useRef } from "react";
import {
  getMouseCoordinates,
  handleDrawing,
  handleEraser,
} from "@/utils/canvasUtils";

const AnnotationCanvas = ({ activeTool, annotationCanvasRef }) => {
  const handleCanvasMouseDown = (e) => {
    if (["blue", "green", "red", "eraser"].includes(activeTool)) {
      const annotationCanvas = annotationCanvasRef.current;
      const context = annotationCanvas.getContext("2d");

      const { x, y } = getMouseCoordinates(e, annotationCanvas);

      if (activeTool === "eraser") {
        handleEraser(context, x, y, 100); // Eraser size: 100x100
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

    const { x, y } = getMouseCoordinates(e, annotationCanvas);

    if (activeTool === "eraser") {
      handleEraser(context, x, y, 20); // Eraser size: 20x20
    } else if (["red", "blue", "green"].includes(activeTool)) {
      handleDrawing(context, x, y, activeTool);
    }
  };

  const handleCanvasMouseUp = () => {
    const annotationCanvas = annotationCanvasRef.current;
    annotationCanvas.removeEventListener("mousemove", handleCanvasMouseMove);
  };

  return (
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
  );
};

export default AnnotationCanvas;
