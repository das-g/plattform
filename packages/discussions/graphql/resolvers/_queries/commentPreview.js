const { Roles } = require('@orbiting/backend-modules-auth')
const { transform } = require('../../../lib/Comment')
const uuid = require('uuid/v4')
const Promise = require('bluebird')

module.exports = async (_, args, context) => {
  const {
    loaders,
    user,
    t
  } = context

  Roles.ensureUserHasRole(user, 'member')

  const {
    // TODO remove if FE is ready
    id = uuid(),
    discussionId,
    parentId
  } = args

  const [discussion, comment, parent] = await Promise.all([
    loaders.Discussion.byId.load(discussionId),
    id && loaders.Comment.byId.load(id),
    parentId && loaders.Comment.byId.load(parentId)
  ])
  if (!discussion) {
    throw new Error(t('api/discussion/404'))
  }

  if (comment) {
    return {
      ...comment,
      ...transform.edit(args)
    }
  } else {
    return transform.create(
      {
        ...args,
        ...(parent ? { depth: parent.depth + 1 } : {}),
        id,
        userId: user.id
      },
      context
    )
  }
}
