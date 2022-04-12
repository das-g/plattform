import React, {
  Attributes,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Editor } from 'slate'
import { ReactEditor, useSlate } from 'slate-react'
import { config as mConfig, configKeys as mKeys } from '../../marks'
import { ToolbarButton } from './Toolbar'
import {
  ButtonConfig,
  CustomEditor,
  CustomMarksType,
  CustomText,
} from '../../../custom-types'
import { getTextNode } from '../helpers/tree'
import { css } from 'glamor'
import { useColorContext } from '../../../../Colors/ColorContext'
import { isEmpty, selectPlaceholder } from '../helpers/text'

const styles = {
  leaf: css({
    position: 'relative',
  }),
  placeholder: css({
    cursor: 'text',
    position: 'absolute',
    whiteSpace: 'nowrap',
  }),
}

const isMarkActive = (editor: CustomEditor, mKey: CustomMarksType): boolean => {
  const marks = Editor.marks(editor)
  return !!marks && !!marks[mKey]
}

const toggleMark = (editor: CustomEditor, mKey: CustomMarksType): void => {
  const isActive = isMarkActive(editor, mKey)
  if (isActive) {
    Editor.removeMark(editor, mKey)
  } else {
    Editor.addMark(editor, mKey, true)
  }
}

export const MarkButton: React.FC<{
  config: ButtonConfig
}> = ({ config }) => {
  const editor = useSlate()
  const mKey = config.type as CustomMarksType
  const mark = mConfig[mKey]
  if (!mark.button) {
    return null
  }
  return (
    <ToolbarButton
      button={mark.button}
      disabled={config.disabled}
      active={isMarkActive(editor, mKey)}
      onClick={() => toggleMark(editor, mKey)}
    />
  )
}

export const LeafComponent: React.FC<{
  attributes: Attributes
  children: ReactElement
  leaf: CustomText
}> = ({ attributes, children, leaf }) => {
  const [colorScheme] = useColorContext()
  const editor = useSlate()
  const [placeholderStyle, setPlaceholderStyle] = useState({})

  // ReactEditor cannot find the path of a leaf directly.
  // That's not so great if the placeholder isn't the last text child
  const parentPath = ReactEditor.findPath(editor, children.props.parent)
  const parentNode = Editor.node(editor, parentPath)
  const node = getTextNode(parentNode, editor)

  const markStyles = mKeys
    .filter((mKey) => leaf[mKey])
    .reduce((acc, mKey) => {
      const mStyle = mConfig[mKey].styles
      return { ...acc, ...mStyle }
    }, {})

  const showPlaceholder = isEmpty(leaf.text) && !leaf.end
  const placeholderRef = useRef<HTMLSpanElement>()

  useEffect(() => {
    const placeholderEl = placeholderRef.current
    if (!placeholderEl || !showPlaceholder) return setPlaceholderStyle({})
    setPlaceholderStyle({
      width: placeholderEl.getBoundingClientRect().width,
      display: 'inline-block',
    })
  }, [showPlaceholder])

  return (
    <span
      {...markStyles}
      {...styles.leaf}
      style={placeholderStyle}
      {...attributes}
    >
      {showPlaceholder && (
        <span
          ref={placeholderRef}
          {...styles.placeholder}
          {...colorScheme.set('color', 'disabled')}
          style={{ userSelect: 'none' }}
          contentEditable={false}
          onClick={() => selectPlaceholder(editor, node)}
        >
          {leaf.placeholder}
        </span>
      )}
      {children}
    </span>
  )
}
