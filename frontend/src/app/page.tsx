"use client";

import fuzzysearch from "fuzzysearch-ts";
import Link from "next/link";
import React, { useState } from "react";
import useSWR from "swr";

function CartView() {
	const { data, error, isLoading } = useSWR(
		"http://localhost:5095/cart",
		(arg: string) => {
			return fetch(arg, {
				credentials: "include",
			}).then<{ [key: string]: number }>((response) =>
				// TODO: sanitize this.
				response.json()
			);
		},
		{
			revalidateOnMount: true,
			refreshInterval: 300,
		}
	);

	function CartLink({ children }: { children: React.ReactNode }) {
		return <Link href="/cart">{children}</Link>;
	}

	if (error) {
		return <CartLink>Cart</CartLink>;
	}

	if (!data && isLoading) {
		return <CartLink>Cart</CartLink>;
	}

	if (!data) {
		return <CartLink>Cart</CartLink>;
	}

	return <CartLink>Cart ({[...Object.keys(data)].length})</CartLink>;
}

export default function Home() {
	const {
		data: items,
		error,
		isLoading,
	} = useSWR("http://localhost:5095/items", (arg: string) => {
		return fetch(arg, {
			credentials: "include",
		}).then<
			{
				id: string;
				name: string;
				category: string;
				value: number;
				imageUrl: string;
				description: string;
				inventoryRemaining: number;
			}[]
		>((response) =>
			// TODO: sanitize this.
			response.json()
		);
	});

	const { data: cart } = useSWR(
		"http://localhost:5095/items",
		(arg: string) => {
			return fetch(arg, {
				credentials: "include",
			}).then<
				{
					id: string;
					name: string;
					category: string;
					value: number;
					imageUrl: string;
					description: string;
					inventoryRemaining: number;
				}[]
			>((response) =>
				// TODO: sanitize this.
				response.json()
			);
		}
	);

	const [category, setCategory] = useState<string>("");
	const [search, setSearch] = useState("");

	if (error) {
		return <div>Failed to fetch the list of inventory</div>;
	}

	if (!items) {
		return <div>Loading</div>;
	}

	if (!items && isLoading) {
		return <div>Loading</div>;
	}

	return (
		<div className="p-5">
			<div className="float-right mb-8">
				<CartView />
			</div>
			<div className="clear-both"></div>
			<div className="flex">
				<div className="w-[400px] pr-6">
					<h2 className="pb-2">Search</h2>
					<div className="mb-3">
						<input
							value={search}
							className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							type="text"
							onChange={(e) => {
								setSearch(e.target.value);
							}}
						/>
					</div>
					<h2 className="pb-2">Filter by:</h2>
					<select
						className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						value={category}
						onChange={(e) => {
							setCategory(e.target.value);
						}}
					>
						<option value="">All</option>
						{[...new Set(items.map((d) => d.category))].map((d) => (
							<option key={d} value={d}>
								{d}
							</option>
						))}
					</select>
				</div>
				<div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
					{items
						.filter(
							(el) =>
								(category === "" || category === el.category) &&
								(search.trim() === "" ||
									fuzzysearch(search.toLowerCase(), el.name.toLowerCase()))
						)
						.map((d) => (
							<div key={d.id}>
								<img src={d.imageUrl} alt={d.name} />
								<h2 className="font-bold">{d.name}</h2>
								<p>{d.description}</p>
								<p className="text-2xl">${d.value}</p>
								<div className="mt-2">
									<button
										className="font-fold block w-full bg-yellow-300 p-2 text-center"
										onClick={() => {
											fetch("http://localhost:5095/cart/add", {
												method: "POST",
												credentials: "include",
												headers: {
													"Content-Type": "application/json",
												},
												body: JSON.stringify({
													id: d.id,
												}),
											})
												.then((response) => {
													if (response.status >= 400) {
														throw new Error(
															"Got a response code greater than or equal to 400"
														);
													}
												})
												.catch((e) => {
													console.error(e);
													alert("Failed to add to cart");
												});
										}}
									>
										Add to Cart
									</button>
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	);
}
