module.exports = `

type Session {
  id: ID!
  ipAddress: String,
  userAgent: String,
  email: String
  cookie: String
  expiresAt: DateTime
}

type User {
  id: ID!
  initials: String
  username: String
  name: String
  firstName: String
  lastName: String
  email: String
  hasPublicProfile: Boolean
  roles: [String!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  sessions: [Session!]
}

type SignInResponse {
  phrase: String!
}
`
