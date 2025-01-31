import React, { useMemo } from 'react'
import { useSlate } from 'slate-react'
import { CharButtonConfig } from '../custom-types'
import { plainButtonRule } from '../../Button'
import { css } from 'glamor'
import { mUp } from '../../../theme/mediaQueries'
import { useColorContext } from '../../Colors/ColorContext'
import { config as charConfig } from '../config/special-chars'
import { insertSpecialChars } from './helpers/text'
import { useRenderContext } from '../Render/Context'

export const styles = {
  button: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    textDecoration: 'none',
    border: 0,
    padding: 0,
    color: 'inherit',
    backgroundColor: 'transparent',
    transition: 'opacity 0.3s',
    ':focus': {
      outline: 'none',
    },
    ':disabled': {
      cursor: 'default',
    },
    '@media(hover)': {
      ':hover:not(:disabled) > *': {
        opacity: 0.6,
      },
    },
  }),
  char: {
    width: 20,
    textAlign: 'center',
    [mUp]: {
      width: 24,
    },
  },
}

export const CharButton: React.FC<{
  config: CharButtonConfig
}> = ({ config }) => {
  const { t } = useRenderContext()
  const editor = useSlate()
  const [colorScheme] = useColorContext()
  return (
    <button
      title={t(`editor/specialChar/${config.char.type}`)}
      disabled={config.disabled}
      onMouseDown={() => insertSpecialChars(editor, config.char.insert)}
      {...plainButtonRule}
      {...styles.button}
      {...colorScheme.set('color', config.disabled ? 'disabled' : 'text')}
      style={config.char.buttonStyle}
    >
      <span style={{ width: 20, textAlign: 'center' }}>
        {config.char.render || config.char.insert}
      </span>
    </button>
  )
}

export const Invisible = ({ children, attributes, ...props }) => {
  const char = children?.props?.leaf?.text
  const displayAs = char && charConfig.find((c) => c.insert === char)?.render
  const invisibleRule = useMemo(
    () =>
      css({
        ':before': {
          color: '#1E90FF',
          content: displayAs || '',
        },
      }),
    [children],
  )
  return (
    <span {...props} {...attributes} {...invisibleRule}>
      {children}
    </span>
  )
}

export const Error = ({ children, attributes, ...props }) => (
  <span {...props} {...attributes} style={{ color: 'red' }}>
    {children}
  </span>
)
