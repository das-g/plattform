import React from 'react'
import { createBlockButton, buttonStyles, matchBlock } from '../../utils'
import injectBlock from '../../utils/injectBlock'
import { Text, Block } from 'slate'

import { LinkForm } from '../link/ui'

import { Label } from '@project-r/styleguide'

export default ({ TYPE }) => {
  const InsertButton = createBlockButton({
    type: TYPE,
    reducer: props =>
      event => {
        const { onChange, value } = props
        event.preventDefault()

        return onChange(
          value
            .change()
            .call(
              injectBlock,
              Block.create({
                kind: 'block',
                type: TYPE,
                nodes: [Text.create('Text')]
              })
            )
        )
      }
  })(
    ({ active, disabled, visible, ...props }) => {
      return <span
        {...buttonStyles.block}
        {...props}
        data-active={active}
        data-disabled={disabled}
        data-visible={visible}
      >
        Button
      </span>
    }
  )

  const Form = ({ value, onChange }) => {
    if (!value.blocks.some(matchBlock(TYPE))) {
      return null
    }
    return <div>
      <Label>Buttons</Label>
      <LinkForm
        kind='block'
        TYPE={TYPE}
        nodes={value.blocks.filter(matchBlock(TYPE))}
        value={value}
        onChange={onChange} />
    </div>
  }

  return {
    forms: [Form],
    insertButtons: [InsertButton]
  }
}
