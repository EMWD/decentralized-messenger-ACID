var messanger;

document.addEventListener("DOMContentLoaded", function() {
    // Loading config
    req = new XMLHttpRequest();
    req.open("POST", "/get_config", false);
    req.send();

    if(req.status != 200) {
	alert(req.status + ": " + req.statusText);
	return
    }

    config = JSON.parse(req.responseText);
    wsAddr = "ws://127.0.0.1:" + config.InPort + "/send_cmd";
    // End of loading

    client = new Client(wsAddr);
    client.addHandler("REER", (data) => alert("Error: " + data));
    messanger = new Messanger(client, "peer_select_panel", "messages");
    slider = new Slider("scontrol", "side", 2);
    search = new Search(client, "search_peers", slider, 1, "conn_fld");

    document.getElementById("search_btn").onclick = function() {
	search_fld = document.getElementById("search_fld");
	value = search_fld.value;
	search_fld.value = "";
	search.search(value);
    }

    document.getElementById("send_fld").onkeydown = function(e) {
	if(e.keyCode === 13)
	    document.getElementById("send_btn").click();
    }
    
    document.getElementById("send_btn").onclick = function() {
	send_fld = document.getElementById("send_fld");
	msg = send_fld.value;
	send_fld.value = "";
	messanger.sendMessage(msg);
    }

    document.getElementById("file_btn").onclick = function() {
	messanger.sendFiles();
    }
    
    document.getElementById("power_btn").onclick = function() {
	client.writePackage("QUIT");
    }
});

function connectToPeer() {
    conn_fld = document.getElementById("conn_fld");
    messanger.connectToPeer(conn_fld.value);
    conn_fld.value="";
}

function escape(s, escapeEverything) {
    if (escapeEverything) {
        s = s.replace(/[\x10-\x7f]/g, function (s) {
            return "-x" + s.charCodeAt(0).toString(16).toUpperCase();
        });
    }
    s = encodeURIComponent(s).replace(/%/g, "\\x");
    if (escapeEverything) {
        s = s.replace(/\-/g, "\\");
    }
    return s;
}
