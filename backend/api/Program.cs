using System;
using System.Collections.Generic;
using System.Linq;


var builder = WebApplication.CreateBuilder(args);

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

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

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

app.MapPost("/checkout", (CheckoutItem[] checkedOutItems) =>
{
    var dictionary = items.ToDictionary(item => item.Id);

    foreach (var element in checkedOutItems)
    {
        var something = dictionary[element.Id];
        if (something != null)
        {
            something.InventoryRemaining--;
        }
    }
})
.WithName("Checkout")
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

record Item(string Id, string Name, string Category, decimal Value, string ImageUrl, string? Description)
{
    public int InventoryRemaining { get; set; }
    public Item(string Id, string Name, string Category, decimal Value, string ImageUrl, string? Description, int InventoryRemaining) : this(Id, Name, Category, Value, ImageUrl, Description)
    {
        this.InventoryRemaining = InventoryRemaining;
    }
}
record CheckoutItem(string Id, int Count);