const stringSimilarity = require("string-similarity");

export const normalizeValue = (value) =>
  value ? value.replace(/\s+/g, " ").trim() : "";

export const searchPdfText = async (pdfBuffer, searchText) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const numPages = pdfDoc.getPageCount();

    // Normalize the search text for case-insensitive search
    const normalizedSearchText = searchText.toLowerCase();

    for (let i = 0; i < numPages; i++) {
      const page = pdfDoc.getPage(i);
      const textContent = await page.getTextContent();

      // Combine all text on the page into a single string
      const pageText = textContent.items.map((item) => item.str).join(" ");
      if (pageText.toLowerCase().includes(normalizedSearchText)) {
        return true; // Found the text
      }
    }
    return false; // Text not found
  } catch (error) {
    console.error("Error searching PDF text:", error);
    return false;
  }
};

export function getSimilarityScore(string1, string2) {
  return stringSimilarity.compareTwoStrings(
    normalizeValue(string1),
    normalizeValue(string2)
  );
}

export function isSimilar(string1, string2) {
  const similarity = getSimilarityScore(string1, string2);
  return similarity >= 0.6;
}

export const sortRowsByY = (rows) => {
  return Object.keys(rows)
    .sort((a, b) => b - a) // Sort by y-coordinate in descending order
    .map((y) => ({
      items: rows[y].items.sort((a, b) => a.transform[4] - b.transform[4]), // Sort items by x-coordinate
    }));
};
