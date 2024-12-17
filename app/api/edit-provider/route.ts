import { ProviderService } from "@/app/api/utils/provider";

export async function GET() {
    const providerService = await ProviderService.init()
    const data = await providerService.getEditableProviders()

    return Response.json({ data })
}
