import {createClient} from '@/utils/supabase/server'
import {cookies} from 'next/headers'
import { ProviderService } from "@/app/api/utils/provider";

export async function GET() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const data = await ProviderService.getEditableProviders(supabase)

    return Response.json({ data })
}
