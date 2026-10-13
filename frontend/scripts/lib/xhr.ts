import { IAny, IResponse, IRequestType } from "@/types/LibTypes"

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
        return { code: 408, ok: false, msg: "REQUEST_TIMEOUT", errors: err }
      })
    return response
  } catch (err) {
    return { code: 408, ok: false, msg: "REQUEST_TIMEOUT", errors: err }
  }
}

async function forceFetchGet(ref: string): Promise<IResponse> {
  const response = await efetch("GET", ref)
  if (response.errors) {
    await waittime(300)
    return forceFetchGet(ref)
  }
  return response
}
async function forceFetchPost(ref: string, s?: IAny): Promise<IResponse> {
  const response = await efetch("POST", ref, s)
  if (response.errors) {
    await waittime(300)
    return forceFetchPost(ref, s)
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
  async forceGet(ref: string): Promise<IResponse> {
    return await forceFetchGet(ref)
  },
  async forcePost(ref: string, s?: IAny): Promise<IResponse> {
    return await forceFetchPost(ref, s)
  }
}
