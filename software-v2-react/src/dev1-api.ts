async function apiDev() {
  const res = await fetch(`https://server.kermite.org/api/packages/catalog`);
  const obj = await res.json();
  console.log({ res, obj });

  const res2 = await fetch(
    `https://server.kermite.org/api/packages/projects/79xv6Z`
  );
  const obj2 = await res2.json();
  console.log({ res2, obj2 });
}

window.addEventListener("load", apiDev);
