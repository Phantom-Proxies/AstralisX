class Tab {
    constructor(tabTitle, tabURL) {
        this.title = tabTitle;
        this.url = tabURL;
        this.active = "false";
        this.history = [tabURL];
        this.historyIndex = 0;
        this.loadWithProxy = !this.url.startsWith('eclipse://');
    }

    changeLocation(newTitle, newURL) {
        if (newURL === 'eclipse://home') {
            this.title = 'Home';
        } else if (newURL === 'eclipse://newtab') {
            this.title = 'New Tab';
        } else {
            this.title = newTitle;
        }
        this.url = newURL;
        this.history.push(newURL);
        this.historyIndex = this.history.length - 1;
        this.loadWithProxy = !this.url.startsWith('eclipse://');
        tabController.update();
        tabController.updateIframe();
    }

    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.url = this.history[this.historyIndex];
            document.getElementById("search-box").value = this.url;
            tabController.update();
            tabController.updateIframe();
        }
    }

    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.url = this.history[this.historyIndex];
            document.getElementById("search-box").value = this.url;
            tabController.update();
            tabController.updateIframe();
        }
    }
}

class TabController {
    constructor(tabContainerID) {
        this.containerID = tabContainerID;
        this.activetab = 0;
        this.tabs = [];
    }

    update() {
        let container = document.getElementById(this.containerID);
        container.innerHTML = `<div class="newtab" id="newtab" onclick="tabController.newtab('eclipse://newtab', 'New Tab');"><img src="icons/add-tab.png" class="newtab-icon"></div>`;
        this.tabs.forEach((tab, index) => {
            container.innerHTML += `<div class="tab" onclick="tabController.opentab(${index})" active-tab="${tab.active}">
                <img src="icons/new-tab.png" class="tab-favicon">
                <p class="tab-title">${tab.title}</p>
                <img src="icons/tab-close.png" class="tab-close" onclick="event.stopPropagation(); tabController.deletetab(${index})">
            </div>`;
        });
    }

    newtab(url, title) {
        this.tabs.push(new Tab(title, url));
        this.opentab(this.tabs.length - 1);
        this.update();
    }

    deletetab(index) {
        this.tabs.splice(index, 1);
        if (this.tabs.length === 0) {
            this.newtab('eclipse://newtab', 'New Tab');
        }
        this.activetab = Math.min(this.activetab, this.tabs.length - 1);
        this.update();
        this.opentab(this.activetab);
    }

    opentab(index) {
        if (this.tabs[this.activetab]) this.tabs[this.activetab].active = "false";
        this.tabs[index].active = "true";
        this.activetab = index;
        this.update();
        document.getElementById("search-box").value = this.tabs[this.activetab].url;
        this.updateIframe();
    }

    updateIframe() {
        let iframe = document.getElementById("tab-viewer");
        if (!iframe) return;
        let activeTab = this.tabs[this.activetab];
        if (activeTab.url.startsWith("eclipse://")) {
            if (activeTab.url === "eclipse://home") {
                iframe.src = "";
                iframe.src = "home.html";
            } else if (activeTab.url === "eclipse://newtab") {
                iframe.src = "";
                iframe.src = "new.html";
            } else {
                iframe.src = "";
            }
        } else {
            iframe.src = "";
            iframe.src = activeTab.url;
        }
    }
}

let tabController = new TabController('tab-bar');
tabController.newtab('eclipse://home', 'Home Page');
tabController.newtab('eclipse://newtab', 'New Tab');
tabController.update();
tabController.opentab(0);

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        let searchBox = document.getElementById("search-box");
        if (searchBox === document.activeElement) {
            let urlCheck = checkURL(searchBox.value);
            let url = searchBox.value;
            let title = url;
            if (urlCheck.isValid) {
                url = urlCheck.url;
            }
            tabController.tabs[tabController.activetab].changeLocation(title, url);
            document.getElementById("tab-viewer").focus();
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
    tabController.tabs[tabController.activetab].changeLocation(
        tabController.tabs[tabController.activetab].title,
        tabController.tabs[tabController.activetab].url
    );
});
