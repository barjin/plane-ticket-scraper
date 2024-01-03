![Flight Ticket Scraper](https://i.imgur.com/J3PtagJ.png)

A highly experimental script for scraping flight ticket prices from Google Flights. Decodes the protobuf data returned by Google Flights and returns a JSON array with the results.

## Usage

In the input object (`index.js`), you can specify the following:
- **fromIATAs** - an array of IATA codes of the airports from which you want to fly. For example `["LAX", "SFO"]`.
- **toIATAs** - an array of IATA codes of the airports to which you want to fly. For example `["LHR", "LGW"]`.
- **currency** - a currency in which you want to see the prices. For example `USD`.
- Date options:
    - Departure:
        - **dateFrom** - a date from which you want to fly TO your destination. For example `2024-12-03`.
        - **dateUntil** - a date until which you want to fly TO your destination. For example `2024-12-10`.
            - If you want to search only flights on a specific date, you can keep this one `undefined`.
    - Return:
        - **dateFromRet** - a date from which you want to return FROM your destination. For example `2024-12-03`.
            - If you want to search only one-way flights, leave this field `undefined`.
        - **dateUntilRet** - a date until which you want to return FROM your destination. For example `2024-12-10`.
            - If you want to search only return flights on a specific date, you can keep this one `undefined`.
- **maxTransfers** - set how many transfers you want to have on your flight (0 up to 2, any other value will be ignored and no constraint will be applied).

Note that with large date ranges, the script may take a long time to run - it efficiently calculates a cross product of all the possible combinations of the specified parameters - all the source airports, target airports and dates.

## Output

The tool outputs a JSON array with date of the flight, its length, number of transfers, price, IATA of the aircraft and more.

![JSON array with results](https://i.imgur.com/STsi9Wu.png)

## Finding the actual tickets
While this tool returns a lot of data, it doesn't retrieve the actual links to the airline tickets. 

However, searching for the tickets on [Google Flights](https://flights.google.com) usually yields very similar results - at least at the time of scraping the data.

