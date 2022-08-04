import compose from 'lodash/flowRight'
import { useRouter } from 'next/router'

import App from '../components/App'
import { enforceAuthorization } from '../components/Auth/withAuthorization'

import { Body, Content, Header } from '../components/Layout'
import MailboxPage from '../components/Mailbox/Page'
import { withDefaultSSR } from '../lib/apollo'

const Mailbox = () => {
  const router = useRouter()
  const changeHandler = (params) => {
    router.replace(
      {
        pathname: '/mailbox',
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
          <MailboxPage params={router.query} onChange={changeHandler} />
        </Content>
      </Body>
    </App>
  )
}

export default withDefaultSSR(
  compose(enforceAuthorization(['supporter']))(Mailbox),
)
