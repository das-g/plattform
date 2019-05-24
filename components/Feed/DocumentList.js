import React from 'react'
import { compose } from 'react-apollo'
import { css } from 'glamor'
import withT from '../../lib/withT'
import PropTypes from 'prop-types'
import withInNativeApp from '../../lib/withInNativeApp'

import { A, mediaQueries, Spinner } from '@project-r/styleguide'
import Feed from './Feed'

import ErrorMessage from '../ErrorMessage'

import { useInfiniteScroll } from '../../lib/hooks/useInfiniteScroll'

const styles = {
  container: css({
    [mediaQueries.mUp]: {
      maxWidth: 695,
      margin: 'auto'
    }
  }),
  more: css({
    position: 'relative',
    height: 50,
    padding: '20px 0 0 0'
  })
}

const DocumentList = ({ documents, totalCount, unfilteredCount, hasMore, loadMore, feedProps, t }) => {
  const [
    { containerRef, infiniteScroll, loadingMore, loadingMoreError },
    setInfiniteScroll
  ] = useInfiniteScroll({ hasMore, loadMore })

  return (
    <div {...styles.container}>
      <div ref={containerRef}>
        <Feed documents={documents} {...feedProps} />
      </div>
      <div {...styles.more}>
        {loadingMoreError && <ErrorMessage error={loadingMoreError} />}
        {loadingMore && <Spinner />}
        {!infiniteScroll && hasMore &&
        <A href='#' onClick={event => {
          event && event.preventDefault()
          setInfiniteScroll(true)
        }}>
          {
            t('feed/loadMore',
              {
                count: documents.length,
                remaining: totalCount - unfilteredCount
              }
            )
          }
        </A>
        }
      </div>
    </div>
  )
}

DocumentList.propTypes = {
  documents: PropTypes.array.isRequired,
  totalCount: PropTypes.number.isRequired,
  unfilteredCount: PropTypes.number.isRequired,
  loadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool,
  t: PropTypes.func.isRequired,
  feedProps: PropTypes.object
}

export default compose(
  withT,
  withInNativeApp
)(DocumentList)
