/**
 --- Disabled due to slate-test-utils causing severe issues with building
 --- and apps depending on styleguide
 --- re-enable if a valid alternative for slate-test-utils has been found
 -- or the issues have been fixed

import Editor from '../editor'
import { buildTestHarness } from 'slate-test-utils'
import { createEditor, Transforms } from 'slate'
import { toggleElement } from '../editor/helpers/structure'
import { cleanupTree } from '../editor/helpers/tree'
import schema from '../../schema/article'

describe('Slate Editor: Inline Insertion', () => {
  function getMockEditor() {
    return createEditor()
  }
  window.document.getSelection = jest.fn()

  let value

  const defaultConfig = { schema }

  const defaultStructure = [
    {
      type: 'headline',
    },
    {
      type: ['paragraph', 'blockQuote', 'ul', 'ol'],
      repeat: true,
    },
  ]

  async function setup(structure = defaultStructure, config = defaultConfig) {
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

  describe('non-void element (e.g. link)', () => {
    it('should wrap the element around selected text', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await setup(structure)

      await Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 11 },
      })
      toggleElement(editor, 'link')
      await new Promise(process.nextTick)

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              children: [{ text: 'ipsum' }],
            },
            { text: ' dolor sit amet.' },
          ],
        },
      ])
      expect(editor.selection).toEqual({
        anchor: {
          offset: 5,
          path: [0, 1, 0],
        },
        focus: {
          offset: 5,
          path: [0, 1, 0],
        },
      })
    })

    it('should wrap the element around corresponding word if selection is collapsed', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await setup(structure)

      await Transforms.select(editor, { path: [0, 0], offset: 9 })
      toggleElement(editor, 'link')
      await new Promise(process.nextTick)

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              children: [{ text: 'ipsum' }],
            },
            { text: ' dolor sit amet.' },
          ],
        },
      ])
      expect(editor.selection).toEqual({
        anchor: {
          offset: 5,
          path: [0, 1, 0],
        },
        focus: {
          offset: 5,
          path: [0, 1, 0],
        },
      })
    })

    it('should work when text has some marks', async () => {
      value = [
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            { text: 'ipsum', bold: true },
            { text: ' dolor' },
          ],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await setup(structure)

      await Transforms.select(editor, {
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 5 },
      })
      toggleElement(editor, 'link')
      await new Promise(process.nextTick)

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              children: [{ text: 'ipsum', bold: true }],
            },
            { text: ' dolor' },
          ],
        },
      ])
      expect(editor.selection.anchor.path).toEqual([0, 1, 0])
    })

    it('should work across complex inline/text nodes', async () => {
      value = [
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              children: [{ text: 'ipsum', bold: true }],
            },
            { text: ' dolor' },
          ],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await setup(structure)

      await Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 2], offset: 2 },
      })
      toggleElement(editor, 'inlineCode')
      await new Promise(process.nextTick)

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lore' },
            {
              type: 'inlineCode',
              children: [{ text: 'm ipsum d' }],
            },
            { text: 'olor' },
          ],
        },
      ])
      expect(editor.selection.anchor.path).toEqual([0, 1, 0])
    })

    it('should remove the element if it is already there and cursor is in it', async () => {
      value = [
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'link',
              children: [{ text: 'ipsum' }],
            },
            { text: ' dolor sit amet.' },
          ],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await setup(structure)

      await Transforms.select(editor, { path: [0, 1], offset: 2 })
      toggleElement(editor, 'link')
      await new Promise(process.nextTick)

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ])
      expect(editor.selection).toEqual({
        anchor: {
          offset: 6,
          path: [0, 0],
        },
        focus: {
          offset: 6,
          path: [0, 0],
        },
      })
    })
  })

  describe('void element (e.g. break)', () => {
    it('should delete selected text and insert element', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await setup(structure)

      await Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 11 },
      })
      toggleElement(editor, 'break')
      await new Promise(process.nextTick)

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'break',
              children: [{ text: '' }],
            },
            { text: ' dolor sit amet.' },
          ],
        },
      ])
    })

    it('should insert element at cursor position if selection is collapsed', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await setup(structure)

      await Transforms.select(editor, { path: [0, 0], offset: 6 })
      toggleElement(editor, 'break')
      await new Promise(process.nextTick)

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'break',
              children: [{ text: '' }],
            },
            { text: 'ipsum dolor sit amet.' },
          ],
        },
      ])
    })

    it('should not set the cursor on the element if it cannot be shown as selected', async () => {
      value = [
        {
          type: 'paragraph',
          children: [{ text: 'LoremIpsum' }],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
          repeat: true,
        },
      ]
      const editor = await setup(structure)
      await Transforms.select(editor, { path: [0, 0], offset: 5 })

      toggleElement(editor, 'break')
      await new Promise(process.nextTick)
      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem' },
            { type: 'break', children: [{ text: '' }] },
            { text: 'Ipsum' },
          ],
        },
      ])
      expect(editor.selection.focus).toEqual({ path: [0, 2], offset: 0 })
    })

    it('should remove the element if it is already there and cursor is in it', async () => {
      value = [
        {
          type: 'paragraph',
          children: [
            { text: 'Lorem ' },
            {
              type: 'break',
              children: [{ text: '' }],
            },
            { text: 'ipsum dolor sit amet.' },
          ],
        },
      ]
      const structure = [
        {
          type: 'paragraph',
        },
      ]
      const editor = await setup(structure)

      await Transforms.select(editor, { path: [0, 1, 0], offset: 0 })
      toggleElement(editor, 'break')
      await new Promise(process.nextTick)

      expect(cleanupTree(value)).toEqual([
        {
          type: 'paragraph',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ])
    })

    it('should not change anything if the element is not allowed', async () => {
      value = [
        {
          type: 'headline',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ]
      const structure = [
        {
          type: 'headline',
        },
      ]
      const editor = await setup(structure)

      await Transforms.select(editor, {
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 11 },
      })
      toggleElement(editor, 'break')
      await new Promise(process.nextTick)

      expect(cleanupTree(value)).toEqual([
        {
          type: 'headline',
          children: [{ text: 'Lorem ipsum dolor sit amet.' }],
        },
      ])
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 11 },
      })
    })
  })
})
*/
