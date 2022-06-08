import { ParsedUrlQuery } from 'querystring'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next'
import {
  APOLLO_STATE_PROP_NAME,
  InitializeApolloFunc,
} from '../apollo/apolloClient'
import { PagePropsWithApollo } from './withApollo'

/**
 * Type of function that can be passed to `createGetServerSideProps`
 */
export type ApolloSSRQueryFunc<P, Q extends ParsedUrlQuery, User = unknown> = (
  client: ApolloClient<NormalizedCacheObject>,
  params: Q,
  user: User | null,
  ctx: GetServerSidePropsContext<Q>,
) => Promise<GetServerSidePropsResult<P>>

/**
 * Returns a function that take a `ApolloSSRQueryFunc` and returns a `GetServerSidePropsResult`.
 * The `ApolloSSRQueryFunc` has access to the `getServerSideProps` context as well as to an Apollo client instance.
 * Additionally, a user object is made available if the optional fetchUserFunc parameter was provided.
 * @param initializeApollo function to retrieve the apollo client
 * @param fetchUserFunc function to retrieve the user object
 */
export function makeCreateGetServerSideProps<U = unknown>(
  initializeApollo: InitializeApolloFunc,
  fetchUserFunc?: (
    apolloClient: ApolloClient<NormalizedCacheObject>,
  ) => Promise<U | null>,
) {
  return function createGetServerSideProps<
    P,
    Q extends ParsedUrlQuery = ParsedUrlQuery,
  >(
    queryFunc: ApolloSSRQueryFunc<P, Q>,
  ): GetServerSideProps<PagePropsWithApollo<P>> {
    return async (
      context: GetServerSidePropsContext<Q>,
    ): Promise<GetServerSidePropsResult<PagePropsWithApollo<P>>> => {
      // Use the request object to pass on the cookies to the graphql requests
      const apolloClient = initializeApollo(null, {
        // Pass headers of the client-request to the apollo-link
        headers: context.req.headers,
        onResponse: (response) => {
          // headers.raw() is a node-fetch specific API and apparently the only way to get multiple cookies
          // https://github.com/bitinn/node-fetch/issues/251
          const cookies = response.headers.raw()['set-cookie']
          if (cookies) {
            context.res.setHeader('Set-Cookie', cookies)
          }
        },
      })

      // Request the user object to attach it to the query-func
      // if a method to fetch the user was given
      let user: U | null = null
      if (fetchUserFunc) {
        user = await fetchUserFunc(apolloClient)
      }

      const result = await queryFunc(
        apolloClient,
        context.params,
        user,
        context,
      )

      if ('redirect' in result || 'notFound' in result) {
        return result
      }

      result.props[APOLLO_STATE_PROP_NAME] = apolloClient.cache.extract()
      return result
    }
  }
}
