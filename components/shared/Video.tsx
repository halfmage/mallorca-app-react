import React from 'react'
import { useTranslation } from '@/app/i18n/client'

interface Props {
  src: string
  className?: string|undefined
  autoPlay?: boolean|undefined
  muted?: boolean|undefined
  loop?: boolean|undefined
}

const Video = ({ src, className, autoPlay, muted, loop }: Props) => {
  const { t } = useTranslation()

  return (
    <video className={className} autoPlay={autoPlay} muted={muted} loop={loop}>
      <source src={src} />
      {t('common.video.notSupported')}
    </video>
  )
}

export default Video
