class Tab {
    constructor(tabTitle, tabURL) {
        this.title = tabTitle;
        this.url = tabURL;
        this.active = "false";
        this.history = [tabURL];
        this.historyIndex = 0;
    }

    changeLocation(newURL) {
        this.url = newURL;
        if (this.history[this.historyIndex] !== newURL) {
            this.history.splice(this.historyIndex + 1);
            this.history.push(newURL);
            this.historyIndex = this.history.length - 1;
        }
        tabController.update();
        document.getElementById("uv-address").value = newURL;
    }

    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.url = this.history[this.historyIndex];
            document.getElementById("uv-address").value = this.url;
            tabController.update();
        }
    }

    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.url = this.history[this.historyIndex];
            document.getElementById("uv-address").value = this.url;
            tabController.update();
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
            if (document.getElementById(`tab-viewer-${index}`) != null) {
                if (document.getElementById(`tab-viewer-${index}`).src !== this.getProxiedURL(tab.url)) {
                    document.getElementById(`tab-viewer-${index}`).src = this.getProxiedURL(tab.url);
                }
            } else {
                document.getElementById('tab-viewer-collection').innerHTML += `<iframe id="tab-viewer-${index}" class="tab-viewer" src="${this.getProxiedURL(tab.url)}"></iframe>`;
            }
        });
        this.addDragEventListeners();
    }

    addDragEventListeners() {
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

    moveTab(fromIndex, toIndex) {
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
        this.update();
        document.getElementById(`tab-viewer-${this.activetab}`).style.animation = "fadeOut 0.2s 1 forwards";
        document.getElementById(`tab-viewer-${index}`).style.animation = "fadeIn 0.2s 1 forwards";
        document.getElementById("uv-address").value = this.tabs[this.activetab].url;
        this.activetab = index;
    }

    getProxiedURL(url) {
        const baseURL = window.location.origin;

        if (url.startsWith("astralisX://")) {
            if (url === "astralisX://home") {
                return `${baseURL}/home.html`;
            } else if (url === "astralisX://newtab") {
                return `${baseURL}/new.html`;
            } else {
                return "";
            }
        } else {
            let urlToEncode = url;
            if (!urlToEncode.startsWith('http://') && !urlToEncode.startsWith('https://')) {
                if (urlToEncode.includes('.')) {
                    urlToEncode = 'https://' + urlToEncode;
                } else {
                    urlToEncode = 'https://www.bing.com/search?q=' + encodeURIComponent(urlToEncode);
                }
            }
            try {
                const proxiedURL = __uv$config.prefix + __uv$config.encodeUrl(urlToEncode);
                return proxiedURL;
            } catch (e) {
                console.error("error encoding url", e);
                return "";
            }
        }
    }
}

let tabController = new TabController('tab-bar');
tabController.newtab('astralisX://home', 'Home');
tabController.newtab('astralisX://newtab', 'New Tab');
tabController.update();
tabController.opentab(0);
document.getElementById("uv-address").value = "";

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        let searchBox = document.getElementById("uv-address");
        if (searchBox === document.activeElement) {
            let url = searchBox.value;
            tabController.tabs[tabController.activetab].changeLocation(url);
            document.getElementById("tab-viewer").focus();
        }
    }
});

document.getElementById('back-button').addEventListener('click', function() {
    tabController.tabs[tabController.activetab].goBack();
});

document.getElementById('forward-button').addEventListener('click', function() {
    tabController.tabs[tabController.activetab].goForward();
});

document.getElementById('reload-button').addEventListener('click', function() {
    tabController.tabs[tabController.activetab].changeLocation(
        tabController.tabs[tabController.activetab].url
    );
});

(async () => {
    const uv = new Ultraviolet();
    window.__uv$config = uv.config;

    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/uv.sw.js', {
                scope: __uv$config.prefix,
            });
        } catch (error) {
            console.error('Failed to register service worker:', error);
        }
    }
})();
