(() => {
  let selectedText = "";
  let popup = null;

  const handleMouseUp = () => {
    var newText = getSelectedText();
    if (newText && newText !== selectedText) {
      selectedText = newText;
      sendMessageToBackground({ text: selectedText });
    }
  };
  const handleClick = (event) => {
    if (popup && !popup.contains(event.target)) {
      closePopup();
      selectedText = null;
    }
  };
  document.addEventListener("mouseup", handleMouseUp);
  document.addEventListener("click", handleClick);

  function getSelectedText() {
    var text = "";
    if (window.getSelection) {
      text = window.getSelection().toString();
    } else if (document.selection && document.selection.type !== "Control") {
      text = document.selection.createRange().text;
    }
    return text;
  }

  function sendMessageToBackground(message) {
    chrome.runtime.sendMessage(message);
  }

  function isValidWord(text) {
    var regex = /^\s*\w+\s*$/;
    return regex.test(text);
  }

  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      const { action, selection } = request;
      if (action === "Define") {
        if (!popup) {
          popup = document.createElement("div");
          document.body.appendChild(popup);
          stylingPopup();
          addTail();
        }

        if (isValidWord(selection)) {
          const selectionCoords = getSelectionCoords();
          positionPopup(selectionCoords);
          showSearchingMessage();
          const response = await getDefinition(selection);
          handleValidWordSelection(response);
          addTail();
        } else {
          closePopup();
        }
      }
    }
  );

  async function handleValidWordSelection(response) {
    const word = response ? response[0]?.word : null;

    if (!word) {
      const errorMessage = response?.message || "Sorry!";
      console.error(errorMessage);
      closePopup();
    } else {
      const { audio, definition, phonetic } = extractDataFromResponse(response);
      displayPopup(word, phonetic, audio, definition);
    }
  }

  function getSelectionCoords() {
    const selection = window.getSelection();

    const range = selection.getRangeAt(0);

    const rect = range.getBoundingClientRect();

    return {
      top: rect.top + window.scrollY + rect.height + 10,
      left: rect.left + window.scrollX,
      bottom: rect.bottom,
      rectTop: rect.top,
      rectBottom: rect.bottom,
    };
  }

  function positionPopup(coords) {
    const { top, left } = coords;
    popup.style.position = "absolute";
    popup.style.top = `${top}px`;
    popup.style.left = `${left > 100 ? left - 120 : left}px`;
  }

  function addTail() {
    var tail = document.createElement("div");
    tail.style.content = "";
    tail.style.border = "10px solid transparent";
    tail.style.position = "absolute";
    tail.style.borderBottomColor = "#F0F0F0";
    tail.style.borderTop = "0";
    tail.style.top = "-10px";
    tail.style.left = "50%";
    tail.style.marginLeft = "-10px";
    popup.appendChild(tail);
  }

  const extractDataFromResponse = (response) => {
    const audio = findAudio(response);
    const definition = findDefinition(response);
    const phonetic = response[0].phonetic || "Phonetic not found!";
    return { audio, definition, phonetic };
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

  function showSearchingMessage() {
    const searchElement = document.createElement("h5");
    searchElement.style.width = "300px";
    searchElement.style.margin = 0;
    searchElement.style.padding = 0;
    searchElement.style.fontWeight = "500";
    searchElement.id = "searching-span";
    searchElement.innerHTML = `Searching...`;

    popup.appendChild(searchElement);
  }

  function displayPopup(word, phonetic, audio, definition) {
    popup.innerHTML = `<span id="close-popup"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span>
            <div id="popup-container">
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

            <a id ="more-info" href = "https://www.google.com/search?dictcorpus=en-US&hl=en&forcedict=${word}&q=define%20${word}" target = "_Blank">More »</a>

            </div>`;
    const popupContainer = document.getElementById("popup-container");
    const upperFlex = document.getElementById("up-flex");
    const closeButton = document.getElementById("close-popup");
    const paraElement = document.getElementById("phonetic-para");
    const playSource = document.getElementById("myAudio");
    const playButton = document.getElementById("play-btn");
    const moreBtn = document.getElementById("more-info");
    const definitionPara = document.getElementById("defination-para");
    const wordSpan = document.getElementById("word-span");
    stylingPopupContainer(
      popupContainer,
      upperFlex,
      closeButton,
      paraElement,
      playButton,
      moreBtn,
      definitionPara,
      wordSpan
    );

    listenToEvents(closeButton, playButton, playSource);
  }

  const closePopup = () => {
    if (popup) {
      document.body.removeChild(popup);
      popup = null;
    }
  };

  const listenToEvents = (closeButton, playButton, playSource) => {
    if (closeButton) {
      closeButton.addEventListener("click", closePopup);
    }
    if (playButton) {
      playButton.addEventListener("click", () => {
        playButton.style.border = "none";
        playSource.play();
      });
    }
  };

  const stylingPopup = () => {
    if (popup) {
      popup.style.zIndex = "10000";
      // popup.style.position = "fixed";
      // popup.style.top = "0";
      // popup.style.right = "0";

      popup.style.background = "#F1EFEF";
      popup.style.color = "#191717";
      // popup.style.border = "1px solid #ccc";
      popup.style.borderTop = "none";
      popup.style.borderRadius = "5px";
      popup.style.padding = "10px";
      popup.style.boxShadow = "rgba(0, 0, 0, 0.34) 0px 5px 10px";
    }
  };

  const stylingPopupContainer = (
    popupContainer,
    upperFlex,
    closeButton,
    paraElement,
    playButton,
    moreBtn,
    definitionPara,
    wordSpan
  ) => {
    //Popup Style
    if (popupContainer) {
      popupContainer.style.position = "relative";
      popupContainer.style.height = "auto";
      popupContainer.style.width = "300px";
      popupContainer.style.display = "flex";
      popupContainer.style.flexDirection = "column";
    }

    //upperFlex Style
    if (upperFlex) {
      upperFlex.style.display = "flex";
      upperFlex.style.flexDirection = "row";
      upperFlex.style.alignItems = "center";
      upperFlex.style.gap = "10px";

      upperFlex.style.paddingTop = "10px";
      upperFlex.style.paddingBottom = "10px";
    }
    //close button Style\
    if (closeButton) {
      closeButton.style.position = "absolute";
      closeButton.style.textDecoration = "none";
      closeButton.style.border = "none";
      closeButton.style.background = "none";
      closeButton.style.color = "#61677A";
      closeButton.style.top = "-1px";
      closeButton.style.right = "1px";
      closeButton.style.padding = "0";
      closeButton.style.margin = "0";
      closeButton.style.borderRadius = "0";
      closeButton.style.appearance = "none";
      closeButton.style.textAlign = "center";
      closeButton.style.zIndex = "100";
      closeButton.style.cursor = "pointer";

      closeButton.addEventListener("mouseover", () => {
        closeButton.style.color = "#191717";
      });
      closeButton.addEventListener("mouseout", () => {
        closeButton.style.color = "#61677A";
      });
    }

    //play-btn Style
    if (playButton) {
      playButton.style.textDecoration = "none";
      playButton.style.border = "none";
      playButton.style.background = "none";
      playButton.style.color = "#61677A";
      playButton.style.padding = "0";
      playButton.style.margin = "0";
      playButton.style.borderRadius = "0";
      playButton.style.appearance = "none";
      playButton.style.textAlign = "center";
      playButton.style.cursor = "pointer";

      playButton.addEventListener("mouseover", () => {
        playButton.style.color = "#191717";
      });
      playButton.addEventListener("mouseout", () => {
        playButton.style.color = "#61677A";
      });
    }

    //paraElement style
    if (paraElement) {
      paraElement.style.position = "relative";
      paraElement.style.fontWeight = "700";
    }
    //definition para style
    if (definitionPara) {
      definitionPara.style.fontWeight = "500";
      definitionPara.style.fontSize = "15px";
    }
    //anchore tag style
    if (moreBtn) {
      moreBtn.style.color = "blue";
      moreBtn.style.fontSize = "13px";
      moreBtn.style.alignSelf = "flex-end";
    }
    //styling word heading
    if (wordSpan) {
      wordSpan.style.fontWeight = "700";
      wordSpan.style.fontSize = "1rem";
    }
  };

  const getDefinition = async (selection) => {
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${selection}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error.message);
      closePopup();
      return;
    }
  };
})();
