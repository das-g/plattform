const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { id, text } = args
  const { user: me, pgdb, loaders, t } = context
  Roles.ensureUserHasRole(me, 'editor')

  const tx = await pgdb.transactionBegin()
  try {
    const memo = await loaders.Memo.byId.load(id)

    if (memo.userId !== me.id) {
      throw new Error(t('api/editMemo/error/notYours')) // @TODO: Add translation
    }

    const updatedMemo = await tx.publikator.memos.updateAndGetOne(
      { id },
      {
        text,
        published: true,
        updatedAt: new Date(),
      },
    )

    await tx.transactionCommit()

    return updatedMemo
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}
