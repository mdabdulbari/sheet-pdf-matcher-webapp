import React, { useRef, useEffect } from "react";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.css";

const HandsontableWrapper = ({ data, columns }) => {
	const tableRef = useRef(null);
	const hotInstance = useRef(null);

	useEffect(() => {
		if (tableRef.current) {
			hotInstance.current = new Handsontable(tableRef.current, {
				data,
				colHeaders: true,
				rowHeaders: true,
				columns,
				licenseKey: "non-commercial-and-evaluation",
			});
		}

		return () => {
			hotInstance.current?.destroy();
		};
	}, [data, columns]);

	return <div ref={tableRef}></div>;
};

export default HandsontableWrapper;
