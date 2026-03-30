export function getArrayFieldError(error: any): string | undefined {
  if (!error) return undefined

  if (error.message) return error.message

  if (Array.isArray(error)) {
    return error.find((e) => e?.message)?.message
  }

  return undefined
}
