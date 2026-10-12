import { defineRouteMiddleware } from '@astrojs/starlight/route-data';

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  // Navigation lives in the site header, so the empty Starlight sidebar is never shown.
  route.hasSidebar = false;
  if (route.entry.data.pageType === 'tool') route.toc = undefined;
});
