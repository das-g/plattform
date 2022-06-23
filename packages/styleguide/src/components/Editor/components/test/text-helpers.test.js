/**
 --- Disabled due to slate-test-utils causing severe issues with building
 --- and apps depending on styleguide
 --- re-enable if a valid alternative for slate-test-utils has been found
 -- or the issues have been fixed

import Editor from '../editor'
import { buildTestHarness } from 'slate-test-utils'
import { createEditor, Transforms } from 'slate'
import { selectNearestWord } from '../editor/helpers/text'
import schema from '../../schema/article'

describe('Slate Editor', () => {
  function getMockEditor() {
    return createEditor()
  }
  window.document.getSelection = jest.fn()

  let value

  const defaultConfig = { schema }

  async function setup(structure, config = defaultConfig) {
    const mock = getMockEditor()
    const [editor] = await buildTestHarness(Editor)({
      editor: mock,
      initialValue: value,
      componentProps: {
        structure,
        config,
        value,
        setValue: (val) => (value = val),
      },
    })
    return editor
  }

  describe('selectNearestWord()', () => {
    const structure = [
      {
        type: 'paragraph',
        repeat: true,
      },
    ]
    let changedSelection

    it('should change selection to word inside which the cursor is', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const editor = await setup(structure)

      await Transforms.select(editor, { path: [0, 0], offset: 9 })
      changedSelection = selectNearestWord(editor)
      await new Promise(process.nextTick)
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 11 },
      })
      expect(changedSelection).toBe(true)
    })

    it('should not select words if cursor is outside', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const editor = await setup(structure)

      await Transforms.select(editor, { path: [0, 0], offset: 6 })
      changedSelection = selectNearestWord(editor)
      await new Promise(process.nextTick)
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      })
      expect(changedSelection).toBe(false)

      await Transforms.select(editor, { path: [0, 0], offset: 11 })
      changedSelection = selectNearestWord(editor)
      await new Promise(process.nextTick)
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 11 },
        focus: { path: [0, 0], offset: 11 },
      })
      expect(changedSelection).toBe(false)
    })

    it('should not select across elements', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem' }],
        },
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ]
      const editor = await setup(structure)

      await Transforms.select(editor, { path: [0, 0], offset: 5 })
      changedSelection = selectNearestWord(editor)
      await new Promise(process.nextTick)
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      })
    })

    it('should support dry run mode', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const editor = await setup(structure)

      await Transforms.select(editor, { path: [0, 0], offset: 9 })
      changedSelection = selectNearestWord(editor, true)
      await new Promise(process.nextTick)
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 9 },
        focus: { path: [0, 0], offset: 9 },
      })
      expect(changedSelection).toBe(true)
    })
  })
})
*/
