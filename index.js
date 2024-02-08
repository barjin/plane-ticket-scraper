const { getBestFlights } = require('./getBestFlights.js');
const { useWikidata } = require('./useWikidata.js');
const { updateCurrencyContext, useCurrency } = require('./useCurrency.js');
const { writeFileSync } = require('fs');

const invariant = require('tiny-invariant');

process.env.PAID ??= !process.env.APIFY_IS_AT_HOME;

const input = {
    fromIATAs: ['PRG'],
    toIATAs: ['GLA', 'EDI'],
    currency: 'CZK',
    lengthMin: 14, // minimum length of the trip in days
    lengthMax: 20, // maximum length of the trip in days
    dateFrom: '2024-07-27', // trip from->to - Start date
    dateUntil: '2024-08-18', // trip from->to - End date (optional)
    dateFromRet: '2024-07-27', // trip from->to - Start date
    dateUntilRet: '2024-08-18', // trip from->to - End date (optional)
    // dateFromRet: '2024-02-18', // trip to->from - Start date (optional)
    // dateUntilRet: '2024-02-18', // trip to->from - End date (optional)
    maxTransfers: 1,
};

async function main() {
    await updateCurrencyContext();

    const results = [];
    
    const { getRate } = useCurrency();
    const { getLabelFromIATA } = useWikidata();
    
    let { fromIATAs, toIATAs, maxTransfers } = input;

    invariant(fromIATAs, 'You must provide the fromIATAs list. This is an array of IATA codes of the airports you want to fly from. For example, ["PRG"].');
    invariant(toIATAs, 'You must provide the toIATAs list. This is an array of IATA codes of the airports you want to fly to. For example, ["LHR"].');
    invariant(fromIATAs.length > 0, 'You must provide at least one IATA code in fromIATAs.');
    invariant(toIATAs.length > 0, 'You must provide at least one IATA code in toIATAs.');

    for(const fromIATA of fromIATAs) {
        for(const toIATA of toIATAs) {
            let { currency, dateFrom, dateUntil, dateFromRet, dateUntilRet, lengthMin, lengthMax } = input;

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
            // invariant(getRate(1, currency, currency) === 1, `"${currency}" is not a valid currency.`);

            invariant(dateFrom, 'You must provide a dateFrom. For example, "2023-10-18".');
            invariant(new Date(dateFrom) > new Date(), 'dateFrom must be in the future.');
            invariant(!dateUntil || new Date(dateUntil) > new Date(), 'dateUntil must be in the future.');
            dateUntil ??= new Date(dateFrom).toISOString().split('T')[0];
            invariant(new Date(dateFrom) <= new Date(dateUntil), 'dateFrom must be before dateUntil.');
            if(dateFromRet || dateUntilRet) {
                invariant(new Date(dateFromRet).getTime(), 'dateFromRet must be a valid date');
                invariant(!dateUntilRet || new Date(dateUntilRet).getTime(), 'dateUntilRet must be a valid date');
                dateUntilRet ??= new Date(dateFromRet).toISOString().split('T')[0];
                invariant(new Date(dateFromRet) <= new Date(dateUntilRet), 'dateFromRet must be before dateUntilRet.');
                invariant(new Date(dateFromRet) >= new Date(dateFrom), 'The return date (dateFromRet) must be after the departure date (dateFrom).');
            }

            let oneWay = true;
            if(dateFromRet) oneWay = false;

            for (let departureDay = new Date(dateFrom); departureDay <= new Date(dateUntil); departureDay.setDate(departureDay.getDate() + 1)) {
                if(oneWay) {
                    dateFromRet = departureDay;
                    dateUntilRet = departureDay;
                }

                const h_departureDay = departureDay.toISOString().split('T')[0];
                
                for (let returnDay = new Date(dateFromRet); returnDay <= new Date(dateUntilRet); returnDay.setDate(returnDay.getDate() + 1)) {
                    if (lengthMin && returnDay - departureDay < lengthMin * 24 * 60 * 60 * 1000) continue;
                    if (lengthMax && returnDay - departureDay > lengthMax * 24 * 60 * 60 * 1000) break;
                    if (departureDay - returnDay > 0) break;

                    const h_returnDay = returnDay.toISOString().split('T')[0];
                    try {
                        console.log(`Scraping ${fromName} -> ${toName} on ${h_departureDay}${!oneWay ? `, returning ${h_returnDay}` : ''}...`);

                        const flights = await getBestFlights({
                            fromIATA,
                            toIATA,
                            departureDay: h_departureDay,
                            oneWay,
                            returnDay: h_returnDay,
                            maxTransfers
                        });
                        
                        for (let i = 0; i < flights.length; i++) {
                            const flight = flights[i];

                            results.push(((x) => {
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
                                        date: h_departureDay,
                                        returnDate: !oneWay && h_returnDay,
                                    };
                            })(flight));
                            
                            if(process.env.PAID !== '1') {
                                console.log(`Scraped ${fromName} -> ${toName} on ${h_departureDay}${!oneWay ? ` (back on ${h_returnDay})` : ''} for ${currency ?? 'USD'} ${getRate(flight.price.amount, flight.currency, currency ?? 'USD')}.`);
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }
            }

        console.log(`
        Done scraping ${fromName} -> ${toName}.

`);
    }

    writeFileSync('results.json', JSON.stringify(results, null, 4));
}}

main();