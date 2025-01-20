"use client";
import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

const Header = ({ title }) => {
	return (
		<AppBar position="sticky" color="primary">
			<Toolbar>
				<Typography variant="h6" component="div">
					{title}
				</Typography>
			</Toolbar>
		</AppBar>
	);
};

export default Header;
