(() => {
  let sText = null;

  document.addEventListener("mouseup", function () {
    console.log(sText, "sText");
    var selectedText = getSelectedText();
    if (selectedText && selectedText != sText) {
      sText = selectedText;
      chrome.runtime.sendMessage({ text: selectedText });
    }
  });

  document.addEventListener("click", function (event) {
    if (popup && !popup.contains(event.target)) {
      closePopup();
    }
  });

  function getSelectedText() {
    var text = "";
    if (window.getSelection) {
      text = window.getSelection().toString();
    } else if (document.selection && document.selection.type !== "Control") {
      text = document.selection.createRange().text;
    }
    return text;
  }

  function isValidWord(text) {
    var regex = /^\s*\w+\s*$/;
    return regex.test(text);
  }

  let popup;
  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      const { action, selection } = request;
      if (action === "Define") {
        if (!popup) {
          popup = document.createElement("div");
          document.body.appendChild(popup);
        }

        if (isValidWord(selection)) {
          const response = await getDefination(selection).then((data) => {
            return data;
          });

          const word = response[0]?.word;
          if (!word) {
            const message = response?.message;
            if (message) {
              errorPopup(message);
            } else {
              errorPopup("Sorry!");
            }
          } else {
            let audio;
            for (let i = 0; i < response[0].phonetics.length; i++) {
              if (response[0].phonetics[i].audio) {
                audio = response[0].phonetics[i].audio;
                break;
              }
            }

            let definition;

            for (
              let i = 0;
              i < response[0].meanings[0].definitions.length;
              i++
            ) {
              if (response[0].meanings[0].definitions[i].definition) {
                definition = response[0].meanings[0].definitions[i].definition;
                break;
              }
            }
            if (!definition) {
              definition = "defination not found";
            }
            let phonetic = response[0].phonetic;
            if (!phonetic) {
              phonetic = "Phonetic not found!";
            }

            popup.style.zIndex = "1000";
            popup.innerHTML = `<button id="close-popup"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0,0,256,256">
            <g transform=""><g fill="#ffffff" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="translate(0,0) scale(8.53333,8.53333)"><path d="M7,4c-0.25587,0 -0.51203,0.09747 -0.70703,0.29297l-2,2c-0.391,0.391 -0.391,1.02406 0,1.41406l7.29297,7.29297l-7.29297,7.29297c-0.391,0.391 -0.391,1.02406 0,1.41406l2,2c0.391,0.391 1.02406,0.391 1.41406,0l7.29297,-7.29297l7.29297,7.29297c0.39,0.391 1.02406,0.391 1.41406,0l2,-2c0.391,-0.391 0.391,-1.02406 0,-1.41406l-7.29297,-7.29297l7.29297,-7.29297c0.391,-0.39 0.391,-1.02406 0,-1.41406l-2,-2c-0.391,-0.391 -1.02406,-0.391 -1.41406,0l-7.29297,7.29297l-7.29297,-7.29297c-0.1955,-0.1955 -0.45116,-0.29297 -0.70703,-0.29297z"></path></g></g></g>
            </svg></button>
            <div id="popup-container">
            <div id ="up-flex">
            <audio id="myAudio">
            <source src="${audio}" type="audio/mpeg">
              Your browser does not support the audio element.
            </audio>
            
            <span id = "phonetic-para">${phonetic}</span>
            <button id = "play-btn"><img width="24" height="24" src="https://img.icons8.com/material-sharp/24/ffffff/high-volume--v2.png" alt="high-volume--v2"/></button>
            </div>
            <h5>${word}: </h5>
            <p id ="defination-para">${definition}</p>
            </div>`;
            console.log("opend!");
            const popupContainer = document.getElementById("popup-container");
            const upperFlex = document.getElementById("up-flex");
            const closeButton = document.getElementById("close-popup");
            const paraElement = document.getElementById("phonetic-para");
            const playSource = document.getElementById("myAudio");
            const playButton = document.getElementById("play-btn");

            stylingPopup(
              popupContainer,
              upperFlex,
              closeButton,
              paraElement,
              playButton
            );

            listenToEvents(closeButton, playButton, playSource);
          }
        } else {
          closePopup();
        }
      }
    }
  );
  const closePopup = () => {
    if (popup) {
      document.body.removeChild(popup);
      popup = null;
      sText = null;
    }
  };
  const listenToEvents = (closeButton, playButton, playSource) => {
    closeButton.addEventListener("click", closePopup);

    playButton.addEventListener("click", () => {
      playSource.play();
    });
  };

  const errorPopup = (content) => {
    popup.innerHTML = `<p>${content}</p>`;
    popup.style.zIndex = "10000";
    popup.style.position = "fixed";
    popup.style.top = "0";
    popup.style.right = "0";
    popup.style.background = "red";
    popup.style.color = "#fff";
    popup.style.border = "1px solid #ccc";
    popup.style.borderRadius = "5px";
    popup.style.padding = "10px";
    popup.style.boxShadow = "rgba(0, 0, 0, 0.34) 0px 5px 10px";

    setTimeout(() => {
      closePopup();
    }, 3000);
  };

  const stylingPopup = (
    popupContainer,
    upperFlex,
    closeButton,
    paraElement,
    playButton
  ) => {
    //Popup Style
    popup.style.position = "fixed";
    popup.style.top = "0";
    popup.style.right = "0";
    popup.style.background = "#000";
    popup.style.color = "#fff";
    popup.style.border = "1px solid #ccc";
    popup.style.borderRadius = "5px";
    popup.style.padding = "10px";
    popup.style.boxShadow = "rgba(0, 0, 0, 0.34) 0px 5px 10px";
    popupContainer.style.position = "relative";
    popupContainer.style.height = "auto";
    popupContainer.style.width = "400px";
    popupContainer.style.display = "flex";
    popupContainer.style.flexDirection = "column";

    //upperFlex Style
    upperFlex.style.display = "flex";
    upperFlex.style.flexDirection = "row";
    upperFlex.style.alignItems = "center";
    upperFlex.style.gap = "10px";

    upperFlex.style.paddingTop = "10px";
    upperFlex.style.paddingBottom = "10px";

    //close button Style
    closeButton.style.position = "absolute";
    closeButton.style.textDecoration = "none";
    closeButton.style.border = "none";
    closeButton.style.background = "none";
    closeButton.style.color = "#fff";
    closeButton.style.top = "-2px";
    closeButton.style.right = "1px";
    closeButton.style.padding = "0";
    closeButton.style.margin = "0";
    closeButton.style.borderRadius = "0";
    closeButton.style.appearance = "none";
    closeButton.style.textAlign = "center";
    closeButton.style.zIndex = "100";

    //play-btn Style
    playButton.style.textDecoration = "none";
    playButton.style.border = "none";
    playButton.style.background = "#000";
    playButton.style.color = "#fff";
    playButton.style.padding = "0";
    playButton.style.margin = "0";
    playButton.style.borderRadius = "0";
    playButton.style.appearance = "none";

    //paraElement style
    paraElement.style.position = "relative";
  };

  const getDefination = async (selection) => {
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${selection}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  };
})();
