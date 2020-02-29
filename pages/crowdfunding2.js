import React, { useState, useEffect } from 'react'
import md from 'markdown-in-js'
import Router, { withRouter } from 'next/router'
import { css } from 'glamor'

import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'

import { Link } from '../lib/routes'
import { countFormat } from '../lib/utils/format'

import mdComponents from '../lib/utils/mdComponents'
import withInNativeApp from '../lib/withInNativeApp'
import withMe from '../lib/apollo/withMe'
import withT from '../lib/withT'

import Employees from '../components/Marketing/Employees'
import Frame from '../components/Frame'
import VideoCover from '../components/VideoCover'
import ShareButtons from '../components/ActionBar/ShareButtons'
import List, { Highlight } from '../components/List'
import { ListWithQuery as TestimonialList } from '../components/Testimonial/List'
import ContainerWithSidebar, {
  Content
} from '../components/Crowdfunding/ContainerWithSidebar'
import withSurviveStatus, {
  userSurviveActionsFragment,
  mapActionData
} from '../components/Crowdfunding/withSurviveStatus'
import ReasonsCover from '../components/Crowdfunding/ReasonsCover'

import { PUBLIC_BASE_URL, CDN_FRONTEND_BASE_URL } from '../lib/constants'

import TeaserBlock, {
  GAP as TEASER_BLOCK_GAP
} from '../components/Overview/TeaserBlock'
import { getTeasersFromDocument } from '../components/Overview/utils'

import {
  Loader,
  Container,
  Label,
  Button,
  Lead,
  colors,
  linkRule,
  Interaction,
  mediaQueries
} from '@project-r/styleguide'

const query = gql`
  query cf2($accessToken: ID) {
    front: document(path: "/") {
      id
      children(first: 60) {
        nodes {
          body
        }
      }
    }
    employees(withBoosted: true, shuffle: 50) {
      title
      name
      group
      subgroup
      user {
        id
        portrait
        slug
      }
    }
    actionMe: me(accessToken: $accessToken) {
      id
      ...SurviveActionsOnUser
    }
    reasons: questionnaire(slug: "101-reasons") {
      id
      nodes: questions(shuffle: 1) {
        ... on QuestionTypeChoice {
          id
          order
          text
          metadata
        }
      }
    }
  }
  ${userSurviveActionsFragment}
`

const styles = {
  overviewOverflow: css({
    overflow: 'hidden',

    paddingTop: 420,
    marginTop: -400,
    marginBottom: 20
  }),
  overviewContainer: css({
    position: 'relative',
    zIndex: 1,
    padding: '30px 0 0',
    backgroundColor: colors.negative.containerBg,
    color: colors.negative.text
  }),
  overviewBottomShadow: css({
    position: 'absolute',
    bottom: 0,
    height: 100,
    left: 0,
    right: 0,
    background:
      'linear-gradient(0deg, rgba(17,17,17,0.9) 0%, rgba(17,17,17,0.8) 30%, rgba(17,17,17,0) 100%)',
    pointerEvents: 'none'
  }),
  overviewTopShadow: css({
    position: 'absolute',
    top: 100,
    height: 350,
    zIndex: 2,
    left: 0,
    right: 0,
    background:
      'linear-gradient(180deg, rgba(17,17,17,0.9) 0%, rgba(17,17,17,0.8) 67%, rgba(17,17,17,0) 100%)',
    pointerEvents: 'none',
    [mediaQueries.mUp]: {
      display: 'none'
    }
  }),
  mediaDiversity: css({
    margin: '20px 0',
    '& img': {
      width: 'calc(50% - 10px)',
      border: `1px solid ${colors.divider}`,
      margin: 5
    }
  }),
  stretchLead: css({
    margin: '20px 0 0'
  }),
  stretchP: css({
    fontSize: 17,
    lineHeight: '25px'
  }),
  cards: css({
    position: 'relative',
    zIndex: 1,
    background: colors.negative.primaryBg,
    margin: '30px 0',
    [mediaQueries.mUp]: {
      margin: '50px 0'
    }
  })
}

const VIDEOS = {
  main: {
    hls:
      'https://player.vimeo.com/external/394299161.m3u8?s=04b073df4a9a2e46dbf3bb030a81d7b233b70e10',
    mp4:
      'https://player.vimeo.com/external/394299161.hd.mp4?s=52bbb16e068387bd4e44683de01cbfebdcbc95e1&profile_id=175',
    subtitles: '/static/subtitles/cf2.vtt',
    thumbnail: `${CDN_FRONTEND_BASE_URL}/static/video/manifest.png`
  }
}

const Page = ({
  router: { query },
  crowdfunding,
  data,
  shouldBuyProlong,
  inNativeIOSApp,
  isReactivating,
  defaultBenefactor,
  activeMembership,
  actionsLoading,
  t
}) => {
  useEffect(() => {
    if (query.token) {
      Router.replace(
        `/crowdfunding2?token=${encodeURIComponent(query.token)}`,
        '/maerzkampagne',
        {
          shallow: true
        }
      )
    }
  }, [query.token])

  const [highlight, setHighlight] = useState()
  // ensure the highlighFunction is not dedected as an state update function
  const onHighlight = highlighFunction => setHighlight(() => highlighFunction)

  const primaryParams = shouldBuyProlong
    ? { package: 'PROLONG' }
    : activeMembership
    ? { package: 'ABO_GIVE', filter: 'pot' }
    : { package: 'ABO' }
  const pledgeLink = inNativeIOSApp ? null : (
    <Link route='pledge' params={primaryParams}>
      <a {...linkRule}>
        {activeMembership && !shouldBuyProlong
          ? 'Wachstum schenken'
          : 'Jetzt mitmachen!'}
      </a>
    </Link>
  )

  const links = [
    !activeMembership && {
      route: 'pledge',
      params: { package: 'ABO', userPrice: 1 },
      text: 'Sie können sich den Betrag nicht leisten?'
    },
    {
      href: `mailto:ir@republik.ch?subject=${encodeURIComponent(
        'Investitionsmöglichkeiten bei der Republik AG'
      )}`,
      text: 'Sie wollen investieren?'
    }
  ].filter(Boolean)
  const packages = actionsLoading
    ? []
    : shouldBuyProlong
    ? [
        {
          name: 'PROLONG',
          title: isReactivating ? 'Zurückkehren' : 'Verlängern',
          price: 24000
        },
        {
          name: 'PROLONG-BEN',
          params: {
            package: 'PROLONG',
            membershipType: 'BENEFACTOR_ABO'
          },
          title: defaultBenefactor ? 'Gönner bleiben' : 'Gönner werden',
          price: 100000
        },
        {
          name: 'ABO_GIVE',
          params: { filter: 'pot' },
          title: 'Wachstum schenken',
          price: 24000
        }
      ]
    : activeMembership
    ? [
        {
          name: 'ABO_GIVE',
          params: { filter: 'pot' },
          title: 'Wachstum schenken',
          price: 24000
        },
        {
          name: 'DONATE_POT',
          params: { price: 6000 },
          title: 'Wachstum spenden',
          price: 6000
        }
      ]
    : [
        {
          name: 'MONTHLY_ABO',
          title: 'Monats-Abo',
          price: 2200
        },
        {
          name: 'ABO',
          title: 'Jahresmitgliedschaft',
          price: 24000
        },
        {
          name: 'BENEFACTOR',
          title: 'Gönner-Mitgliedschaft',
          price: 100000
        },
        {
          name: 'ABO_GIVE',
          params: { filter: 'pot' },
          title: 'Wachstum schenken'
        }
      ]

  const shareProps = {
    url: `${PUBLIC_BASE_URL}/`,
    tweet: '',
    emailBody: '',
    emailAttachUrl: true,
    emailSubject: '101 Gründe, die Republik jetzt zu unterstützen.',
    eventCategory: 'March2020'
  }

  return (
    <Frame
      raw
      meta={{
        // ToDo: change once no longer in index
        url: `${PUBLIC_BASE_URL}/`,
        pageTitle: 'Republik – das digitale Magazin von Project R',
        title:
          '101 Gründe, die Republik jetzt zu unterstützen. Kommen Sie an Bord.',
        description:
          'Unabhängiger Journalismus ohne Bullshit. Transparent. Werbefrei. Finanziert von den Leserinnen und Lesern.',
        image: `${CDN_FRONTEND_BASE_URL}/static/social-media/march20.jpg`
      }}
      cover={
        <>
          {/*data.reasons && data.reasons.nodes.slice(1).map(r =>
            <ReasonsCover reason={r} />
          )*/}
          <VideoCover
            src={VIDEOS.main}
            customCover={
              <ReasonsCover
                loading={data.loading}
                reason={data.reasons && data.reasons.nodes[0]}
              />
            }
            playTop='65%'
            endScroll={0.97}
          />
        </>
      }
    >
      <ContainerWithSidebar
        sidebarProps={{
          title: 'Jetzt unterstützen',
          crowdfunding: !actionsLoading &&
            crowdfunding && {
              ...crowdfunding,
              status: crowdfunding.status && {
                memberships: crowdfunding.status.memberships,
                people: crowdfunding.status.people,
                money: crowdfunding.status.money
              }
            },
          links,
          packages,
          primaryParams,
          statusProps: {
            memberships: true
          }
        }}
        raw
      >
        <Lead>
          Unabhängiger Journalismus ohne Bullshit: Willkommen bei der Republik.
        </Lead>
        {md(mdComponents)`

Damit Sie uns vertrauen können, machen wir ein paar Dinge anders. Zum Beispiel sind wir komplett werbefrei. Und kompromisslos in der Qualität.

Unser Ziel: Journalismus, der die Köpfe klarer, das Handeln mutiger, die Entscheidungen klüger macht. Und der das Gemeinsame stärkt: die Freiheit, den Rechtsstaat, die Demokratie.

${pledgeLink}
  `}

        <div style={{ margin: '15px 0 0' }}>
          <Label style={{ display: 'block', marginBottom: 5 }}>
            Teilen Sie diese Seite mit Ihren Freunden:
          </Label>
          <ShareButtons {...shareProps} />
        </div>

        <Loader
          loading={data.loading}
          error={data.error}
          style={{ minHeight: 300 }}
          render={() => {
            if (!crowdfunding) {
              return null
            }
            const firstGoal = crowdfunding.goals[0]
            const { status, goals } = crowdfunding

            if (!firstGoal) {
              return null
            }

            const remainingPeople = firstGoal.people - status.people
            const remainingMoney = (firstGoal.money - status.money) / 100

            const initialGoalsReached =
              remainingMoney <= 0 && remainingPeople <= 0

            return (
              <div {...styles.stretchLead}>
                <Interaction.P {...styles.stretchP}>
                  {initialGoalsReached && (
                    <>
                      Wir sind dankbar und erfreut! Wir haben unsere Ziele
                      gemeinsam mit Ihnen erreicht. Die Republik hat definitiv
                      eine Zukunft. Herzlichen Dank!
                    </>
                  )}
                  {remainingMoney > 0 && remainingPeople > 0 && (
                    <>
                      Damit die Republik in Zukunft bestehen kann, brauchen wir
                      bis am 31.&nbsp;März noch {countFormat(remainingPeople)}{' '}
                      Mitglieder und Abonnenten und{' '}
                      {countFormat(remainingMoney)} Franken. Um die Ziele zu
                      erreichen, wollen wir diesen Monat um{' '}
                      <Highlight>3000 Mitgliedschaften und Abos</Highlight>{' '}
                      wachsen. Denn eine möglichst grosse Verlegerschaft sichert
                      die Republik langfristig am besten.
                    </>
                  )}
                  {remainingMoney > 0 && remainingPeople <= 0 && (
                    <>
                      Damit die Republik in Zukunft bestehen kann, brauchen wir
                      bis am 31.&nbsp;März noch {countFormat(remainingMoney)}{' '}
                      Franken. Um das Ziel zu erreichen, wollen wir diesen Monat
                      um 3000 Mitgliedschaften und Abos wachsen. Denn eine
                      möglichst grosse Verlegerschaft sichert die Republik
                      langfristig am besten.
                    </>
                  )}
                </Interaction.P>
                {goals.length > 1 && initialGoalsReached && (
                  <>
                    <Interaction.P
                      {...styles.stretchP}
                      style={{ marginTop: 10 }}
                    >
                      Die Republik will das Mediensystem mit einem neuen Modell
                      für unabhängigen Journalismus entscheidend verändern –
                      deshalb sammeln wir weiter.
                    </Interaction.P>
                    <List>
                      {goals
                        .filter(g => g.description)
                        .map((goal, i) => (
                          <List.Item key={i}>{goal.description}</List.Item>
                        ))}
                    </List>
                    <Interaction.P
                      {...styles.stretchP}
                      style={{ marginTop: 10 }}
                    >
                      Danke fürs Weitersagen!
                    </Interaction.P>
                  </>
                )}
              </div>
            )
          }}
        />

        {md(mdComponents)`
<br />

## Was ist die Republik?

Die Republik ist eine Dienstleistung für interessierte Menschen in einer grossen, faszinierenden und komplexen Welt.

Wir recherchieren, fragen nach, ordnen ein und decken auf. Und liefern Ihnen Fakten und Zusammenhänge als Grundlage für Ihre eigenen Überlegungen und Entscheidungen.

Das ist eine heikle Aufgabe. Denn Journalismus ist alles andere als harmlos: Es ist entscheidend, welche Geschichten erzählt werden.

Weil Vertrauen im Journalismus die härteste Währung ist, haben wir die Republik so aufgestellt, dass wir diese Aufgabe für Sie bestmöglich erledigen können:

**Wir sind unabhängig.** Und komplett werbefrei. So können wir uns auf unseren einzigen Kunden konzentrieren: Sie. Und müssen weder möglichst viele Klicks generieren noch Sie mit nervigen Anzeigen belästigen. Und wir verkaufen Ihre persönlichen Daten niemals weiter.

**Wir sind das transparenteste Medienunternehmen (das wir kennen).** Wir legen alles offen: unsere Finanzen, Besitzverhältnisse, Arbeitsweisen, Fehler, Löhne – weil wir überzeugt sind, dass es wichtig ist zu zeigen, unter welchen Bedingungen Journalismus hergestellt wird. 

**Wir gehören niemandem – aber Ihnen ein bisschen.** Mit einer Mitgliedschaft werden Sie auch Genossenschafter und damit Verlegerin der Republik. Das ist für Sie ohne Risiko, dafür mit Einblick und Einfluss verbunden: Wir erklären, was wir tun – und Sie können mitentscheiden.

**Wir sind kompromisslos in der Qualität.** Unsere Reporter und Journalistinnen haben Zeit, um ein Thema mit der angebrachten Sorgfalt und Hartnäckigkeit zu recherchieren. Und es gibt drei Dinge, an denen uns besonders viel liegt: Gute Sprache. Gute Bilder. Und gutes Design.

**Wir stehen mit Ihnen im Dialog.** Und lieben es! Das Internet ermöglicht nicht nur viele neue Formen, wie wir Geschichten erzählen können, sondern auch den direkten Dialog mit Ihnen. Damit die Republik mit Ihrer Stimme vielfältiger, interessanter und reflektierter wird.

${!activeMembership ? pledgeLink : ''}

## Worum geht es?

Die Republik ist 2018 gestartet. Als Rebellion für den Journalismus. Und gegen den Einheitsbrei und die Vermischung von Journalismus und Werbung bei grossen Medienkonzernen.

Wir haben nur einen einzigen Kunden: Sie. Als Leserinnen. Als Bürger. Als Menschen, die bereit sind, etwas Geld in unabhängigen Journalismus zu investieren.

Um ein tragfähiges Modell für unabhängigen, werbefreien und leserfinanzierten Journalismus zu entwickeln, braucht die Republik rund 24’000 Mitglieder. Dieses Ziel wollen wir in den nächsten Jahren gemeinsam mit möglichst vielen von Ihnen erreichen. 

Wir sind überzeugt, das zu schaffen. Weil wir schon weit gekommen sind:

1. Wir liefern guten Journalismus. Die meisten Abonnenten bleiben der Republik treu, und viele haben ihre Mitgliedschaft jetzt schon zum zweiten Mal erneuert.

2. Wir haben öffentliche Wirkung: Mit investigativen Recherchen – zum Beispiel zum Bündner Baukartell oder zu Missständen bei der grössten Kita-Kette der Schweiz – löst die Republik nicht nur Debatten aus, sondern auch konkrete politische Reaktionen.

3. Wir sind von einer starken Community getragen. Von unseren Leserinnen lernen wir jeden Tag, wie wir besser werden können. Und über 1000 Freunde und Komplizen helfen mit, unseren Journalismus in jeden Winkel der Schweiz zu bringen.

Damit die Republik in Zukunft bestehen kann, brauchen wir einen Wachstumsschub. Deshalb haben wir uns überlebenswichtige Ziele gesetzt: Bis Ende März mindestens 19’000 Mitglieder zu haben und 2,2 Millionen Franken zu finden.

Erreichen wir die Ziele nicht, beenden wir das Projekt.

Den grösseren Teil des Geldes haben wir durch die Grosszügigkeit unserer Mitglieder und Investorinnen bereits gefunden. Jetzt geht es darum, möglichst viele neue Leute von der Republik zu begeistern.

Wenn Sie mitmachen und wir es nicht schaffen, bekommen Sie Ihr Geld zurück. Wenn wir es schaffen, bekommen Sie nicht nur vernünftigen Journalismus, sondern haben auch einen entscheidenden Beitrag zur Medienvielfalt in der Schweiz geleistet.

${!activeMembership ? pledgeLink : ''}

        `}
      </ContainerWithSidebar>
      <div {...styles.overviewOverflow}>
        <div {...styles.overviewContainer}>
          <Container
            style={{
              maxWidth: 1200,
              padding: 0
            }}
          >
            <div style={{ padding: `0 ${TEASER_BLOCK_GAP}px` }}>
              <Loader
                loading={data.loading}
                error={data.error}
                style={{ minHeight: 420 }}
                render={() => (
                  <TeaserBlock
                    teasers={getTeasersFromDocument(data.front)}
                    highlight={highlight}
                    onHighlight={onHighlight}
                    maxHeight={500}
                    maxColumns={8}
                  />
                )}
              />
            </div>
            <div {...styles.overviewBottomShadow} />
          </Container>
        </div>
      </div>
      <Container>
        <Content>
          {md(mdComponents)`

## Was bekomme ich für mein Geld?

Sie erhalten täglich eine bis drei neue Geschichten. Als Newsletter, im Web oder in der App. Das Konzept ist einfach: Einordnung und Vertiefung statt einer Flut von Nachrichten.

Sie lesen und hören in der Republik zu allem, was aktuell, verworren, komplex – und für viele gerade wichtig ist. Derzeit beschäftigen uns Klima, Digitalisierung, Kinderbetreuung und besonders intensiv die Folgen des Aufstiegs autoritärer Politik für Demokratie.

Wir liefern Ihnen Recherchen, Analysen, Reportagen und Erklärartikel. Aufgemacht als digitales Magazin, mit ausgewählten Bildern, Illustrationen, Grafiken. Manchmal interaktiv. Manchmal als Podcast. Oder auch als Veranstaltung.

Statt täglichen News fassen wir einmal pro Woche in Briefings das Wichtigste aus der Schweiz und der Welt zusammen, kompakt und übersichtlich – damit Sie nichts verpassen.

Die Republik bietet ein vielfältiges Programm an Themen, Autorinnen und Formaten. Und Sie entscheiden selbst, wie Sie die Republik nutzen möchten: täglich, wöchentlich oder unregelmässig; alles oder nur ausgewählte Beiträge, aktiv im Dialog mit anderen oder einfach ganz für sich allein einen Podcast geniessen.

Sie können Beiträge, die Sie besonders freuen oder ärgern, jederzeit mit Ihren Freunden teilen, selbst wenn diese kein Abo haben. Alle Beiträge der Republik sind frei teilbar, damit unser Journalismus möglichst viele Menschen erreicht. 

Und einen entscheidenden Unterschied machen kann. Die Republik ist politisch nicht festgelegt, aber keineswegs neutral: Sie steht gegen die Diktatur der Angst. Und für die Werte der Aufklärung: für Klarheit im Stil, Treue zu Fakten, für Lösungen von Fall zu Fall, für Offenheit gegenüber Kritik, Respektlosigkeit vor der Macht und Respekt vor dem Menschen.

${!activeMembership ? pledgeLink : ''}

## Wer macht die Republik?

Unsere Crew besteht aus kompetenten Profis. Den besten, die wir finden konnten. Sehen Sie selbst und blättern Sie durch unsere Redaktion.

`}
        </Content>
      </Container>

      <div {...styles.cards}>
        <Loader
          loading={data.loading}
          error={data.error}
          style={{ minHeight: 420 }}
          render={() =>
            data.employees ? (
              <Employees
                employees={data.employees}
                filter={e => e.group === 'Redaktion'}
              />
            ) : null
          }
        />
      </div>

      {/* with loader data.employees */}

      <Container>
        <Content>
          {md(mdComponents)`

## Warum das alles wichtig ist

Bei der Republik und beim Journalismus überhaupt geht es nicht nur um den individuellen Nutzen. Es geht auch darum, eine wichtige Funktion in einer Demokratie auszuüben: den Mächtigen auf die Finger zu schauen, unabhängig zu recherchieren und Missstände aufzudecken.

Traditionelle Medien haben das Problem, dass mit dem Internet ihr Geschäftsmodell zusammengebrochen ist. Sie haben ihre Monopolstellung verloren, fast alles ist gratis im Netz verfügbar. Die Bereitschaft, für Journalismus zu bezahlen, ist gesunken. Parallel dazu wanderten die Werbeeinnahmen fast vollständig zu Google, Facebook und Co. ab.

Die Folgen davon sind unübersehbar: ein massiver Abbau bei Redaktionen auf Kosten der Qualität und Vielfalt. Seit 2011 sind in der Schweiz unter dem Strich mehr als 3000 Stellen im Journalismus verschwunden. (Das ist viel: damit könnte man 100 Republiken machen.)

Zeitungen fusionieren, Redaktionen werden zusammengelegt, es gibt immer weniger Vielfalt im Schweizer Medienmarkt. In der Deutschschweiz verfügen Tamedia, Ringier und die NZZ mit ihren Zeitungen bereits über 80% Marktanteil.

Und als neueste Entwicklung, um den sinkenden Werbeeinnahmen entgegenzuwirken, gehen die Verlage immer dreistere Deals mit Werbekunden ein. Die Grenze zwischen redaktionellen Beiträgen und Werbung verwischt. Der Presserat kritisiert in einem Leiturteil diese Grenzüberschreitungen der Verlage. Damit werde das Publikum getäuscht und irregeführt. Die Medien schaden so ihrer eigenen Glaubwürdigkeit als unabhängige Berichterstatter.

Kurz: Es steht nicht unbedingt gut um die Medienbranche und die Zukunft des Journalismus.

Als Antwort auf diese Entwicklungen – und aus Leidenschaft für guten Journalismus – bauen wir die Republik auf.

Einerseits als konkreten Beitrag zur Vielfalt. Mit einem Medium, das Unabhängigkeit konsequent ernst nimmt. Andererseits auch als Labor für den Journalismus des 21. Jahrhunderts. Dafür ist es notwendig, ein funktionierendes Geschäftsmodell zu entwickeln.

Eine Republik baut niemand alleine, sondern nur viele gemeinsam. Wir mit Ihnen?

  `}
          <br />
          {inNativeIOSApp ? (
            <Interaction.P
              style={{ color: colors.error, marginBottom: 15, marginTop: 15 }}
            >
              {t('cockpit/ios')}
            </Interaction.P>
          ) : (
            <Link route='pledge' params={primaryParams} passHref>
              <Button primary style={{ minWidth: 300 }}>
                {activeMembership && !shouldBuyProlong
                  ? 'Wachstum schenken'
                  : 'Jetzt mitmachen!'}
              </Button>
            </Link>
          )}

          <div style={{ margin: '15px 0 40px' }}>
            <Label style={{ display: 'block', marginBottom: 5 }}>
              Jetzt andere auf die Republik aufmerksam machen:
            </Label>
            <ShareButtons {...shareProps} />
          </div>

          {md(mdComponents)`

## ${countFormat(
            (crowdfunding && crowdfunding.status.people) || 'Unsere'
          )} Verlegerinnen und Verleger

  `}
          {crowdfunding && (
            <div style={{ margin: '20px 0' }}>
              <TestimonialList
                first={10}
                membershipAfter={crowdfunding.endDate}
                share={false}
              />
            </div>
          )}

          <Link route='community'>
            <a {...linkRule}>Alle ansehen</a>
          </Link>

          <br />
          <br />
          <br />
        </Content>
      </Container>
    </Frame>
  )
}

export default compose(
  withRouter,
  withSurviveStatus,
  withMe,
  graphql(query, {
    props: args => {
      return {
        ...mapActionData(args),
        data: args.data
      }
    },
    options: ({ router: { query } }) => ({
      variables: {
        accessToken: query.token
      }
    })
  }),
  withInNativeApp,
  withT
)(Page)
