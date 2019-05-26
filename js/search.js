class Search {
    constructor(client, panel, slider, connPanelIndex, connFld) {
	this.client = client;
	this.panel = document.getElementById(panel);
	this.slider = slider;
	this.connPanelIndex = connPanelIndex;
	this.connFld = connFld;
    }

    search(query) {
	let cls = this;
	this.client.addHandler("RELI", (res) => cls.searchCallback(cls, query, res));
	this.client.writePackage("LIST");
    }

    searchCallback(cls, query, res) {
	let peers = JSON.parse(res);
	cls.panel.innerHTML = "";

	for(let k in peers) {
	    let peer = peers[k];

	    if(peer.Login.indexOf(query) < 0)
		continue;

	    let divPeer = document.createElement("div");
	    divPeer.classList.add("peer");
	    divPeer.onclick = function() {
		let conn_fld = document.getElementById(cls.connFld);
		conn_fld.value = peer.Addr;
		cls.slider.switchTo(cls.connPanelIndex);
	    }
	    
	    let divLogin = document.createElement("div");
	    divLogin.innerHTML = peer.Login;
	    
	    let divIP = document.createElement("div");
	    divIP.innerHTML = peer.Addr;

	    divPeer.appendChild(divLogin);
	    divPeer.appendChild(divIP);
	    cls.panel.appendChild(divPeer);
	}

	cls.client.delHandler("RELI");
    }
}
