export async function getMovies() {
  let res = await fetch('http://localhost:3000/api/movies')
  let data = await res.json()
  console.log(data)
  return data;
}