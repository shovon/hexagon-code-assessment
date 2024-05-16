using System.ComponentModel.DataAnnotations;

namespace App;

class Carts<T, K>
	where T : notnull
	where K : notnull
{
	private Dictionary<T, Dictionary<K, int>> carts = new Dictionary<T, Dictionary<K, int>>();
	private readonly object _lockObject = new object();

	private Dictionary<K, int> getCart(T ownerKey)
	{
		if (!carts.ContainsKey(ownerKey))
		{
			carts[ownerKey] = new Dictionary<K, int>();
		}
		return carts[ownerKey];
	}

	public Dictionary<K, int> GetCart(T ownerKey)
	{
		Monitor.Enter(_lockObject);
		try
		{
			return getCart(ownerKey);
		}
		finally
		{
			Monitor.Exit(_lockObject);
		}

	}

	public void SetCartItem(T ownerKey, K itemId, int count)
	{
		try
		{
			Monitor.Enter(_lockObject);
			var cart = getCart(ownerKey);
			if (count <= 0)
			{
				cart.Remove(itemId);
				return;
			}

			cart[itemId] = count;
		}
		finally
		{
			Monitor.Exit(_lockObject);
		}
	}

	public void AddCartItem(T ownerKey, K itemId)
	{
		try
		{
			Monitor.Enter(_lockObject);
			var cart = getCart(ownerKey);
			int itemCount = 0;
			if (cart.ContainsKey(itemId))
			{
				itemCount = cart[itemId];
			}
			cart[itemId] = itemCount + 1;
		}
		finally
		{
			Monitor.Exit(_lockObject);
		}
	}

	public void ClearCart(T ownerKey)
	{
		try
		{
			Monitor.Enter(_lockObject);
			var cart = getCart(ownerKey);
			cart.Clear();
		}
		finally
		{
			Monitor.Exit(_lockObject);
		}
	}
}
