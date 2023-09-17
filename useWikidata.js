class SPARQLQueryDispatcher {
	constructor( endpoint ) {
		this.endpoint = endpoint;
	}

	query( sparqlQuery ) {
		const fullUrl = this.endpoint + '?query=' + encodeURIComponent( sparqlQuery );
		const headers = { 'Accept': 'application/sparql-results+json' };

		return fetch( fullUrl, { headers } ).then( body => body.json() );
	}
}

const endpointUrl = 'https://query.wikidata.org/sparql';
const queryDispatcher = new SPARQLQueryDispatcher( endpointUrl );

const wikidata = {
    getLabelFromIATA: (iata) => {
        const sparqlQuery = `
        SELECT ?item ?itemLabel 
            WHERE 
            {
            ?item wdt:P238 '${iata.replaceAll('\'', "\\\'")}'.
            SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }`;
        return queryDispatcher.query( sparqlQuery ).then( json => {
            return json.results.bindings[0]?.itemLabel.value ?? null;
        });
    }
};

const useWikidata = () => wikidata;

module.exports = { useWikidata };