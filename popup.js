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

const getDefinition = async (word) => {
  responseContainer.innerHTML = `Loading...`;
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const data = await response.json();
    console.log(data);
    const { audio, definition, phonetic, usageExample } =
      extractDataFromResponse(data);
    responseContainer.innerHTML = ` <div id="popup-container">
                                      <div id ="up-flex">
                                        <span id = "phonetic-para">${phonetic}</span>
                                          ${
                                            audio
                                              ? `<audio id="myAudio">
                                                <source src="${audio}" type="audio/mpeg">
                                                  Your browser does not support the audio element.
                                                </audio>
                                                <span id = "play-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg></span>`
                                              : ""
                                          }
                                    </div>
                                    <span id = "word-span">${word}: </span>
                                    <p id ="defination-para">${definition}</p>
                                    <p id ="defination-example">${usageExample}</p>
                                    <a id ="more-info" href = "https://www.google.com/search?dictcorpus=en-US&hl=en&forcedict=${word}&q=define%20${word}" target = "_Blank">More »</a>
                                    </div>`;
    return data;
  } catch (error) {
    console.error(error);
    responseContainer.innerHTML = ``;
    return;
  }
};
const isValidWord = (text) => {
  var regex = /^\s*\w+\s*$/;
  return regex.test(text);
};
const extractDataFromResponse = (response) => {
  const audio = findAudio(response);
  const definition = findDefinition(response);
  const usageExample = findExample(response);
  const phonetic = response[0].phonetic || "Phonetic not found!";
  return { audio, definition, phonetic, usageExample };
};

const findAudio = (response) => {
  for (const phonetic of response[0].phonetics) {
    if (phonetic.audio) {
      return phonetic.audio;
    }
  }
  return null;
};

const findDefinition = (response) => {
  for (const def of response[0].meanings[0].definitions) {
    if (def.definition) {
      return def.definition;
    }
  }
  return "Definition not found";
};
const findExample = (response) => {
  for (const ex of response[0].meanings[0].definitions) {
    if (ex.definition && ex.example) {
      return ex.example;
    }
  }
};
