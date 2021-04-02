export async function fakeHomeAddress ({ lat, long }) {
  console.log(`Run fakeHomeAddress with coordinate lat:${lat}, long:${long}`)

  const response = await fetch(
    `api/fake-address?lat=${lat}&long=${long}`,
  ).catch((e) => alert('Impossible de récupérer une adresse'))
  const result = await response.json()
  return result
}
