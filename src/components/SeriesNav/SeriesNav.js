import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import PropTypes from 'prop-types'
import {
  TeaserCarousel,
  TeaserCarouselTileContainer
} from '../../components/TeaserCarousel'
import { useColorContext } from '../Colors/useColorContext'
import { ColorContextLocalExtension } from '../Colors/ColorContext'
import {
  sansSerifMedium16,
  sansSerifMedium19,
  sansSerifRegular15,
  sansSerifRegular18
} from '../Typography/styles'
import Center, { BREAKOUT_SIZES } from '../../components/Center'
import SeriesNavTile from './SeriesNavTile'
import { localInvertedColors } from '../../theme/colors'

const DEFAULT_PAYNOTE_INDEX = 2

const styles = {
  container: css({
    maxWidth: BREAKOUT_SIZES.breakout,
    margin: '0 auto'
  }),
  containerInline: css({
    margin: '0 auto',
    padding: 0,
    width: '100%'
  }),
  hline: css({
    borderWidth: 0,
    borderTopWidth: 1,
    borderStyle: 'solid',
    margin: 0,
    marginBottom: 15,
    [mUp]: {
      display: 'none'
    }
  }),
  title: css({
    ...sansSerifMedium16,
    marginBottom: 0,
    [mUp]: {
      ...sansSerifMedium19
    }
  }),
  description: css({
    ...sansSerifRegular15,
    [mUp]: {
      ...sansSerifRegular18
    },
    margin: 0,
    marginBottom: 5
  }),
  plainlink: css({
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer'
  })
}

const DefaultLink = ({ children }) => children

function SeriesNav({
  repoId,
  series,
  inline,
  ActionBar,
  Link = DefaultLink,
  PayNote,
  onEpisodeClick
}) {
  const [colorScheme] = useColorContext()

  const currentTile =
    repoId &&
    series.episodes.find(episode => episode.document?.repoId === repoId)
  const currentTileIndex = currentTile && series.episodes.indexOf(currentTile)

  // add paynote object after current episode or to third card if no current episode
  const payNoteObject = { isPayNote: true }
  const payNotePosition = currentTile
    ? Math.max(currentTileIndex + 1, DEFAULT_PAYNOTE_INDEX)
    : DEFAULT_PAYNOTE_INDEX
  const episodes =
    PayNote && !inline
      ? [
          ...series.episodes.slice(0, payNotePosition),
          payNoteObject,
          ...series.episodes.slice(payNotePosition)
        ]
      : [...series.episodes]

  const titlePath =
    series.overview?.meta?.path || series.episodes[0]?.meta?.path

  return (
    <div {...(inline ? styles.containerInline : styles.container)}>
      {inline ? (
        <Center>
          <hr
            {...styles.hline}
            {...colorScheme.set('borderColor', 'divider')}
          />
          <h3 {...styles.title}>
            {titlePath ? (
              <Link href={titlePath} passHref>
                <a {...styles.plainlink}>{series.title}</a>
              </Link>
            ) : (
              series.title
            )}
          </h3>
          <p {...styles.description}>{series.description}</p>
        </Center>
      ) : null}

      <TeaserCarousel grid={!inline} isSeriesNav>
        <TeaserCarouselTileContainer
          initialScrollTileIndex={currentTileIndex}
          isSeriesNav
        >
          {episodes.map((episode, i) => {
            return (
              <SeriesNavTile
                key={i}
                PayNote={episode.isPayNote && PayNote}
                current={repoId && repoId === episode?.document?.repoId}
                episode={episode}
                inline={inline}
                ActionBar={ActionBar}
                Link={Link}
                onEpisodeClick={onEpisodeClick}
              />
            )
          })}
        </TeaserCarouselTileContainer>
      </TeaserCarousel>

      {inline ? (
        <>
          {PayNote ? (
            <ColorContextLocalExtension localColors={localInvertedColors}>
              <PayNote inline={inline} />
            </ColorContextLocalExtension>
          ) : (
            <hr
              {...styles.hline}
              {...colorScheme.set('borderColor', 'divider')}
            />
          )}
        </>
      ) : null}
    </div>
  )
}

SeriesNav.propTypes = {
  repoId: PropTypes.string,
  series: PropTypes.object.isRequired,
  ActionBar: PropTypes.func,
  Link: PropTypes.func,
  PayNote: PropTypes.func,
  inline: PropTypes.bool,
  height: PropTypes.number,
  onEpisodeClick: PropTypes.func
}

export default SeriesNav
