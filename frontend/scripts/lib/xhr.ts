import type { IAny, IResponse, IRequestType } from "@/types/LibTypes"
import waittime from "@/lib/waittime"

async function efetch(method: IRequestType, url: string, s?: IAny, isFile?: boolean): Promise<IResponse> {
  const bodyInit: string | FormData | undefined = await new Promise((resolve) => {
    if (!s) return resolve(undefined)

    if (isFile) {
      const formData = new FormData()
      for (const key in s) {
        const item = s[key]
        if (item instanceof File || typeof item === "string") formData.append(key, s[key])
      }

      return resolve(formData)
    }

    return resolve(JSON.stringify(s))
  })

  const headersInit: HeadersInit = {
    Accept: "application/json"
  }

  if (!isFile) headersInit["Content-Type"] = "application/json"

  try {
    const response = await fetch(url, {
      method,
      headers: headersInit,
      body: bodyInit
    })
      .then((res) => {
        return res.json()
      })
      .then((res) => {
        return res
      })
      .catch((err) => {
        return { ok: false, code: "request_timeout", status: 408, errors: err }
      })
    return response
  } catch (err) {
    return { ok: false, code: "request_timeout", status: 408, errors: err }
  }
}

async function forceFetchGet(ref: string, ms: number): Promise<IResponse> {
  const response = await efetch("GET", ref)

  if (response.status === 401 || response.status === 403) return response

  if (!response.ok) {
    await waittime(ms)
    return forceFetchGet(ref, ms)
  }
  return response
}

async function forceFetchPost(ref: string, ms: number, s?: IAny): Promise<IResponse> {
  const response = await efetch("POST", ref, s)
  if (!response.ok) {
    await waittime(ms)
    return forceFetchPost(ref, s, ms)
  }
  return response
}

export default {
  async get(ref: string): Promise<IResponse> {
    return await efetch("GET", ref)
  },
  async post(ref: string, s?: IAny, isFile?: boolean): Promise<IResponse> {
    return await efetch("POST", ref, s, isFile)
  },
  async forceGet(ref: string, ms: number = 2000): Promise<IResponse> {
    return await forceFetchGet(ref, ms)
  },
  async forcePost(ref: string, ms: number = 2000, s?: IAny): Promise<IResponse> {
    return await forceFetchPost(ref, s, ms)
  }
}
