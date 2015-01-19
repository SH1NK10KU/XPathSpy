/**************************************************************
 *
 *    XPath Spy 1.0
 *
 *    Copyright (c) 2014, Shin Feng. All rights reserved.
 *
 **************************************************************/
chrome.runtime.onMessage.addListener(function(request, sender) {
    var elementCount = 0;
    var theResult = "";
    if (request.command === "xpathspy") {
        if (request.xpath.match(/^(\/)/) === null) {
            theResult = "Please input valid XPath!";
            console.error(theResult);
        } else {
            try {
                var elements = document.evaluate(request.xpath, document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
                elementCount = elements.snapshotLength;
                if (elementCount > 0) {
                    theResult = "There " + (elementCount > 1 ? "are " + elementCount + " elements" : "is only one element") + " which XPath likes \'" + request.xpath + "\' in this page."
                    console.log(theResult);
                } else {
                    theResult = "There is no such element in this page!";
                    console.error(theResult);
                }
            } catch (e) {
                theResult = e.message.substr(e.message.indexOf("The string"));
            }
        }
        chrome.runtime.sendMessage({
            message: "xpathspy",
            result: theResult
        });
    }
});