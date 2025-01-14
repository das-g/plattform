import {
  BlockQuoteElement,
  FigureCaptionElement,
  FigureElement,
  FlyerTileElement,
  FlyerTileOpeningElement,
  HeadlineElement,
  ParagraphElement,
  PullQuoteElement,
} from '../custom-types'

export const figureCaption: FigureCaptionElement = {
  type: 'figureCaption',
  children: [
    { text: '' },
    {
      type: 'figureByline',
      children: [{ text: '' }],
    },
    { text: '' },
  ],
}

export const figure: FigureElement = {
  type: 'figure',
  children: [
    {
      type: 'figureImage',
      children: [{ text: '' }],
    },
    figureCaption,
  ],
}

export const blockQuote: BlockQuoteElement = {
  type: 'blockQuote',
  children: [
    {
      type: 'blockQuoteText',
      children: [{ text: '' }],
    },
    figureCaption,
  ],
}

export const pullQuote: PullQuoteElement = {
  type: 'pullQuote',
  children: [
    {
      type: 'pullQuoteText',
      children: [{ text: '' }],
    },
    {
      type: 'pullQuoteSource',
      children: [{ text: '' }],
    },
  ],
}

export const headline: HeadlineElement = {
  type: 'headline',
  children: [{ text: '' }],
}

export const paragraph: ParagraphElement = {
  type: 'paragraph',
  children: [{ text: '' }],
}

export const flyerTileOpening: Partial<FlyerTileOpeningElement> = {
  type: 'flyerTileOpening',
  children: [
    {
      type: 'flyerDate',
      children: [{ text: '' }],
    },
    {
      type: 'headline',
      children: [{ text: '' }],
    },
    {
      type: 'flyerOpeningP',
      children: [
        {
          text: '',
        },
      ],
    },
  ],
}

export const flyerTile: Partial<FlyerTileElement> = {
  type: 'flyerTile',
  children: [
    {
      type: 'flyerMetaP',
      children: [
        {
          text: '',
        },
      ],
    },
    {
      type: 'flyerTopic',
      children: [
        {
          text: '',
        },
      ],
    },
    {
      type: 'flyerTitle',
      children: [
        {
          text: '',
        },
      ],
    },
    {
      type: 'flyerAuthor',
      children: [{ text: '' }],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: '',
        },
      ],
    },
    {
      type: 'flyerPunchline',
      children: [{ text: '' }],
    },
  ],
}
