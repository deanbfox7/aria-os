import { Hono } from 'hono';
import type { Handler } from 'hono/types';

const API_BASENAME = '/api';
const api = new Hono();

// Use import.meta.glob to statically resolve all API route files at build time.
// This works in both dev (with HMR) and production (bundled for serverless).
const routeModules = import.meta.glob('../src/app/api/**/route.js', {
  eager: true,
}) as Record<
  string,
  Record<string, (req: Request, ctx: { params: Record<string, string> }) => Response | Promise<Response>>
>;

// Transform a glob key like "../src/app/api/auth/login/route.js" into a Hono path like "/auth/login"
function getHonoPath(filePath: string): string {
  const match = filePath.match(/\.\.\/src\/app\/api\/(.+)\/route\.js$/);
  if (!match) return '/';

  const parts = match[1].split('/');
  const transformed = parts.map((segment) => {
    const paramMatch = segment.match(/^\[(\.{3})?([^\]]+)\]$/);
    if (paramMatch) {
      const [, dots, param] = paramMatch;
      return dots === '...' ? `:${param}{.+}` : `:${param}`;
    }
    return segment;
  });

  return '/' + transformed.join('/');
}

// Sort paths so more specific routes come first (longer paths = more specific)
const sortedEntries = Object.entries(routeModules).sort(
  ([a], [b]) => b.length - a.length
);

// Register all routes
for (const [filePath, routeModule] of sortedEntries) {
  const honoPath = getHonoPath(filePath);
  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

  for (const method of methods) {
    if (routeModule[method]) {
      const handler: Handler = async (c) => {
        const params = c.req.param();
        return routeModule[method](c.req.raw, { params });
      };
      const m = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
      api[m](honoPath, handler);
    }
  }
}

export { api, API_BASENAME };
