export const stringifyParams = (params: object) => {
    const queryParams = new URLSearchParams(
        Object.entries(params).filter(([key, value]) => value != null) // eslint-disable-line @typescript-eslint/no-unused-vars
    )

    return `?${queryParams.toString()}`
}
