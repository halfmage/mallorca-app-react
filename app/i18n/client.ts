'use client'

import { useEffect, useState } from 'react'
import i18next from 'i18next'
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
  UseTranslationOptions
} from 'react-i18next'
import { useCookies } from 'react-cookie'
import resourcesToBackend from 'i18next-resources-to-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import countries from 'i18n-iso-countries'
import enLocalizedCountries from 'i18n-iso-countries/langs/en.json'
import esLocalizedCountries from 'i18n-iso-countries/langs/es.json'
import deLocalizedCountries from 'i18n-iso-countries/langs/de.json'
import { getOptions, languages, cookieName } from './settings'

countries.registerLocale(enLocalizedCountries)
countries.registerLocale(esLocalizedCountries)
countries.registerLocale(deLocalizedCountries)

const runsOnServerSide = typeof window === 'undefined'

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resourcesToBackend((language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)))
  .init({
    ...getOptions(),
    lng: undefined, // let detect the language on client side
    detection: {
      order: [ 'path', 'htmlTag', 'cookie', 'navigator' ],
    },
    preload: runsOnServerSide ? languages : []
  })

export function useTranslation(lng: string | undefined = undefined, ns: string | undefined = undefined, options: UseTranslationOptions<undefined> | undefined = undefined) {
  const [ cookies, setCookie ] = useCookies([ cookieName ])
  const ret = useTranslationOrg(ns, options)
  const { i18n } = ret
  if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
    i18n.changeLanguage(lng)
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [ activeLng, setActiveLng ] = useState(i18n.resolvedLanguage)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (activeLng === i18n.resolvedLanguage) return
      setActiveLng(i18n.resolvedLanguage)
    }, [ activeLng, i18n.resolvedLanguage ])
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!lng || i18n.resolvedLanguage === lng) return
      i18n.changeLanguage(lng)
    }, [ lng, i18n ])
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!lng || cookies.i18next === lng) return
      setCookie(cookieName, lng, { path: '/' })
    }, [ lng, cookies.i18next ]) // eslint-disable-line react-hooks/exhaustive-deps
  }
  return ret
}
