import ProviderService from '@/app/api/utils/services/ProviderService'

export async function GET(request: Request, { params }) {
    const { id } = await params
    const providerService = await ProviderService.init()
    const data = await providerService.get(id)

    return Response.json({ data })
}