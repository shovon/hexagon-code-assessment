"use client";

import fuzzysearch from "fuzzysearch-ts";
import Link from "next/link";
import React, { useState } from "react";
import useSWR from "swr";
import { pluralizer } from "../lib/pluralizer";

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

	if (!data) {
		if (error) {
			return <CartLink>Cart</CartLink>;
		}

		if (!data && isLoading) {
			return <CartLink>Cart</CartLink>;
		}

		if (!data) {
			return <CartLink>Cart</CartLink>;
		}
	}

	return <CartLink>Cart ({[...Object.keys(data)].length})</CartLink>;
}

type Item = {
	id: string;
	name: string;
	category: string;
	value: number;
	imageUrl: string;
	description: string;
	inventoryRemaining: number;
};

export default function Home() {
	const {
		data: items,
		error,
		isLoading,
	} = useSWR("http://localhost:5095/items", (arg: string) => {
		return fetch(arg, {
			credentials: "include",
		}).then<Item[]>((response) =>
			// TODO: sanitize this.
			response.json()
		);
	});

	const [alphabetical, setAlphabetical] = useState(true);
	const [lowToHigh, setLowToHigh] = useState(true);

	const { data: cart } = useSWR("http://localhost:5095/cart", (arg: string) => {
		return fetch(arg, {
			credentials: "include",
		}).then<{ [key: string]: number }>((response) =>
			// TODO: sanitize this.
			response.json()
		);
	});

	const [category, setCategory] = useState<string>("");
	const [search, setSearch] = useState("");

	if (!items) {
		if (error) {
			return <div>Failed to fetch the list of inventory</div>;
		}
		return <div>Loading</div>;
	}

	const priceSort = (a: Item, b: Item) =>
		lowToHigh ? a.value - b.value : b.value - a.value;

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

					<h2 className="mt-5">Sort by name</h2>

					<form>
						<div className="flex items-center mb-4 mt-6">
							<input
								checked={alphabetical}
								id="alphabetical"
								type="radio"
								value=""
								name="default-radio"
								className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
								onChange={(e) => {
									setAlphabetical(e.target.checked);
								}}
							/>
							<label
								htmlFor="alphabetical"
								className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
							>
								A-Z
							</label>
						</div>
						<div className="flex items-center">
							<input
								checked={!alphabetical}
								id="not-alphabetical"
								type="radio"
								value=""
								name="default-radio"
								className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
								onChange={(e) => {
									setAlphabetical(!e.target.checked);
								}}
							/>
							<label
								htmlFor="not-alphabetical"
								className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
							>
								Z-A
							</label>
						</div>
					</form>

					<h2 className="mt-5">Sort by price</h2>

					<form>
						<div className="flex items-center mb-4 mt-6">
							<input
								checked={lowToHigh}
								id="default-radio-1"
								type="radio"
								value=""
								name="default-radio"
								className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
								onChange={(e) => {
									setLowToHigh(e.target.checked);
								}}
							/>
							<label
								htmlFor="default-radio-1"
								className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
							>
								Low first
							</label>
						</div>
						<div className="flex items-center">
							<input
								checked={!lowToHigh}
								id="default-radio-2"
								type="radio"
								value=""
								name="default-radio"
								className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
								onChange={(e) => {
									setLowToHigh(!e.target.checked);
								}}
							/>
							<label
								htmlFor="default-radio-2"
								className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
							>
								High first
							</label>
						</div>
					</form>
				</div>
				<div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
					{items
						.filter(
							(el) =>
								(category === "" || category === el.category) &&
								(search.trim() === "" ||
									fuzzysearch(search.toLowerCase(), el.name.toLowerCase()))
						)
						.sort((a, b) =>
							alphabetical
								? a.name > b.name
									? 1 + priceSort(a, b)
									: -1 + priceSort(b, a)
								: b.name > a.name
								? 1 + priceSort(a, b)
								: -1 + priceSort(b, a)
						)
						.sort()
						.map((d) => (
							<div key={d.id}>
								<img src={d.imageUrl} alt={d.name} />
								<h2 className="font-bold">{d.name}</h2>
								<p>{d.description}</p>
								<p className="text-2xl">${d.value}</p>
								<div className="mt-2">
									{(cart ?? {})[d.id] ?? 0 > 0
										? `${(cart ?? {})[d.id] ?? 0} ${pluralizer(
												"unit",
												(cart ?? {})[d.id] ?? 0
										  )} already in cart`
										: ""}
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
