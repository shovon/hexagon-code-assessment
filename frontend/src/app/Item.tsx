import useSWR from "swr";

export function Item() {
	const { data, error, isLoading } = useSWR(
		"http://localhost:5095/items",
		(arg) => {
			return fetch(arg, {
				credentials: "include",
			}).then((response) => response.json());
		}
	);

	return;
}
