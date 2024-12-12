import { login } from './actions'
import React from "react";
import { useTranslation } from '@/app/i18n'

export default async function LoginPage({ params }) {
    const { lng } = await params
    const { t } = await useTranslation(lng)
    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            {/*{error && <p className="text-red-500">{error}</p>}*/}
            <form>
                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input
                        type="email"
                        className="w-full p-2 border rounded"
                        name="email"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Password</label>
                    <input
                        type="password"
                        className="w-full p-2 border rounded"
                        name="password"
                        required
                    />
                </div>
                <button
                    formAction={login}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                    Login
                </button>
            </form>
        </div>
    )
}