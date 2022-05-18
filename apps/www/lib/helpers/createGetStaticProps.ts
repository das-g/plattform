import { ParsedUrlQuery } from 'querystring'
import {
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next'
import { BasePageProps } from '../../pages/_app'
import {
  APOLLO_STATE_PROP_NAME,
  initializeApollo,
} from '../apollo/apolloClient'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

/**
 * A function that is able to interact with the apollo-client
 */
type ApolloSSGQueryFunc<P, Q extends ParsedUrlQuery> = (
  client: ApolloClient<NormalizedCacheObject>,
  params: Q,
) => Promise<GetStaticPropsResult<P>>

/**
 * createGetStaticProps returns a getStaticProps-function that may fetch data
 * from the graphql api.
 * @param queryFunc
 */
function createGetStaticProps<P, Q extends ParsedUrlQuery = ParsedUrlQuery>(
  queryFunc: ApolloSSGQueryFunc<P, Q>,
  headers?: { [key: string]: string },
): GetStaticProps<BasePageProps<P>> {
  return async (
    ctx: GetStaticPropsContext<Q>,
  ): Promise<GetStaticPropsResult<BasePageProps<P>>> => {
    const apolloClient = initializeApollo(null, {
      headers,
    })
    const result = await queryFunc(apolloClient, ctx.params)

    // Return result directly if not successful getStaticProps-result
    if ('redirect' in result || 'notFound' in result) {
      return result
    }

    result.props[APOLLO_STATE_PROP_NAME] = apolloClient.cache.extract()

    return {
      props: {
        ...result.props,
        [APOLLO_STATE_PROP_NAME]: apolloClient.cache.extract(),
        assumeMembership: !!headers?.authorization,
      },
      revalidate: result.revalidate,
    }
  }
}

export default createGetStaticProps
