class tab {
    constructor(tabTitle, tabURL) {
        this.title = tabTitle;
        this.url = tabURL
        this.active = "false";
        this.history = [tabURL];
        this.historyIndex = 0;
        if (this.url.startsWith('eclipse://')) {
            this.loadWithProxy = false;
        } else {
            this.loadWithProxy = true;
        }
    }
    changeLocation(newTitle, newURL) {
        this.title = newTitle;
        this.url = newURL;
        this.history.push(newURL);
        this.historyIndex = this.history.length - 1;
        if (this.url.startsWith('eclipse://')) {
            this.loadWithProxy = false;
        } else {
            this.loadWithProxy = true;
        }
    }

    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.url = this.history[this.historyIndex];
            document.getElementById("search-box").value = this.url;
            tabController.update();
        }
    }

    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.url = this.history[this.historyIndex];
            document.getElementById("search-box").value = this.url;
            tabController.update();
        }
    }

    reload() {
        this.url = this.history[this.historyIndex];
        document.getElementById("search-box").value = this.url;
        tabController.update();
    }
}

class tabcontroller {
    constructor(tabContainerID, tabControllerVarName) {
        this.containerID = tabContainerID;
        this.controllerVar = tabControllerVarName;
        this.activetab = 0;
        this.tabs = [];
    }

    update() {
        let i = 0;
        document.getElementById(this.containerID).innerHTML = `<div class="newtab" id="newtab" onclick="` + this.controllerVar + `.newtab('eclipse://newtab', 'New Tab');"><img src="icons/add-tab.png" class="newtab-icon"></div>`;
        while (i != this.tabs.length) {
            document.getElementById(this.containerID).innerHTML = document.getElementById(this.containerID).innerHTML + `<div class="tab" id="tab" onclick="` + this.controllerVar + `.opentab('` + i.toString() + `');" active-tab="` + this.tabs[i].active + `"><img src="icons/new-tab.png" class="tab-favicon"><p class="tab-title">` + this.tabs[i].title + `</p><img src="icons/tab-close.png" class="tab-close" onclick="` + this.controllerVar + `.deletetab('` + i.toString() + `')"></div>`;
            i++;
        }
    }

    newtab(url, title) {
        this.tabs.push(new tab(title, url));
        this.opentab(this.tabs.length - 1);
        this.update()
    }

    deletetab(index) {
        try {
            this.tabs.splice(Number(index), 1);
            if (this.tabs.length == 0) {
                console.log("deletetab, is tabs empty, tabs list is empty.");
                this.newtab('eclipse://newtab', 'New Tab');
            }
            if (this.tabs[this.activetab] === undefined) {
                console.log("deletetab, is activetab null, active tab is undefined.");
                this.activetab = this.tabs.length - 1;
            }
            this.update();
            this.opentab(this.activetab);
        } catch (e) {
            alert(e);
        }
    }

    opentab(index) {
        console.log("opentab, index: " + index);
        this.tabs[this.activetab].active = "false";
        this.tabs[Number(index)].active = "true";
        this.activetab = Number(index);
        this.update();
        document.getElementById("search-box").value = this.tabs[this.activetab].url;
    }
}

let tabController = new tabcontroller('tab-bar', 'tabController');
tabController.newtab('eclipse://home', 'Home Page');
tabController.newtab('eclipse://newtab', 'New Tab');
tabController.update();
tabController.opentab("0");

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        if (document.getElementById("search-box") == document.activeElement) {
            if (checkURL(document.getElementById("search-box").value).isValid == true) {
                tabController.tabs[tabController.activetab].changeLocation(checkURL(document.getElementById("search-box").value).url, checkURL(document.getElementById("search-box").value).url);
                document.getElementById("search-box").value = checkURL(document.getElementById("search-box").value).url;
                tabController.update();
            } else {
                console.log("call search engine");
            }
        }
    }
});

function checkURL(input) {
    if (input.startsWith("http://") || input.startsWith("https://")) {
        return { isValid: true, url: input };
    }
    if (input.includes(".") && input.split(".").length > 1) {
        return { isValid: true, url: "https://" + input };
    }
    return { isValid: false, url: null };
}

document.getElementById('back-button').addEventListener('click', function() {
    tabController.tabs[tabController.activetab].goBack();
});

document.getElementById('forward-button').addEventListener('click', function() {
    tabController.tabs[tabController.activetab].goForward();
});

document.getElementById('reload-button').addEventListener('click', function() {
    tabController.tabs[tabController.activetab].reload();
});
