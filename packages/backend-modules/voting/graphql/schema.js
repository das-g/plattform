module.exports = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  votings: [Voting!]!
  voting(slug: String!): Voting

  elections: [Election!]!
  election(slug: String!): Election

  questionnaires: [Questionnaire!]!
  questionnaire(slug: String!): Questionnaire
}

type mutations {
  createVoting(votingInput: VotingInput!): Voting!
  submitVotingBallot(
    votingId: ID!
    optionId: ID
  ): Voting!
  finalizeVoting(
    slug: String!
    dry: Boolean!
    # for undecided votes: VotingOption.name
    winner: String
    message: String
    video: VideoInput
  ): VotingResult!

  createElection(electionInput: ElectionInput!): Election!
  submitCandidacy(slug: String!, credential: String!): Candidacy!
  cancelCandidacy(slug: String!): Election!
  submitElectionBallot(
    electionId: ID!
    candidacyIds: [ID!]!
  ): Election!
  finalizeElection(
    slug: String!
    dry: Boolean!
    # for undecided elections: ALL candidacyIds to elect
    candidacyIds: [ID!]
    message: String
    video: VideoInput
  ): ElectionResult!


  submitAnswer(answer: AnswerInput!): QuestionInterface!
  submitAnswerUnattributed(
    answer: AnswerInput!
    pseudonym: ID!
  ): QuestionInterface!
  # reset some unsubmitted answer
  resetAnswer(id: ID!): QuestionInterface!
  # delete all my unsubmitted answers
  resetQuestionnaire(id: ID!): Questionnaire!
  submitQuestionnaire(id: ID!): Questionnaire!
  revokeQuestionnaire(id: ID!): Questionnaire!
  finalizeQuestionnaire(
    slug: String!
    dry: Boolean!
  ): JSON!
  anonymizeUserAnswers(questionnaireId: ID!): Questionnaire!
  # admins only
  refreshQuestionnaireResult(slug: String!): Questionnaire
}
`
