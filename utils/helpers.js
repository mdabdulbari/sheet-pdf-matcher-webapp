export const normalizeValue = (value) => value.replace(/\s+/g, " ").trim();

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
			const pageText = textContent.items
				.map((item) => item.str)
				.join(" ");
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
