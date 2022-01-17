import React, { useMemo } from 'react'
import { css } from 'glamor'
import { useRouter } from 'next/router'
import compose from 'lodash/flowRight'

import withMe from '../../lib/apollo/withMe'
import withT from '../../lib/withT'
import { timeFormat } from '../../lib/utils/format'
import { MainContainer, Content } from '../../components/Frame'
import SignIn from '../../components/Auth/SignIn'

import {
  Interaction,
  Label,
  fontStyles,
  useColorContext,
  plainButtonRule
} from '@project-r/styleguide'

const styles = {
  p: css({
    margin: 0,
    ...fontStyles.sansSerifRegular16
  }),
  container: css({
    '&:not(:last-child)': css({
      marginBottom: 24
    })
  }),
  hintareaText: css({
    ...fontStyles.sansSerifRegular18,
    margin: 0
  })
}

const { H3 } = Interaction

const hourFormat = timeFormat('%H:%M')
const dayFormat = timeFormat('%d. %B %Y')

export const Item = withT(
  ({ t, highlighted, title, createdAt, children, compact }) => {
    const [colorScheme] = useColorContext()
    return (
      <div
        {...styles.container}
        {...colorScheme.set(
          'backgroundColor',
          highlighted ? 'alert' : 'default'
        )}
        style={{ marginBottom: compact ? 0 : undefined }}
      >
        <H3>{title}</H3>
        {!compact && (
          <>
            <Label>
              {t('account/item/label', {
                formattedDate: dayFormat(createdAt),
                formattedTime: hourFormat(createdAt)
              })}
            </Label>
            <br />
          </>
        )}
        {children}
      </div>
    )
  }
)

export const EditButton = ({ children, onClick }) => {
  const [colorScheme] = useColorContext()
  const buttonStyleRules = useMemo(
    () =>
      css(plainButtonRule, {
        ...fontStyles.sansSerifMedium14,
        color: colorScheme.getCSSColor('primary'),
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('primaryHover')
          }
        }
      }),
    [colorScheme]
  )
  return (
    <button {...buttonStyleRules} onClick={onClick}>
      {children}
    </button>
  )
}

export const P = ({ children, ...props }) => (
  <p {...props} {...styles.p}>
    {children}
  </p>
)

export const Hint = ({ t, tKey }) => {
  const [colorScheme] = useColorContext()
  return (
    <Label
      style={{
        marginTop: -12,
        marginBottom: 12,
        display: 'block'
      }}
    >
      <span {...colorScheme.set('color', 'textSoft')}>{t(tKey)}</span>
    </Label>
  )
}

export const HintArea = ({ color = 'hover', children }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      style={{ padding: '8px 16px' }}
      {...colorScheme.set('backgroundColor', color)}
    >
      <p {...styles.hintareaText}>{children}</p>
    </div>
  )
}

export const AccountPageContainer = compose(
  withT,
  withMe
)(({ t, me, children }) => {
  const { query } = useRouter()

  return (
    <MainContainer>
      {!me ? (
        <Content>
          <Interaction.H1 style={{ marginBottom: 22 }}>
            {t('account/signedOut/title')}
          </Interaction.H1>
          <Interaction.P>{t('account/signedOut/signIn')}</Interaction.P>
          <SignIn email={query.email} />
        </Content>
      ) : (
        children
      )}
    </MainContainer>
  )
})
