export async function getMovies(page, section) {
  let res = await fetch(encodeURI(`http://localhost:3000/api/movies/?page=${page}${section? '&section=' + section : ''}`))
  let data = await res.json()
  console.log(data)
  return data;
}