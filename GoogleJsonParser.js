class GoogleFlightsResponse {
    constructor(data) {
        this.data = data;
    }

    getBestFlights() {
        for(let i = 2; i < 5; i++) {
            if(this.data[0][2][i]) return this.data[0][2][i];
        }
        return null;
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