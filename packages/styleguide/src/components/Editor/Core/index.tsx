import React, { useCallback, useEffect } from 'react'
import { createEditor, Editor, Transforms, Text } from 'slate'
import { withHistory } from 'slate-history'
import {
  Slate,
  Editable,
  withReact,
  ReactEditor,
  useSelected,
  useSlate,
} from 'slate-react'
import { useMemoOne } from 'use-memo-one'
import { withNormalizations } from './decorators/normalization'
import { withElAttrsConfig } from './decorators/attrs'
import Footer from './Footer'
import { FormContextProvider, FormOverlay, useFormContext } from './Forms'
import Toolbar from './Toolbar'
import { config as elementsConfig } from '../config/elements'
import { LeafComponent } from './Mark'
import {
  CustomDescendant,
  CustomEditor,
  CustomElement,
  EditorConfig,
  NodeTemplate,
} from '../custom-types'
import { NAV_KEYS, navigateOnTab } from './helpers/tree'
import { handleInsert, insertOnKey } from './helpers/structure'
import { withInsert } from './decorators/insert'
import { withDelete } from './decorators/delete'
import { withCustomConfig } from './decorators/config'
import { ErrorMessage } from '../Render/Message'
import { LayoutContainer } from '../Render/Containers'
import {
  ERROR_CHARS,
  flagChars,
  getCharCount,
  INVISIBLE_CHARS,
} from './helpers/text'
import BlockUi from './BlockUi'
import { RenderContextProvider } from '../Render/Context'

export type SlateEditorProps = {
  value: CustomDescendant[]
  setValue: (t: CustomDescendant[]) => void
  structure?: NodeTemplate[]
  editor?: CustomEditor
  config: EditorConfig
}

const RenderedElementComponent: React.FC<{
  editor: CustomEditor
  element: CustomElement
  attributes: any
}> = ({ element, children, attributes }) => {
  const editor = useSlate()
  const [_, setFormPath] = useFormContext()
  const isSelected = useSelected()
  const path = ReactEditor.findPath(editor, element)
  const config = elementsConfig[element.type]
  if (!config) {
    return (
      <ErrorMessage
        attributes={attributes}
        error={`${element.type} config missing`}
      >
        {children}
      </ErrorMessage>
    )
  }
  const isVoid = config.attrs?.isVoid
  const showBlockUi =
    !config.attrs?.isInline && (config.Form || element.template?.repeat)
  const Component =
    editor.customConfig.editorSchema?.[element.type] ||
    editor.customConfig.schema[element.type]

  if (!Component) {
    return (
      <ErrorMessage
        attributes={attributes}
        error={`${element.type} component missing in schema`}
      >
        {children}
      </ErrorMessage>
    )
  }
  const selectVoid = (e) => {
    if (isVoid) {
      e.preventDefault()
      Transforms.select(editor, path)
    }
  }
  const baseStyles = showBlockUi
    ? { position: 'relative', display: 'block' }
    : {}

  return (
    <Component
      {...element}
      attributes={{
        ...attributes,
        style: { ...attributes.style, ...baseStyles },
      }}
      onMouseDown={selectVoid}
      onDoubleClick={(e) => {
        e.stopPropagation()
        setFormPath(path)
      }}
    >
      {showBlockUi && isSelected && <BlockUi path={path} element={element} />}
      {children}
    </Component>
  )
}

const SlateEditor: React.FC<SlateEditorProps> = ({
  value,
  setValue,
  structure,
  editor: mockEditor,
  config,
}) => {
  const editor = useMemoOne<CustomEditor>(
    () =>
      withInsert(config)(
        withDelete(
          withNormalizations(structure)(
            withElAttrsConfig(
              withCustomConfig(config)(
                withReact(withHistory(mockEditor ?? createEditor())),
              ),
            ),
          ),
        ),
      ),
    [],
  )

  const decorate = useCallback(([node, path]) => {
    let ranges = []

    if (Text.isText(node)) {
      ranges = ranges.concat(
        flagChars(INVISIBLE_CHARS, 'invisible')([node, path]),
      )
      // TODO: this selects the whole node. Why? No idea.
      ranges = ranges.concat(flagChars(ERROR_CHARS, 'error')([node, path]))
    }

    return ranges
  }, [])

  useEffect(() => {
    Editor.normalize(editor, { force: true })
  }, [])

  const renderElement = useCallback(
    ({ children, ...props }) => (
      <RenderedElementComponent {...props}>{children}</RenderedElementComponent>
    ),
    [],
  )

  const renderLeaf = useCallback(
    ({ children, ...props }) => (
      <LeafComponent {...props}>{children}</LeafComponent>
    ),
    [],
  )

  return (
    <RenderContextProvider t={config.t} Link={config.Link}>
      <FormContextProvider>
        <Slate
          editor={editor}
          value={value}
          onChange={(newValue) => {
            // console.log({ newValue })
            setValue(newValue)
          }}
        >
          <FormOverlay />
          {!config.readOnly && <Toolbar />}
          <LayoutContainer
            style={{ position: 'sticky', zIndex: 1 }}
            schema={config.schema}
          >
            <Editable
              readOnly={config.readOnly}
              data-testid='slate-content-editable'
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              decorate={decorate}
              onKeyDown={(event) => {
                // console.log('event', event.key, event.shiftKey, event)

                // disable key down events if max signs is reached
                if (
                  config.maxSigns &&
                  getCharCount(editor.children) >= config.maxSigns &&
                  !NAV_KEYS.concat('Backspace').includes(event.key)
                ) {
                  event.preventDefault()
                  return false
                }

                insertOnKey({ name: 'Enter', shift: true }, 'break')(
                  editor,
                  event,
                )
                handleInsert(editor, event)
                navigateOnTab(editor, event)
              }}
            />
          </LayoutContainer>
          <Footer config={config} />
        </Slate>
      </FormContextProvider>
    </RenderContextProvider>
  )
}

export default SlateEditor
