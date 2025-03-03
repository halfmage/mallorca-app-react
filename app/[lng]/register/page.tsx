import { signup } from "./actions";
import React from "react";
import { useTranslation } from "@/app/i18n";
import Link from "next/link";

interface Props {
  params: Promise<{ lng: string }>;
  searchParams: Promise<{ error?: string; min?: string }>;
}

export default async function RegisterPage({ params, searchParams }: Props) {
  const { lng } = await params;
  const { min, error } = await searchParams;
  const { t } = await useTranslation(lng); // eslint-disable-line react-hooks/rules-of-hooks
  
  // Handle error messages
  let errorMessage = '';
  if (error) {
    switch (error) {
      case 'passwords_dont_match':
        errorMessage = t("signUp.main.error.passwordNotMatch");
        break;
      case 'password_too_short':
        // @ts-expect-error: not clear Type 'string' is not assignable to type 'number'
        errorMessage = t("signUp.main.error.count", { count: min || '8' });
        break;
      case 'signup_failed':
        errorMessage = t("signUp.main.error.signupFailed");
        break;
      default:
        errorMessage = t("signUp.main.error.default");
    }
  }
  const handleSubmit = signup.bind(null, lng)
  
  return (
    <div className="h-[calc(100vh-6rem)] flex items-center rounded-3xl justify-center p-4 bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url("https://images.pexels.com/photos/1731826/pexels-photo-1731826.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")'}}>
      <div className="">
        <div className="bg-white/95 dark:bg-gray-950/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 pt-8">
            <h1 className="h3">
              {t("signUp.main.title")}
            </h1>
          </div>
          <div className="p-8">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                {errorMessage}
              </div>
            )}
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("signUp.main.firstName")}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                             focus:ring-2 focus:ring-primary-400 focus:border-primary-400 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             transition-colors duration-200"
                  name="firstName"
                  required
                  placeholder={t("signUp.main.firstName")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("signUp.main.lastName")}
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                             focus:ring-2 focus:ring-primary-400 focus:border-primary-400 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             transition-colors duration-200"
                  name="lastName"
                  required
                  placeholder={t("signUp.main.lastName")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("signUp.main.email")}
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                             focus:ring-2 focus:ring-primary-400 focus:border-primary-400 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             transition-colors duration-200"
                  name="email"
                  required
                  placeholder={t("signUp.main.email")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("signUp.main.password")}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                             focus:ring-2 focus:ring-primary-400 focus:border-primary-400 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             transition-colors duration-200"
                  name="password"
                  required
                  placeholder={t("signUp.main.password")}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t("signUp.main.passwordHint")}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("signUp.main.repeatPassword")}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                             focus:ring-2 focus:ring-primary-400 focus:border-primary-400 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             transition-colors duration-200"
                  name="repeatPassword"
                  required
                  placeholder={t("signUp.main.repeatPassword")}
                />
              </div>
              <button
                formAction={handleSubmit}
                className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 
                           focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
                           text-white font-medium rounded-lg
                           transform transition-all duration-200 hover:scale-[1.02]
                           shadow-lg hover:shadow-primary-500/25"
              >
                {t("signUp.main.submit")}
              </button>
            </form>
            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {t("signUp.main.message")}
                <Link
                  href={`/${lng}/login`}
                  className="ml-2 text-primary-600 hover:text-primary-500 dark:text-primary-400 
                             dark:hover:text-primary-300 font-semibold transition-colors duration-200"
                >
                  {t("signUp.main.login")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
