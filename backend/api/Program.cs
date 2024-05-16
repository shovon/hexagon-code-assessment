using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using App;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddConnections();
// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

const string SessionCookieString = "session";

app.Use(async (context, next) =>
{
    context.Response.Headers["Access-Control-Allow-Origin"] = new[] { (string)context.Request.Headers["Origin"] };
    context.Response.Headers["Access-Control-Allow-Headers"] = new[] { "Origin, X-Requested-With, Content-Type, Accept" };
    context.Response.Headers["Access-Control-Allow-Methods"] = new[] { "GET, POST, PUT, DELETE, OPTIONS" };
    context.Response.Headers["Access-Control-Allow-Credentials"] = new[] { "true" };

    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 200;
        await context.Response.WriteAsync("OK");
        return;
    }

    await next(context);
});

app.Use(async (context, next) =>
{
    var sessionCookie = context.Request.Cookies[SessionCookieString];

    var cookieOptions = new CookieOptions()
    {
        HttpOnly = true,
        Secure = true, // Ensure HTTPS is used
        SameSite = SameSiteMode.None, // Adjust as needed
        MaxAge = TimeSpan.FromDays(365),
    };

    if (sessionCookie == null)
    {
        var newCookie = Guid.NewGuid().ToString();
        context.Response.Cookies.Append("session", Guid.NewGuid().ToString(), cookieOptions);
        context.Items["cookie"] = newCookie;
    }
    else
    {
        var existingCookie = sessionCookie;
        context.Response.Cookies.Append("session", existingCookie, cookieOptions);
        context.Items["cookie"] = existingCookie;
    }


    await next(context);
});

var items = new Item[]
{
    new ("1", "Laptop", "Electronics", 1999.99m, "https://picsum.photos/id/2/800/600", "Lorem ipsum dolor", 100),
    new ("2", "Fork", "Kitchen & Dining", 4.99m, "https://picsum.photos/id/23/800/600", "Lorem ipsum dolor", 100),
    new ("3", "Mug", "Kitchen & Dining", 13.45m, "https://picsum.photos/id/30/800/600", "Lorem ipsum dolor", 100),
    new ("4", "Record Player", "Electronics", 249.99m, "https://picsum.photos/id/39/800/600", "Lorem ipsum dolor", 100),
    new ("5", "Controller", "Electronics", 27.99m, "https://picsum.photos/id/96/800/600", "Lorem ipsum dolor", 100),
    new ("6", "Tricycle", "Bikes, Scooters & Ride-Ons", 149.95m, "https://picsum.photos/id/146/800/600", "Lorem ipsum dolor", 100),
    new ("7", "Guitar", "Musical Instruments", 99.99m, "https://picsum.photos/id/145/800/600", "Lorem ipsum dolor", 100),
    new ("8", "Skateboard", "Bikes, Scooters & Ride-Ons", 34.99m, "https://picsum.photos/id/157/800/600", "Lorem ipsum dolor", 100),
    new ("9", "Counterfeit iPhone", "Electronics", 249.77m, "https://picsum.photos/id/160/800/600", "Lorem ipsum dolor", 100),
    new ("10", "Clock", "Clocks", 12.99m, "https://picsum.photos/id/175/800/600", "Lorem ipsum dolor", 100),
    new ("11", "Tea Kettle", "Kitchen & Dining", 59.99m, "https://picsum.photos/id/225/800/600", "Lorem ipsum dolor", 100),
    new ("12", "Analogue Camera", "Film Cameras", 349.99m, "https://picsum.photos/id/250/800/600", "Lorem ipsum dolor", 100)
};

app.MapGet("/items", () =>
{
    return items;
})
.WithName("Items")
.WithOpenApi();

var carts = new Carts<string, string>();


app.MapPost("/checkout", (HttpContext context) =>
{
    var sessionCookie = (string)context.Items["cookie"];
    if (sessionCookie == null)
    {
        // 500 error because a cookie should have been set by default.
        context.Response.StatusCode = 500;
        return Results.Json(null);
    }

    var dictionary = items.ToDictionary(item => item.Id);
    var cart = carts.GetCart(sessionCookie);

    foreach (var element in cart)
    {
        int count = dictionary[element.Key].InventoryRemaining;
        dictionary[element.Key].InventoryRemaining = count - element.Value;
    }

    return Results.Json(null);
})
.WithName("Checkout")
.WithOpenApi();


app.MapGet("/cart", (HttpContext context) =>
{
    var sessionCookie = (string)context.Items["cookie"];
    if (sessionCookie == null)
    {
        // 500 error because a cookie should have been set by default.
        context.Response.StatusCode = 500;
        return Results.Json(null);
    }

    return Results.Json(carts.GetCart(sessionCookie));
});

app.MapPost("/cart/set", (SetCartItem cartItem, HttpContext context) =>
{
    var sessionCookie = (string)context.Items["cookie"];
    if (sessionCookie == null)
    {
        // 500 error because a cookie should have been set by default.
        context.Response.StatusCode = 500;
        return;
    }

    carts.SetCartItem(sessionCookie, cartItem.Id, cartItem.Count);
});

app.MapPost("/cart/add", (AddCartItem cartItem, HttpContext context) =>
{
    var sessionCookie = (string)context.Items["cookie"];
    if (sessionCookie == null)
    {
        // 500 error because a cookie should have been set by default.
        context.Response.StatusCode = 500;
        return;
    }

    carts.AddCartItem(sessionCookie, cartItem.Id);
});

app.Run();

record Item(string Id, string Name, string Category, decimal Value, string ImageUrl, string? Description)
{
    public int InventoryRemaining { get; set; }
    public Item(string Id, string Name, string Category, decimal Value, string ImageUrl, string? Description, int InventoryRemaining) : this(Id, Name, Category, Value, ImageUrl, Description)
    {
        this.InventoryRemaining = InventoryRemaining;
    }
}
record CheckoutItem(string Id, int Count);
record AddCartItem(string Id, int Count);
record SetCartItem(string Id, int Count);
