class Client {
    constructor(url) {
	this.ws = new WebSocket(url);
	this.handlers = new Map();
	this.isOpened = false;

	let cls = this;
	this.ws.onmessage = (event) => cls.parseResponse(cls, event);
	this.ws.onopen = () => cls.isOpened = true;
    }

    addHandler(command, handler) {
	this.handlers.set(command, handler);
    }

    delHandler(command) {
	this.handlers.delete(command);
    }
    
    parseResponse(cls, event) {
	if(event.data.length < 4)
	    return;

	console.log(event.data);
	
	let cmd = event.data.slice(0,4);
	let handler = cls.handlers.get(cmd);
	if(handler !== undefined) {
	    handler(event.data.slice(4));
	}
    }

    stringToBytes(str) {
	str = str.replace(/[\x10-\x7f]/g, function (s) {
            return "-" + s.charCodeAt(0).toString(16);
	});
	str = encodeURIComponent(str).replace(/-/g, "%");
	str = str.split("%").slice(1).map(f => parseInt(f, 16));
	return Uint8Array.from(str);
    }
    
    writePackage(body) {
	if(!this.isOpened)
	    return;

	let bytes = this.stringToBytes(body);
	let len = bytes.length;
	if(len > 0xffffffff) {
            throw "message is too large";
	}

	let lbuf = new Uint8Array(4);
	lbuf[0] = len & 0xff;
	lbuf[1] = (len & 0xff00) >> 8;
	lbuf[2] = (len & 0xff0000) >> 16;
	lbuf[3] = (len & 0xff000000) >> 24;

	this.ws.send(lbuf.buffer);
	this.ws.send(bytes.buffer);
    }
}
