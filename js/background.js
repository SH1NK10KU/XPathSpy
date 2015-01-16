/*******************************************************************************
 *
 * XPath Spy 1.0
 *
 * Copyright (c) 2014, Shin Feng. All rights reserved.
 *
 ******************************************************************************/
function getNotificationId() {
    var id = Math.floor(Math.random() * 9007199254740992) + 1;
    return id.toString();
}

function messageReceived() {
    var theMessage = getMessage(xpath);
    chrome.notifications.create(getNotificationId(), {
        title: 'XPath Spy',
        iconUrl: 'images/icon128.png',
        type: 'basic',
        message: theMessage
    }, function() {});
}

chrome.commands.onCommand.addListener(function(command) {
    if (command == "xpathspy") {
        var theXpath = prompt("Please input your XPath:", "");
        chrome.tabs.query({
            currentWindow: true,
            active: true
        }, function(tab) {
            chrome.tabs.sendMessage(tab[0].id, {
                command: "xpathspy",
                xpath: theXpath
            });
        });
        messageReceived();
    }
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "xpathspy")
      chrome.notifications.create(getNotificationId(), {
        title: 'XPath Spy',
        iconUrl: 'images/icon128.png',
        type: 'basic',
        message: request.result
    }, function() {});
  });

chrome.gcm.onMessage.addListener(messageReceived);