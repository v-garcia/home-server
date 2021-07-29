
class Utils {
    static groupBy = (items, key) => items.reduce(
        (result, item) => ({
          ...result,
          [item[key]]: [
            ...(result[item[key]] || []),
            item,
          ],
        }), 
        {},
      );
}
  
export default Utils;