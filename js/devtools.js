/*******************************************************************************
 * 
 * XPath Spy 1.0
 * 
 * Copyright (c) 2014, Shin Feng. All rights reserved.
 * 
 ******************************************************************************/
var getElementInfo = function selectedElement() {
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
        var nodeInfo = e.tagName;
        var sibling = getSibling(e, isFull);
        if (isFull) {
            var attrsArray = new Array();
            var attrs = [ "@value=", "@type=", "@class=", "@name=", "@id=" ];
            var values = [ e.value, e.type, e.className, e.name, e.id ];
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
        return formatWithHTML("//" + e.tagName + "[@id='" + e.id + "']");
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
    
    function formatWithHTML(str) {
        return str.replace(/^((\/){0,2}HTML)/, "/HTML");
    }

    // Get the top pixel of the element.
    function getTop(e) {
        var offset = e.offsetTop;
        if (e.offsetParent != null)
            offset += getTop(e.offsetParent);
        return offset;
    }
    
    // Get the left pixel of the element.
    function getLeft(e) {
        var offset = e.offsetLeft;
        if (e.offsetParent != null)
            offset += getLeft(e.offsetParent);
        return offset;
    }
    
    // Get the bottom pixel of the element.
    function getBottom(e) {
        return getTop(e) + e.offsetHeight;
    }
    
    // Get the right pixel of the element.
    function getRight(e) {
        return getLeft(e) + e.offsetWidth;
    }
    
    // 

    // Create data object.
    var data = Object.create(null);
    if ($0.nodeType === 1) {
        data["xpath(Short)"] = getXpath($0, false);
        data["xpath(Full)"] = getXpath($0, true);
        data["top"] = getTop($0);
        data["left"] = getLeft($0);
        data["bottom"] = getBottom($0);
        data["right"] = getRight($0);
    } else {
        data["error"] = "This is not an element node.";
    }
    return data;
};

chrome.devtools.panels.elements.createSidebarPane("XPath Spy",
        function(sidebar) {
            var onSelectionChanged = function() {
                sidebar.setExpression("(" + getElementInfo.toString() + ")()",
                        "Element");
            };
            onSelectionChanged();
            chrome.devtools.panels.elements.onSelectionChanged
                    .addListener(onSelectionChanged);
        });