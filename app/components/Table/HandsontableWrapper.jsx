import React, { useRef, useEffect } from "react";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";

const HandsontableWrapper = ({ data }) => {
	const tableRef = useRef(null);
	const hotInstance = useRef(null);

	useEffect(() => {
		if (tableRef.current) {
			const filteredData = data.map((row) => {
				const { id, ...rest } = row;
				return rest;
			});
			hotInstance.current = new Handsontable(tableRef.current, {
				data: filteredData,
				colHeaders: Object.keys(filteredData[0]),
				rowHeaders: true,
				licenseKey: "non-commercial-and-evaluation",
			});
		}

		return () => {
			hotInstance.current?.destroy();
		};
	}, [data]);

	return <div ref={tableRef}></div>;
};

export default HandsontableWrapper;
