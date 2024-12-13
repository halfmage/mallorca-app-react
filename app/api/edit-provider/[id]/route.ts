import {createClient} from '@/utils/supabase/server'
import {cookies} from 'next/headers'
import { ProviderService } from "@/app/api/utils/provider";

export async function GET(request: Request, { params }) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { id } = await params
    const data = await ProviderService.getEditableProvider(supabase, id)
    console.log('data = ', data)

    return Response.json({ data })
}