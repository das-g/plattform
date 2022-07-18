const type = 'Answer'

module.exports = {
  type,
  name: type.toLowerCase(),
  path: 'public.answers',
  searchable: false,
  mapping: {
    [type]: {
      dynamic: false,
      properties: {
        payload: {
          properties: {
            text: {
              type: 'text',
              analyzer: 'german',
            },
          },
        },
        resolved: {
          properties: {
            value: {
              properties: {
                Choice: {
                  type: 'keyword',
                },
                Document: {
                  type: 'keyword',
                },
                Range: {
                  type: 'long',
                },
                Text: {
                  type: 'text',
                  analyzer: 'german',
                },
              },
            },
            question: {
              properties: {
                text: {
                  type: 'text',
                  analyzer: 'german',
                },
              },
            },
          },
        },
      },
    },
  },
}
