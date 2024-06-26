import { query } from './_generated/server'

import { v } from 'convex/values'

export const get = query({
  args: {
    orgId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Unauthorized')
    }

    const boards = await ctx.db
      .query('board')
      .withIndex('by_org', q => q.eq('orgId', args.orgId))
      .order('desc')
      .collect()

    return boards
  },
})
