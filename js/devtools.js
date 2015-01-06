/**************************************************************
 *
 *    XPath Spy 1.0
 *
 *    Copyright (c) 2014, Shin Feng. All rights reserved.
 *
 **************************************************************/
var getElementInfo = function detectElement() {
    function getTagName(e) {
        return e.tagName;
    }

    function getId(e) {
        return e.id;
    }

    function getName(e) {
        return e.name;
    }

    function getClassName(e) {
        return e.className;
    }

    function getType(e) {
        return e.type;
    }

    function getValue(e) {
        return e.value;
    }

    function getNodeInfo(e) {
        var nodeInfo = getTagName(e);
        var attrsArray = new Array();
        var attrs = ["@id=", "@name=", "@class=", "@type="]
        var values = [getId(e), getName(e), getClassName(e),
            getType(e), getValue(e)
        ];
        for (var index = attrs.length - 1; index >= 0; index--) {
            if (typeof values[index] !== "undefined" && values[index] !== "") {
                attrsArray.push(attrs[index] + "'" + values[index] + "'");
            }
        }
        if (attrsArray.length > 0) {
            nodeInfo += "[" + attrsArray.join(" and ") + "]";
        }
        if (getPreviousSibling(e) > 1) {
            nodeInfo += "[" + getPreviousSibling(e) + "]";
        }
        return nodeInfo;
    }

    function getParentNode(e) {
        return e.parentNode;
    }

    function getPreviousSibling(e) {
        var pre = 1;
        var previousNode = e.previousSibling;
        while (previousNode != null) {
            if (previousNode.id === e.id && previousNode.tagName === e.tagName && previousNode.className === e.className && previousNode.type === e.type) {
                pre += 1;
            }
            previousNode = previousNode.previousSibling;
        }
        return pre;
    }

    function getTop(e) {
        var offset = e.offsetTop;
        if (e.offsetParent != null) offset += getTop(e.offsetParent);
        return offset;
    }

    function getLeft(e) {
        var offset = e.offsetLeft;
        if (e.offsetParent != null) offset += getLeft(e.offsetParent);
        return offset;
    }

    function getBottom(e) {
        return getTop(e) + e.offsetHeight;
    }

    function getRight(e) {
        return getLeft(e) + e.offsetWidth;
    }
    var node = $0;
    var data = Object.create(null);
    var parentElement = getParentNode($0);
    var xpath = getNodeInfo($0);
    while (parentElement.tagName) {
        xpath = getNodeInfo(parentElement) + "/" + xpath;
        parentElement = getParentNode(parentElement);
    }
    data["xpath"] = "//" + xpath;
    data["top"] = getTop($0);
    data["left"] = getLeft($0);
    data["bottom"] = getBottom($0);
    data["right"] = getRight($0);
    return data;
};
chrome.devtools.panels.elements.createSidebarPane("XPath Spy", function(sidebar) {
    var onSelectionChanged = function() {
        sidebar.setExpression("(" + getElementInfo.toString() + ")()", "Element");
    };
    onSelectionChanged();
    chrome.devtools.panels.elements.onSelectionChanged.addListener(onSelectionChanged);
});