import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { TeaserSectionTitle } from '../TeaserShared'
import { NarrowContainer } from '../Grid'
import SlateRender from '../Editor/Render'
import schema from '../Editor/schema/flyer'
import { RenderContextProvider } from '../Editor/Render/Context'

const DefaultLink = ({ children }) => children

const styles = {
  container: css({
    padding: '46px 0',
    [mUp]: {
      padding: '70px 0',
    },
  }),
  link: css({
    marginTop: 27,
    [mUp]: {
      marginTop: 36,
    },
  }),
}

const TeaserFlyer = ({ flyer, Link = DefaultLink }) => {
  const value = flyer.content.children[0].children.filter(
    (n) => ['headline', 'flyerOpeningP'].indexOf(n.type) !== -1,
  )
  return (
    <div {...styles.container}>
      <NarrowContainer>
        <RenderContextProvider>
          <SlateRender value={value} schema={schema} raw />
        </RenderContextProvider>
        <div {...styles.link}>
          <Link href={flyer.meta.path} passHref>
            <TeaserSectionTitle small href={flyer.meta.path}>
              {flyer.meta.format?.meta.title}
            </TeaserSectionTitle>
          </Link>
        </div>
      </NarrowContainer>
    </div>
  )
}

const WrappedTeaserFlyer = (props) => <TeaserFlyer {...props} />

export default WrappedTeaserFlyer

WrappedTeaserFlyer.data = {
  config: {
    props: ({ data }) => {
      return {
        data: {
          loading: data.loading,
          error: data.error,
          flyer: data.latestFlyer?.nodes[0],
        },
      }
    },
  },
  query: `
    query getLatestFlyer {
      latestFlyer: documents(format: "republik/format-journal", first: 1) {
        nodes {
          id
          meta {
            title
            path
            format {
              meta {
                title
              }
            }
          }
          content
        }
      }
    }
  `,
}