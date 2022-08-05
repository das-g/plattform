const { Roles } = require('@orbiting/backend-modules-auth')

const {
  getOptions,
  isEligible,
  userHasSubmitted,
  userSubmitDate,
} = require('../../lib/Voting')

module.exports = {
  slug({ id, slug }) {
    return slug || id
  },
  async options(voting, args, { pgdb }) {
    return getOptions(voting.id, pgdb)
  },
  async discussion(voting, args, { pgdb }) {
    if (!voting.discussionId) {
      return
    }
    return pgdb.public.discussions.findOne({
      id: voting.discussionId,
    })
  },
  async userIsEligible(entity, args, { pgdb, user: me }) {
    return isEligible(me && me.id, entity, pgdb)
  },
  async userHasSubmitted(entity, args, context) {
    const { user: me } = context
    return userHasSubmitted(entity.id, me && me.id, context)
  },
  async userSubmitDate(entity, args, context) {
    const { user: me } = context
    return userSubmitDate(entity.id, me && me.id, context)
  },
  allowedRoles(entity) {
    const roles = entity?.allowedRoles?.filter((role) =>
      Roles.exposableRoles.includes(role),
    )

    return roles?.length ? roles : null
  },
  async turnout(voting, args, { pgdb }) {
    if (voting.result && voting.result.turnout) {
      // after counting
      return voting.result.turnout
    }
    return { entity: voting }
  },
  async groupTurnout(voting, args, { pgdb }) {
    if (voting.result && voting.result.groupTurnout) {
      // after counting
      return voting.result.groupTurnout
    }
    if (voting.groupSlug) {
      return { entity: voting, groupSlug: true }
    }
    return null
  },
  async result(entity, args, { pgdb }) {
    if (entity.result) {
      return entity.result
    }
    if (!entity.liveResult) {
      return null
    }
    return { entity }
  },
}
