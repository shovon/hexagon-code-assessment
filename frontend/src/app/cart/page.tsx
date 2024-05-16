"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { pluralizer } from "../../lib/pluralizer";

type Item = {
	id: string;
	name: string;
	category: string;
	value: number;
	imageUrl: string;
	description: string;
	inventoryRemaining: number;
};

function UpdateBox({
	value,
	isValid,
	onUpdate,
}: {
	value: string;
	isValid: (value: string) => boolean;
	onUpdate: (value: string) => void;
}) {
	const [internalValue, setInternalValue] = useState(value);

	useEffect(() => {
		setInternalValue(value);
	}, [value]);

	return (
		<div className="flex">
			<div className="mr-2">
				<input
					className="w-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					style={{
						borderColor: !isValid(internalValue) ? "red" : undefined,
					}}
					type="text"
					value={internalValue}
					onChange={(e) => {
						setInternalValue(e.target.value);
					}}
				/>
			</div>
			{internalValue !== value ? (
				<div className="pt-0.5">
					<button
						className="h-full bg-yellow-400 p-1 pointer disabled: disabled:opacity-50"
						disabled={!isValid(internalValue)}
						onClick={() => {
							onUpdate(internalValue);
						}}
					>
						Update
					</button>
				</div>
			) : null}
		</div>
	);
}

function CartItem({ item, countInCart }: { countInCart: number; item: Item }) {
	return (
		<div
			className={`flex mb-4 ${
				item.inventoryRemaining <= 0 ? "opacity-50" : ""
			}`}
		>
			<div className={`w-[200px] mr-4`}>
				<img src={item.imageUrl} alt={item.description} />
			</div>
			<div className="flex-1 flex flex-col">
				<div className="flex-1">
					<h2 className="font-bold">{item.name}</h2>
					<p>{item.description}</p>
					<p>
						{item.inventoryRemaining <= 0 ? (
							<span className="text-red-500">Out of stock</span>
						) : (
							<span className="text-green-600">In stock</span>
						)}
					</p>
				</div>
				<div className="flex items-center">
					<div className="border-r-2 pr-3 mr-3 border-gray-200 flex items-center">
						<div className="inline-block pr-2">Quantity:</div>
						<UpdateBox
							value={countInCart.toString()}
							isValid={(value) => {
								return value.trim() !== "" && !isNaN(value as any);
							}}
							onUpdate={(value) => {
								alert("New value");
							}}
						/>
					</div>
					<div>
						<button className="text-blue-700 pointer" onClick={() => {}}>
							Delete
						</button>
					</div>
				</div>
			</div>
			<div>
				<p className="font-bold text-lg">
					{new Intl.NumberFormat("en-US", {
						style: "currency",
						currency: "CAD",
					}).format(item.value)}
				</p>
			</div>
		</div>
	);
}

export default function Cart() {
	const {
		data: items,
		error: itemsError,
		// isLoading: itemsIsLoading,
	} = useSWR(
		"http://localhost:5095/items",
		(arg: string) => {
			return fetch(arg, {
				credentials: "include",
			}).then<Item[]>((response) =>
				// TODO: sanitize this.
				response.json()
			);
		},
		{
			revalidateOnMount: true,
			refreshInterval: 100,
		}
	);

	const {
		data: cart,
		error: cartError,
		// isLoading: cartIsLoading,
	} = useSWR(
		"http://localhost:5095/cart",
		(arg: string) => {
			return fetch(arg, {
				credentials: "include",
			}).then<{ [key: string]: number }>((response) => response.json());
		},
		{
			revalidateOnMount: true,
			refreshInterval: 100,
		}
	);

	if (!items || !cart) {
		if (cartError || itemsError) {
			return <div>Failed to fetch the list of inventory</div>;
		}
		return <div>Loading</div>;
	}

	const itemsMap = new Map<string, Item>(items.map((el) => [el.id, el]));
	const totalItemsCount = Object.entries(cart)
		.map(([, value]) => value)
		.reduce((prev, next) => prev + next, 0);
	const subTotal = Object.entries(cart)
		.filter(([key]) => itemsMap.has(key))
		.map(([key, count]) => itemsMap.get(key)!.value * count)
		.reduce((prev, next) => prev + next, 0);

	return (
		<div className="p-10 my-0 mx-auto mt-10 m-5 max-w-[1000px]">
			<div>
				{Object.entries(cart)
					.filter(([key]) => itemsMap.has(key))
					.map(([key, value]) => {
						return (
							<CartItem
								key={key}
								countInCart={value}
								item={itemsMap.get(key)!}
							/>
						);
					})}
			</div>
			<div>
				<p className="text-right text-lg">
					Subtotal (
					{`${totalItemsCount} ${pluralizer("item", totalItemsCount)}`}):{" "}
					<span className="font-bold">
						{new Intl.NumberFormat("en-US", {
							style: "currency",
							currency: "CAD",
						}).format(subTotal)}
					</span>
				</p>
			</div>
		</div>
	);
}
