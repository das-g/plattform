import { ElementConfigI } from '../../../custom-types'
import { FlyerTileIcon } from '../../../../Icons'

const getId = (): string => Math.floor(Math.random() * 1000).toString()

export const baseConfig: Partial<ElementConfigI> = {
  attrs: {
    blockUi: {
      style: {
        top: 10,
        left: 10,
      },
    },
    stopFormIteration: true,
  },
  props: ['id'],
  defaultProps: {
    id: getId,
  },
}

export const config: ElementConfigI = {
  ...baseConfig,
  structure: [
    { type: 'flyerMetaP', main: true },
    { type: 'flyerTopic' },
    { type: 'flyerTitle' },
    { type: 'flyerAuthor' },
    { type: ['paragraph', 'ul', 'ol'], repeat: true },
    {
      type: ['flyerPunchline', 'pullQuote', 'articlePreview', 'figure'],
    },
  ],
  button: { icon: FlyerTileIcon },
}
