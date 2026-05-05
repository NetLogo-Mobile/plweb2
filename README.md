# ai-friiendly-prerender-version

This is a special version for agents and AI(those could get access to URL content).Some AI are not able to execute js(e.g. Curl, or Request from Python) and cannot sent a request to get data from physics lab's server.We use netify's edge function to prerender the fetch request in our browser on netlify's server(also provides proxy) and return HTML with rendered data(only for crawlers with user-agent), such as `curl -A "Twitterbot/1.0" https://plweb-ai-friendly.netlify.app/`

This branch will no longer update.We may use SSR or a agent skill indtead.

See our work at https://plweb-ai-friendly.netlify.app/.

Well....You may not be able to see it.Just Curl it.
