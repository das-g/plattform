import { useState, useEffect, useRef } from 'react'
import { css } from 'glamor'
import {
  Scroller,
  TabButton,
  Field,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import scrollIntoView from 'scroll-into-view'
import withT from '../../lib/withT'
import { MetaOption, MetaOptionLabel, AutosizeInput } from './components/Layout'
import SocialMedia from './components/SocialMedia'

const styles = {
  metaContainer: css({
    maxWidth: 640,
    margin: '0px auto',
    padding: '24px 15px 120px 15px',
    [mediaQueries.mUp]: {
      padding: '24px 0 120px 0',
    },
  }),
  metaHeader: css({ position: 'sticky', top: 80, zIndex: 9 }),
  metaSection: css({ ':not(:first-child)': { marginTop: 128 } }),
  metaSectionTitle: css({ margin: '24px 0' }),
}

const MetaSection = ({ children }) => {
  return <div {...styles.metaSection}>{children}</div>
}

const MetaSectionTitle = ({ children }) => {
  return <h3 {...styles.metaSectionTitle}>{children}</h3>
}

const MetaDataForm = ({ t, metaData, setMetaData }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [colorScheme] = useColorContext()
  const scrollRef = useRef()

  useEffect(() => {
    if (!scrollRef.current) {
      return
    }
    const scroller = scrollRef.current
    const target = Array.from(scroller.children)[activeTabIndex]

    scrollIntoView(target, {
      time: 400,
    })
  }, [activeTabIndex])

  const handleMetaDataChange = (name, value) => {
    setMetaData((prevState) => {
      return {
        ...prevState,
        [name]: value,
      }
    })
  }

  return (
    <div {...colorScheme.set('background-color', 'hover')}>
      <div {...styles.metaContainer}>
        <h2>Metadaten</h2>
        <div
          {...styles.metaHeader}
          {...colorScheme.set('background-color', 'hover')}
        >
          <Scroller innerPadding={0} activeChildIndex={activeTabIndex}>
            {['Beitrag', 'Social Media'].map((n, i) => (
              <TabButton
                key={n}
                text={n}
                isActive={activeTabIndex === i}
                onClick={() => {
                  setActiveTabIndex(i)
                }}
              />
            ))}
          </Scroller>
        </div>
        <div ref={scrollRef}>
          <MetaSection>
            <MetaSectionTitle>Beitrag</MetaSectionTitle>
            <MetaOption>
              <Field
                label='Titel'
                name='title'
                value={metaData.title}
                onChange={(event) => {
                  handleMetaDataChange(event.target.name, event.target.value)
                }}
                noMargin
                renderInput={({ ref, ...inputProps }) => (
                  <AutosizeInput {...inputProps} ref={ref} />
                )}
              />
            </MetaOption>
            <MetaOption>
              <Field
                label='Kurztitel'
                name='kurztitel'
                value={metaData.short_title}
                onChange={(event) => {
                  handleMetaDataChange(event.target.name, event.target.value)
                }}
                noMargin
                renderInput={({ ref, ...inputProps }) => (
                  <AutosizeInput {...inputProps} ref={ref} />
                )}
              />
            </MetaOption>
            <MetaOption>
              <Field
                label='Lead'
                name='lead'
                value={metaData.lead}
                onChange={(event) => {
                  handleMetaDataChange(event.target.name, event.target.value)
                }}
                noMargin
                renderInput={({ ref, ...inputProps }) => (
                  <AutosizeInput {...inputProps} ref={ref} />
                )}
              />
            </MetaOption>
            <MetaOption>
              <Field
                label='Slug'
                name='slug'
                value={metaData.slug}
                onChange={(event) => {
                  handleMetaDataChange(event.target.name, event.target.value)
                }}
                noMargin
              />
            </MetaOption>
          </MetaSection>
          <MetaSection>
            <MetaSectionTitle>Social Media</MetaSectionTitle>
            <SocialMedia data={metaData} onChange={handleMetaDataChange} />
          </MetaSection>
        </div>
      </div>
    </div>
  )
}

export default withT(MetaDataForm)
