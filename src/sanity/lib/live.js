// Querying with "sanityFetch" keeps content automatically updated via
// Sanity's Live Content API. Render <SanityLive /> once in your root layout.
//
// For real-time updates to work in production you need a read token:
//   1. Sanity dashboard → API → Tokens → Add API token (Viewer role)
//   2. Add to .env.local:  SANITY_API_READ_TOKEN=your_token_here
//
// Without the token, sanityFetch still works — it just won't stream live
// updates until the token is set.
import { defineLive } from 'next-sanity/live'
import { client } from './client'

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({ useCdn: false }),
  serverToken: process.env.SANITY_API_READ_TOKEN,
  browserToken: process.env.SANITY_API_READ_TOKEN,
})
