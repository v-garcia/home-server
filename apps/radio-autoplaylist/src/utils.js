import got from 'got';

function reduceOverStream(stream, callback, acc) {
  return new Promise((resolve, reject) => {
    stream
      .on('data', (data) => {
        acc = callback(acc, data);
      })
      .on('error', reject)
      .on('end', () => resolve(acc));
  });
}

function gotifyNotification(title, message, priority) {
  const url = process.env.GOTIFY_URL;
  const token = process.env.GOTIFY_TOKEN;

  if (!url || !token) return;

  return got
    .post(`${url}/message`, {
      headers: { 'X-Gotify-Key': token },
      json: {
        title: title,
        message: message,
        priority: priority || 1,
      },
      retry: 3,
    })
    .catch(console.error);
}

export { reduceOverStream, gotifyNotification };
