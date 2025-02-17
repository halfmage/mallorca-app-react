import ProviderService from '@/app/api/utils/services/ProviderService'

interface Props {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: Props) {
    const { id } = await params
    const providerService = await ProviderService.init()
    const data = await (providerService as ProviderService).get(id)

    return Response.json({ data })
}
