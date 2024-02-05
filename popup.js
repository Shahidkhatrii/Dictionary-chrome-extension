const searchInput = document.querySelector("#search-input");
const searchBtn = document.querySelector("#search-btn");
const responseContainer = document.querySelector("#response");

searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  console.log(searchInput.value);
  const word = searchInput.value;
  if (isValidWord(word)) {
    getDefinition(word);
  } else {
    responseContainer.innerHTML = `Please enter a valid word`;
    setTimeout(() => {
      responseContainer.innerHTML = ``;
    }, 3000);
    searchInput.value = "";
  }
});

const getDefinition = async (selection) => {
  responseContainer.innerHTML = `Loading...`;
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${selection}`
    );
    const data = await response.json();
    responseContainer.innerHTML = ``;
    return data;
  } catch (error) {
    console.error(error.message);
    closePopup();
    responseContainer.innerHTML = ``;
    return;
  }
};
const isValidWord = (text) => {
  var regex = /^\s*\w+\s*$/;
  return regex.test(text);
};
