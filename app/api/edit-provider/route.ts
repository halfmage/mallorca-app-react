import ProviderService from '@/app/api/utils/services/ProviderService'

export async function GET() {
    const providerService = await ProviderService.init()
    const data = await (providerService as ProviderService).getEditableProviders()

    return Response.json({ data })
}
