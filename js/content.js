/*******************************************************************************
 * 
 * XPath Spy 1.0
 * 
 * Copyright (c) 2014, Shin Feng. All rights reserved.
 * 
 ******************************************************************************/
chrome.runtime.onMessage.addListener(function(request, sender) {
    var elementCount = 0;
    var theResult = "";
    if (request.command === "shortcut") {
        if (request.xpath.match(/^(\/)/) === null) {
            theResult = "Please input valid XPath!";
            console.error(theResult);
        } else {
            try {
                var elements = document.evaluate(request.xpath, document, null,
                        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
                elementCount = elements.snapshotLength;
                if (elementCount > 0) {
                    theResult = "There "
                            + (elementCount > 1 ? "are " + elementCount
                                    + " elements" : "is only one element")
                            + " which XPath like \'" + request.xpath
                            + "\' in this page."
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
            message : "notification",
            result : theResult
        });
    }
});

document.oncontextmenu = function(e) {
    e = e || window.event;
    var target = e.target || e.srcElement; 
    chrome.runtime.sendMessage({
        message : "contextMenu",
        result : getElementInfo(target)
    });
    return true;
}

var getElementInfo = function selectedElement(element) {
    // Get sibling information.
    function getSibling(e, isFull) {
        var sibling = {
            num : 0,
            index : 1
        };
        var preSiblingNum = 0;
        var nextSiblingNum = 0;
        var previousSiblingElement = e.previousSibling;
        var nextSiblingElement = e.nextSibling;
        if (isFull) {
            while (previousSiblingElement != null) {
                if (previousSiblingElement.id === e.id
                        && previousSiblingElement.tagName === e.tagName
                        && previousSiblingElement.name === e.name
                        && previousSiblingElement.className === e.className
                        && previousSiblingElement.type === e.type) {
                    preSiblingNum += 1;
                }
                previousSiblingElement = previousSiblingElement.previousSibling;
            }
            while (nextSiblingElement != null) {
                if (nextSiblingElement.id === e.id
                        && nextSiblingElement.tagName === e.tagName
                        && nextSiblingElement.name === e.name
                        && nextSiblingElement.className === e.className
                        && nextSiblingElement.type === e.type) {
                    nextSiblingNum += 1;
                }
                nextSiblingElement = nextSiblingElement.nextSibling;
            }
        } else {
            while (previousSiblingElement != null) {
                if (previousSiblingElement.tagName === e.tagName) {
                    preSiblingNum += 1;
                }
                previousSiblingElement = previousSiblingElement.previousSibling;
            }
            while (nextSiblingElement != null) {
                if (nextSiblingElement.tagName === e.tagName) {
                    nextSiblingNum += 1;
                }
                nextSiblingElement = nextSiblingElement.nextSibling;
            }
        }
        sibling["num"] = preSiblingNum + nextSiblingNum;
        sibling["index"] += preSiblingNum;
        return sibling;
    }
    
    // Get the xpath of the element.
    function getElementXpath(e, isFull) {
        var nodeInfo = e.tagName.toLowerCase();
        var sibling = getSibling(e, isFull);
        if (isFull) {
            var attrsArray = new Array();
            var attrs = [ "@type=", "@class=", "@name=", "@id=" ];
            var values = [ e.type, e.className, e.name, e.id ];
            for (var index = attrs.length - 1; index >= 0; index--) {
                if (typeof values[index] !== "undefined"
                        && values[index] !== "") {
                    attrsArray.push(attrs[index] + "'" + values[index] + "'");
                }
            }
            if (attrsArray.length > 0) {
                nodeInfo += "[" + attrsArray.join(" and ") + "]";
            }
        }
        if (sibling["num"] > 0) {
            nodeInfo += "[" + sibling["index"] + "]";
        }
        return nodeInfo;
    }
    
    // Get the xpath of the element with id.
    function getElementXpathWithId(e) {
        return formatWithHTML("//" + e.tagName.toLowerCase() + "[@id='" + e.id
                + "']");
    }
    
    // Get the xpath of the element.
    function getXpath(e, isFull) {
        var xpath = getElementXpath(e, isFull);
        var parentElement = e.parentNode;
        while (parentElement.tagName) {
            if (!isFull) {
                if (e.id !== "") {
                    return getElementXpathWithId(e);
                }
                if (parentElement.id !== "") {
                    return getElementXpathWithId(parentElement) + "/" + xpath;
                }
            }
            xpath = getElementXpath(parentElement, isFull) + "/" + xpath;
            parentElement = parentElement.parentNode;
        }
        return formatWithHTML(xpath);
    }
    
    // Format the XPath with node, "html"
    function formatWithHTML(str) {
        return str.replace(/^((\/){0,2}html)/, "/html");
    }
    
    return getXpath(element, false);
};