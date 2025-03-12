import React from 'react'
import { useTranslation } from '@/app/i18n/client'

interface Props {
  src: string
  className: string|undefined
  autoPlay: boolean|undefined
  muted: boolean|undefined
}

const Video = ({ src, className, autoPlay, muted }: Props) => {
  const { t } = useTranslation()

  return (
    <video className={className} autoPlay={autoPlay} muted={muted}>
      <source src={src} />
      {t('common.video.notSupported')}
    </video>
  )
}

export default Video
