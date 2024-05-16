namespace App;

class Carts<T, K>
	where T : notnull
	where K : notnull
{
	private Dictionary<T, Dictionary<K, int>> carts = new Dictionary<T, Dictionary<K, V>>();

	public Dictionary<K, int> GetCart(T ownerKey)
	{
		Dictionary<K, int>? cart;
		var cartFound = carts.TryGetValue(ownerKey, out cart);
		if (!cartFound || cart != null)
		{
			cart = new Dictionary<K, int>();
			carts.Add(ownerKey, cart);
		}

		return cart ?? throw new Exception("A fatal error occurred");
	}

	public void AddTocart(T ownerKey, K itemId)
	{
		int count;
		var cart = GetCart(ownerKey);
		var itemCount = GetCart(ownerKey);
		var exists = cart.TryGetValue(itemId, out count);
		if (!exists)
		{

		}
	}
}
