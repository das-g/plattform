import React from 'react'
import { css } from 'glamor'
import {
  IconButton,
  Spinner,
  CloseIcon,
  ForwardIcon,
  PauseIcon,
  PlayIcon,
  ReplayIcon,
  ExpandMoreIcon,
} from '@project-r/styleguide'
import { AudioPlayerProps } from './shared'
import Scrubber from './ui/Scrubber'
import PlaybackRateControl from './controls/PlaybackRateControl'
import CurrentlyPlaying from './ui/CurrentlyPlaying'
import Queue from './ui/Queue'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    padding: '1.5rem',
    '& > *': {
      userSelect: 'none',
    },
  }),
  spinnerWrapper: css({
    position: 'relative',
    width: 42,
    height: 42,
  }),
  actionWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-center',
    alignItems: 'center',
    gap: '1rem',
    margin: '0 auto',
  }),
  bottomActionsWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  }),
  topActions: css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  }),
}

type ExpandedAudioPlayerProps = {
  handleMinimize: () => void
  handleToggle: () => void
  handleSeek: (progress: number) => void
  handleClose: () => void
  handleForward: () => void
  handleBackward: () => void
  handlePlaybackRateChange: (value: number) => void
} & Omit<AudioPlayerProps, 'actions'>

const ExpandedAudioPlayer = ({
  t,
  activePlayerItem,
  queue,
  currentTime = 0,
  duration = 0,
  playbackRate,
  isPlaying,
  isLoading,
  buffered,
  handleMinimize,
  handleToggle,
  handleSeek,
  handleClose,
  handleForward,
  handleBackward,
  handlePlaybackRateChange,
}: ExpandedAudioPlayerProps) => {
  return (
    <div {...styles.root}>
      <CurrentlyPlaying t={t} activePlayerItem={activePlayerItem} />
      {queue && queue.length > 0 && <Queue items={queue} />}
      <div>
        <Scrubber
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          disabled={isLoading}
          onSeek={handleSeek}
          showScrubber
          showTime
        />
      </div>
      <div {...styles.actionWrapper}>
        <IconButton
          size={32}
          fillColorName={'text'}
          onClick={handleBackward}
          Icon={ReplayIcon}
          style={{ marginRight: 0 }}
        />
        {isLoading ? (
          <div {...styles.spinnerWrapper}>
            <Spinner size={32} />
          </div>
        ) : (
          <IconButton
            onClick={handleToggle}
            title={t(`styleguide/AudioPlayer/${isPlaying ? 'pause' : 'play'}`)}
            aria-live='assertive'
            Icon={isPlaying ? PauseIcon : PlayIcon}
            size={64}
            fillColorName={'text'}
            style={{ marginRight: 0 }}
          />
        )}
        <IconButton
          size={32}
          fillColorName={'text'}
          onClick={handleForward}
          Icon={ForwardIcon}
          style={{ marginRight: 0 }}
        />
      </div>
      <div {...styles.bottomActionsWrapper}>
        <span>Share</span>
        <PlaybackRateControl
          playbackRate={playbackRate}
          setPlaybackRate={handlePlaybackRateChange}
        />
        <span>
          <IconButton
            Icon={ExpandMoreIcon}
            size={24}
            style={{ marginRight: 0 }}
            onClick={handleMinimize}
          />
        </span>
      </div>
    </div>
  )
}

export default ExpandedAudioPlayer