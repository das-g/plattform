const Promise = require('bluebird')

const bulk = require('../indexPgTable')

async function transform(row) {
  const { questionnaireId, userId } = row

  const { questions, answers } = await Promise.props({
    questions: this.payload.getQuestions(questionnaireId),
    answers: this.payload.getAnswers(questionnaireId, userId),
  })

  row.resolved = {
    answers: answers
      .map((answer) => {
        const question =
          questions.find((question) => question.id === answer.questionId) || {}

        const { type } = question

        if (!type) {
          return false
        }

        return {
          ...answer,
          resolved: {
            question,
            value: {
              [type]: answer.payload?.value,
            },
          },
        }
      })
      .filter(Boolean),
  }

  return row
}

const getDefaultResource = async ({ pgdb }) => {
  return {
    table: pgdb.public.questionnaireSubmissions,
    payload: {
      getQuestions: async function (questionnaireId) {
        return pgdb.public.questions.find(
          { questionnaireId },
          { fields: ['id', 'type', 'text'] },
        )
      },
      getAnswers: async function (questionnaireId, userId) {
        return pgdb.public.answers.find(
          { questionnaireId, userId },
          { fields: ['id', 'questionId', 'payload'] },
        )
      },
    },
    transform,
  }
}

module.exports = {
  before: () => {},
  insert: async ({ resource, ...rest }) => {
    resource = Object.assign(
      await getDefaultResource({ resource, ...rest }),
      resource,
    )

    return bulk.index({ resource, ...rest })
  },
  after: () => {},
  final: () => {},
}
