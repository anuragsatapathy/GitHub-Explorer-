const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsDiv = document.getElementById("results");
const favoritesDiv = document.getElementById("favorites");
const userSearchBtn = document.getElementById("userSearchBtn");
const repoSearchBtn = document.getElementById("repoSearchBtn");

let searchType = "users";
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

userSearchBtn.addEventListener("click", () => {
  searchType = "users";
  userSearchBtn.classList.add("active");
  repoSearchBtn.classList.remove("active");
});

repoSearchBtn.addEventListener("click", () => {
  searchType = "repositories";
  repoSearchBtn.classList.add("active");
  userSearchBtn.classList.remove("active");
});

searchBtn.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  if (!query) return alert("Enter a search term");

  const url = `https://api.github.com/search/${searchType}?q=${query}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("GitHub API error");
    const data = await res.json();
    displayResults(data.items || []);
  } catch (err) {
    alert("Error fetching data from GitHub API.");
    console.error(err);
  }
});

function displayResults(items) {
  resultsDiv.innerHTML = "";

  if (items.length === 0) {
    resultsDiv.innerHTML = `<p style="grid-column: 1 / -1; text-align:center; color:#ffd700;">No results found!</p>`;
    return;
  }

  items.forEach(item => {
    const card = document.createElement("div");
    card.classList.add("card");

    if (searchType === "users") {
      card.innerHTML = `
        <img src="${item.avatar_url}" width="80" />
        <h3>${item.login}</h3>
        <a href="${item.html_url}" target="_blank">View Profile</a><br>
        <button onclick="addToFavorites('${item.login}', '${item.html_url}', '${item.avatar_url}', 'user', this)">Add to Favorites</button>
      `;
    } else {
      card.innerHTML = `
        <img src="${item.owner.avatar_url}" width="80" />
        <h3>${item.name}</h3>
        <p>${item.description || "No description"}</p>
        <a href="${item.html_url}" target="_blank">View Repo</a><br>
        <button onclick="addToFavorites('${item.full_name}', '${item.html_url}', '${item.owner.avatar_url}', 'repo', this)">Add to Favorites</button>
      `;
    }

    resultsDiv.appendChild(card);
  });
}

function addToFavorites(name, url, avatar, type, btn) {
  if (favorites.some(f => f.name === name)) return;
  favorites.push({ name, url, avatar, type });
  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites();
  btn.textContent = "Added";
  btn.disabled = true;
}

function displayFavorites() {
  favoritesDiv.innerHTML = "";
  favorites.forEach((fav, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
      ${fav.avatar ? `<img src="${fav.avatar}" width="60" />` : ""}
      <h3>${fav.name}</h3>
      <a href="${fav.url}" target="_blank">Open</a><br>
      <button onclick="removeFavorite(${index})">Remove</button>
    `;
    favoritesDiv.appendChild(card);
  });
}

function removeFavorite(index) {
  favorites.splice(index, 1);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  displayFavorites();
}

displayFavorites();


