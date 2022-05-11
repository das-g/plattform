import React, { useEffect, useState } from 'react'
import { useSlate } from 'slate-react'
import { config as elConfig } from '../../elements'
import { ToolbarButton } from './Toolbar'
import { CustomElementsType, ButtonConfig } from '../../../custom-types'
import { insertElement } from '../helpers/structure'
import { useFormContext } from './Forms'

export const ContainerComponent: React.FC<{
  [x: string]: unknown
}> = ({ props, children }) => {
  return <div {...props}>{children}</div>
}

export const InsertButton: React.FC<{
  config: ButtonConfig
}> = ({ config }) => {
  const editor = useSlate()
  const setFormPath = useFormContext()[1]
  const [pendingFormPath, setPendingFormPath] = useState<number[]>()
  const element = elConfig[config.type]

  // slightly cleaner hack than the use of timeout
  // to update formPath AFTER the insert has completed
  // and the value was updated.
  useEffect(() => {
    if (pendingFormPath) {
      setFormPath(pendingFormPath)
      setPendingFormPath(undefined)
    }
  }, [editor.children])

  if (!element?.button) {
    return null
  }

  return (
    <ToolbarButton
      button={element.button}
      disabled={config.disabled}
      active={config.active}
      disableWhenActive={true}
      onClick={() => {
        const insertPath = insertElement(
          editor,
          config.type as CustomElementsType,
        )
        setPendingFormPath(insertPath)
      }}
    />
  )
}
