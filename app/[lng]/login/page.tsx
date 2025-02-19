import { login } from "./actions";
import React from "react";
import { useTranslation } from "@/app/i18n";
import Link from "next/link";

interface Props {
  params: Promise<{ lng: string }>;
}

export default async function LoginPage({ params }: Props) {
  const { lng } = await params;
  const { t } = await useTranslation(lng); // eslint-disable-line react-hooks/rules-of-hooks
  return (
    <div className="h-[calc(100vh-6rem)] flex items-center rounded-3xl justify-center p-4 bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url("https://images.pexels.com/photos/1731826/pexels-photo-1731826.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")'}}>
      <div className="">
        <div className="bg-white/95 dark:bg-gray-950/90 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden">
          <div className="px-8 pt-8">
            <h1 className="h3">
              {t("login.title")}
            </h1>
          </div>
          <div className="p-8">
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("login.email")}
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                                             focus:ring-2 focus:ring-primary-400 focus:border-primary-400 
                                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                             transition-colors duration-200"
                  name="email"
                  required
                  placeholder={t("login.email")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("login.password")}
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 
                                             focus:ring-2 focus:ring-primary-400 focus:border-primary-400 
                                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                             transition-colors duration-200"
                  name="password"
                  required
                  placeholder={t("login.password")}
                />
              </div>
              <div className="text-right">
                <Link
                  href={`/${lng}/forgot-password`}
                  className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 
                                             dark:hover:text-gray-300 transition-colors duration-200"
                >
                  {t("login.forgotPassword")}
                </Link>
              </div>
              <button
                formAction={login}
                className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 
                                         focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
                                         text-white font-medium rounded-lg
                                         transform transition-all duration-200 hover:scale-[1.02]
                                         shadow-lg hover:shadow-primary-500/25"
              >
                {t("login.button")}
              </button>
            </form>
            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                {t("login.message")}
                <Link
                  href={`/${lng}/register`}
                  className="ml-2 text-primary-600 hover:text-primary-500 dark:text-primary-400 
                                             dark:hover:text-primary-300 font-semibold transition-colors duration-200"
                >
                  {t("login.register")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
