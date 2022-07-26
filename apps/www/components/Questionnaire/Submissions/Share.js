import { format } from 'url'
import Head from 'next/head'
import { css } from 'glamor'

import { fontStyles } from '@project-r/styleguide'

import Meta from '../../Frame/Meta'
import AnswerText from './AnswerText'
import { ASSETS_SERVER_BASE_URL, PUBLIC_BASE_URL } from '../../../lib/constants'
import { useTranslation } from '../../../lib/withT'

export const SHARE_IMAGE_WIDTH = 1200
export const SHARE_IMAGE_HEIGHT = 628

export const getSubmissionUrl = (pathname, id, query) =>
  `${PUBLIC_BASE_URL}${format({
    pathname,
    query: {
      share: id,
      ...query,
    },
  })}`

const replaceText = (text, { name, answerText, questionText }) => {
  return (
    text &&
    text
      .replace('{name}', name)
      .replace('{answerText}', answerText)
      .replace('{questionText}', questionText)
  )
}

const ShareSubmission = ({
  pathname,
  qid,
  share,
  submission,
  questions,
  meta,
}) => {
  const { t } = useTranslation()
  const answer =
    submission?.answers?.nodes?.find((a) => a.question.id === qid) ||
    submission?.answers?.nodes?.[0]
  const question = questions?.find((q) => q.id === answer.question.id)
  if (!answer || !question) {
    return null
  }

  if (meta) {
    const replacements = {
      name: submission.displayAuthor.name,
      questionText: question.text.replace(/:$/, ''),
    }
    return (
      <Meta
        data={{
          url: getSubmissionUrl(pathname, submission.id, {
            qid,
          }),
          title: replaceText(
            share.title || t('questionnaire/share/title'),
            replacements,
          ),
          description: replaceText(share.description, replacements),
          image: share.extract
            ? `${ASSETS_SERVER_BASE_URL}/render?width=1200&height=1&url=${encodeURIComponent(
                getSubmissionUrl(pathname, submission.id, {
                  qid,
                  extract: share.extract,
                }),
              )}`
            : '',
        }}
      />
    )
  }

  return (
    <>
      <Head>
        <meta name='robots' content='noindex' />
      </Head>
      <div
        style={{
          width: SHARE_IMAGE_WIDTH,
          height: SHARE_IMAGE_HEIGHT,
          backgroundImage: `url(${share.backgroundImage})`,
          backgroundSize: 'cover',
          padding: '120px 180px',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          ...fontStyles.serifRegular,
          fontSize: 58,
          lineHeight: 1.25,
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: '" …»"',
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
          }}
          {...css({
            textOverflow: ['ellipsis', '" …»"'],
            '::before': {
              content: '«',
            },
            '::after': {
              content: '»',
            },
          })}
        >
          <AnswerText
            text={answer.payload.text}
            value={answer.payload.value}
            question={question}
          />
        </span>
      </div>
    </>
  )
}

export default ShareSubmission
