chrome.runtime.onInstalled.addListener(function () {
  console.info("Dictionary Extension installed!");
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.text) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "Define",
        selection: request.text,
      });
    });
  }
});
