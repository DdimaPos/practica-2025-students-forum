// https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For#parsing
export const getFirstIP = (ipList: string) => {
  return ipList.split(',')[0].trim();
};
