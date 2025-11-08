export function getIKPath(path: string) {
  if (!path) return "";
  return path.startsWith("/") ? path : `/${path}`;
}
