import { forwardRef } from 'react'
import { css } from 'glamor'
import { Label, useColorContext } from '@project-r/styleguide'
import { default as ReactTextAreaAutosize } from 'react-textarea-autosize'

const styles = {
  metaOption: css({ marginBottom: 24 }),
  metaOptionLabel: css({ display: 'block', marginBottom: 8 }),
  autoSize: css({
    paddingTop: '7px !important',
    paddingBottom: '6px !important',
    background: 'transparent',
  }),
}

export const MetaOption = ({ children }) => {
  return <div {...styles.metaOption}>{children}</div>
}

export const MetaOptionLabel = ({ children }) => {
  const [colorScheme] = useColorContext()
  return (
    <label {...styles.metaOptionLabel}>
      <Label {...colorScheme.set('color', 'textSoft')}>{children}</Label>
    </label>
  )
}

export const AutosizeInput = forwardRef((props, ref) => (
  <ReactTextAreaAutosize {...styles.autoSize} {...props} inputRef={ref} />
))
