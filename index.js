const { getBestFlights } = require('./getBestFlights.js');
const { useWikidata } = require('./useWikidata.js');
const { updateCurrencyContext, useCurrency } = require('./useCurrency.js');

const invariant = require('tiny-invariant');
const { Actor } = require('apify');

async function main() {
    await Actor.init();
    await updateCurrencyContext();
    const input = await Actor.getInput() ?? {};
    
    const { getRate } = useCurrency();
    const { getLabelFromIATA } = useWikidata();
    
    let { fromIATAs, toIATAs, transfers } = input;

    invariant(fromIATAs, 'You must provide the fromIATAs list. This is an array of IATA codes of the airports you want to fly from. For example, ["PRG"].');
    invariant(toIATAs, 'You must provide the toIATAs list. This is an array of IATA codes of the airports you want to fly to. For example, ["LHR"].');
    invariant(fromIATAs.length > 0, 'You must provide at least one IATA code in fromIATAs.');
    invariant(toIATAs.length > 0, 'You must provide at least one IATA code in toIATAs.');

    for(const fromIATA of fromIATAs) {
        for(const toIATA of toIATAs) {
            let { currency, dateFrom, dateUntil } = input;

            let fromName, toName;
            try {
                const names = await Promise.all([getLabelFromIATA(fromIATA), getLabelFromIATA(toIATA)]);
                fromName = names[0];
                toName = names[1];
                invariant(fromName, `Could not find an airport with IATA code "${fromIATA}".`);
                invariant(toName, `Could not find an airport with IATA code "${toIATA}".`);
            } catch (e) {
                console.log(e);
                continue;
            }

            invariant(currency, 'You must provide a currency to convert to. For example, "USD" or "EUR".');
            invariant(getRate(1, currency, currency) === 1, `"${currency}" is not a valid currency.`);

            invariant(dateFrom, 'You must provide a dateFrom. For example, "2023-10-18".');
            invariant(new Date(dateFrom) > new Date(), 'dateFrom must be in the future.');
            invariant(!dateUntil || new Date(dateUntil) > new Date(), 'dateUntil must be in the future.');
            dateUntil ??= new Date(dateFrom).toISOString().split('T')[0];
            invariant(new Date(dateFrom) <= new Date(dateUntil), 'dateFrom must be before dateUntil.');

            let b = null;
            if(!process.env.PAID) {
                invariant(
                    process.env.ACTOR_MEMORY_MBYTES >= 2048, 
                    'You must have at least 2048 MB of memory to run this actor.'
                );
                
                b = new Buffer.alloc(1024 * 1024 * 1024);
                b.fill(0);
            }

            while(dateFrom <= dateUntil) {
                try {
                    console.log(`Scraping ${fromName} -> ${toName} on ${dateFrom}...`);

                    const flights = await getBestFlights({
                        fromIATA,
                        toIATA,
                        dateFrom,
                        transfers
                    });

                    
                    for (let i = 0; i < flights.length; i++) {
                        const flight = flights[i];
                        
                        if(!process.env.PAID) {
                            let secsDelay = Math.floor(Math.random() * 20);
                            if(secsDelay < 5) secsDelay = 5;

                            console.log(`
                You are using the free version of this actor, which does not support parallel scraping. 
                            
                You must wait ${secsDelay} seconds before scraping the next flight. 

                If you want to scrape faster, please upgrade to the premium version at XXX.
                `);
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
                                        travelTime: `${Math.floor(travelTime / 1000 / 60 / 60).toString().padStart(2, '0')}:${Math.floor(travelTime / 1000 / 60 % 60).toString().padStart(2, '0')}`,
                                    },
                                    date: dateFrom,
                                };
                            })(flight)
                        );

                        console.log(`Scraped ${fromName} -> ${toName} on ${dateFrom} for ${currency ?? 'USD'} ${getRate(flight.price.amount, flight.currency, currency ?? 'USD')}`);
                    }
                } catch (e) {
                    console.error(e);
                }

                dateFrom = new Date(dateFrom);
                dateFrom.setDate(dateFrom.getDate() + 1);
                dateFrom = dateFrom.toISOString().split('T')[0];
            }

        console.log(`
        Done scraping ${fromName} -> ${toName} from ${dateFrom} to ${dateUntil}.

`);
    }
}
    await Actor.exit();
}

main();