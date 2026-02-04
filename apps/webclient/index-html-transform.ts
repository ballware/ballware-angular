import { version } from './package.json';

export default (indexHtml: string) => {

  const keys = Object.keys(process.env);

  indexHtml = indexHtml.replace(`%BALLWARE_VERSION%`, version);

  keys.forEach(k => {
    if (k.startsWith('BALLWARE_')) {
      indexHtml = indexHtml.replace(`%${k}%`, process.env[k] as string);
    }
  });

  return indexHtml;
};
