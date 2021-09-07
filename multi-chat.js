var content = document.body;
var template =
    "<div class=\"box\" style=\"float:left;width:$w$%;height:$h$%\">" + 
        "<div class=\"row header\" style=\"padding-left:10px;padding-top:5px;padding-bottom:5px\"><a href=\"https://www.twitch.tv/$channel$\" target=\"_blank\">$channelDisplay$</a></div>" + 
        "<div class=\"row content\">" + 
            "<iframe id=\"$id$\" src=\"https://www.twitch.tv/embed/$channel$/chat?parent=tools.ensmann.de$darkmode$\" style=\"border:none;width:100%;height:100%\">iframes not supported</iframe>" + 
        "</div>" + 
    "</div>";

var urlParams = parseURLParams(window.location.href);
console.log(urlParams);

function init() {
    if (urlParams.get("query").get("c") === undefined) {
        alert("You have not provided any channels to view. Returning to configurator...");
        window.location.replace("https://z.ensmann.de/multi-chat/");
    }
    else {
        startChats()
    }
}

function startChats() {
    var q = urlParams.get("query");
    var channels = q.get("c");
    var useDarkMode = q.get("dm") !== undefined && q.get("dm").length > 0 ? "&darkpopout" : "";
    var useTwoRows = q.get("tr") !== undefined && q.get("tr").length > 0;

    if (useDarkMode !== "") {
        document.body.style.backgroundColor = "#000";
    }

    console.log("starting chats");
    console.log(channels);
    console.log(useDarkMode);
    console.log(useTwoRows);

    var title = "Multi-Chat: " + channels.join(", ");
    window.document.title = title;
    
    var newContent = "";

    var chanCount = Math.min(10, channels.length);
    var height = (useTwoRows && channels.length > 1) ? "50" : "100";
    var dividor = (useTwoRows && channels.length > 1) ? Math.floor(chanCount / 2) : chanCount;
    var width1 = 100 / dividor;
    var width2 = 100 / (chanCount - dividor);

    var index = 0;
    for (var i = 0; i < 2; ++i) {
        var limit = i == 0 ? Math.min(dividor, chanCount) : chanCount;
        for (; index < limit; ++index) {
            channels[index] = channels[index].trim()
            var currentFrame = template
            .replace("$id$", "chat" + index)
            .replace("$channelDisplay$", channels[index].trim())
            .replace(/\$channel\$/g, channels[index].trim().toLowerCase())
            .replace("$darkmode$", useDarkMode)
            .replace("$w$", "" + (i === 0 ? width1 : width2))
            .replace("$h$", height);
            newContent = newContent + currentFrame;
        }
        if (i === 1 && useTwoRows) {
            newContent = newContent + "<br />";
        }
    }
    content.innerHTML = newContent;
}

window.onload = init;