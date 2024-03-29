export default async function fetch2(method, params = null) {
  return await fetch(
    "https://notifications-backend-production.koka.team/v1/" +
      method +
      sessionStorage.getItem("params"),
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    }
  )
    .then((data) => data.json())
    .then((res) => {
      return res;
    });
}
