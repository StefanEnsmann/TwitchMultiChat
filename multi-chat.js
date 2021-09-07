let userNameRegEx = /^[a-zA-Z0-9_]{4,25}$/;
let users = [];
let darkMode = false;
let rowCount = 0;

function init() {
    let urlParams = parseURLParams(window.location.href);
    console.log(urlParams);
    let q = urlParams.get("query");

    darkMode = q.get("dm") !== undefined && q.get("dm").length > 0 ? true : false;
    $("#multiChatDarkMode").checked = darkMode;
    darkModeChanged(darkMode);

    rowCount = q.get("rc") !== undefined && !isNaN(parseInt(q.get("rc"))) ? parseInt(q.get("rc")) : 1;
    $("#rowCount").value = rowCount;
    rowCountChanged(rowCount);
    
    paramUsers = q.get("c");

    if (paramUsers !== undefined) {
        users = paramUsers;
        $("#multiChatChannels").value = ";".join(users);
        loadChats()
    }
}

function getUserList() {
    let userString = $("multiChatChannels").value;
    let users = userString.split(";")
    let finalUsers = [];
    let wrongUsers = [];
    users.forEach(user => {if (user === "") return; if (userNameRegEx.test(user)) finalUsers.push(user); else wrongUsers.push(user);});
    if (wrongUsers.length > 0) {
        alert("The following users are no valid Twitch account names: " + wrongUsers.join(", "));
    }
    return finalUsers;
}

function generateURL() {
    let url = "https://tools.ensmann.de/multi-chat/";
    let hasQM = false;
    if (users.length > 0) {
        url += "?c=" + "&c=".join(users);
        hasQM = true;
    }
    if (darkMode) {
        url += hasQM ? "&" : "?";
        hasQM = true;
        url += "dm";
    }
    if (rowCount > 1) {
        url += hasQM ? "&" : "?";
        hasQM = true;
        url += "rc=" + rowCount;
    }
    return generateURL;
}

function loadChats() {
    users = getUserList();
    window.document.title = "Multi-Chat: " + users.join(", ");
    $(".chat.box").remove();
}

function startChats() {
    let index = 0;
    for (let i = 0; i < 2; ++i) {
        let limit = i == 0 ? Math.min(dividor, chanCount) : chanCount;
        for (; index < limit; ++index) {
            channels[index] = channels[index].trim()
            let currentFrame = template
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
}

function darkModeChanged(useDarkMode) {
    console.log("darkModeChanged triggered");
    darkMode = useDarkMode;
    $("body").css("background-color", darkMode ? "black": "");
}

function rowCountChanged(rowValue) {
    console.log("rowCountChanged triggered");
    rowCount = rowValue;
    let chatRows = $(".chatrow");
    if (chatRows.length < rowCount) {
        let chatbox = $("#chatbox");
        for (let index=chatRows.length; index < rowCount; ++index) {
            let div = document.createElement("div");
            div.classList.add("chatrow", "row", "content");
            chatbox.append(div);
        }
    }
    distributeChatsToRows(chatRows);
    if (chatRows.length > rowCount) {
        chatRows.each(function(index) {
            if (index >= rowCount) {
                $(this).remove();
            }
        });
    }
}

function distributeChatsToRows(chatRows) {
    let chatsPerRow = users.length / rowCount;
    let chats = $(".chat.box");
    chats.detach();
    chatRows.each(function(index) {
        if (index == rowCount - 1) {
            $(this).append(chats.slice(index * chatsPerRow));
        }
        else {
            $(this).append(chats.slice(index * chatsPerRow, (index + 1) * chatsPerRow - 1));
        }
    });
}

function openMultiStreams() {
    if (users.length > 0) {
        let url = null;
        let service = document.getElementById("multiChatStreams").value;
        switch (service) {
                case "ms":
                if (users.length > 8) {
                    while (users.length > 8) {
                        users.pop();
                    }
                    alert("Since MultiStre.am supports a maximum amount of 8 streams, your request has been shortened to the 8 first channels!");
                }
                url = "https://multistre.am/" + users.join("/");
                break;
            case "mt":
                url = "http://multitwitch.tv/" + users.join("/");
                break;
            case "mtb":
                url = "https://multitwitch.live/" + users.join("/");
                break;
            case "tt":
                url = "https://twitchtheater.tv/" + users.join("/");
                break;
            default:
                alert("There was an error opening the streaming service!");
        }
        if (url != null) {
            window.open(url);
        }
    }
}

function generateChatBox(width, height, channel, id, darkmode) {
    let lowerChannel = channel.toLowerCase();
    let outerDiv = document.createElement("div");
    outerDiv.classList.add("chat", "box");
    outerDiv.style.float = "left";
    outerDiv.style.width = width + "%";
    outerDiv.style.height = height + "%";
    let header = document.createElement("div");
    header.classList.add("row", "chat", "header");
    let channelLink = document.createElement("a");
    channelLink.href = "https://www.twitch.tv/" + lowerChannel;
    channelLink.target = "_blank";
    header.appendChild(channelLink);
    outerDiv.appendChild(header);
    let chatBoxDiv = document.createElement("div");
    chatBoxDiv.classList.add("row", "content");
    let iFrame = document.createElement("iframe");
    iFrame.classList.add("chatframe");
    iFrame.id = "chat" + id;
    iFrame.src = "https://www.twitch.tv/embed/" + lowerChannel + "/chat?parent=tools.ensmann.de$darkmode$" + (darkmode ? "&darkpopout" : "");
    iFrame.innerHTML = "iframes not supported";
    chatBoxDiv.appendChild(iFrame);
    outerDiv.appendChild(chatBoxDiv);
    return outerDiv;
}

window.onload = init;