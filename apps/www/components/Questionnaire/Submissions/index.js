import { gql, useQuery } from '@apollo/client'
import {
  Interaction,
  Loader,
  SearchIcon,
  Field,
  useDebounce,
  HR,
  InlineSpinner,
} from '@project-r/styleguide'
import { useRouter } from 'next/router'
import { useInfiniteScroll } from '../../../lib/hooks/useInfiniteScroll'
import { useTranslation } from '../../../lib/withT'
import ErrorMessage from '../../ErrorMessage'
import Submission from './Submission'
import PlainButton from './PlainButton'

const mainQuery = gql`
  query getQuestionnaireSubmissions(
    $slug: String!
    $search: String
    $first: Int
    $after: String
  ) {
    questionnaire(slug: $slug) {
      id
      beginDate
      endDate
      userHasSubmitted
      userSubmitDate
      questions {
        id
        text
        ... on QuestionTypeChoice {
          options {
            label
            value
            category
          }
        }
        ... on QuestionTypeRange {
          kind
          ticks {
            label
            value
          }
        }
      }
      submissions {
        totalCount
      }
      results: submissions(search: $search, first: $first, after: $after) {
        totalCount
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          id
          createdAt
          updatedAt
          displayAuthor {
            id
            name
            slug
            profilePicture
          }
          answers {
            totalCount
            nodes {
              id
              hasMatched
              question {
                id
              }
              payload
            }
          }
        }
      }
    }
  }
`

const getTotalCount = (data) => data?.questionnaire?.submissions?.totalCount

const Submissions = ({ slug }) => {
  const router = useRouter()
  const searchQuery = router.query.q || ''
  const [search] = useDebounce(searchQuery, 100)
  const { loading, error, data, previousData, fetchMore } = useQuery(
    mainQuery,
    {
      variables: {
        slug,
        search,
        first: 10,
      },
    },
  )

  const loadMore = () => {
    return fetchMore({
      variables: {
        after: data.questionnaire.results.pageInfo.endCursor,
      },
      updateQuery: (previousResult = {}, { fetchMoreResult = {} }) => {
        const previousNodes = previousResult.questionnaire.results.nodes || []
        const newNodes = fetchMoreResult.questionnaire.results.nodes || []

        const res = {
          ...previousResult,
          ...fetchMoreResult,
          questionnaire: {
            ...previousResult.questionnaire,
            ...fetchMoreResult.questionnaire,
            results: {
              ...previousResult.questionnaire.results,
              ...fetchMoreResult.questionnaire.results,
              nodes: [...previousNodes, ...newNodes],
            },
          },
        }
        return res
      },
    })
  }

  const hasMore = data?.questionnaire?.results?.pageInfo?.hasNextPage
  const [
    { containerRef, infiniteScroll, loadingMore, loadingMoreError },
    setInfiniteScroll,
  ] = useInfiniteScroll({
    hasMore,
    loadMore,
  })

  const { t } = useTranslation()

  return (
    <>
      <Interaction.H2 style={{ marginBottom: 10 }}>
        {t.pluralize('questionnaire/submissions/count', {
          count: getTotalCount(data) || getTotalCount(previousData) || '',
        })}
      </Interaction.H2>
      <Field
        label='Suche'
        value={searchQuery}
        onChange={(_, value) => {
          router[searchQuery ? 'replace' : 'push'](
            `${router.asPath.split('?')[0]}${
              value ? `?q=${encodeURIComponent(value)}` : ''
            }`,
            undefined,
            { shallow: true },
          )
        }}
        icon={<SearchIcon size={30} />}
      />
      <Loader
        loading={loading}
        error={error}
        render={() => {
          const {
            questionnaire: { results, questions },
          } = data
          return (
            <>
              {results.totalCount !== getTotalCount(data) && (
                <Interaction.P>
                  {t.pluralize('search/preloaded/results', {
                    count: results.totalCount,
                  })}
                </Interaction.P>
              )}
              <div ref={containerRef}>
                {results.nodes.map(
                  ({ id, displayAuthor, answers, createdAt, updatedAt }) => {
                    return (
                      <div
                        key={id}
                        style={{
                          marginTop: 40,
                        }}
                      >
                        <Submission
                          t={t}
                          displayAuthor={displayAuthor}
                          answers={answers}
                          questions={questions}
                          createdAt={createdAt}
                          updatedAt={updatedAt}
                        />
                        <HR />
                      </div>
                    )
                  },
                )}
                <div style={{ marginTop: 10 }}>
                  {loadingMoreError && (
                    <ErrorMessage error={loadingMoreError} />
                  )}
                  {loadingMore && <InlineSpinner />}
                  {!infiniteScroll && hasMore && (
                    <PlainButton
                      onClick={() => {
                        setInfiniteScroll(true)
                      }}
                    >
                      {t.pluralize('questionnaire/submissions/loadMore', {
                        count: results.totalCount - results.nodes.length,
                      })}
                    </PlainButton>
                  )}
                </div>
              </div>
            </>
          )
        }}
      />
    </>
  )
}

export default Submissions