# Flight Ticket Scraper 

This is a lightweight Apify Actor for extracting flight tickets data. It scrapes data from multiple flight ticket providers and returns them in a structured JSON format.

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

## Finding the actual tickets
While this Actor returns a lot of data, it doesn't retrieve the actual links to the airline tickets. Since the ticket prices are aggregated from multiple sources, we cannot guarantee you will find a ticket for the exact same price this actor returns. 

However, searching for the tickets on [Google Flights](https://flights.google.com) usually yields very similar results - at least at the time of scraping the data.