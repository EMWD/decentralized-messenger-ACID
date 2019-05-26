
class Slider {
    constructor(control_data, panel_data, start_panel) {
	this.controls = document.querySelectorAll("[data-" + control_data + "]");
	this.curPanel = start_panel;
	let panels = document.querySelectorAll("[data-" + panel_data + "]");
	this.panels = new Map();
	for(let i = 0; i < panels.length; i++) {
	    let index = parseInt(panels[i].dataset[panel_data]);
	    this.panels.set(index, panels[i]);
	    this.hidePanel(index);
	}
	this.showPanel(this.curPanel);

	for(let i = 0; i < this.controls.length; i++) {
	    let cls = this;
	    let control = this.controls[i];
	    let index = parseInt(control.dataset[control_data]);
	    let func = window[control.dataset["func"]];

	    control.onclick = function() {
		cls.switchTo(index);

		if(func !== undefined) {
		    func.call();
		}
	    }
	}
    }

    switchTo(ind) {
	this.hidePanel(this.curPanel);
	this.showPanel(ind);
	this.curPanel = ind;
    }
    
    showPanel(ind) {
	let panel = this.panels.get(ind);
	panel.style.display = "block"
	panel.style.visibility = "visible";
    }

    hidePanel(ind) {
	let panel = this.panels.get(ind);
	panel.style.display = "none";
	panel.style.visibility = "hidden";
    }
}
