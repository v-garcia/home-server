import Papa from 'papaparse';
import got from 'got';

class Utils {
  static groupBy = (items, key) =>
    items.reduce(
      (result, item) => ({
        ...result,
        [item[key]]: [...(result[item[key]] || []), item],
      }),
      {}
    );
  static toCsv = (items) => Papa.unparse(items);

  static notify =
    (url, token) =>
    (title, message, priority = 1) => {
      console.info('notification:', title, message);
      return got.post(`${url}/message`, {
        headers: { 'X-Gotify-Key': token },
        json: {
          title,
          message,
          priority,
        },
        retry: 3,
      });
    };
}

export default Utils;
