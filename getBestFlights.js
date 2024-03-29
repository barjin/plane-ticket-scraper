const { decodeFlightInfo } = require('./test.proto.js');
const { GoogleJSONParser } = require('./GoogleJsonParser.js');
const { RequestBodyFactory } = require('./RequestFactory.js');
const { gotScraping } = require('got-scraping');

const proxyPassword = process.env.APIFY_PROXY_PASSWORD;

async function getBestFlights({ fromIATA, toIATA, departureDay, oneWay, returnDay, maxTransfers }) {
    for(let repeat = 0; repeat < 3; repeat++) {
        try {
            const response = await gotScraping.post(
                'https://www.google.com/_/TravelFrontendUi/data/travel.frontend.flights.FlightsFrontendService/GetShoppingResults?&rt=c', {
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/117.0",
                    "Accept": "*/*",
                    "Accept-Language": "en;q=0.7,en-US;q=0.3",
                    "X-Same-Domain": "1",
                    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin"
                },
                body: RequestBodyFactory.createRequestBody({
                    departureDay,
                    returnDay: oneWay ? undefined : returnDay,
                    fromIATA,
                    toIATA, 
                    transfers: maxTransfers == 0 ? '1' :
                        maxTransfers == 1 ? '2' :
                        maxTransfers == 2 ? '3' : '0',
                }),
            }).then(x => x.body);
            const bestFlights = GoogleJSONParser.parse(response).getBestFlights();

            if(!bestFlights) return [];

            const base64strings = bestFlights[0].map(x => JSON.parse(x[8])[0]);
            return await Promise.all(
                base64strings.map(decodeFlightInfo)
            );
        } catch (e) {
            console.error(`Scraping failed. Retrying... [${repeat}/3]`);
        }
    }

    throw new Error(`Scraping ${fromIATA} -> ${toIATA} on ${departureDay} failed.`);
};

module.exports = { getBestFlights };
