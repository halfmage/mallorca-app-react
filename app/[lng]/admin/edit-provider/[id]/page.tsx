import {createClient} from '@/utils/supabase/server'
import {cookies} from 'next/headers'
import React from "react";
import { redirect } from 'next/navigation'
import { ProviderService } from "@/app/api/utils/provider";
import EditProvider from "@/components/EditProvider";

export default async function EditProviderPage({ params }) {
    const { id, lng } = await params
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser();
    if ('halfmage@gmail.com' !== user?.email) {
        return redirect(`/${lng}/403`)
    }

    const provider = await ProviderService.getEditableProvider(supabase, id)
    const { data: mainCategories } = await supabase.from('maincategories').select('*');

    return (
        <EditProvider provider={provider} mainCategories={mainCategories} />
    )
}
