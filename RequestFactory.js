class RequestBodyFactory {
  static createRequestBody({ fromIATA, toIATA, departureDay, returnDay, transfers }) {
    const dateDeparture = new Date(departureDay).toLocaleDateString('en-GB').split('/').reverse().join('-');
    const dateReturn = returnDay && new Date(returnDay).toLocaleDateString('en-GB').split('/').reverse().join('-');

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
            ],
            ...(dateReturn ? 
                [[
                    [
                        [
                            [toIATA, 0]
                        ]
                    ],
                    [
                        [
                            [fromIATA, 0]
                        ]
                    ], null, 
                    Number(transfers),
                    [],
                    [], dateReturn, null, [],
                    [],
                    [], null, null, [], 3
                ]] : [])
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