![Flight Ticket Scraper](https://i.imgur.com/J3PtagJ.png)

>
> This is the free version of this actor. 
>
> It doesn't support parallel scraping, so it's (much) slower. If you want to scrape flight tickets faster (cca 120 flights per minute), please consider supporting us by using the [premium version](https://apify.com/jindrich.bar/flight-ticket-scraper) of this actor. 
>
> It's only 2 USD per 1000 scraped flights. This one will remain free forever, though. :)
>

Search for great deals on flight tickets using this Actor. You can specify the airports you want to fly from and to, the dates you want to fly on and the number of transfers you want to have on your flight. The actor will then return a list of flights that match your criteria, along with their prices in a neatly formatted JSON.
## Usage

In the input tab, you can specify the following:
- **fromIATAs** - an array of IATA codes of the airports from which you want to fly. For example `["LAX", "SFO"]`.
- **toIATAs** - an array of IATA codes of the airports to which you want to fly. For example `["LHR", "LGW"]`.
- **currency** - a currency in which you want to see the prices. For example `USD`.
- Date options:
    - Departure:
        - **dateFrom** - a date from which you want to fly to your destination. For example `2024-12-03`.
        - **dateUntil** - a date until which you want to fly to your destination. For example `2024-12-10`.
            - If you want to search only flights on a specific date, you can keep this one empty.
    - Return:
        - **dateFromRet** - a date from which you want to return from your destination. For example `2024-12-03`.
            - If you want to search only one-way flights, leave this field empty.
        - **dateUntilRet** - a date until which you want to return from your destination. For example `2024-12-10`.
            - If you want to search only return flights on a specific date, you can keep this one empty.
- **transfers** - set how many transfers you want to have on your flight. 
    - **Watch out!** This one is slightly unintuitive. `0` means **no constraints** on the number of transfers, `1` means flights without transfers, `2` means flights with 1 transfer and `3` means flights with 2 transfers.

## Search for mistake fares
Sometimes, airlines make mistakes and sell tickets for a fraction of their usual price. These are called mistake fares (or error fares) and using this Actor, you can search for them. 

To do so, set the `transfers` input to `0` (Any number of transfers) and set the `dateFrom` and `dateUntil` inputs to a date range in the future. The further in the future you go, the more likely you are to find a mistake fare - or a good deal in general.

## Output

The Actor outputs a JSON array with date of the flight, its length, number of transfers, price, IATA of the aircraft and more.

![Table with results](https://i.imgur.com/tnjxtHu.png)

You can export this data as CSV, Excel file or JSON, so you can integrate them seamlessly into your workflow.

![JSON array with results](https://i.imgur.com/STsi9Wu.png)

## Finding the actual tickets
While this Actor returns a lot of data, it doesn't retrieve the actual links to the airline tickets. Since the ticket prices are aggregated from multiple sources, we cannot guarantee you will find a ticket for the exact same price this actor returns. 

However, searching for the tickets on [Google Flights](https://flights.google.com) usually yields very similar results - at least at the time of scraping the data.

