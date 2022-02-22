import React from 'react'
import { gql } from '@apollo/client'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { ChartTitle, ChartLead, Chart, Loader } from '@project-r/styleguide'
import { timeDay } from 'd3-time'
import { swissTime } from '../../../lib/utils/format'
import withT from '../../../lib/withT'

const accessGrantQuery = gql`
  query accessGrantQuery($accessCampaignId: ID!, $min: Date!, $max: Date!) {
    accessGrantStats {
      evolution(accessCampaignId: $accessCampaignId, min: $min, max: $max) {
        buckets {
          date
          activeUnconverted
          converted
        }
        updatedAt
      }
      events(accessCampaignId: $accessCampaignId, min: $min, max: $max) {
        buckets {
          pledges
        }
        updatedAt
      }
    }
  }
`

const formatDate = swissTime.format('%d.%m.%Y')

const ShareChart = ({ data, t }) => {
  return (
    <div style={{ margin: '16px 0px 32px 0px' }}>
      <Loader
        loading={data.loading}
        error={data.error}
        render={() => {
          if (!data.accessGrantStats) return null
          const accessGrantData = ['activeUnconverted', 'converted']
            .map((key) => {
              return data.accessGrantStats.evolution.buckets.map((bucket) => {
                return {
                  date: bucket.date,
                  type: t(`Share/chart/labels/${key}`),
                  value: bucket[key],
                }
              })
            })
            .flat()

          const currentActiveAccessGrants =
            data.accessGrantStats.evolution.buckets
              .slice(-1)
              .pop().activeUnconverted
          const soldMembership = data.accessGrantStats.events.buckets.reduce(
            (prev, curr) => prev + curr.pledges,
            0,
          )

          return (
            <>
              <ChartTitle>
                {t('Share/chart/title', { currentActiveAccessGrants })}
              </ChartTitle>
              <ChartLead>{t('Share/chart/lead', { soldMembership })}</ChartLead>
              <Chart
                config={{
                  type: 'TimeBar',
                  x: 'date',
                  color: 'type',
                  timeParse: '%d.%m.%Y',
                  timeFormat: '%d. %B',
                  height: 300,
                  yTicks: [0, 200, 400, 600, 800],
                  colorMap: {
                    'Aktiv geteilte Abos': '#256900',
                    'Verkaufte Abos': '#3CAD00',
                  },
                }}
                values={accessGrantData}
              />
            </>
          )
        }}
      />
    </div>
  )
}

export default compose(
  graphql(accessGrantQuery, {
    options: ({ accessCampaignId }) => {
      const currentDay = timeDay.floor(new Date())
      return {
        variables: {
          accessCampaignId,
          max: formatDate(currentDay),
          min: formatDate(timeDay.offset(currentDay, -30)),
        },
      }
    },
  }),
  withT,
)(ShareChart)
