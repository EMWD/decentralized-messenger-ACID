class Messanger {
    constructor(client, controls, messages) {
	this.client = client;
	this.controls = document.querySelector("#" + controls);
	this.messages = document.querySelector("#" + messages);
	
	this.panels = [];
	this.buttons = [];

	this.panelsCount = 0;
	this.curPanel = 0;

	this.connPeer = null;
	this.curPeer = null;
	
	this.peers = new Map();

	let cls = this;
	this.client.addHandler("SEND", (data) => cls.messageHandler(cls, data));
    }

    messageHandler(cls, data) {
	let msg = JSON.parse(data);

	if(msg.Type  === undefined ||
	   msg.Login === undefined ||
	   msg.Addr  === undefined ||
	   msg.Data  === undefined)
	{
	    return;
	}

	let ip = msg.Addr.split(":")[0];
	if(cls.peers.get(ip) === undefined) {
	    cls.addPeerAndPanel(msg);
	}
	cls.addIncomingMessage(msg);
    }

    sendMessage(data) {
	if(!this.changePeer())
	    return;
	this.client.writePackage("SEND" + data);
	this.addOutcomingMessage(data);
    }

    sendFiles() {
	let cls = this;
	if(!this.changePeer())
	    return;
	let dialog = new FileDialog(function(files) {
	    files.forEach(function(f) {
		cls.addOutcomingMessage(f.Name);
		dialog.sendFile(f);
	    });
	});
    }

    changePeer() {
	if(this.peers.size == 0) {
	    alert("Can't write to unknown peer");
	    return false;
	}
	if(this.connPeer === null || this.curPeer != this.connPeer) {
	    if(this.connPeer !== null) this.client.writePackage("DISC");
	    this.client.writePackage("CONN" + this.curPeer);
	}
	return true;
    }
    
    connectToPeer(addr) {
	let ip = addr.split(":")[0];
	let peer = this.peers.get(ip);

	if(peer === undefined) {
	    this.addPeerAndPanel({
		Login: addr,
		Addr: addr
	    });
	}	
    }
    
    addIncomingMessage(msg) {
	let ip = msg.Addr.split(":")[0];
	let peer = this.peers.get(ip);

	peer.Login = msg.Login;
	peer.LogSpan.innerHTML = msg.Login;
	
	if(this.curPeer != msg.Addr) {
	    peer.Notifications++;
	    peer.NotSpan.innerHTML = peer.Notifications + "+";
	}

	switch(msg.Type) {
	case "Message":
	    this.showIncomingMessage(msg);
	    break;
	case "File":
	    this.showIncomingFile(msg);
	    break;
	}
    }

    showIncomingMessage(msg) {
	let ip = msg.Addr.split(":")[0];
	let peer = this.peers.get(ip);
	let div = document.createElement("div");
	
	div.classList.add("msg");
	div.innerHTML = msg.Data;
	peer.Panel.appendChild(div);
    }

    showIncomingFile(msg) {
	let ip = msg.Addr.split(":")[0];
	let peer = this.peers.get(ip);

	if(peer.FileName !== msg.Data) {
	    peer.FileName = msg.Data;
	    peer.FilePieces = 0;
	    peer.FileSpan = document.createElement("div");
	    peer.FileSpan.classList.add("msg");
	    peer.Panel.appendChild(peer.FileSpan);
	}

	peer.FilePieces++;
	peer.FileSpan.innerHTML = peer.FileName + ": " + peer.FilePieces;
    }

    addOutcomingMessage(msg) {
	let panel = this.panels[this.curPanel];
	let div = document.createElement("div");
	div.classList.add("msg");
	div.classList.add("outcoming_msg");
	div.innerHTML = msg;
	panel.appendChild(div);
    }
    
    addPeerAndPanel(msg) {
	let cls = this;
	let ind = this.panelsCount;
	
	let panel = document.createElement("div");
	panel.classList.add("msg_panel");
	
	let control = document.createElement("div");

	let logSpan = document.createElement("span");
	logSpan.innerHTML = msg.Login;
	
	let notSpan = document.createElement("span");
	control.appendChild(logSpan);
	control.appendChild(notSpan);

	let ip = msg.Addr.split(":")[0];
	control.onclick = function() {
	    cls.hidePanel(cls.curPanel);
	    cls.showPanel(ind);
	    cls.curPanel = ind;
	    cls.curPeer = msg.Addr;
	    cls.peers.get(ip).Notifications = 0;
	    notSpan.innerHTML = "";
	}

	this.peers.set(ip, {
	    Login: msg.Login,
	    Addr:  msg.Addr,
	    Panel: panel,
	    Control: control,
	    NotSpan: notSpan,
	    LogSpan: logSpan,
	    Notifications: 0,
	    FilePieces: 0,
	    FileName: "",
	    FileSpan: null
	});

	this.panels.push(panel);
	this.buttons.push(control);
	this.hidePanel(ind);
	this.controls.appendChild(control);
	this.messages.appendChild(panel);
	this.panelsCount++;
    }

    deletePeerAndPanel(addr) {
	let peer = this.peers.get(addr);
	peer.Panel.remove();
	peer.Control.remove();
	this.peers.delete(addr);
    }

    showPanel(ind) {
	let panel = this.panels[ind];
	let button = this.buttons[ind];
	
	panel.style.display = "block";
	panel.style.visibility = "visible";
	button.classList.add("active_peer");
    }

    hidePanel(ind) {
	let panel = this.panels[ind];
	let button = this.buttons[ind];
	
	panel.style.display = "none";
	panel.style.visibility = "hidden";
	button.classList.remove("active_peer");
    }
}
