import { sortRowsByY } from "./helpers";

export const drawCheckmarksOnCanvas = (matchedData, viewport, canvas) => {
  const rowsToMark = matchedData.map((data) => data.pdfData.lastItemTransform);
  const annotationCanvas = canvas.current;
  const context = annotationCanvas.getContext("2d");

  context.fillStyle = "rgba(0, 0, 0, 0)";
  context.strokeStyle = "green";
  context.lineWidth = 2;

  rowsToMark.forEach((transform) => {
    const currentTransform = pdfjsLib.Util.transform(
      viewport.transform,
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
};

export const highlightTermOnCanvas = (itemToHighlight, viewport, canvas) => {
  const annotationCanvas = canvas.current;
  const context = annotationCanvas.getContext("2d");

  const transform = pdfjsLib.Util.transform(
    viewport.transform,
    itemToHighlight.transform
  );
  const x = transform[4];
  const y = transform[5] - 12;
  const width = itemToHighlight.width * viewport.scale;
  const height = 12;

  context.fillStyle = "rgba(255, 255, 0, 0.4)";
  context.fillRect(x, y, width, height);
};

export const removeHighlightedTermFromCanvas = (
  oldItemToHighlight,
  savedViewport,
  annotationCanvasRef
) => {
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
};

export const extractPdfData = async (file) => {
  const fileUrl = URL.createObjectURL(file);
  const pdf = await pdfjsLib.getDocument(fileUrl).promise;
  let extractedTables = [];

  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const textContent = await page.getTextContent();

    const rows = groupItemsByYCoordinate(textContent.items);
    const sortedRows = sortRowsByY(rows);
    const table = createTable(sortedRows);
    const structuredTable = structureTable(table, i + 1);

    extractedTables = [...extractedTables, ...structuredTable];
  }

  return extractedTables;
};

const groupItemsByYCoordinate = (items) => {
  const rows = {};
  items.forEach((item) => {
    const y = item.transform[5];
    if (!rows[y]) {
      rows[y] = { items: [] };
    }
    rows[y].items.push({
      str: item.str,
      transform: item.transform,
      width: item.width,
    });
  });
  return rows;
};

const createTable = (sortedRows) => {
  return sortedRows.map((row) => ({
    items: row.items.map(({ str, width, transform }) => ({
      str,
      width,
      transform,
    })),
  }));
};

const structureTable = (table, pageNum) => {
  return table.map((row) => {
    let date = "";
    let credit = "";
    let debit = "";
    let balance = "";
    let description = [];
    let totalWidth = 0;
    let transform = [];
    let lastItemTransform = [];

    row.items.forEach(({ str, width, transform: currentTransform }, index) => {
      const isLastItem = index === row.items.length - 1;
      if (isLastItem) {
        const updatedCurrentTransform = [...currentTransform];
        updatedCurrentTransform[4] = updatedCurrentTransform[4] + width;
        lastItemTransform = updatedCurrentTransform;
      }
      // Process the data as needed
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
        date = str;
      } else if (/^\d{1,3}(?:,\d{3})*(?:\.\d{2})$/.test(str)) {
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
    });

    description = description.join(" ").trim();

    return {
      date,
      description,
      credit,
      debit,
      balance,
      page: pageNum,
      transform,
      width: totalWidth,
      lastItemTransform,
    };
  });
};

// Function to get the scaled coordinates for mouse events
export const getMouseCoordinates = (e, canvas) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  return { x, y };
};

// Function to handle drawing
export const handleDrawing = (context, x, y, tool) => {
  context.lineWidth = 2;

  switch (tool) {
    case "red":
      context.strokeStyle = "red";
      break;
    case "blue":
      context.strokeStyle = "blue";
      break;
    case "green":
      context.strokeStyle = "green";
      break;
    default:
      break;
  }

  if (tool !== "eraser") {
    context.lineTo(x, y);
    context.stroke();
  }
};

// Function to handle eraser functionality
export const handleEraser = (context, x, y, size = 20) => {
  context.clearRect(x - size / 2, y - size / 2, size, size);
};
