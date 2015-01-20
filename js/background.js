/*******************************************************************************
 * 
 * XPath Spy 1.0
 * 
 * Copyright (c) 2014, Shin Feng. All rights reserved.
 * 
 ******************************************************************************/
window.xpathOfSelectedElement = "";
function getNotificationId() {
    var id = Math.floor(Math.random() * 9007199254740992) + 1;
    return id.toString();
}

function messageReceived() {
    var theMessage = getMessage(xpath);
    chrome.notifications.create(getNotificationId(), {
        title : 'XPath Spy',
        iconUrl : 'images/icon128.png',
        type : 'basic',
        message : theMessage
    }, function() {
    });
}

chrome.commands.onCommand.addListener(function(command) {
    if (command === "xpathspy") {
        var theXpath = prompt("Please input your XPath:", "");
        chrome.tabs.query({
            currentWindow : true,
            active : true
        }, function(tab) {
            chrome.tabs.sendMessage(tab[0].id, {
                command : "shortcut",
                xpath : theXpath
            });
        });
        messageReceived();
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "notification") {
        chrome.notifications.create(getNotificationId(), {
            title : 'XPath Spy',
            iconUrl : 'images/icon128.png',
            type : 'basic',
            message : request.result
        }, function() {
        });
    } else if (request.message === "contextMenu") {
        window.xpathOfSelectedElement = request.result;
    }
});

chrome.gcm.onMessage.addListener(messageReceived);

function conttextMenuHandler(info, tab) {
    prompt("The XPath of your selected element is:", window.xpathOfSelectedElement);
};

chrome.contextMenus.onClicked.addListener(conttextMenuHandler);
chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        "title" : "Spy XPath",
        "type" : "normal",
        "id" : "spyxpath",
        "contexts" : [ "all" ]
    });
});