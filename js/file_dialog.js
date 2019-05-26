class FileDialog {
    constructor(callback) {
	this.dialog = document.createElement("div");
	this.dialog.classList.add("dialog");

	this.box = document.createElement("div");
	this.box.classList.add("card");

	let cls = this;
	let okbtn = document.createElement("span");
	okbtn.classList.add("button");
	okbtn.innerHTML = "OK";
	okbtn.onclick = function() {
	    let checks = document.querySelectorAll("input[name=files]:checked");
	    let files = new Array(checks.length);

	    for(let i = 0; i < checks.length; i++) {
		files[i] = {
		    Name: checks[i].value
		};
	    }
	    callback(files);
	    
	    cls.hide();
	}

	let crossbtn = document.createElement("span");
	crossbtn.classList.add("button");
	crossbtn.classList.add("cross");
	crossbtn.onclick = function() {
	    cls.hide();
	}

	let headerText = document.createElement("span");
	headerText.innerHTML = "Выберите файлы";
	
	this.header = document.createElement("div");
	this.header.appendChild(headerText);
	this.header.appendChild(okbtn);
	this.header.appendChild(crossbtn);
	    
	this.info = document.createElement("div");
	this.info.style.maxHeight = "50vh";
	this.info.style.overflowY="scroll";
	
	this.box.appendChild(this.header);
	this.box.appendChild(this.info);

	this.dialog.appendChild(this.box);
	document.body.appendChild(this.dialog);

	this.getFiles();
    }

    addFile(file) {
	let div = document.createElement("div");

	let check = document.createElement("input");
	check.type = "checkbox";
	check.name = "files";
	check.value = file.Name;
	
	let icon = document.createElement("span");

	let text = document.createElement("span");
	text.innerHTML = file.Name;
	
	if(file.IsDir) {
	    let cls = this;
	    text.style.cursor = "pointer";
	    text.onclick = function() {
		cls.openDir(file);
		cls.getFiles();
	    }
	    icon.classList.add("dir");
	} else {
	    icon.classList.add("file");
	    div.appendChild(check);
	}

	div.appendChild(icon);
	div.appendChild(text);
	this.info.appendChild(div);
    }

    openDir(file) {
	let cls = this;
	sendPost("/open_dir", "dir=" + file.Name, function(response) {
	    cls.getFiles();
	});
    }

    getFiles() {
	let cls = this;
	sendPost("/get_files", null, function(response) {
	    let files = JSON.parse(response);
	    cls.info.innerHTML = "";
	    cls.addFile({
		Name: "..",
		IsDir: true
	    });
	    files.forEach(f => cls.addFile(f));
	});
	
    }

    sendFile(file) {
	let cls = this;
	sendPost("/send_file", "file=" + file.Name, null);
    }

    hide() {
	this.dialog.remove();
    }
}

function sendPost(url, data, callback) {
    let req = new XMLHttpRequest()
    req.open("POST", url, true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.onreadystatechange = function() {
	if(req.readyState != 4 || req.status != 200)
	    return;
	if(callback !== null) callback(req.responseText);
    }
    req.send(data);
}
