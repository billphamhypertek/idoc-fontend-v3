export interface MenuItem {
  id: string;
  code: string;
  name: string;
  href: string;
  svg: string;
  children: MenuItem[];
}
