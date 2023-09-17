const { getBestFlights } = require('./getBestFlights.js');
const { Actor } = require('apify');
const { updateCurrencyContext, useCurrency } = require('./useCurrency.js');
const invariant = require('tiny-invariant');
const { useWikidata } = require('./useWikidata.js');

async function main() {
    await Actor.init();
    await updateCurrencyContext();
    const input = await Actor.getInput() ?? {};
    
    const { getRate } = useCurrency();
    const { getLabelFromIATA } = useWikidata();
    
    let { currency, dateFrom, dateUntil, fromIATA, toIATA } = input;

    invariant(fromIATA, 'You must provide a fromIATA. This is the IATA code of the airport you want to fly from. For example, "PRG".');
    invariant(toIATA, 'You must provide a toIATA. This is the IATA code of the airport you want to fly to. For example, "PRG".');
    invariant(fromIATA !== toIATA, 'fromIATA and toIATA must be different.');

    const [fromName, toName] = await Promise.all([getLabelFromIATA(fromIATA), getLabelFromIATA(toIATA)]);
    invariant(fromName, `Could not find an airport with IATA code "${fromIATA}".`);
    invariant(toName, `Could not find an airport with IATA code "${toIATA}".`);

    invariant(currency, 'You must provide a currency to convert to. For example, "USD" or "EUR".');
    invariant(getRate(1, currency, currency) === 1, `"${currency}" is not a valid currency.`);

    invariant(dateFrom, 'You must provide a dateFrom. For example, "2023-10-18".');
    invariant(new Date(dateFrom) > new Date(), 'dateFrom must be in the future.');
    invariant(!dateUntil || new Date(dateUntil) > new Date(), 'dateUntil must be in the future.');
    dateUntil ??= new Date(dateFrom).toISOString().split('T')[0];
    invariant(new Date(dateFrom) <= new Date(dateUntil), 'dateFrom must be before dateUntil.');

    while(dateFrom <= dateUntil) {
        try {
            console.log(`Scraping ${fromName} -> ${toName} on ${dateFrom}...`);

            const flights = await getBestFlights({
                fromIATA,
                toIATA,
                dateFrom,
            });

            
            for (let i = 0; i < flights.length; i++) {
                const flight = flights[i];
                let secsDelay = Math.floor(Math.random() * 20);
                if(secsDelay < 5) secsDelay = 5;

                if(!process.env.PAID) {
                    console.log(`You are using the free version of this actor, which does not support parallel scraping. 
                    
You must wait ${secsDelay} seconds before scraping the next flight. 

If you want to scrape faster, please upgrade to the premium version at XXX.`);
                    await new Promise(r => setTimeout(() => {
                        r();
                    }, secsDelay * 1000));
                }

                await Actor.pushData(
                    ((x) => {
                        const travelTime = (new Date(x.trip.tripStages.stages[x.trip.tripStages.stages.length - 1].arrivalTime) - new Date(x.trip.tripStages.stages[0].departureTime));
        
                        return {
                            ...x,
                            fromIATA,
                            toIATA,
                            fromName,
                            toName,
                            precision: undefined,
                            currency: currency ?? 'USD',
                            price: getRate(x.price.amount, x.currency, currency ?? 'USD'),
                            trip: {
                                ...x.trip,
                                tripStages: x.trip.tripStages.stages,
                                travelTimeSecs: travelTime / 1000,
                                travelTime: `${Math.floor(travelTime / 1000 / 60 / 60)}:${Math.floor(travelTime / 1000 / 60 % 60)}`,
                            }
                        };
                    })(flight)
                );
            }
        } catch (e) {
            console.error(e);
        }

        dateFrom = new Date(dateFrom);
        dateFrom.setDate(dateFrom.getDate() + 1);
        dateFrom = dateFrom.toISOString().split('T')[0];
    }

    console.log(`

Done scraping ${fromName} -> ${toName} from ${input.dateFrom} to ${input.dateUntil}.
`);
    await Actor.exit();
}

main();