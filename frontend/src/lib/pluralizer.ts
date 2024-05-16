export function pluralizer(noun: string, count: number): string {
	return count === 1 ? noun : noun + "s";
}

console.assert(pluralizer("item", 2) === "items");
