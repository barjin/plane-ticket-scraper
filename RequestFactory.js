class RequestBodyFactory {
  static createRequestBody({ fromIATA, toIATA, dateFrom }) {
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
                ], null, 0, [],
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

    return `f.req=${encodeURIComponent(JSON.stringify(b))}`;
  }
}

module.exports = { RequestBodyFactory };