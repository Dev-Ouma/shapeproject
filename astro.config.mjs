import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://shapeproject.org',
  trailingSlash: 'ignore',
  // Keep the original WordPress permalinks working.
  redirects: {
    '/feed': '/feed.xml',
    '/sitemap_index.xml': '/sitemap.xml',
    '/project-team-2': '/project-team/',
    '/shape-project-officially-launches': '/news/shape-project-officially-launches/',
    '/shape-consortium-convenes-partners-meeting-in-mombasa-to-set-the-course-for-smart-city-education-in-east-africa':
      '/news/shape-consortium-convenes-partners-meeting-in-mombasa-to-set-the-course-for-smart-city-education-in-east-africa/',
  },
});
