import {createClient} from '@/utils/supabase/server'
import {cookies} from 'next/headers'
import React from "react";
import Admin from '@/components/Admin'
import { redirect } from 'next/navigation'
import { ProviderService } from "@/app/api/utils/provider";

export default async function AdminPage({ params }) {
    const { lng } = await params
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser();
    if ('halfmage@gmail.com' !== user?.email) {
        return redirect(`/${lng}/403`)
    }

    const providers = await ProviderService.getEditableProviders(supabase)
    const { data: mainCategories } = await supabase.from('maincategories').select('*');

    return (
        <Admin providers={providers} mainCategories={mainCategories} />
    )
}
