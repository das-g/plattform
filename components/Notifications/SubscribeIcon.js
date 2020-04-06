import React from 'react'
import { colors, fontStyles } from '@project-r/styleguide'
import SubIcon from 'react-icons/lib/md/notifications'
import UnsubIcon from 'react-icons/lib/md/notifications-none'
import { css } from 'glamor'

const styles = {
  icon: css({
    '@media(hover)': {
      '&:hover': {
        opacity: 0.6
      }
    }
  }),
  animate: css({
    opacity: 0,
    animation: `${css.keyframes({
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    })} 0.5s cubic-bezier(0.6, 0, 0.6, 1) forwards`
  })
}

const SubscribeIcon = ({ isSubscribed, animate }) => {
  const Icon = isSubscribed ? SubIcon : UnsubIcon
  return (
    <Icon
      {...styles.icon}
      {...(animate && styles.animate)}
      size={24}
      fill={colors.text}
    />
  )
}

export default SubscribeIcon
