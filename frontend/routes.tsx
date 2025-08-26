export const ROUTES = {
  home: '/',
  about: '/about',
  contact: '/contact',
  user: (id: string | number) => `/user/${id}`,
};