class GoogleFlightsResponse {
    constructor(data) {
        this.data = data;
    }

    getBestFlights() {
        // this.data[0] -> this.data[1]?
        return this.data[0][2][2];
    }
}


class GoogleJSONParser {
    static parse(json) {
        const dataLines = json.split('\n').slice(2).filter((x, i) => i % 2 === 1);

        const data = dataLines
            .map((x) => JSON.parse(x))
            .filter(x => x[0][0] === 'wrb.fr')
            .map(x => x[0])
            .map(x => {
                x[2] = JSON.parse(x[2]);
                return x;
            });

        return new GoogleFlightsResponse(data);
    }
}

module.exports = { GoogleJSONParser };