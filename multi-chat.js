let userNameRegEx = /^[a-zA-Z0-9_]{4,25}$/;
let users = [];
let darkMode = false;
let rowCount = 0;

function init() {
    let urlParams = parseURLParams(window.location.href);
    let q = urlParams.get("query");

    darkMode = q.get("dm") !== undefined && q.get("dm").length > 0 ? true : false;
    $("#multiChatDarkMode").prop("checked", darkMode);
    darkModeChanged(darkMode);

    rowCount = q.get("rc") !== undefined && !isNaN(parseInt(q.get("rc"))) ? parseInt(q.get("rc")) : 1;
    $("#rowCount").val(rowCount);
    rowCountChanged(rowCount);
    
    paramUsers = q.get("c");

    if (paramUsers !== undefined) {
        users = paramUsers;
        $("#multiChatChannels").val(users.join(";"));
        loadChats()
    }
}

function getUserList() {
    let userString = $("#multiChatChannels").val();
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
        url += "?c=" + users.join("&c=");
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
    return url;
}

function loadChats() {
    users = getUserList();
    window.document.title = "Multi-Chat: " + users.join(", ");
    $(".chat.box").remove();
    let rows = $(".chatrow");
    let usersPerRow = users.length / rowCount;
    users.forEach(function(element, index) {
        let rowIndex = index / usersPerRow;
        rows.slice(rowIndex, rowIndex + 1).append(generateChatBox(element, "chat" + index, darkMode));
    });
    history.pushState("", window.document.title, generateURL());
}

function darkModeChanged(useDarkMode) {
    console.log("dmc");
    darkMode = useDarkMode;
    if (darkMode) {
        document.body.classList.add("dark");
        $(".chatframe").each(function() {
            let src = $(this).attr("src");
            $(this).attr("src", src + "&darkpopout");
        });
    }
    else {
        document.body.classList.remove("dark");
        $(".chatframe").each(function() {
            let src = $(this).attr("src");
            $(this).attr("src", src.replace("&darkpopout", ""));
        });
    }
    history.pushState("", window.document.title, generateURL());
}

function rowCountChanged(rowValue) {
    console.log("rcc");
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
    chatRows = $(".chatrow");
    distributeChatsToRows(chatRows);
    if (chatRows.length > rowCount) {
        chatRows.each(function(index) {
            if (index >= rowCount) {
                $(this).remove();
            }
        });
    }
    history.pushState("", window.document.title, generateURL());
}

function calculateEntryCounts(entries, rows) {
    let result = [];
    let remainder = entries % rows;
    let entriesPerRow = Math.floor(entries / rows);
    for (let idx = 0; idx < rows; ++idx) {
        result.push(idx < remainder ? entriesPerRow + 1 : entriesPerRow);
    }
    return result;
}

function distributeChatsToRows(chatRows) {
    let entries = calculateEntryCounts(Math.round(users.length), Math.round(rowCount));
    let chats = $(".chat.box");
    let lowerIndex = 0;
    chatRows.slice(0, rowCount).each(function(index) {
        $(this).append(chats.slice(lowerIndex, lowerIndex + entries[index]));
        lowerIndex += entries[index];
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

function generateChatBox(channel, id, darkmode) {
    let lowerChannel = channel.toLowerCase();
    let outerDiv = document.createElement("div");
    outerDiv.classList.add("chat", "box");
    let header = document.createElement("div");
    header.classList.add("row", "chat", "header");
    let channelLink = document.createElement("a");
    channelLink.href = "https://www.twitch.tv/" + lowerChannel;
    channelLink.target = "_blank";
    channelLink.innerHTML = channel;
    header.appendChild(channelLink);
    outerDiv.appendChild(header);
    let chatBoxDiv = document.createElement("div");
    chatBoxDiv.classList.add("row", "content");
    let iFrame = document.createElement("iframe");
    iFrame.classList.add("chatframe");
    iFrame.id = "chat" + id;
    iFrame.src = "https://www.twitch.tv/embed/" + lowerChannel + "/chat?parent=tools.ensmann.de" + (darkmode ? "&darkpopout" : "");
    iFrame.innerHTML = "iframes not supported";
    chatBoxDiv.appendChild(iFrame);
    outerDiv.appendChild(chatBoxDiv);
    return outerDiv;
}

window.onload = init;