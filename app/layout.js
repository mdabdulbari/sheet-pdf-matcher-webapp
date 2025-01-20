import "./globals.css";
import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";

export const metadata = {
	title: "Ledger Match",
	description: "App that matches Ledger and Bank Statement.",
};

export default function RootLayout({ children }) {
	return (
		<html
			lang="en"
			style={{
				height: "100%",
				width: "100%",
			}}
		>
			<body
				style={{
					margin: 0,
					backgroundColor: "#f2f2f2",
					width: "100%",
					height: "100%",
				}}
			>
				{children}
			</body>
		</html>
	);
}
