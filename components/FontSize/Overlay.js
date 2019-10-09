import React from 'react'

import {
  DEFAULT_FONT_SIZE, Overlay, OverlayBody,
  OverlayToolbar, OverlayToolbarConfirm,
  Interaction, Slider,
  fontStyles, colors
} from '@project-r/styleguide'

import MdClose from 'react-icons/lib/md/close'
import withT from '../../lib/withT'
import { compose } from 'react-apollo'

import { useFontSize } from '../../lib/fontSize'
import { css } from 'glamor'

const FontSizeOverlay = ({ t, onClose }) => {
  const [fontSize, setFontSize] = useFontSize(DEFAULT_FONT_SIZE)
  const fontPercentage = Math.round(100 * fontSize / DEFAULT_FONT_SIZE)
  const labelStyle = css({
    ...fontStyles.sansSerifRegular14,
    color: colors.secondary })

  return (
    <Overlay onClose={onClose} mUpStyle={{ maxWidth: 400, minHeight: 'none' }}>
      <OverlayToolbar>
        <Interaction.Emphasis style={{ padding: '15px 20px', fontSize: 16 }}>
          {t('article/actionbar/fontSize/title')}
        </Interaction.Emphasis>
        <OverlayToolbarConfirm
          onClick={onClose}
          label={<MdClose size={24} fill='#000' />}
        />
      </OverlayToolbar>
      <OverlayBody>
        <div>
          <label {...labelStyle}>{'Font size: ' + fontPercentage + '%'}</label>
          <Slider
            value={fontSize}
            min='8'
            max='48'
            step='4'
            title={fontPercentage + '%'}
            onChange={(e, newValue) => { setFontSize(newValue) }}
            fullWidth />
          <br />
          <br />
        </div>
      </OverlayBody>
    </Overlay>
  )
}

export default compose(withT)(FontSizeOverlay)
