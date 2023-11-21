// chrome.contextMenus.onClicked.addListener(selectionProcess);

// function selectionProcess(info, tab) {
//   if (info.menuItemId === "Define") {
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//       chrome.tabs.sendMessage(tabs[0].id, {
//         action: "Define",
//         selection: info.selectionText,
//       });
//     });
//     // chrome.tabs.sendMessage(tab.id, {
//     //   action: "Define",
//     //   selection: info.selectionText,
//     // });
//   }
// }

chrome.runtime.onInstalled.addListener(function () {
  console.log("Text Selection Extension installed");
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

// chrome.runtime.onInstalled.addListener(function () {
//   var text = document.getSelection();
//   if (text !== "") {
//     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//       chrome.tabs.sendMessage(tabs[0].id, {
//         action: "Define",
//         selection: text,
//       });
//     });
//   }
// });

// chrome.runtime.onInstalled.addListener(function () {
//   let context = ["selection"];
//   let title = "Define";

//   chrome.contextMenus.create({
//     title: title,
//     contexts: context,
//     id: "Define",
//   });
// });
