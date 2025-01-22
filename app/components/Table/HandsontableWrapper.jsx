import React, { useRef, useEffect } from "react";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";
import _ from "lodash";

const HandsontableWrapper = ({
	data,
	setHoverRowId,
	downloadSheet,
	setDownloadSheet,
	fileName,
}) => {
	const tableRef = useRef(null);
	const hotInstance = useRef(null);

	useEffect(() => {
		if (hotInstance.current && downloadSheet) {
			hotInstance.current.getPlugin("exportFile").downloadFile("csv", {
				filename: `${fileName}-matched`,
				columnHeaders: true,
				rowHeaders: true,
			});
			setDownloadSheet(false);
		}
	}, [downloadSheet]);

	const debouncedHover = _.debounce((event, coords, TD) => {
		if (coords.row >= 0) {
			const rowIndex = coords.row;
			const instance = hotInstance.current;

			const rowData = instance.getDataAtRow(rowIndex);

			instance.getDataAtRow(rowIndex).forEach((_, colIndex) => {
				const cell = instance.getCell(rowIndex, colIndex);
				if (cell) {
					cell.style.backgroundColor = "#f0f8ff";
					setHoverRowId(rowData[0]);
				}
			});
		}
	}, 100);

	useEffect(() => {
		if (tableRef.current) {
			const onHoverOut = (event, coords) => {
				if (coords.row >= 0) {
					const rowIndex = coords.row;
					const instance = hotInstance.current;

					// Add a delay of 100ms before resetting the background color
					setTimeout(() => {
						instance
							.getDataAtRow(rowIndex)
							.forEach((_, colIndex) => {
								const cell = instance.getCell(
									rowIndex,
									colIndex
								);
								if (cell) {
									cell.style.backgroundColor = "";
									setHoverRowId(null);
								}
							});
					}, 100); // 100ms delay
				}
			};

			hotInstance.current = new Handsontable(tableRef.current, {
				data: data,
				colHeaders: Object.keys(data[0]),
				rowHeaders: true,
				licenseKey: "non-commercial-and-evaluation",
				afterOnCellMouseOver: debouncedHover,
				afterOnCellMouseOut: onHoverOut,
			});
		}

		return () => {
			hotInstance.current?.destroy();
			debouncedHover.cancel();
		};
	}, [data]);

	return <div ref={tableRef}></div>;
};

export default HandsontableWrapper;
