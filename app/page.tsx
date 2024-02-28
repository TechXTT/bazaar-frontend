"use client";
import 'animate.css';
import { useEffect } from 'react';

export default function Home() {
	useEffect(() => {
		console.log("location", window.location.href)
	})

	return (
		<main className="max-w-screen-2xl m-auto">

		</main>
	);
}
