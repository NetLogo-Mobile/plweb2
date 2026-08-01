export const onRequest: PagesFunction = async ({ request, params }) => {
  const path = Array.isArray(params.path) ? params.path.join('/') : String(params.path ?? '')

  const upstream = new URL(request.url)
  upstream.protocol = 'https:'
  upstream.host = 'physics-api-cn.turtlesim.com'
  upstream.pathname = `/${path}`

  const headers = new Headers(request.headers)
  headers.set('Referer', 'https://www.turtlesim.com/')
  headers.set('Origin', 'https://www.turtlesim.com/')
  headers.delete('host')
  headers.delete('content-length')

  const response = await fetch(upstream.toString(), {
    method: request.method,
    headers,
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    redirect: 'manual',
  })

  const resultHeaders = new Headers(response.headers)
  resultHeaders.delete('access-control-allow-origin')
  resultHeaders.delete('access-control-allow-credentials')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: resultHeaders,
  })
}
