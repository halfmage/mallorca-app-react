export const stringifyParams = (params: object) => {
    const queryParams = new URLSearchParams(
        Object.entries(params).filter(([key, value]) => value != null) // eslint-disable-line @typescript-eslint/no-unused-vars
    )

    return `?${queryParams.toString()}`
}

export const isUUID = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value)
