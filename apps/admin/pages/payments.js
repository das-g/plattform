import compose from 'lodash/flowRight'
import { useRouter } from 'next/router'

import App from '../components/App'
import { enforceAuthorization } from '../components/Auth/withAuthorization'

import { Body, Content, Header } from '../components/Layout'
import Payments from '../components/Payments/List'
import { withDefaultSSR } from '../lib/apollo'

const PaymentsPage = () => {
  const router = useRouter()
  const changeHandler = (params) => {
    router.replace(
      {
        pathname: '/payments',
        query: params ?? {},
      },
      undefined,
      { shallow: true },
    )
  }

  return (
    <App>
      <Body>
        <Header search={router.query.search} />
        <Content id='content'>
          <Payments params={router.query} onChange={changeHandler} />
        </Content>
      </Body>
    </App>
  )
}

export default withDefaultSSR(
  compose(enforceAuthorization(['supporter']))(PaymentsPage),
)
