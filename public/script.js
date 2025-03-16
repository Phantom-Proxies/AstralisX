class Tab {
    constructor(tabTitle, tabURL) {
        this.title = tabTitle;
        this.url = tabURL;
        this.active = "false";
        this.history = [tabURL];
        this.historyIndex = 0;
        this.loadWithProxy = !this.url.startsWith('astralisX://');
    }

    changeLocation(newTitle, newURL) {
        if (newURL === 'astralisx://home') {
            this.title = 'Home';
        } else if (newURL === 'astralisX://newtab') {
            this.title = 'New Tab';
        } else {
            this.title = newTitle;
        }
        this.url = newURL;
        this.history.push(newURL);
        this.historyIndex = this.history.length - 1;
        this.loadWithProxy = !this.url.startsWith('astralisX://');
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
        container.innerHTML = `<div class="newtab" id="newtab" onclick="tabController.newtab('astralisX://newtab', 'New Tab');"><img src="icons/add-tab.png" class="newtab-icon"></div>`;
        this.tabs.forEach((tab, index) => {
            container.innerHTML += `<div class="tab" draggable="true" data-index="${index}" onclick="tabController.opentab(${index})" active-tab="${tab.active}">
            <img src="icons/new-tab.png" class="tab-favicon">
            <p class="tab-title">${tab.title}</p>
            <img src="icons/tab-close.png" class="tab-close" onclick="event.stopPropagation(); tabController.deletetab(${index})">
        </div>`;
        });
        this.addDragEventListeners();
    }

    addDragEventListeners(){
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('dragstart', this.handleDragStart.bind(this));
            tab.addEventListener('dragover', this.handleDragOver.bind(this));
            tab.addEventListener('drop', this.handleDrop.bind(this));
        });
    }

    handleDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.dataset.index);
    }

    handleDragOver(event) {
        event.preventDefault();
    }

    handleDrop(event) {
        const fromIndex = event.dataTransfer.getData('text/plain');
        const toIndex = event.target.dataset.index;
        this.moveTab(fromIndex, toIndex);
    }

    moveTab(fromIndex, toIndex){
        const tab = this.tabs.splice(fromIndex, 1)[0];
        this.tabs.splice(toIndex, 0, tab);

        this.tabs.forEach((tab, index) => {
            if (index === this.activetab) {
                tab.active = "true";
            } else {
                tab.active = "false";
            }
        });

        if (fromIndex === this.activetab) {
            this.activetab = toIndex;
        } else if (fromIndex < this.activetab && toIndex >= this.activetab) {
            this.activetab--;
        } else if (fromIndex > this.activetab && toIndex <= this.activetab) {
            this.activetab++;
        }

        this.update();
        this.updateIframe();
    }

    newtab(url, title) {
        this.tabs.push(new Tab(title, url));
        this.opentab(this.tabs.length - 1);
        this.update();
    }

    deletetab(index) {
        this.tabs.splice(index, 1);
        if (this.tabs.length === 0) {
            this.newtab('astralisX://newtab', 'New Tab');
        }
        this.activetab = Math.min(this.activetab, this.tabs.length - 1);
        this.update();
        this.opentab(this.activetab);
    }

    opentab(index) {
        this.tabs[this.activetab].active = "false";
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
        if (activeTab.url.startsWith("astralisX://")) {
            if (activeTab.url === "astralisX://home") {
                iframe.src = "";
                iframe.src = "home.html";
            } else if (activeTab.url === "astralisX://newtab") {
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
tabController.newtab('astralisX://home', 'Home');
tabController.newtab('astralisX://newtab', 'New Tab');
tabController.update();
tabController.opentab(0);
document.getElementById("search-box").value = "";

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        let searchBox = document.getElementById("search-box");
        if (searchBox === document.activeElement) {
            let urlCheck = checkURL(searchBox.value);
            let url = null;
            if (urlCheck.isValid == false && !searchBox.value.startsWith("astralisX://")) {
                url = "https://bing.com/search?q=" + encodeURIComponent(searchBox.value);
            } else {
                url = urlCheck.url;
            }
            let title = url;
            console.log(url);
            tabController.tabs[tabController.activetab].changeLocation(title, url);
            document.getElementById("tab-viewer").focus();
        }
    }
});

function checkURL(input) {
    if (input.startsWith("http://") || input.startsWith("https://") || input.startsWith("astralisX://")) {
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
