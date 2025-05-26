// ==UserScript==
// @name        [DEV] ARpilot v3
// @version     1.3
// @description Supply Clicker, with Love
// @author      maserati, aemond
// @info        Press 0 to toggle
// @match       https://*.tankionline.com/*
// @icon        https://i.imgur.com/GCgFcIX.png
// @run-at      document-start
// @connect     raw.githubusercontent.com
// @connect     corsproxy.io
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function () {
    "use strict";

    class Utils {
        constructor() {
            this.observers = [];
            this.observeInBattle();
        }

        get rootElement() {
            return document.getElementById("root");
        }

        get isChatOpen() {
            return document.querySelectorAll("input[type=text]").length > 0;
        }

        get inBattle() {
            return document.querySelector(".BattleChatComponentStyle-rootDesktop") !== null;
        }

        observeInBattle() {
            const targetNode = document.body;
            const config = { childList: true, subtree: true };
            const callback = (mutationsList) => {
                for (let mutation of mutationsList) {
                    const state = this.inBattle;
                    this.notifyObservers(state);
                }
            };

            const observer = new MutationObserver(callback);
            observer.observe(targetNode, config);
        }

        addObserver(callback) {
            this.observers.push(callback);
        }

        notifyObservers(state) {
            this.observers.forEach(callback => callback(state));
        }
    }

    class Settings {
        constructor() {
            this.settings = this.loadSettings();
        }

        loadSettings() {
            let savedSettings = JSON.parse(localStorage.getItem("667-arpilot")) || null;
            const defaultSettings = {
                resize: {
                    enabled: false,
                    default: {
                        width: "390px",
                        height: "90%"
                    },
                    lastSize: null
                },
                developerMode: false,
                antiIDLE: false,
                suppliesClickEnabled: false,
                binds: {
                    display: "Digit0",
                    supplies: "Digit8",
                    mines: "Digit9"
                },
                clickState: {
                    supplies: {
                        firstaid: { state: false, delay: 300, name: "First Aid", key: "Digit1" },
                        doublearmor: { state: false, delay: 300, name: "Double Armor", key: "Digit2" },
                        doubledamage: { state: false, delay: 300, name: "Double Damage", key: "Digit3" },
                        nitro: { state: false, delay: 300, name: "Nitro", key: "Digit4" }
                    },
                    mine: { state: false, delay: 300, multiplier: 1, name: "Mines", key: "Digit5" },
                    goldbox: { state: false, delay: 300, name: "Gold Box", key: "Digit6" }
                }
            };

            if (!savedSettings) {
                savedSettings = defaultSettings;
                localStorage.setItem("667-arpilot", JSON.stringify(defaultSettings));
            } else {
                savedSettings = { ...defaultSettings, ...savedSettings };
                savedSettings.binds = { ...defaultSettings.binds, ...savedSettings.binds };
                savedSettings.clickState = { ...defaultSettings.clickState, ...savedSettings.clickState };
                savedSettings.clickState.supplies = { ...defaultSettings.clickState.supplies, ...savedSettings.clickState.supplies };
                savedSettings.clickState.mine = { ...defaultSettings.clickState.mine, ...savedSettings.clickState.mine };
                savedSettings.clickState.goldbox = { ...defaultSettings.clickState.goldbox, ...savedSettings.clickState.goldbox };
            }

            this.settings = savedSettings;
            this.saveSettings();
            return this.settings;
        }

        saveSettings() {
            localStorage.setItem("667-arpilot", JSON.stringify(this.settings));
        }
    }

    class ARpilot {
        constructor(settings, utils) {
            this.utils = utils;
            this.settings = settings;
            this.suppliesIcon = {
                firstaid: { icon: 'https://tankionline.com/play/static/images/Repair.13e5e240.svg' },
                armor: { icon: 'https://tankionline.com/play/static/images/Shield.6319a2d0.svg' },
                damage: { icon: 'https://tankionline.com/play/static/images/DoubleDamage.c601a4b1.svg' },
                nitro: { icon: 'https://tankionline.com/play/static/images/Speed.3b207b8e.svg' },
                mine: { icon: 'https://tankionline.com/play/static/images/Mine.230cdfaa.svg' },
                goldbox: { icon: 'https://tankionline.com/play/static/images/GoldBox.61e0017c.svg' }
            };
            this.uiContainer = null;
            this.autoDisableTimer = null;
            this.updateTimersInterval = null;
            this.init();
            this.EventListeners();
            this.antiIDLE();
            this.clickMechanic();
            this.uiContainer = null;
            this.resizeObserver = null;

        }

        enforceSizeLimits(element) {
            const minWidth = this.settings.settings.resize?.minWidth || 310;
            const minHeight = this.settings.settings.resize?.minHeight || 350;

            const currentWidth = parseInt(element.style.width) || element.offsetWidth;
            const currentHeight = parseInt(element.style.height) || element.offsetHeight;

            const hitWidth = currentWidth < minWidth;
            const hitHeight = currentHeight < minHeight;

            if (hitWidth || hitHeight) {
                if (hitWidth) element.style.width = `${minWidth}px`;
                if (hitHeight) element.style.height = `${minHeight}px`;

                if (this.hitLimitTimeout) {
                    clearTimeout(this.hitLimitTimeout);
                }

                element.classList.add('hit-limit');

                this.hitLimitTimeout = setTimeout(() => {
                    element.classList.remove('hit-limit');
                }, 500);
            }

            element.style.minWidth = `${minWidth}px`;
            element.style.minHeight = `${minHeight}px`;
        }

        disableSupply(type) {
            if (type === 'mine' || type === 'goldbox') {
                if (this.settings.settings.clickState[type]) {
                    this.settings.settings.clickState[type].state = false;
                    this.settings.saveSettings();
                    this.updateButtonState(type, false);
                }
            } else if (this.settings.settings.clickState.supplies && this.settings.settings.clickState.supplies[type]) {
                this.settings.settings.clickState.supplies[type].state = false;
                this.settings.saveSettings();
                this.updateButtonState(type, false);
            }
        }

        init() {
            const style = document.createElement('style');
            style.textContent = `.action-timer {
        font-variant-numeric: tabular-nums;
        min-width: 60px;
        display: inline-block;
        text-align: right;
    } #arpilot-ui.hit-limit {outline: 2px dashed #ff3b30 !important;animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;} @keyframes shake { 0%, 100% { transform: translateX(0); }10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }20%, 40%, 60%, 80% { transform: translateX(3px); }}`;
            document.head.appendChild(style);
            const colors = {
                dark: 'rgba(28, 28, 30, 0.95)',
                semidark: 'rgba(44, 44, 46, 0.8)',
                lighttext: '#ffffff',
                darktext: 'rgba(255, 255, 255, 0.7)',
                active: '#f28558'
            };

            const initialWidth = this.settings.settings.resize.enabled && this.settings.settings.resize.lastSize
            ? this.settings.settings.resize.lastSize.width
            : this.settings.settings.resize.default.width;

            const initialHeight = this.settings.settings.resize.enabled && this.settings.settings.resize.lastSize
            ? this.settings.settings.resize.lastSize.height
            : this.settings.settings.resize.default.height;

            const uiContainer = document.createElement("div");
            uiContainer.id = "arpilot-ui";
            uiContainer.style = `resize: ${this.settings.settings.resize?.enabled ? "both" : "none"};position: fixed;top: 20px;left: 20px;width: ${initialWidth};height: ${initialHeight};min-width: ${this.settings.settings.resize?.minWidth || 310}px;min-height: ${this.settings.settings.resize?.minHeight || 350}px;background: ${colors.dark};border-radius: 10px;box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.3);font-family: -apple-system, BlinkMacSystemFont, sans-serif;overflow: ${this.settings.settings.resize?.enabled ? "auto" : "hidden"};z-index: 10000;backdrop-filter: blur(20px);border: 1px solid rgba(255, 255, 255, 0.1);box-sizing: border-box !important;`;

            if (!this.settings.settings.resize?.enabled) {
                this.originalSize = {
                    width: initialWidth,
                    height: initialHeight
                };
            }

            this.uiContainer = uiContainer;
            this.resizeObserver = new ResizeObserver((entries) => {
                if (!this.settings.settings.resize?.enabled) return;

                const uiElement = entries[0].target;
                this.enforceSizeLimits(uiElement);

                if (!uiElement.classList.contains('hit-limit')) {
                    this.settings.settings.resize.lastSize = {
                        width: uiElement.style.width,
                        height: uiElement.style.height
                    };
                    this.settings.saveSettings();
                }
            });

            if (this.settings.settings.resize?.enabled) {
                this.resizeObserver.observe(uiContainer);
            }

            const header = document.createElement("div");
            header.style = `position: relative;display: flex;align-items: center;height: 40px;background: rgba(30, 30, 30, 0.8);padding: 0 15px;cursor: grab;border-top-left-radius: 10px;border-top-right-radius: 10px;border-bottom: 1px solid rgba(255, 255, 255, 0.05);`;

            const btnContainer = document.createElement("div");
            btnContainer.style = "display: flex; gap: 4px; align-items: center;";

            ["#ff5f56", "#ffbd2e", "#27c93f"].forEach((color, index) => {
                const btn = document.createElement("div");
                btn.style = `width: 12px;height: 12px;background: ${color};border-radius: 50%;cursor: pointer;box-shadow: 0 0 1px rgba(0,0,0,0.3);transition: all 0.2s ease;`;
                if (index === 0) {
                    btn.onmouseenter = () => btn.style.transform = 'scale(1.1)';
                    btn.onmouseleave = () => btn.style.transform = 'scale(1)';
                    btn.onclick = () => uiContainer.remove();
                }
                btnContainer.appendChild(btn);
            });

            const titleBar = document.createElement("span");
            titleBar.innerHTML = "ARpilot";
            titleBar.style = `position: absolute;left: 50%; transform: translateX(-50%);color: rgba(255, 255, 255, 0.8);font-size: 13px;font-weight: 500;cursor: grab;`;

            header.appendChild(btnContainer);
            header.appendChild(titleBar);

            let isDragging = false, offsetX, offsetY;
            header.addEventListener("mousedown", (e) => {
                isDragging = true;
                offsetX = e.clientX - uiContainer.offsetLeft;
                offsetY = e.clientY - uiContainer.offsetTop;
            });
            document.addEventListener("mousemove", (e) => {
                if (isDragging) {
                    uiContainer.style.left = `${e.clientX - offsetX}px`;
                    uiContainer.style.top = `${e.clientY - offsetY}px`;
                }
            });
            document.addEventListener("mouseup", () => isDragging = false);

            const tabs = document.createElement("div");
            tabs.style = `display: flex;justify-content: flex-start;background: rgba(40, 40, 42, 0.8);padding: 8px 15px;gap: 20px;border-bottom: 1px solid rgba(255, 255, 255, 0.05);`;

            const tabNames = ["Supplies", "Actions", "Settings"];
            tabNames.forEach((tabName) => {
                const tab = document.createElement("div");
                tab.innerText = tabName;
                tab.style = `cursor: pointer;color: ${colors.darktext};font-size: 13px;font-weight: 500;padding: 4px 0;position: relative;transition: all 0.2s ease;`;

                tab.addEventListener("mouseenter", () => {
                    tab.style.color = colors.lighttext;
                });

                tab.addEventListener("mouseleave", () => {
                    tab.style.color = colors.darktext;
                });

                tab.addEventListener("click", () => {
                    if (tabName === "Settings") {
                        this.createSettingsTab(contentContainer);
                    } else if (tabName === "Supplies") {
                        this.createSuppliesTab(contentContainer);
                    } else if (tabName === "Actions") {
                        this.createActionsTab(contentContainer);
                    }

                    document.querySelectorAll('#arpilot-ui .tab').forEach(t => {
                        t.style.color = colors.darktext;
                        t.style.borderBottom = 'none';
                    });
                    tab.style.color = colors.active;
                    tab.style.borderBottom = `2px solid ${colors.active}`;
                });

                tab.classList.add('tab');
                tabs.appendChild(tab);
            });

            const mainLogo = document.createElement("div");
            mainLogo.style = `display: flex;justify-content: center;padding: 20px;`;
            mainLogo.innerHTML = `<svg width="80" height="40" viewBox="0 0 140 69" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M48.2969 42.6875C44.5469 42.8125 41.7969 42.875 40.0469 42.875C37.3594 42.875 33.6406 42.8125 28.8906 42.6875C27.8906 43.7812 26.6719 45.0781 25.2344 46.5781C23.7969 48.0469 22.4375 49.4219 21.1562 50.7031C19.875 51.9531 18.7656 53.0312 17.8281 53.9375C16.9219 54.8125 16.1719 55.5469 15.5781 56.1406C12.1094 59.5156 9.84375 61.7188 8.78125 62.75C7.75 63.7812 6.65625 64.7031 5.5 65.5156C4.34375 66.3594 3.28125 66.7812 2.3125 66.7812C1.21875 66.7812 0.671875 66.2812 0.671875 65.2812C0.671875 64.1875 1.45312 62.5 3.01562 60.2188C4.57812 57.9375 6.34375 55.9219 8.3125 54.1719C10.2812 52.4219 11.8906 51.5469 13.1406 51.5469C13.4844 51.5469 13.9688 51.7031 14.5938 52.0156L23.5 42.5C22.375 42.3438 20.9062 42.25 19.0938 42.2188C17.2812 42.1562 16.0625 42.0156 15.4375 41.7969C14.8125 41.5781 14.5 41.0469 14.5 40.2031C14.5 38.8594 15.9375 36.75 18.8125 33.875C20.375 32.2812 21.8438 31.2656 23.2188 30.8281C24.5938 30.3906 27.2188 30.1562 31.0938 30.125C28.8125 30.4375 27.1875 30.8125 26.2188 31.25C25.2812 31.6562 24.7656 32.2812 24.6719 33.125C25.5781 33.125 26.4062 33.125 27.1562 33.125C27.9375 33.125 28.9375 33.125 30.1562 33.125C31.4062 33.0938 32.3281 33.0625 32.9219 33.0312C38.0469 28.0312 42.7031 23.6875 46.8906 20C51.0781 16.2812 55.4844 12.7656 60.1094 9.45312C64.7656 6.10938 69.7188 3.04688 74.9688 0.265625C76 1.60938 76.5156 3.01562 76.5156 4.48438C76.5156 5.70312 76.1094 7.10938 75.2969 8.70312C74.5156 10.2969 72.8281 13.2969 70.2344 17.7031C67.6719 22.0781 65.0625 26.7344 62.4062 31.6719C63.2812 31.6719 64 31.6875 64.5625 31.7188C65.1562 31.7188 65.7812 31.7344 66.4375 31.7656C68.2188 31.7656 69.2969 31.7969 69.6719 31.8594C70.0781 31.9219 70.2812 32.2344 70.2812 32.7969C70.2812 33.0469 70.0312 33.5 69.5312 34.1562C69.0625 34.7812 68.2188 35.8438 67 37.3438C65.7812 38.8125 64.5938 40.3125 63.4375 41.8438L56.5469 42.4062C52.8906 49.2812 51.0625 53.1562 51.0625 54.0312C51.0625 55.3125 51.7344 55.9531 53.0781 55.9531C53.7344 55.9531 56.4531 54.5781 61.2344 51.8281L60.8594 54.3125C58.2969 56.25 56.2969 57.7812 54.8594 58.9062C53.4531 60 52.2188 60.9219 51.1562 61.6719C50.125 62.3906 49.1719 62.9219 48.2969 63.2656C47.4531 63.6406 46.5938 63.8281 45.7188 63.8281C44.6875 63.8281 43.6719 63.3438 42.6719 62.375C41.6719 61.4375 41.1719 60.0938 41.1719 58.3438C41.1719 57.625 41.4375 56.6094 41.9688 55.2969C42.5 53.9531 43.0625 52.6719 43.6562 51.4531C44.2812 50.2344 45.8281 47.3125 48.2969 42.6875ZM39.4375 32.0469L54.625 31.7656C56.4062 28.7344 57.8438 26.2812 58.9375 24.4062C60.0625 22.5312 61.2812 20.5 62.5938 18.3125C63.9375 16.0938 65.0781 14.2188 66.0156 12.6875C66.9844 11.1562 68.0469 9.42188 69.2031 7.48438C66.9531 8.89062 64.6562 10.4531 62.3125 12.1719C59.9688 13.8906 57.3281 15.9688 54.3906 18.4062C51.4531 20.8125 48.8438 23.0625 46.5625 25.1562C44.2812 27.2188 41.9062 29.5156 39.4375 32.0469ZM103.844 57.6875L86.1719 49.0625C81.6719 55.2188 79.1562 59.2812 78.625 61.25C78.25 62.6562 77.4062 63.8281 76.0938 64.7656C74.8125 65.7344 73.8906 66.2188 73.3281 66.2188C71.7344 66.2188 70.9375 65.6094 70.9375 64.3906C70.9375 63.7031 71.875 61.7344 73.75 58.4844C75.6562 55.2031 78.2656 51.3438 81.5781 46.9062C79.7344 46.1562 78.5938 45.6562 78.1562 45.4062C77.7188 45.1562 77.5469 44.6875 77.6406 44C77.7344 43.2812 78.2812 42.1719 79.2812 40.6719C80.1562 39.3594 80.8125 38.4844 81.25 38.0469C81.6875 37.5781 82.2031 37.2188 82.7969 36.9688C83.3906 36.6875 84.0156 36.5 84.6719 36.4062C85.3281 36.3125 87.1719 36.0781 90.2031 35.7031C92.6719 32.3594 95.3438 28.75 98.2188 24.875C101.125 21 103.391 17.9844 105.016 15.8281C100.109 16.4844 96.6875 17.0312 94.75 17.4688C92.6875 17.875 90.9531 18.2188 89.5469 18.5C88.1719 18.75 87.2031 18.9844 86.6406 19.2031C86.0781 19.3906 85.7969 19.6719 85.7969 20.0469C85.7969 20.3906 86.1406 20.625 86.8281 20.75C87.5156 20.875 88.375 20.9375 89.4062 20.9375C90.4688 20.9375 91.2812 20.9844 91.8438 21.0781C92.4375 21.1406 92.7344 21.3125 92.7344 21.5938C92.7344 21.9062 92.3438 22.0938 91.5625 22.1562C90.8125 22.1875 88.6719 22.2812 85.1406 22.4375C83.1406 22.5 81.4531 22.5625 80.0781 22.625C78.7344 22.6875 77.7969 22.7188 77.2656 22.7188C76.5469 22.7188 75.9844 22.5 75.5781 22.0625C75.1719 21.625 74.9688 21.0469 74.9688 20.3281C74.9688 19.7969 75.2656 18.8125 75.8594 17.375C76.4531 15.9375 77.2969 14.4844 78.3906 13.0156C79.4844 11.5469 80.7344 10.4062 82.1406 9.59375C83.7344 8.625 86.2031 7.65625 89.5469 6.6875C92.9219 5.6875 96.6562 4.89062 100.75 4.29688C104.875 3.67188 108.953 3.35938 112.984 3.35938C115.422 3.35938 117.797 3.5 120.109 3.78125C122.453 4.0625 124.562 4.40625 126.438 4.8125C128.344 5.21875 129.844 5.625 130.938 6.03125C133.781 6.96875 135.953 8.39062 137.453 10.2969C138.984 12.2031 139.75 14.2969 139.75 16.5781C139.75 18.7969 139.359 20.9688 138.578 23.0938C137.828 25.1875 136.656 27.1406 135.062 28.9531C133.5 30.7344 131.609 32.1875 129.391 33.3125C127.578 34.25 124.828 35.2031 121.141 36.1719C117.453 37.1406 113 38 107.781 38.75C102.562 39.5 96.7344 40.0469 90.2969 40.3906C95.1094 42.0781 99.5938 43.7812 103.75 45.5C107.938 47.1875 111.453 48.7031 114.297 50.0469C117.172 51.3594 119.422 52.4375 121.047 53.2812C123.328 54.4688 124.812 55.3281 125.5 55.8594C126.188 56.3906 126.641 57.0781 126.859 57.9219C127.078 58.7656 127.188 60.1562 127.188 62.0938C127.188 64.2812 127.047 65.8906 126.766 66.9219C126.516 67.9844 125.953 68.5156 125.078 68.5156C124.797 68.5156 124.047 68.2031 122.828 67.5781C121.641 66.9844 119.984 66.0938 117.859 64.9062C115.734 63.75 113.797 62.7188 112.047 61.8125C110.328 60.875 107.594 59.5 103.844 57.6875ZM107.969 15.3594C108 15.5781 108.016 15.7812 108.016 15.9688C108.047 16.1562 108.062 16.4219 108.062 16.7656C108.062 17.6406 107.781 18.6562 107.219 19.8125C106.688 20.9375 105.984 22.1094 105.109 23.3281C104.266 24.5156 102.984 26.2344 101.266 28.4844C99.5781 30.7031 98.0156 32.75 96.5781 34.625C103.141 33.375 108.734 32.1719 113.359 31.0156C118.016 29.8594 121.844 28.7031 124.844 27.5469C127.844 26.3594 130.094 25.125 131.594 23.8438C133.125 22.5312 133.891 21.1719 133.891 19.7656C133.891 18.2031 132.297 16.9844 129.109 16.1094C125.953 15.2031 122.078 14.75 117.484 14.75C116.547 14.75 115.547 14.7812 114.484 14.8438C113.453 14.875 112.203 14.9688 110.734 15.125C109.297 15.25 108.375 15.3281 107.969 15.3594Z" fill="rgb(242, 133, 88)"/></svg>`;

            const stateSupplies = document.createElement("div");
            stateSupplies.style = `width:100%;display:flex;align-items:center;justify-content:space-between;box-sizing:border-box;padding:15px 15px 5px 15px;`;

            const suppliesEnabled = document.createElement("div");
            suppliesEnabled.style = `display:flex;justify-content:flex-start;gap:8px;align-items:center;border-radius: 10px;padding: 8px 8px;background-color: rgb(0 0 0 / 24%);`;

            const suppliesLabel = document.createElement("label");
            suppliesLabel.innerText = "Supplies Status";
            suppliesLabel.style = `color:${colors.lighttext};font-size:12px;font-weight:500;`;

            const suppliesStatus = document.createElement("div");
            suppliesStatus.id = "supplies-status-icon";
            suppliesStatus.style = `width:12px;height:12px;border-radius:50%;background:rgba(255,255,255,0.3);transition:all 0.3s ease;position:relative;`;

            suppliesStatus.innerHTML = `<div style="position:absolute;width:100%;height:100%;border-radius:50%;opacity:0;transition:all 0.3s ease;"></div>`;

            suppliesEnabled.appendChild(suppliesLabel);
            suppliesEnabled.appendChild(suppliesStatus);
            stateSupplies.appendChild(suppliesEnabled);

            const contentContainer = document.createElement("div");
            contentContainer.style = `height: calc(100% - 240px);padding: 5px;color: ${colors.lighttext};font-size: 13px;overflow-y: auto;background: transparent;scrollbar-width: thin;scrollbar-color: rgba(255, 255, 255, 0.2) transparent;`;

            uiContainer.appendChild(header);
            uiContainer.appendChild(tabs);
            uiContainer.appendChild(mainLogo);
            uiContainer.appendChild(stateSupplies);
            uiContainer.appendChild(contentContainer);

            document.body.appendChild(uiContainer);
            this.createSuppliesTab(contentContainer);

            tabs.firstChild.style.color = colors.active;
            tabs.firstChild.style.borderBottom = `2px solid ${colors.active}`;
        }

        updateButtonState(type, isActive) {
            let buttonKey = type;
            if (type === "doublearmor" || type === "armor") {
                buttonKey = "doublearmor";
            } else if (type === "doubledamage" || type === "damage") {
                buttonKey = "doubledamage";
            }

            const button = document.getElementById(`arpilot-btn-${buttonKey}`);
            if (button) {
                button.innerText = isActive ? "Deactivate" : "Activate";
                button.style.background = isActive ? "rgb(118, 255, 51)" : "#B22222";
                button.style.color = isActive ? "#000" : "#fff";
                button.style.animation = isActive ? "blink 1s infinite alternate" : "none";
            } else {
                console.error(`Botão não encontrado: arpilot-btn-${buttonKey}`);
            }
        }

        updateSuppliesSuperState() {
            const el = document.getElementById('supplies-status-icon');
            const pulseEffect = el.firstChild;

            if (this.settings.settings.suppliesClickEnabled) {
                el.style.backgroundColor = "#76ff33";
                el.style.boxShadow = "0 0 0 2px rgba(118, 255, 51, 0.05)";
                pulseEffect.style.opacity = "0.8";
                pulseEffect.style.transform = "scale(1.1)";
                pulseEffect.style.backgroundColor = "#76ff33";
                pulseEffect.style.boxShadow = "none";
            } else {
                el.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
                el.style.boxShadow = "none";
                pulseEffect.style.opacity = "0";
                pulseEffect.style.transform = "scale(1)";
            }
        }


        EventListeners() {
            document.addEventListener("keydown", (event) => {
                if (this.utils.isChatOpen) return;

                if (event.code === this.settings.settings.binds.display) {
                    const uiContainer = document.getElementById("arpilot-ui");
                    if (uiContainer) {
                        uiContainer.style.display = uiContainer.style.display === "none" ? "block" : "none";
                    }
                }

                if (event.code === this.settings.settings.binds.mines) {
                    let mine = this.settings.settings.clickState.mine;
                    mine.state = !mine.state;
                    this.settings.saveSettings();
                    this.updateButtonState("mine", mine.state);
                    this.clickMechanic();
                }

                if (event.code === this.settings.settings.binds.supplies) {
                    this.settings.settings.suppliesClickEnabled = !this.settings.settings.suppliesClickEnabled;
                    this.settings.saveSettings();

                    let supplies = this.settings.settings.clickState.supplies;
                    for (let key in supplies) {
                        this.updateButtonState(key, supplies[key].state);
                    }

                    this.updateSuppliesSuperState();
                    this.clickMechanic();
                }
            });
        }

        createSettingsTab(content) {
            const settingsContainer = document.createElement("div");
            settingsContainer.style = "display:flex;flex-direction:column;gap:12px;padding:0 5px;";

            const styleChangeButton = `background: rgba(255, 255, 255, 0.08);color: rgb(242, 133, 88);border: 1px solid rgba(255, 255, 255, 0.2);padding: 4px 12px;border-radius: 4px;font-size: 12px;font-weight: 500;cursor: pointer;transition: all 0.15s ease;height: 24px; &:hover {background: rgba(255, 255, 255, 0.15);}`;

            const styleRestoreButton = `background: rgba(255, 255, 255, 0.08);color: #ff3b30;border: 1px solid rgba(255, 255, 255, 0.2);padding: 4px 12px;border-radius: 4px;font-size: 12px;font-weight: 500;cursor: pointer;transition: all 0.15s ease;height: 24px; &:hover {background: rgba(255, 255, 255, 0.15);}`;
            const devModeContainer = document.createElement("div");
            devModeContainer.style = "display:flex;flex-direction:column;gap:8px;background:rgba(50,50,52,0.6);border-radius:8px;padding:12px;";

            const toggleStyle = `.ar-dev-checkbox { -webkit-appearance: none; -moz-appearance: none;appearance: none;width: 34px;height: 20px;border-radius: 10px;background: rgba(255,255,255,0.2);position: relative;cursor: pointer;transition: all 0.3s ease;border: none;outline: none;} .ar-dev-checkbox:checked {background: rgb(242, 133, 88);} .ar-dev-checkbox::after {content: '';position: absolute;top: 2px;left: 2px;width: 16px;height: 16px;border-radius: 50%;background: #fff;box-shadow: 0 1px 3px rgba(0,0,0,0.3);transition: all 0.3s ease;} .ar-dev-checkbox:checked::after {left: 16px;}`;
            const styleElement = document.createElement('style');
            styleElement.textContent = toggleStyle;
            document.head.appendChild(styleElement);

            const antiIDLE = document.createElement("div");
            antiIDLE.style = "display:flex;align-items:center;justify-content:space-between;";

            const antiIDLELabel = document.createElement("label");
            antiIDLELabel.innerText = "Pause Click";
            antiIDLELabel.style = "color:#fff;font-size:13px;font-weight:500;";
            antiIDLE.appendChild(antiIDLELabel);

            const antiIDLEToggle = document.createElement("input");
            antiIDLEToggle.type = "checkbox";
            antiIDLEToggle.classList.add("ar-dev-checkbox");
            antiIDLEToggle.checked = this.settings.settings.antiIDLE;
            antiIDLEToggle.addEventListener("change", () => {
                this.settings.settings.antiIDLE = antiIDLEToggle.checked;
                this.settings.saveSettings();
                this.createSettingsTab(content);
            });
            antiIDLE.appendChild(antiIDLEToggle);
           // devModeContainer.appendChild(antiIDLE);

            const resizeToggleDiv = document.createElement("div");
            resizeToggleDiv.style = "display:flex;align-items:center;justify-content:space-between;";

            const resizeLabel = document.createElement("label");
            resizeLabel.innerText = "Custom Resize";
            resizeLabel.style = "color:#fff;font-size:13px;font-weight:500;";
            resizeToggleDiv.appendChild(resizeLabel);

            const resizeToggle = document.createElement("input");
            resizeToggle.type = "checkbox";
            resizeToggle.classList.add("ar-dev-checkbox");
            resizeToggle.checked = this.settings.settings.resize.enabled;

            resizeToggle.addEventListener("change", () => {
                const newState = resizeToggle.checked;
                this.settings.settings.resize.enabled = newState;

                const uiContainer = document.getElementById('arpilot-ui');
                if (!uiContainer) {
                    console.error("UI Container não encontrado no DOM");
                    return;
                }

                if (this.resizeObserver) {
                    try {
                        this.resizeObserver.unobserve(uiContainer);
                    } catch (e) {
                        console.warn("Erro ao desconectar observer:", e);
                    }
                }

                if (newState) {
                    uiContainer.style.resize = "both";

                    if (this.settings.settings.resize.lastSize) {
                        uiContainer.style.width = this.settings.settings.resize.lastSize.width;
                        uiContainer.style.height = this.settings.settings.resize.lastSize.height;
                    }

                    if (!this.resizeObserver) {
                        this.resizeObserver = new ResizeObserver((entries) => {
                            if (!this.settings.settings.resize?.enabled) return;

                            const uiElement = entries[0]?.target;
                            if (!uiElement) return;

                            this.enforceSizeLimits(uiElement);

                            if (!uiElement.classList.contains('hit-limit')) {
                                this.settings.settings.resize.lastSize = {
                                    width: uiElement.style.width,
                                    height: uiElement.style.height
                                };
                                this.settings.saveSettings();
                            }
                        });
                    }

                    try {
                        this.resizeObserver.observe(uiContainer);
                    } catch (e) {
                        console.error("Erro ao observar container:", e);
                    }
                } else {
                    uiContainer.style.resize = "none";

                    uiContainer.style.width = this.settings.settings.resize.default.width;
                    uiContainer.style.height = this.settings.settings.resize.default.height;

                    this.settings.settings.resize.lastSize = null;
                }

                this.settings.saveSettings();
            });

            resizeToggleDiv.appendChild(resizeToggle);
            devModeContainer.appendChild(resizeToggleDiv);

            const devMode = document.createElement("div");
            devMode.style = "display:flex;align-items:center;justify-content:space-between;";

            const devModeLabel = document.createElement("label");
            devModeLabel.innerText = "Developer Mode";
            devModeLabel.style = "color:#fff;font-size:13px;font-weight:500;";
            devMode.appendChild(devModeLabel);

            const devModeToggle = document.createElement("input");
            devModeToggle.type = "checkbox";
            devModeToggle.classList.add("ar-dev-checkbox");
            devModeToggle.checked = this.settings.settings.developerMode;
            devModeToggle.addEventListener("change", () => {
                this.settings.settings.developerMode = devModeToggle.checked;
                this.settings.saveSettings();
                this.createSettingsTab(content);
            });
            devMode.appendChild(devModeToggle);
            devModeContainer.appendChild(devMode);
            settingsContainer.appendChild(devModeContainer);

            const bindLabel = document.createElement("h4");
            bindLabel.innerText = "Keybinds";
            bindLabel.style = "color:#fff;font-size:14px;font-weight:600;margin:15px 0 5px 0;";
            settingsContainer.appendChild(bindLabel);

            const createBindSection = (label, bindName) => {
                const sectionDiv = document.createElement("div");
                sectionDiv.style = "display:flex;flex-direction:column;gap:8px;background:rgba(50,50,52,0.6);border-radius:8px;padding:12px;";

                const displayElements = document.createElement("div");
                displayElements.style = "display:flex;justify-content:space-between;align-items:center;";

                const labelElement = document.createElement("label");
                labelElement.innerText = label;
                labelElement.style = "color:#fff;font-size:13px;font-weight:500;";
                displayElements.appendChild(labelElement);

                const keyDisplay = document.createElement("span");
                keyDisplay.innerText = this.settings.settings.binds[bindName] || "Not set";
                keyDisplay.style = "font-weight:600;color:rgba(255,255,255,0.7);font-family:monospace;background:rgba(0,0,0,0.3);padding:3px 8px;border-radius:4px;";
                displayElements.appendChild(keyDisplay);

                const btnGroup = document.createElement("div");
                btnGroup.style = "display:flex;justify-content:flex-end;gap:8px;";

                const changeButton = document.createElement("button");
                changeButton.innerText = "Change";
                changeButton.style = styleChangeButton;
                changeButton.addEventListener("click", () => this.changeBind(bindName, keyDisplay));
                btnGroup.appendChild(changeButton);

                const restoreButton = document.createElement("button");
                restoreButton.innerText = "Restore";
                restoreButton.style = styleRestoreButton;
                restoreButton.addEventListener("click", () => this.restoreDefaultBind(bindName, keyDisplay));
                btnGroup.appendChild(restoreButton);

                sectionDiv.appendChild(displayElements);
                sectionDiv.appendChild(btnGroup);

                return sectionDiv;
            };

            settingsContainer.appendChild(createBindSection("Display ", "display"));
            settingsContainer.appendChild(createBindSection("Supplies", "supplies"));
            settingsContainer.appendChild(createBindSection("Mines", "mines"));

            if (this.settings.settings.developerMode) {
                const suppliesContainer = document.createElement("div");
                suppliesContainer.style = "display:flex;flex-direction:column;gap:8px;margin-top:10px;";

                const suppliesLabel = document.createElement("h4");
                suppliesLabel.innerText = "Custom Supplies Keybinds";
                suppliesLabel.style = "color:#fff;font-size:14px;font-weight:600;margin:15px 0 5px 0;";
                suppliesContainer.appendChild(suppliesLabel);

                const allSupplies = { ...this.settings.settings.clickState.supplies, mine: this.settings.settings.clickState.mine, goldbox: this.settings.settings.clickState.goldbox };

                Object.keys(allSupplies).forEach(supply => {
                    const supplyDiv = document.createElement("div");
                    supplyDiv.style = "display:flex;flex-direction:column;gap:8px;background:rgba(50,50,52,0.6);border-radius:8px;padding:12px;";

                    const supplyTextGroup = document.createElement("div");
                    supplyTextGroup.style = "display:flex;justify-content:space-between;align-items:center;";

                    const supplyLabel = document.createElement("label");
                    supplyLabel.innerText = allSupplies[supply].name;
                    supplyLabel.style = "color:#fff;font-size:13px;font-weight:500;";
                    supplyTextGroup.appendChild(supplyLabel);

                    const keyDisplay = document.createElement("span");
                    keyDisplay.innerText = allSupplies[supply].key !== undefined ? allSupplies[supply].key : "Not set";
                    keyDisplay.style = "font-weight:600;color:rgba(255,255,255,0.7);font-family:monospace;background:rgba(0,0,0,0.3);padding:3px 8px;border-radius:4px;";
                    supplyTextGroup.appendChild(keyDisplay);
                    supplyDiv.appendChild(supplyTextGroup);

                    const supplyBtnGroup = document.createElement("div");
                    supplyBtnGroup.style = "display:flex;justify-content:flex-end;gap:8px;";

                    const changeButton = document.createElement("button");
                    changeButton.innerText = "Change";
                    changeButton.style = styleChangeButton;
                    changeButton.addEventListener("click", () => this.changeBind(supply, keyDisplay, true));
                    supplyBtnGroup.appendChild(changeButton);

                    const restoreButton = document.createElement("button");
                    restoreButton.innerText = "Restore";
                    restoreButton.style = styleRestoreButton;
                    restoreButton.addEventListener("click", () => this.restoreDefaultBind(supply, keyDisplay, true));
                    supplyBtnGroup.appendChild(restoreButton);
                    supplyDiv.appendChild(supplyBtnGroup);

                    suppliesContainer.appendChild(supplyDiv);
                });

                settingsContainer.appendChild(suppliesContainer);
            }

            content.innerHTML = "";
            content.appendChild(settingsContainer);
        }

        changeBind(bindName, keyDisplay, isSupply = false) {
            keyDisplay.innerText = "Press a key...";
            const onKeyPress = (e) => {
                e.preventDefault();
                const pressedKey = e.code;

                if (isSupply) {
                    if (this.settings.settings.clickState.supplies[bindName]) {
                        this.settings.settings.clickState.supplies[bindName].key = pressedKey;
                    } else if (this.settings.settings.clickState[bindName]) {
                        this.settings.settings.clickState[bindName].key = pressedKey;
                    }
                } else {
                    this.settings.settings.binds[bindName] = pressedKey;
                }

                keyDisplay.innerText = pressedKey;
                document.removeEventListener("keydown", onKeyPress);
                this.settings.saveSettings();
            };

            document.addEventListener("keydown", onKeyPress);

            setTimeout(() => {
                if (isSupply) {
                    keyDisplay.innerText =
                        this.settings.settings.clickState.supplies[bindName]?.key ||
                        this.settings.settings.clickState[bindName]?.key || "Not set";
                } else {
                    keyDisplay.innerText = this.settings.settings.binds[bindName] || "Not set";
                }
                document.removeEventListener("keydown", onKeyPress);
            }, 5000);
        }

        restoreDefaultBind(bindName, keyDisplay, isSupply = false) {
            const defaultKeys = {
                display: "Digit0",
                supplies: "Digit8",
                mines: "Digit9",
                firstaid: "Digit1",
                doublearmor: "Digit2",
                doubledamage: "Digit3",
                nitro: "Digit4",
                mine: "Digit5",
                goldbox: "Digit6"
            };

            if (isSupply) {
                if (this.settings.settings.clickState.supplies[bindName]) {
                    this.settings.settings.clickState.supplies[bindName].key = defaultKeys[bindName];
                } else if (this.settings.settings.clickState[bindName]) {
                    this.settings.settings.clickState[bindName].key = defaultKeys[bindName];
                }
            } else {
                this.settings.settings.binds[bindName] = defaultKeys[bindName];
            }

            keyDisplay.innerText = defaultKeys[bindName] || "Not set";
            this.settings.saveSettings();
        }

        createSuppliesTab(content) {
            content.innerHTML = "";

            const suppliesContainer = document.createElement("div");
            suppliesContainer.style = `display: flex;flex-direction: column;gap: 8px;padding: 12px;background: rgba(28, 28, 30, 0.8);border-radius: 10px;backdrop-filter: blur(20px);border: 1px solid rgba(255, 255, 255, 0.1);box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);`;

            const clickState = this.settings.settings.clickState;

            for (let type in clickState) {
                if (type === "supplies") {
                    for (let key in clickState[type]) {
                        this.createSupplyItem(suppliesContainer, clickState[type][key], key);
                    }
                } else {
                    this.createSupplyItem(suppliesContainer, clickState[type], type);
                }
            }

            content.appendChild(suppliesContainer);
        }

        createSupplyItem(suppliesContainer, supply, key) {
            const originalKey = key;
            let normalizedKey = key;
            if (normalizedKey === "doublearmor" || normalizedKey === "armor") {
                normalizedKey = "armor";
            } else if (normalizedKey === "doubledamage" || normalizedKey === "damage") {
                normalizedKey = "damage";
            }

            const supplyWrapper = document.createElement("div");
            supplyWrapper.style = `border-radius: 8px;background: rgba(44, 44, 46, 0.8);overflow: hidden;transition: all 0.3s ease;border: 1px solid rgba(255, 255, 255, 0.08);`;

            const supplyHeader = document.createElement("div");
            supplyHeader.style = `display: flex;align-items: center;justify-content: space-between;padding: 10px 12px;cursor: pointer;user-select: none;`;

            const leftHeader = document.createElement("div");
            leftHeader.style = "display: flex; align-items: center;";

            const icon = document.createElement("img");
            icon.src = this.suppliesIcon[normalizedKey]?.icon || "";
            icon.style = `width: 20px;height: 20px;margin-right: 10px;filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2));`;

            const name = document.createElement("span");
            let displayName;
            switch(originalKey.toLowerCase()) {
                case 'firstaid':
                    displayName = 'First Aid';
                    break;
                case 'armor':
                case 'doublearmor':
                    displayName = 'Double Armor';
                    break;
                case 'damage':
                case 'doubledamage':
                    displayName = 'Double Damage';
                    break;
                case 'mine':
                case 'mines':
                    displayName = 'Mines';
                    break;
                case 'goldbox':
                    displayName = 'Gold Box';
                    break;
                case 'nitro':
                case 'speed':
                    displayName = 'Nitro';
                    break;
                default:
                    displayName = originalKey
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, str => str.toUpperCase())
                        .trim();

                    displayName = displayName.replace('First Aid', 'First Aid');
            }
            name.innerText = displayName;
            name.style = `color: #ffffff;font-size: 13px;font-weight: 500;`;

            const expandButton = document.createElement("div");
            expandButton.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L2 5L10 5L6 9Z" fill="#a1a1a6"/></svg>`;
            expandButton.style = `margin-left: 8px;transition: transform 0.3s ease;transform: rotate(180deg);`;

            const toggleButton = document.createElement("button");
            toggleButton.id = `arpilot-btn-${key}`;

            function updateButtonState() {
                toggleButton.innerText = supply.state ? "Deactivate" : "Activate";
                toggleButton.style.background = supply.state ? "rgb(118, 255, 51)" : "rgb(178, 34, 34)";
                toggleButton.style.color = supply.state ? "#000" : "#fff";

                if (supply.state) {
                    toggleButton.style.animation = "blink 1s infinite alternate";
                } else {
                    toggleButton.style.animation = "none";
                }
            }

            toggleButton.style = `color: white;border: none;padding: 4px 12px;border-radius: 4px;cursor: pointer;transition: all 0.2s ease;font-size: 12px;font-weight: 500;min-width: 80px;text-align: center;`;

            toggleButton.addEventListener("click", (e) => {
                e.stopPropagation();
                const supply = this.settings.settings.clickState[key] || this.settings.settings.clickState.supplies[key];
                supply.state = !supply.state;
                updateButtonState();
                this.settings.saveSettings();
                this.clickMechanic();
            });
            document.head.insertAdjacentHTML("beforeend", `<style>@keyframes blink {0% { opacity: 1; }100% { opacity: 0.6; }}</style>`);
            updateButtonState();

            const controlsContainer = document.createElement("div");
            controlsContainer.style = `display: flex;flex-direction: column;gap: 10px;padding: 12px;background: rgba(36, 36, 38, 0.8);border-top: 1px solid rgba(255, 255, 255, 0.05);`;

            const delayControl = document.createElement("div");
            delayControl.style = "display: flex; align-items: center; gap: 10px;";

            const rangeInput = document.createElement("input");
            rangeInput.type = "range";
            rangeInput.min = "1";
            rangeInput.max = "500";
            rangeInput.value = supply.delay;
            rangeInput.style = `flex: 1;height: 4px;-webkit-appearance: none;margin: 10px 0;background: transparent;`;

            const rangeId = `range-${key}-${Math.random().toString(36).substr(2, 9)}`;
            rangeInput.id = rangeId;

            if (!document.getElementById('range-base-styles')) {
                const baseStyle = document.createElement("style");
                baseStyle.id = 'range-base-styles';
                baseStyle.textContent = `input[type="range"].custom-range {-webkit-appearance: none;width: 100%;height: 4px;background: transparent;} input[type="range"].custom-range::-webkit-slider-runnable-track {height: 4px;-webkit-appearance: none;border-radius: 10px;} input[type="range"].custom-range::-webkit-slider-thumb {-webkit-appearance: none;width: 14px;height: 14px;background: rgb(255, 188, 9);border-radius: 50%;margin-top: -5px;cursor: pointer;position: relative;z-index: 2;}`;
                document.head.appendChild(baseStyle);
            }

            const rangeStyle = document.createElement("style");
            rangeStyle.textContent = `#${rangeId} {-webkit-appearance: none;width: 100%;height: 4px;background: transparent;outline: none;} #${rangeId}::-webkit-slider-runnable-track {height: 4px;background: linear-gradient(to right,rgb(255, 188, 9) 0%,rgb(255, 188, 9) var(--percent),rgba(0, 0, 0, 0.5) var(--percent),rgba(0, 0, 0, 0.5) 100%);border-radius: 10px;border: none;} #${rangeId}::-webkit-slider-thumb {-webkit-appearance: none;width: 13px;height: 13px;background: rgb(255, 188, 9);border-radius: 50%;margin-top: -5px;box-shadow: 0 2px 4px rgba(0,0,0,0.2);cursor: pointer;transition: all 0.1s ease;} #${rangeId}::-webkit-slider-thumb:active {transform: scale(1.1);box-shadow: 0 3px 6px rgba(0,0,0,0.3);}`;

            document.head.appendChild(rangeStyle);

            function updateRangeGradient() {
                const value = rangeInput.value;
                const percent = (value/500)*100;

                rangeInput.style.setProperty('--percent', `${percent}%`);

                const track = rangeInput.querySelector('.range-track');
                if (track) {
                    track.style.background = `linear-gradient(to right,rgb(255, 188, 9) 0%,rgb(255, 188, 9) ${percent}%,rgba(0, 0, 0, 0.5) ${percent}%,rgba(0, 0, 0, 0.5) 100%)`;
                }
            }

            rangeInput.addEventListener('input', () => {
                supply.delay = parseInt(rangeInput.value);
                numberInput.value = supply.delay;
                updateRangeGradient();
                this.settings.saveSettings();
            });

            updateRangeGradient();

            const numberInput = document.createElement("input");
            numberInput.type = "number";
            numberInput.min = "1";
            numberInput.max = "500";
            numberInput.value = supply.delay;
            numberInput.style = `width: 60px;padding: 4px 8px;border: 1px solid rgba(255, 255, 255, 0.1);border-radius: 4px;background: rgba(28, 28, 30, 0.8);color: #ffffff;font-size: 12px;text-align: center;`;

            const msLabel = document.createElement("span");
            msLabel.textContent = "MS";
            msLabel.style = `color: #a1a1a6;font-size: 11px;width: 20px;`;

            rangeInput.addEventListener("input", () => {
                supply.delay = parseInt(rangeInput.value);
                numberInput.value = supply.delay;
                updateRangeGradient();
                this.settings.saveSettings();
            });

            function preventHotkeyExecution(e) {
                if (e.target.tagName === 'INPUT') {
                    e.stopImmediatePropagation();
                    return false;
                }
            }

            numberInput.addEventListener("input", () => {
                let value = parseInt(numberInput.value) || 1;
                value = Math.max(1, Math.min(value, 500));
                supply.delay = value;
                numberInput.value = value;
                rangeInput.value = value;
                updateRangeGradient();
                this.settings.saveSettings();
            });

            numberInput.addEventListener('keydown', preventHotkeyExecution);
            numberInput.addEventListener('keyup', preventHotkeyExecution);


            if (key === "mine" || key === "mines") {
                const multiplierControl = document.createElement("div");
                multiplierControl.style = `display: flex;justify-content: center;align-items: center;gap: 5px;width: 100%;`;

                const multiplierLabel = document.createElement("span");
                multiplierLabel.textContent = "Multiplier";
                multiplierLabel.style = `color: #a1a1a6;font-size: 11px;`;

                const multiplierInputWrapper = document.createElement("div");
                multiplierInputWrapper.style = "display: flex; align-items: center; gap: 8px;";

                const multiplierInput = document.createElement("input");
                multiplierInput.type = "number";
                multiplierInput.min = "1";
                multiplierInput.max = "500";
                multiplierInput.value = supply.multiplier;
                multiplierInput.style = `width: 60px;padding: 4px 8px;border: 1px solid rgba(255, 255, 255, 0.1);border-radius: 4px;background: rgba(28, 28, 30, 0.8);color: #ffffff;font-size: 12px;text-align: center;`;
                multiplierInput.addEventListener("input", () => {
                    let value = parseInt(multiplierInput.value) || 1;
                    value = Math.max(1, Math.min(value, 500));
                    supply.multiplier = value;
                    multiplierInput.value = value;
                    this.settings.saveSettings();
                });

                multiplierInput.addEventListener('keydown', preventHotkeyExecution);
                multiplierInput.addEventListener('keyup', preventHotkeyExecution);

                multiplierInputWrapper.appendChild(multiplierInput);
                multiplierControl.appendChild(multiplierLabel);
                multiplierControl.appendChild(multiplierInputWrapper);
                controlsContainer.appendChild(multiplierControl);
            }

            delayControl.appendChild(rangeInput);
            delayControl.appendChild(numberInput);
            delayControl.appendChild(msLabel);
            controlsContainer.appendChild(delayControl);

            leftHeader.appendChild(icon);
            leftHeader.appendChild(name);
            leftHeader.appendChild(expandButton);
            supplyHeader.appendChild(leftHeader);
            supplyHeader.appendChild(toggleButton);
            supplyWrapper.appendChild(supplyHeader);
            supplyWrapper.appendChild(controlsContainer);
            suppliesContainer.appendChild(supplyWrapper);

            updateRangeGradient();

            let isExpanded = true;
            supplyHeader.addEventListener("click", () => {
                isExpanded = !isExpanded;
                if (isExpanded) {
                    controlsContainer.style.display = "flex";
                    expandButton.style.transform = "rotate(180deg)";
                } else {
                    controlsContainer.style.display = "none";
                    expandButton.style.transform = "rotate(0deg)";
                }
            });
        }

        update(inBattle) {
            if (this.messageNotification) {
                this.messageNotification.style.display = inBattle ? "none" : "flex";
            }
            if (this.contentContainer) {
                this.contentContainer.style.height = `calc(100% - ${inBattle ? 240 : 145}px)`;
            }
        }

        createActionsTab(content) {
            const colors = {
                dark: 'rgba(28, 28, 30, 0.9)',
                semidark: 'rgba(44, 44, 46, 0.8)',
                lighttext: '#ffffff',
                darktext: 'rgba(255, 255, 255, 0.7)',
                active: '#f28558'
            };

            const actionsContainer = document.createElement("div");
            actionsContainer.style = `display:flex;flex-direction:column;gap:12px;padding:0 5px;`;

            // 1. Seção de Auto Desligar Supplies
            const autoDisableSection = document.createElement("div");
            autoDisableSection.style = `display:flex;flex-direction:column;gap:8px;background:${colors.semidark};border-radius:8px;padding:12px;`;

            const autoDisableLabel = document.createElement("h4");
            autoDisableLabel.innerText = "Auto Disable Supplies";
            autoDisableLabel.style = `color:${colors.lighttext};font-size:14px;font-weight:600;margin:0 0 8px 0;`;
            autoDisableSection.appendChild(autoDisableLabel);

            const autoDisableDesc = document.createElement("p");
            autoDisableDesc.innerText = "Automatically disable specific supplies after X minutes";
            autoDisableDesc.style = `color:${colors.darktext};font-size:12px;margin:0 0 12px 0;`;
            autoDisableSection.appendChild(autoDisableDesc);

            // Dropdown para selecionar o supply
            const supplySelectContainer = document.createElement("div");
            supplySelectContainer.style = "display:flex;align-items:center;gap:10px;margin-bottom:10px;";

            const supplySelectLabel = document.createElement("label");
            supplySelectLabel.innerText = "Supply:";
            supplySelectLabel.style = `color:${colors.lighttext};font-size:13px;min-width:60px;`;
            supplySelectContainer.appendChild(supplySelectLabel);

            const supplySelect = document.createElement("select");
            supplySelect.style = `flex:1;padding:6px 8px;border-radius:4px;background:${colors.dark};border:1px solid rgba(255,255,255,0.1);color:${colors.lighttext};font-size:13px;`;

            const supplyOptions = [
                { value: "firstaid", text: "First Aid" },
                { value: "armor", text: "Double Armor" },
                { value: "damage", text: "Double Damage" },
                { value: "nitro", text: "Nitro" },
                { value: "mine", text: "Mines" },
                { value: "goldbox", text: "Gold Box" }
            ];

            supplyOptions.forEach(option => {
                const optElement = document.createElement("option");
                optElement.value = option.value;
                optElement.textContent = option.text;
                supplySelect.appendChild(optElement);
            });
            supplySelectContainer.appendChild(supplySelect);
            autoDisableSection.appendChild(supplySelectContainer);

            // Dropdown para selecionar o tempo
            const timeSelectContainer = document.createElement("div");
            timeSelectContainer.style = "display:flex;align-items:center;gap:10px;margin-bottom:10px;";

            const timeSelectLabel = document.createElement("label");
            timeSelectLabel.innerText = "After:";
            timeSelectLabel.style = `color:${colors.lighttext};font-size:13px;min-width:60px;`;
            timeSelectContainer.appendChild(timeSelectLabel);

            const timeSelect = document.createElement("select");
            timeSelect.style = `flex:1;padding:6px 8px;border-radius:4px;background:${colors.dark};border:1px solid rgba(255,255,255,0.1);color:${colors.lighttext};font-size:13px;`;

            const timeOptions = [
                { value: "5", text: "5 minutes" },
                { value: "30", text: "30 minutes" },
                { value: "90", text: "90 minutes" },
                { value: "custom", text: "Custom..." }
            ];

            timeOptions.forEach(option => {
                const optElement = document.createElement("option");
                optElement.value = option.value;
                optElement.textContent = option.text;
                timeSelect.appendChild(optElement);
            });
            timeSelectContainer.appendChild(timeSelect);
            autoDisableSection.appendChild(timeSelectContainer);

            // Input customizado para tempo
            const customTimeContainer = document.createElement("div");
            customTimeContainer.style = "display:none;flex-direction:column;gap:8px;margin-top:8px;";

            const customTimeInput = document.createElement("input");
            customTimeInput.type = "number";
            customTimeInput.min = "1";
            customTimeInput.max = "999";
            customTimeInput.placeholder = "Enter minutes (1-999)";
            customTimeInput.style = `padding:6px 8px;border-radius:4px;background:${colors.dark};border:1px solid rgba(255,255,255,0.1);color:${colors.lighttext};font-size:13px;`;

            timeSelect.addEventListener("change", () => {
                if (timeSelect.value === "custom") {
                    customTimeContainer.style.display = "flex";
                } else {
                    customTimeContainer.style.display = "none";
                }
            });

            customTimeContainer.appendChild(customTimeInput);
            autoDisableSection.appendChild(customTimeContainer);

            // Botão para adicionar ação
            const addActionBtn = document.createElement("button");
            addActionBtn.innerText = "Add Auto-Disable Action";
            addActionBtn.style = `background:rgba(255,255,255,0.08);color:rgb(242, 133, 88);border:1px solid rgba(255,255,255,0.2);padding:8px 12px;border-radius:4px;font-size:13px;font-weight:500;cursor:pointer;transition:all 0.15s ease;margin-top:8px;`;
            addActionBtn.addEventListener("click", () => {
                const selectedSupply = supplySelect.value;
                let minutes = timeSelect.value === "custom" ? customTimeInput.value : timeSelect.value;

                if (!minutes || isNaN(minutes) || minutes < 1 || minutes > 999) {
                    alert("Please enter a valid time between 1 and 999 minutes");
                    return;
                }

                minutes = parseInt(minutes);
                this.addAutoDisableAction(selectedSupply, minutes);
            });
            autoDisableSection.appendChild(addActionBtn);

            // Lista de ações ativas
            const activeActionsContainer = document.createElement("div");
            activeActionsContainer.style = "display:flex;flex-direction:column;gap:8px;margin-top:12px;";

            const activeActionsLabel = document.createElement("h5");
            activeActionsLabel.innerText = "Active Auto-Disable Actions";
            activeActionsLabel.style = `color:${colors.lighttext};font-size:13px;font-weight:600;margin:0 0 4px 0;`;
            activeActionsContainer.appendChild(activeActionsLabel);

            const activeActionsList = document.createElement("div");
            activeActionsList.id = "active-auto-disable-actions";
            activeActionsList.style = "display:flex;flex-direction:column;gap:6px;";
            activeActionsContainer.appendChild(activeActionsList);

            autoDisableSection.appendChild(activeActionsContainer);
            actionsContainer.appendChild(autoDisableSection);

            // 2. Seção de Click Behavior (simplificada)
            const clickModeSection = document.createElement("div");
            clickModeSection.style = `display:flex;flex-direction:column;gap:8px;background:${colors.semidark};border-radius:8px;padding:12px;`;

            const clickModeLabel = document.createElement("h4");
            clickModeLabel.innerText = "Click Behavior";
            clickModeLabel.style = `color:${colors.lighttext};font-size:14px;font-weight:600;margin:0 0 8px 0;`;
            clickModeSection.appendChild(clickModeLabel);

            // Estilo para os checkboxes
            const checkboxStyle = `
        .ar-checkbox-container {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px;
            border-radius: 6px;
            background: rgba(28,28,30,0.5);
            transition: all 0.2s ease;
            cursor: pointer;
        }
        .ar-checkbox-container:hover {
            background: rgba(255,255,255,0.1);
        }
        .ar-checkbox {
            position: relative;
            width: 18px;
            height: 18px;
            border-radius: 4px;
            border: 2px solid rgba(255,255,255,0.3);
            background: transparent;
            transition: all 0.2s ease;
        }
        .ar-checkbox.checked {
            border-color: ${colors.active};
            background: rgba(242,133,88,0.2);
        }
        .ar-checkbox.checked::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 10px;
            height: 10px;
            border-radius: 2px;
            background: ${colors.active};
        }
        .ar-checkbox-label {
            color: ${colors.lighttext};
            font-size: 13px;
            font-weight: 500;
        }
        .ar-checkbox-desc {
            color: ${colors.darktext};
            font-size: 11px;
        }
    `;

            const styleElement = document.createElement('style');
            styleElement.textContent = checkboxStyle;
            document.head.appendChild(styleElement);

            // Opção Normal
            const normalOption = document.createElement("label");
            normalOption.className = "ar-checkbox-container";

            const normalCheckbox = document.createElement("input");
            normalCheckbox.type = "radio";
            normalCheckbox.name = "clickMode";
            normalCheckbox.value = "normal";
            normalCheckbox.style.display = "none";
            normalCheckbox.checked = this.settings.settings.clickMode === "normal";

            const normalCustomCheckbox = document.createElement("div");
            normalCustomCheckbox.className = `ar-checkbox ${this.settings.settings.clickMode === "normal" ? 'checked' : ''}`;

            const normalLabel = document.createElement("div");
            const normalTitle = document.createElement("div");
            normalTitle.className = "ar-checkbox-label";
            normalTitle.textContent = "Normal Mode";
            const normalDesc = document.createElement("div");
            normalDesc.className = "ar-checkbox-desc";
            normalDesc.textContent = "Auto-click works normally";
            normalLabel.appendChild(normalTitle);
            normalLabel.appendChild(normalDesc);

            normalOption.appendChild(normalCheckbox);
            normalOption.appendChild(normalCustomCheckbox);
            normalOption.appendChild(normalLabel);

            normalOption.addEventListener("click", () => {
                this.settings.settings.clickMode = "normal";
                this.settings.saveSettings();
                document.querySelectorAll('.ar-checkbox').forEach(el => el.classList.remove('checked'));
                normalCustomCheckbox.classList.add('checked');
                this.clickMechanic();
            });

            // Opção Híbrida
            const hybridOption = document.createElement("label");
            hybridOption.className = "ar-checkbox-container";

            const hybridCheckbox = document.createElement("input");
            hybridCheckbox.type = "radio";
            hybridCheckbox.name = "clickMode";
            hybridCheckbox.value = "hybrid";
            hybridCheckbox.style.display = "none";
            hybridCheckbox.checked = this.settings.settings.clickMode === "hybrid";

            const hybridCustomCheckbox = document.createElement("div");
            hybridCustomCheckbox.className = `ar-checkbox ${this.settings.settings.clickMode === "hybrid" ? 'checked' : ''}`;

            const hybridLabel = document.createElement("div");
            const hybridTitle = document.createElement("div");
            hybridTitle.className = "ar-checkbox-label";
            hybridTitle.textContent = "Hybrid Mode";
            const hybridDesc = document.createElement("div");
            hybridDesc.className = "ar-checkbox-desc";
            hybridDesc.textContent = "Auto-click + manual multiplier activation";
            hybridLabel.appendChild(hybridTitle);
            hybridLabel.appendChild(hybridDesc);

            hybridOption.appendChild(hybridCheckbox);
            hybridOption.appendChild(hybridCustomCheckbox);
            hybridOption.appendChild(hybridLabel);

            hybridOption.addEventListener("click", () => {
                this.settings.settings.clickMode = "hybrid";
                this.settings.saveSettings();
                document.querySelectorAll('.ar-checkbox').forEach(el => el.classList.remove('checked'));
                hybridCustomCheckbox.classList.add('checked');
                this.clickMechanic();
            });

            clickModeSection.appendChild(normalOption);
            clickModeSection.appendChild(hybridOption);
            //actionsContainer.appendChild(clickModeSection);

            // Adiciona todos os elementos ao content
            content.innerHTML = "";
            content.appendChild(actionsContainer);

            // Carrega as ações ativas
            this.loadActiveAutoDisableActions();
        }

        addAutoDisableAction(supplyType, minutes) {
            if (!this.settings.settings.autoDisableActions) {
                this.settings.settings.autoDisableActions = [];
            }

            const existingIndex = this.settings.settings.autoDisableActions.findIndex(
                action => action.supplyType === supplyType
            );

            if (existingIndex >= 0) {
                this.settings.settings.autoDisableActions[existingIndex].minutes = minutes;
                this.settings.settings.autoDisableActions[existingIndex].startTime = Date.now();
            } else {
                this.settings.settings.autoDisableActions.push({
                    supplyType,
                    minutes,
                    startTime: Date.now()
                });
            }

            this.settings.saveSettings();
            this.loadActiveAutoDisableActions();

            if (!this.autoDisableTimer) {
                this.startAutoDisableTimer();
            }
        }

        loadActiveAutoDisableActions() {
            const activeActionsList = document.getElementById("active-auto-disable-actions");
            if (!activeActionsList) return;

            activeActionsList.innerHTML = "";

            if (!this.settings.settings.autoDisableActions || this.settings.settings.autoDisableActions.length === 0) {
                const noActions = document.createElement("div");
                noActions.innerText = "No active auto-disable actions";
                noActions.style = "color:rgba(255,255,255,0.5);font-size:12px;font-style:italic;padding:8px 0;text-align:center;";
                activeActionsList.appendChild(noActions);
                return;
            }

            if (this.updateTimersInterval) {
                clearInterval(this.updateTimersInterval);
            }

            const updateAllTimers = () => {
                const now = Date.now();
                const actionItems = activeActionsList.querySelectorAll(".auto-disable-action-item");

                this.settings.settings.autoDisableActions.forEach((action, index) => {
                    if (index >= actionItems.length) return;

                    const elapsedMs = now - action.startTime;
                    const remainingMs = Math.max(0, (action.minutes * 60000) - elapsedMs);
                    const minutes = Math.floor(remainingMs / 60000);
                    const seconds = Math.floor((remainingMs % 60000) / 1000);

                    const timerElement = actionItems[index].querySelector(".action-timer");
                    if (timerElement) {
                        timerElement.textContent = `${minutes}m ${seconds.toString().padStart(2, '0')}s`;

                        // Muda a cor quando faltar menos de 1 minuto
                        if (remainingMs < 60000) {
                            timerElement.style.color = "#ff3b30";
                        } else {
                            timerElement.style.color = "#a1a1a6";
                        }
                    }
                });
            };

            this.settings.settings.autoDisableActions.forEach((action, index) => {
                const actionItem = document.createElement("div");
                actionItem.className = "auto-disable-action-item";
                actionItem.style = "display:flex;justify-content:space-between;align-items:center;background:rgba(28,28,30,0.8);border-radius:6px;padding:8px 10px;margin-bottom:6px;";

                const actionText = document.createElement("div");
                actionText.style = "display:flex;align-items:center;gap:8px;";

                // Ícone do supply
                const icon = document.createElement("img");
                icon.src = this.suppliesIcon[action.supplyType]?.icon || "";
                icon.style = "width:16px;height:16px;filter:drop-shadow(0 1px 1px rgba(0,0,0,0.2));";
                actionText.appendChild(icon);

                let supplyName = action.supplyType;
                switch(action.supplyType) {
                    case 'firstaid': supplyName = 'First Aid'; break;
                    case 'armor': supplyName = 'Double Armor'; break;
                    case 'damage': supplyName = 'Double Damage'; break;
                    case 'nitro': supplyName = 'Nitro'; break;
                    case 'mine': supplyName = 'Mines'; break;
                    case 'goldbox': supplyName = 'Gold Box'; break;
                }

                const nameElement = document.createElement("span");
                nameElement.textContent = supplyName;
                nameElement.style = "color:#fff;font-size:13px;min-width:80px;";
                actionText.appendChild(nameElement);

                const timerElement = document.createElement("span");
                timerElement.className = "action-timer";
                timerElement.style = "color:#a1a1a6;font-size:12px;font-family:monospace;margin-left:8px;";
                actionText.appendChild(timerElement);

                actionItem.appendChild(actionText);

                const removeBtn = document.createElement("button");
                removeBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 3L3 9M3 3L9 9" stroke="#ff3b30" stroke-width="1.5" stroke-linecap="round"/></svg>`;
                removeBtn.style = "background:rgba(255,59,48,0.1);border:none;border-radius:4px;padding:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;";
                removeBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.settings.settings.autoDisableActions.splice(index, 1);
                    this.settings.saveSettings();
                    this.loadActiveAutoDisableActions();

                    if (this.settings.settings.autoDisableActions.length === 0 && this.autoDisableTimer) {
                        clearInterval(this.autoDisableTimer);
                        this.autoDisableTimer = null;
                    }
                });
                actionItem.appendChild(removeBtn);

                activeActionsList.appendChild(actionItem);
            });

            updateAllTimers();

            this.updateTimersInterval = setInterval(updateAllTimers, 1000);
        }

        startAutoDisableTimer() {
            if (this.autoDisableTimer) {
                clearInterval(this.autoDisableTimer);
                this.autoDisableTimer = null;
            }

            this.autoDisableTimer = setInterval(() => {
                if (!this.settings.settings.autoDisableActions ||
                    this.settings.settings.autoDisableActions.length === 0) {
                    clearInterval(this.autoDisableTimer);
                    this.autoDisableTimer = null;
                    return;
                }

                const now = Date.now();
                let needsUpdate = false;

                for (let i = this.settings.settings.autoDisableActions.length - 1; i >= 0; i--) {
                    const action = this.settings.settings.autoDisableActions[i];
                    if (now - action.startTime >= action.minutes * 60000) {
                        this.disableSupply(action.supplyType);
                        this.settings.settings.autoDisableActions.splice(i, 1);
                        needsUpdate = true;
                    }
                }

                if (needsUpdate) {
                    this.settings.saveSettings();
                    this.loadActiveAutoDisableActions();
                    this.clickMechanic();
                }
            }, 1000);
        }

        /*
        antiIDLE() {
            // Limpar observers anteriores se existirem
            if (this.idleObserver) {
                this.idleObserver.disconnect();
                this.idleObserver = null;
            }
            if (this.garageObserver) {
                this.garageObserver.disconnect();
                this.garageObserver = null;
            }

            this.antiIdlePaused = false;

            const fadeOut = (el) => {
                if (!el) return;
                el.style.transition = 'opacity 0.3s ease';
                el.style.opacity = '0';
                setTimeout(() => {
                    if (el) el.style.pointerEvents = 'none';
                }, 300);
            };

            const isInactivityDialog = (el) => {
                if (!el) return false;
                const text = el.innerText?.toLowerCase() || '';
                return text.includes('você foi pausado') ||
                    text.includes('inatividade') ||
                    text.includes('kick');
            };

            const hasInteractiveElements = (el) => {
                return el && el.querySelector('input, button, textarea, select');
            };

            const handleIdleBypass = () => {
                if (this.antiIdlePaused || !this.utils.inBattle || !this.settings.settings.antiIDLE) return;

                // Verificar múltiplos tipos de diálogos de inatividade
                const dialogs = [
                    document.querySelector(".DialogContainerComponentStyle-container"),
                    document.querySelector(".ModalStyle-rootHover"),
                    document.querySelector("#modal-root > div")
                ];

                dialogs.forEach(dialog => {
                    if (dialog && isInactivityDialog(dialog) && !hasInteractiveElements(dialog)) {
                        fadeOut(dialog);

                        // Clicar no botão de confirmação se existir após 500ms
                        setTimeout(() => {
                            const confirmBtn = dialog.querySelector('button');
                            if (confirmBtn) {
                                confirmBtn.click();
                            }
                        }, 500);
                    }
                });
            };

            // Observer principal para diálogos de inatividade
            this.idleObserver = new MutationObserver((mutations) => {
                try {
                    handleIdleBypass();
                } catch (e) {
                    console.error("[antiIDLE] Error in observer:", e);
                }
            });

            this.idleObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: false,
                characterData: false
            });

            // Observer para detectar quando está na garagem
            this.garageObserver = new MutationObserver(() => {
                try {
                    const garage = document.querySelector(".GarageCommonStyle-garageContainer");
                    const visible = garage &&
                          getComputedStyle(garage).opacity !== "0" &&
                          garage.offsetParent !== null;

                    this.antiIdlePaused = visible;

                    // Se sair da garagem, força uma verificação imediata
                    if (!visible) {
                        setTimeout(handleIdleBypass, 1000);
                    }
                } catch (e) {
                    console.error("[GarageObserver] Error:", e);
                }
            });

            this.garageObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });

            setTimeout(handleIdleBypass, 3000);

            if (!this.cleanupFunctions) this.cleanupFunctions = [];
            this.cleanupFunctions.push(() => {
                if (this.idleObserver) this.idleObserver.disconnect();
                if (this.garageObserver) this.garageObserver.disconnect();
            });
        }*/

        clickMechanic() {
            this.cleanupClickResources();

            if (!this.utils.inBattle) return;

            const pressKey = (() => {
                const lastEvent = {};
                return (key) => {
                    const now = performance.now();
                    if (lastEvent[key] && now - lastEvent[key] < 1) return;
                    lastEvent[key] = now;

                    const keyCode = key.length === 1 ? `Key${key.toUpperCase()}` : key;
                    document.dispatchEvent(new KeyboardEvent("keydown", {
                        code: keyCode,
                        key: key,
                        bubbles: true
                    }));
                    document.dispatchEvent(new KeyboardEvent("keyup", {
                        code: keyCode,
                        key: key,
                        bubbles: true
                    }));
                };
            })();

            if (!this.supplyResources) this.supplyResources = {};

            const manageSupply = (supply, type) => {
                if (!this.supplyResources[type]) {
                    this.supplyResources[type] = {
                        animationFrameId: null,
                        timeouts: [],
                        watchdog: null
                    };
                }

                const resources = this.supplyResources[type];

                const stopAutoclicking = () => {
                    if (resources.animationFrameId) {
                        cancelAnimationFrame(resources.animationFrameId);
                        resources.animationFrameId = null;
                    }
                    resources.timeouts.forEach(clearTimeout);
                    resources.timeouts = [];
                    if (resources.watchdog) {
                        clearInterval(resources.watchdog);
                        resources.watchdog = null;
                    }
                };

                const startAutoclicking = () => {
                    stopAutoclicking();

                    let supplyEnabled;
                    // Supplies normais dependem do toggle geral, mines/goldbox não!
                    if (Object.keys(this.settings.settings.clickState.supplies).includes(type)) {
                        supplyEnabled = this.settings.settings.suppliesClickEnabled;
                    } else {
                        supplyEnabled = true;
                    }

                    if (!supplyEnabled) {
                        stopAutoclicking();
                        return;
                    }

                    let lastExecutionTime = performance.now();
                    let lastLoopTime = 0;

                    const autoclickLoop = (currentTime) => {
                        try {
                            lastLoopTime = currentTime;

                            let supplyEnabledLoop;
                            if (Object.keys(this.settings.settings.clickState.supplies).includes(type)) {
                                supplyEnabledLoop = this.settings.settings.suppliesClickEnabled;
                            } else {
                                supplyEnabledLoop = true;
                            }

                            if (!supply.state || !supplyEnabledLoop) {
                                stopAutoclicking();
                                return;
                            }

                            if (currentTime - lastExecutionTime >= supply.delay) {
                                lastExecutionTime = currentTime;

                                for (let i = 0; i < (supply.multiplier ?? 1); i++) {
                                    resources.timeouts.push(
                                        setTimeout(() => {
                                            let supplyEnabledSet;
                                            if (Object.keys(this.settings.settings.clickState.supplies).includes(type)) {
                                                supplyEnabledSet = this.settings.settings.suppliesClickEnabled;
                                            } else {
                                                supplyEnabledSet = true;
                                            }

                                            if (supply.state && supply.key && supplyEnabledSet) {
                                                pressKey(supply.key);
                                            }
                                        }, i * 20)
                                    );
                                }
                            }

                            resources.animationFrameId = requestAnimationFrame(autoclickLoop);
                        } catch (e) {
                            console.error("Error in click loop:", e);
                            stopAutoclicking();
                        }
                    };

                    resources.watchdog = setInterval(() => {
                        if (supply.state && performance.now() - lastLoopTime > 200) {
                            console.warn("[Watchdog] Restarting stuck loop for", type);
                            stopAutoclicking();
                            startAutoclicking();
                        }
                    }, 500);

                    resources.animationFrameId = requestAnimationFrame(autoclickLoop);
                };

                // Supplies normais dependem do toggle geral, mines/goldbox não!
                const isSupply = Object.keys(this.settings.settings.clickState.supplies).includes(type);
                const shouldAutoclick = isSupply ? (supply.state && this.settings.settings.suppliesClickEnabled) : supply.state;

                if (shouldAutoclick) {
                    startAutoclicking();
                } else {
                    stopAutoclicking();
                }
            };

            Object.entries(this.settings.settings.clickState.supplies).forEach(([type, supply]) => {
                manageSupply(supply, type);
            });

            manageSupply(this.settings.settings.clickState.mine, 'mine');
            manageSupply(this.settings.settings.clickState.goldbox, 'goldbox');
        }

        cleanupClickResources() {
            if (this.supplyResources) {
                Object.values(this.supplyResources).forEach(resources => {
                    if (resources.animationFrameId) cancelAnimationFrame(resources.animationFrameId);
                    resources.timeouts.forEach(clearTimeout);
                    if (resources.watchdog) clearInterval(resources.watchdog);
                });
                this.supplyResources = {};
            }
        }
    }

    const utils = new Utils();
    const settings = new Settings();
    const arpilot = new ARpilot(settings, utils);
})();