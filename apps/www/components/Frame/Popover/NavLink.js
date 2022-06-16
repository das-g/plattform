import { forwardRef, useMemo, useEffect, useRef } from 'react'
import { css } from 'glamor'

import {
  fontStyles,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import Link from 'next/link'
import { useTranslation } from '../../../lib/withT'
import { AccessibilityStyles } from '../../../lib/accessibility/styles'

const styles = {
  link: css({
    textDecoration: 'none',
    '@media (hover)': {
      ':hover': {
        textDecoration: 'underline',
        textDecorationSkip: 'ink',
      },
    },
  }),
  inline: css({
    display: 'inline-block',
    '& + &': {
      marginLeft: 20,
    },
  }),
  block: css({
    display: 'block',
  }),
  large: css({
    '& + &': {
      marginTop: 24,
    },
    ...fontStyles.sansSerifMedium20,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifMedium22,
      '& + &': {
        marginLeft: 36,
        marginTop: 0,
      },
    },
  }),
}

export const NavA = forwardRef(
  (
    {
      inline,
      color = 'text',
      formatColor,
      activeFormatColor,
      children,
      style,
      title,
      large,
      isActive,
      ...props
    },
    ref,
  ) => {
    const [colorScheme] = useColorContext()
    const { t } = useTranslation()
    const hoverRule = useMemo(
      () =>
        formatColor &&
        css({
          transition: 'color 200ms ease-in-out',
          transitionDelay: '33ms',
          '@media (hover)': {
            ':hover': {
              color: colorScheme.getCSSColor(formatColor, 'format'),
            },
          },
        }),
      [colorScheme, formatColor],
    )

    const colorRule =
      isActive && activeFormatColor && formatColor
        ? colorScheme.set('color', formatColor, 'format')
        : colorScheme.set('color', color)

    return (
      <a
        ref={ref}
        {...styles.link}
        {...colorRule}
        {...hoverRule}
        {...(inline ? styles.inline : styles.block)}
        {...(large && styles.large)}
        style={style}
        className={isActive ? 'is-active' : undefined}
        title={title}
        aria-current={isActive ? 'page' : undefined}
        {...props}
      >
        {children}
        {isActive && (
          <span {...AccessibilityStyles.srOnly}>{t('nav/active-page')}</span>
        )}
      </a>
    )
  },
)

const NavLink = ({
  href,
  children,
  active,
  closeHandler,
  inline,
  color,
  formatColor,
  prefetch = false,
  minifeed,
  title,
  large,
}) => {
  const isActive = href === active
  const linkRef = useRef()
  useEffect(() => {
    if (linkRef && linkRef.current && isActive) {
      linkRef.current.scrollIntoView()
    }
  }, [isActive])

  return (
    <Link href={href} prefetch={prefetch ? undefined : prefetch} passHref>
      <NavA
        ref={linkRef}
        title={title}
        inline={inline}
        onClick={
          !minifeed
            ? (e) => {
                e.stopPropagation()
                closeHandler()
              }
            : undefined
        }
        color={color}
        formatColor={formatColor}
        activeFormatColor={minifeed}
        large={large}
        isActive={isActive}
      >
        {children}
      </NavA>
    </Link>
  )
}

export default NavLink
