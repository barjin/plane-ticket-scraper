class RequestBodyFactory {
  static createRequestBody({ fromIATA, toIATA, dateFrom, transfers }) {
    const dateDeparture = new Date(dateFrom).toLocaleDateString('en-GB').split('/').reverse().join('-');

    const innerRequestBody = [
        [],
        [null, null, 2, null, [], 1, [1, 0, 0, 0], null, null, null, null, null, null, [
            [
                [
                    [
                        [fromIATA, 0]
                    ]
                ],
                [
                    [
                        [toIATA, 0]
                    ]
                ], null, 
                Number(transfers), // 0 - any number of stops, 1 - direct flights, 2 - 1 stop, 3 - 2 stops
                [],
                [], dateDeparture, null, [],
                [],
                [], null, null, [], 3
            ]
        ], null, null, null, 1, null, null, null, null, null, []], 1, 0, 0
    ];

    const b = [
        null,
        JSON.stringify(innerRequestBody),
    ];

    // console.debug(JSON.stringify(b));

    return `f.req=${encodeURIComponent(JSON.stringify(b))}`;
  }
}

module.exports = { RequestBodyFactory };