export function useCounselorAuth() {
  const config = useRuntimeConfig()
  const token = useState<string>('counselor-token', () => '')
  const ready = useState<boolean>('counselor-auth-ready', () => false)
  const verified = useState<boolean>('counselor-auth-verified', () => false)

  const hydrate = () => {
    if (import.meta.client && !ready.value) {
      token.value = localStorage.getItem('counselor-token') || ''
      ready.value = true
      verified.value = false
    }
  }
  const clear = () => {
    token.value = ''
    verified.value = false
    if (import.meta.client) localStorage.removeItem('counselor-token')
  }
  const request = async <T = any>(path: string, options: any = {}): Promise<T> => {
    hydrate()
    const headers: Record<string, string> = { Accept: 'application/json', ...(options.headers || {}) }
    if (token.value) headers.Authorization = `Bearer ${token.value}`
    try {
      return await $fetch<T>(`${config.public.apiBase}${path}`, { ...options, headers })
    } catch (error: any) {
      if (error?.status === 401) clear()
      throw error
    }
  }
  const login = async (email: string, password: string) => {
    const result = await request<{ data: { id: number; name: string }; token: string }>('/counselor/login', {
      method: 'POST', body: { email, password },
    })
    token.value = result.token
    verified.value = true
    if (import.meta.client) localStorage.setItem('counselor-token', result.token)
    return result.data
  }
  const verify = async () => {
    if (!token.value) return false
    await request('/counselor/appointments')
    verified.value = true
    return true
  }
  return { token, ready, verified, hydrate, clear, request, login, verify }
}
