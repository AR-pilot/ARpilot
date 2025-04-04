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
              developerMode: false,
              antiIDLE: false,
              binds: {
                  display: "0",
                  supplies: "8",
                  mines: "9"
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
          this.suppliesClickEnabled = false;
          this.utils.addObserver((state) => {
              this.updateUI(state);
              if (state) {
                  this.clickMechanic();
              } else {
                  this.stopAllClicking();
              }
          });
          this.suppliesIcon = {
              firstaid: { icon: 'https://tankionline.com/play/static/images/Repair.13e5e240.svg' },
              armor: { icon: 'https://tankionline.com/play/static/images/Shield.6319a2d0.svg' },
              damage: { icon: 'https://tankionline.com/play/static/images/DoubleDamage.c601a4b1.svg' },
              nitro: { icon: 'https://tankionline.com/play/static/images/Speed.3b207b8e.svg' },
              mine: { icon: 'https://tankionline.com/play/static/images/Mine.230cdfaa.svg' },
              goldbox: { icon: 'https://tankionline.com/play/static/images/GoldBox.61e0017c.svg' }
          };
          this.initUI();
          this.EventListeners();
          this.antiIDLE();
          this.clickMechanic();
      }

      initUI() {
          const colors = {
              dark: '#121214',
              semindark: '#1d1d21',
              lighttext: '#fff',
              darktext: '#d1d1d1',
              active: '#f28558'
          };

          const uiContainer = document.createElement("div");
          uiContainer.id = "arpilot-ui";
          uiContainer.style = `position: fixed;top: 20px;left: 20px;width: 380px;height: 90%;background: ${colors.dark};border-radius: 10px;box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);font-family: Arial, sans-serif;overflow: hidden;z-index: 10000;`;

          const header = document.createElement("div");
          header.style = `display: flex;align-items: center;justify-content: space-between;padding: 5px 10px;background: ${colors.semindark}; cursor: grab !important;`;

          const titleBar = document.createElement("span");
          titleBar.innerHTML = "ARpilot";
          titleBar.style = `font-size: 12px;color: white;position: absolute;left: 50%; transform: translateX(-50%); cursor: grab;`;

          const btnContainer = document.createElement("div");
          btnContainer.style = "display: flex; gap: 5px;";

          ["#ff5f56", "#ffbd2e", "#27c93f"].forEach((color, index) => {
              const btn = document.createElement("div");
              btn.style = `width: 12px;height: 12px;background: ${color};border-radius: 50%;cursor: pointer;`;
              btnContainer.appendChild(btn);
              if (index === 0) btn.onclick = () => uiContainer.remove();
          });

          header.style = `position: relative; display: flex;align-items: center;height: 30px;background: ${colors.semindark};padding: 0 10px; cursor: grab !important;`;

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
          tabs.style = `display: flex;justify-content: space-around;background: ${colors.semindark};border-top: 1px solid rgba(255, 255, 255, 0.05);padding: 5px;`;

          const mainLogo = document.createElement("div");
          mainLogo.style = `display: flex;justify-content: center;padding: 12px;`;
          mainLogo.innerHTML = `<svg width="80" height="40" viewBox="0 0 140 69" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M48.2969 42.6875C44.5469 42.8125 41.7969 42.875 40.0469 42.875C37.3594 42.875 33.6406 42.8125 28.8906 42.6875C27.8906 43.7812 26.6719 45.0781 25.2344 46.5781C23.7969 48.0469 22.4375 49.4219 21.1562 50.7031C19.875 51.9531 18.7656 53.0312 17.8281 53.9375C16.9219 54.8125 16.1719 55.5469 15.5781 56.1406C12.1094 59.5156 9.84375 61.7188 8.78125 62.75C7.75 63.7812 6.65625 64.7031 5.5 65.5156C4.34375 66.3594 3.28125 66.7812 2.3125 66.7812C1.21875 66.7812 0.671875 66.2812 0.671875 65.2812C0.671875 64.1875 1.45312 62.5 3.01562 60.2188C4.57812 57.9375 6.34375 55.9219 8.3125 54.1719C10.2812 52.4219 11.8906 51.5469 13.1406 51.5469C13.4844 51.5469 13.9688 51.7031 14.5938 52.0156L23.5 42.5C22.375 42.3438 20.9062 42.25 19.0938 42.2188C17.2812 42.1562 16.0625 42.0156 15.4375 41.7969C14.8125 41.5781 14.5 41.0469 14.5 40.2031C14.5 38.8594 15.9375 36.75 18.8125 33.875C20.375 32.2812 21.8438 31.2656 23.2188 30.8281C24.5938 30.3906 27.2188 30.1562 31.0938 30.125C28.8125 30.4375 27.1875 30.8125 26.2188 31.25C25.2812 31.6562 24.7656 32.2812 24.6719 33.125C25.5781 33.125 26.4062 33.125 27.1562 33.125C27.9375 33.125 28.9375 33.125 30.1562 33.125C31.4062 33.0938 32.3281 33.0625 32.9219 33.0312C38.0469 28.0312 42.7031 23.6875 46.8906 20C51.0781 16.2812 55.4844 12.7656 60.1094 9.45312C64.7656 6.10938 69.7188 3.04688 74.9688 0.265625C76 1.60938 76.5156 3.01562 76.5156 4.48438C76.5156 5.70312 76.1094 7.10938 75.2969 8.70312C74.5156 10.2969 72.8281 13.2969 70.2344 17.7031C67.6719 22.0781 65.0625 26.7344 62.4062 31.6719C63.2812 31.6719 64 31.6875 64.5625 31.7188C65.1562 31.7188 65.7812 31.7344 66.4375 31.7656C68.2188 31.7656 69.2969 31.7969 69.6719 31.8594C70.0781 31.9219 70.2812 32.2344 70.2812 32.7969C70.2812 33.0469 70.0312 33.5 69.5312 34.1562C69.0625 34.7812 68.2188 35.8438 67 37.3438C65.7812 38.8125 64.5938 40.3125 63.4375 41.8438L56.5469 42.4062C52.8906 49.2812 51.0625 53.1562 51.0625 54.0312C51.0625 55.3125 51.7344 55.9531 53.0781 55.9531C53.7344 55.9531 56.4531 54.5781 61.2344 51.8281L60.8594 54.3125C58.2969 56.25 56.2969 57.7812 54.8594 58.9062C53.4531 60 52.2188 60.9219 51.1562 61.6719C50.125 62.3906 49.1719 62.9219 48.2969 63.2656C47.4531 63.6406 46.5938 63.8281 45.7188 63.8281C44.6875 63.8281 43.6719 63.3438 42.6719 62.375C41.6719 61.4375 41.1719 60.0938 41.1719 58.3438C41.1719 57.625 41.4375 56.6094 41.9688 55.2969C42.5 53.9531 43.0625 52.6719 43.6562 51.4531C44.2812 50.2344 45.8281 47.3125 48.2969 42.6875ZM39.4375 32.0469L54.625 31.7656C56.4062 28.7344 57.8438 26.2812 58.9375 24.4062C60.0625 22.5312 61.2812 20.5 62.5938 18.3125C63.9375 16.0938 65.0781 14.2188 66.0156 12.6875C66.9844 11.1562 68.0469 9.42188 69.2031 7.48438C66.9531 8.89062 64.6562 10.4531 62.3125 12.1719C59.9688 13.8906 57.3281 15.9688 54.3906 18.4062C51.4531 20.8125 48.8438 23.0625 46.5625 25.1562C44.2812 27.2188 41.9062 29.5156 39.4375 32.0469ZM103.844 57.6875L86.1719 49.0625C81.6719 55.2188 79.1562 59.2812 78.625 61.25C78.25 62.6562 77.4062 63.8281 76.0938 64.7656C74.8125 65.7344 73.8906 66.2188 73.3281 66.2188C71.7344 66.2188 70.9375 65.6094 70.9375 64.3906C70.9375 63.7031 71.875 61.7344 73.75 58.4844C75.6562 55.2031 78.2656 51.3438 81.5781 46.9062C79.7344 46.1562 78.5938 45.6562 78.1562 45.4062C77.7188 45.1562 77.5469 44.6875 77.6406 44C77.7344 43.2812 78.2812 42.1719 79.2812 40.6719C80.1562 39.3594 80.8125 38.4844 81.25 38.0469C81.6875 37.5781 82.2031 37.2188 82.7969 36.9688C83.3906 36.6875 84.0156 36.5 84.6719 36.4062C85.3281 36.3125 87.1719 36.0781 90.2031 35.7031C92.6719 32.3594 95.3438 28.75 98.2188 24.875C101.125 21 103.391 17.9844 105.016 15.8281C100.109 16.4844 96.6875 17.0312 94.75 17.4688C92.6875 17.875 90.9531 18.2188 89.5469 18.5C88.1719 18.75 87.2031 18.9844 86.6406 19.2031C86.0781 19.3906 85.7969 19.6719 85.7969 20.0469C85.7969 20.3906 86.1406 20.625 86.8281 20.75C87.5156 20.875 88.375 20.9375 89.4062 20.9375C90.4688 20.9375 91.2812 20.9844 91.8438 21.0781C92.4375 21.1406 92.7344 21.3125 92.7344 21.5938C92.7344 21.9062 92.3438 22.0938 91.5625 22.1562C90.8125 22.1875 88.6719 22.2812 85.1406 22.4375C83.1406 22.5 81.4531 22.5625 80.0781 22.625C78.7344 22.6875 77.7969 22.7188 77.2656 22.7188C76.5469 22.7188 75.9844 22.5 75.5781 22.0625C75.1719 21.625 74.9688 21.0469 74.9688 20.3281C74.9688 19.7969 75.2656 18.8125 75.8594 17.375C76.4531 15.9375 77.2969 14.4844 78.3906 13.0156C79.4844 11.5469 80.7344 10.4062 82.1406 9.59375C83.7344 8.625 86.2031 7.65625 89.5469 6.6875C92.9219 5.6875 96.6562 4.89062 100.75 4.29688C104.875 3.67188 108.953 3.35938 112.984 3.35938C115.422 3.35938 117.797 3.5 120.109 3.78125C122.453 4.0625 124.562 4.40625 126.438 4.8125C128.344 5.21875 129.844 5.625 130.938 6.03125C133.781 6.96875 135.953 8.39062 137.453 10.2969C138.984 12.2031 139.75 14.2969 139.75 16.5781C139.75 18.7969 139.359 20.9688 138.578 23.0938C137.828 25.1875 136.656 27.1406 135.062 28.9531C133.5 30.7344 131.609 32.1875 129.391 33.3125C127.578 34.25 124.828 35.2031 121.141 36.1719C117.453 37.1406 113 38 107.781 38.75C102.562 39.5 96.7344 40.0469 90.2969 40.3906C95.1094 42.0781 99.5938 43.7812 103.75 45.5C107.938 47.1875 111.453 48.7031 114.297 50.0469C117.172 51.3594 119.422 52.4375 121.047 53.2812C123.328 54.4688 124.812 55.3281 125.5 55.8594C126.188 56.3906 126.641 57.0781 126.859 57.9219C127.078 58.7656 127.188 60.1562 127.188 62.0938C127.188 64.2812 127.047 65.8906 126.766 66.9219C126.516 67.9844 125.953 68.5156 125.078 68.5156C124.797 68.5156 124.047 68.2031 122.828 67.5781C121.641 66.9844 119.984 66.0938 117.859 64.9062C115.734 63.75 113.797 62.7188 112.047 61.8125C110.328 60.875 107.594 59.5 103.844 57.6875ZM107.969 15.3594C108 15.5781 108.016 15.7812 108.016 15.9688C108.047 16.1562 108.062 16.4219 108.062 16.7656C108.062 17.6406 107.781 18.6562 107.219 19.8125C106.688 20.9375 105.984 22.1094 105.109 23.3281C104.266 24.5156 102.984 26.2344 101.266 28.4844C99.5781 30.7031 98.0156 32.75 96.5781 34.625C103.141 33.375 108.734 32.1719 113.359 31.0156C118.016 29.8594 121.844 28.7031 124.844 27.5469C127.844 26.3594 130.094 25.125 131.594 23.8438C133.125 22.5312 133.891 21.1719 133.891 19.7656C133.891 18.2031 132.297 16.9844 129.109 16.1094C125.953 15.2031 122.078 14.75 117.484 14.75C116.547 14.75 115.547 14.7812 114.484 14.8438C113.453 14.875 112.203 14.9688 110.734 15.125C109.297 15.25 108.375 15.3281 107.969 15.3594Z" fill="white"/></svg>`;

          const messageNotification = document.createElement("div");
          messageNotification.style = `margin: 10px;display: ${this.utils.inBattle ? "none" : "flex"};color: #fff;padding: 10px;background-color: rgb(244 67 54 / 20%);border: 1px solid rgb(244 67 54);border-radius: 5px;`;
          messageNotification.innerHTML = `<p style="color: #fff; font-size: 12px;">Important: Your click is active, but there is no battle. Waiting...<p/>`

          const contentContainer = document.createElement("div");
          contentContainer.style = `height: calc(100% - ${this.utils.inBattle ? 240 : 145}px); padding: 10px; color: ${colors.lighttext}; font-size: 14px; overflow-y: auto; background: transparent; scrollbar-width: thin; scrollbar-color: rgba(255, 255, 255, 0.3) transparent;`;

          const tabNames = ["Supplies", "Settings"];
          tabNames.forEach((tabName) => {
              const tab = document.createElement("div");
              tab.innerText = tabName;
              tab.style = `cursor: pointer; color: ${colors.darktext}; font-size: 13px;`;
              tab.addEventListener("click", () => {
                  if (tabName === "Settings") {
                      this.createSettingsTab(contentContainer);
                  } else if (tabName === "Supplies") {
                      this.createSuppliesTab(contentContainer);
                  } else {
                      contentContainer.innerHTML = "Nothing here...";
                  }
              });
              tabs.appendChild(tab);

          });

          this.createSuppliesTab(contentContainer);

          uiContainer.appendChild(header);
          uiContainer.appendChild(tabs);
          uiContainer.appendChild(mainLogo);
          //uiContainer.appendChild(messageNotification);
          uiContainer.appendChild(contentContainer);
          document.body.appendChild(uiContainer);
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

      EventListeners() {
          document.addEventListener("keydown", (event) => {
              if (this.utils.isChatOpen) return;

              if (event.key === this.settings.settings.binds.display) {
                  const uiContainer = document.getElementById("arpilot-ui");
                  if (uiContainer) {
                      uiContainer.style.display = uiContainer.style.display === "none" ? "block" : "none";
                  }
              }

              if (event.key === this.settings.settings.binds.mines) {
                  let mine = this.settings.settings.clickState.mine;
                  mine.state = !mine.state;
                  this.settings.saveSettings();
                  this.updateButtonState("mine", mine.state);
                  this.clickMechanic();
              }

              if (event.key === this.settings.settings.binds.supplies) {
                  this.suppliesClickEnabled = !this.suppliesClickEnabled;

                  let supplies = this.settings.settings.clickState.supplies;
                  for (let key in supplies) {
                      this.updateButtonState(key, supplies[key].state);
                  }

                  this.clickMechanic();
              }

          });
      }

      createSettingsTab(content) {
          const settingsContainer = document.createElement("div");
          settingsContainer.style = "display: flex; flex-direction: column; gap: 10px;";

          const styleChangeButton = `background-color: #ffcc00;color: #000;border: none;padding: 5px 10px;border-radius: 3px;text-transform: uppercase;font-size: 11px;font-weight: 500;font-family: BaseFontBold, FallbackFontBold;cursor: pointer;`;
          const styleRestoreButton = `background-color: #F44336;color: #fff;border: none;padding: 5px 10px;border-radius: 3px;text-transform: uppercase;font-size: 11px;font-weight: 500;font-family: BaseFontBold, FallbackFontBold;cursor: pointer;`;

          const devModeContainer = document.createElement("div");
          devModeContainer.style = "display: flex; align-items: center; gap: 10px; flex-direction: column;";

          const antiIDLE = document.createElement("div");
          antiIDLE.style = "width: 100%;display: flex;align-items: center;gap: 10px;justify-content: space-between;border: 1px solid rgba(255, 255, 255, 0.1);border-radius: 5px;padding: 10px;box-sizing: border-box;";

          const antiIDLELabel = document.createElement("label");
          antiIDLELabel.innerText = "Pause Click";
          antiIDLE.appendChild(antiIDLELabel);

          const antiIDLEToggle = document.createElement("input");
          antiIDLEToggle.type = "checkbox";
          antiIDLEToggle.classList.add("ar-dev-checkbox");
          antiIDLEToggle.innerHTML = `<style>input{--primary-color:#1677ff;--secondary-color:#fff; --third-color: rgb(17, 17, 18);--primary-hover-color:#4096ff;--checkbox-diameter:16px;--checkbox-border-radius:5px;--checkbox-border-color:#d9d9d9;--checkbox-border-width:1px;--checkbox-border-style:solid;--checkmark-size:1;appearance:none;-webkit-appearance:none;-moz-appearance:none;width:var(--checkbox-diameter);height:var(--checkbox-diameter);border-radius:var(--checkbox-border-radius);background:var(--third-color);border:var(--checkbox-border-width) var(--checkbox-border-style) var(--checkbox-border-color);transition:.3s;cursor:pointer;position:relative;box-sizing:border-box}input::before{content:"";position:absolute;top:40%;left:50%;width:4px;height:7px;border-right:2px solid var(--secondary-color);border-bottom:2px solid var(--secondary-color);transform:translate(-50%,-50%) rotate(45deg) scale(0);opacity:0;transition:.1s cubic-bezier(.71,-.46,.88,.6),opacity .1s}input::after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;box-shadow:0 0 0 calc(var(--checkbox-diameter) / 2.5) var(--primary-color);border-radius:inherit;opacity:0;transition:.5s cubic-bezier(.12,.4,.29,1.46)}input:hover{border-color:var(--primary-color)}input:checked{background:var(--primary-color);border-color:#fff0}input:checked::before{opacity:1;transform:translate(-50%,-50%) rotate(45deg) scale(var(--checkmark-size));transition:.2s cubic-bezier(.12,.4,.29,1.46) .1s}input:active:not(:checked)::after{transition:none;box-shadow:none;opacity:1}</style><input type="checkbox">`
          antiIDLEToggle.checked = this.settings.settings.antiIDLE;
          antiIDLEToggle.addEventListener("change", () => {
              this.settings.settings.antiIDLE = antiIDLEToggle.checked;
              this.settings.saveSettings();
              this.createSettingsTab(content);
          });

          antiIDLE.appendChild(antiIDLEToggle);
          devModeContainer.appendChild(antiIDLE);

          const devMode = document.createElement("div");
          devMode.style = "width: 100%;display: flex;align-items: center;gap: 10px;justify-content: space-between;border: 1px solid rgba(255, 255, 255, 0.1);border-radius: 5px;padding: 10px;box-sizing: border-box;";

          const devModeLabel = document.createElement("label");
          devModeLabel.innerText = "Developer Mode";
          devMode.appendChild(devModeLabel);

          const devModeToggle = document.createElement("input");
          devModeToggle.type = "checkbox";
          devModeToggle.classList.add("ar-dev-checkbox");
          devModeToggle.innerHTML = `<style>input{--primary-color:#1677ff;--secondary-color:#fff;--primary-hover-color:#4096ff;--checkbox-diameter:16px;--checkbox-border-radius:5px;--checkbox-border-color:#d9d9d9;--checkbox-border-width:1px;--checkbox-border-style:solid;--checkmark-size:1;appearance:none;-webkit-appearance:none;-moz-appearance:none;width:var(--checkbox-diameter);height:var(--checkbox-diameter);border-radius:var(--checkbox-border-radius);background:var(--third-color);border:var(--checkbox-border-width) var(--checkbox-border-style) var(--checkbox-border-color);transition:.3s;cursor:pointer;position:relative;box-sizing:border-box}input::before{content:"";position:absolute;top:40%;left:50%;width:4px;height:7px;border-right:2px solid var(--secondary-color);border-bottom:2px solid var(--secondary-color);transform:translate(-50%,-50%) rotate(45deg) scale(0);opacity:0;transition:.1s cubic-bezier(.71,-.46,.88,.6),opacity .1s}input::after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;box-shadow:0 0 0 calc(var(--checkbox-diameter) / 2.5) var(--primary-color);border-radius:inherit;opacity:0;transition:.5s cubic-bezier(.12,.4,.29,1.46)}input:hover{border-color:var(--primary-color)}input:checked{background:var(--primary-color);border-color:#fff0}input:checked::before{opacity:1;transform:translate(-50%,-50%) rotate(45deg) scale(var(--checkmark-size));transition:.2s cubic-bezier(.12,.4,.29,1.46) .1s}input:active:not(:checked)::after{transition:none;box-shadow:none;opacity:1}</style><input type="checkbox">`
          devModeToggle.checked = this.settings.settings.developerMode;
          devModeToggle.addEventListener("change", () => {
              this.settings.settings.developerMode = devModeToggle.checked;
              this.settings.saveSettings();
              this.createSettingsTab(content);
          });

          devMode.appendChild(devModeToggle);
          devModeContainer.appendChild(devMode);
          settingsContainer.appendChild(devModeContainer);

          const createBindSection = (label, bindName) => {
              const sectionDiv = document.createElement("div");
              sectionDiv.style = "display: flex; align-items: center; gap: 10px; flex-direction: column; padding: 10px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 5px;";

              const displayElements = document.createElement("div");
              displayElements.style = `width: 100%;display: flex; justify-content: space-between;`;

              const labelElement = document.createElement("label");
              labelElement.innerText = label;
              labelElement.style = "width: 120px;";
              displayElements.appendChild(labelElement);

              const keyDisplay = document.createElement("span");
              keyDisplay.innerText = this.settings.settings.binds[bindName] || "Not set";
              keyDisplay.style = "font-weight: bold; color: #f28558;";
              displayElements.appendChild(keyDisplay);

              const btnGroup = document.createElement("div");
              btnGroup.style = `width: 100%;display: flex; justify-content: flex-end; gap: 10px;`;

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

          settingsContainer.appendChild(createBindSection("Display UI", "display"));
          settingsContainer.appendChild(createBindSection("Supplies", "supplies"));
          settingsContainer.appendChild(createBindSection("Mines", "mines"));

          if (this.settings.settings.developerMode) {
              const suppliesContainer = document.createElement("div");
              suppliesContainer.style = "display: flex; flex-direction: column; gap: 10px; margin-top: 10px;";

              const suppliesLabel = document.createElement("h4");
              suppliesLabel.innerText = "Custom Supplies Keybinds";
              suppliesContainer.appendChild(suppliesLabel);

              const allSupplies = { ...this.settings.settings.clickState.supplies, mine: this.settings.settings.clickState.mine, goldbox: this.settings.settings.clickState.goldbox };

              Object.keys(allSupplies).forEach(supply => {
                  const supplyDiv = document.createElement("div");
                  supplyDiv.style = "display: flex; flex-direction: column; align-items: center; padding: 10px; gap: 10px; border-radius: 5px; border: 1px solid rgba(255, 255, 255, 0.1);";

                  const supplyTextGroup = document.createElement("div");
                  supplyTextGroup.style = `width: 100%; display: flex; justify-content: space-between; gap: 10px;`;

                  const supplyLabel = document.createElement("label");
                  supplyLabel.innerText = allSupplies[supply].name;
                  supplyLabel.style = "width: 120px;";
                  supplyTextGroup.appendChild(supplyLabel);

                  const keyDisplay = document.createElement("span");
                  keyDisplay.innerText = allSupplies[supply].key !== undefined ? allSupplies[supply].key : "Not set";
                  keyDisplay.style = "font-weight: bold; color: #f28558;";
                  supplyTextGroup.appendChild(keyDisplay);
                  supplyDiv.appendChild(supplyTextGroup);

                  const supplyBtnGroup = document.createElement("div");
                  supplyBtnGroup.style = `width: 100%; display: flex; justify-content: flex-end; gap: 10px;`;

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
              display: "0",
              supplies: "8",
              mines: "9",
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
          suppliesContainer.style = "display: flex; flex-direction: column; gap: 10px;";

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

          const supplyItem = document.createElement("div");
          supplyItem.style = `display: flex; align-items: center; justify-content: space-between;padding: 5px; border-radius: 5px;`;

          const icon = document.createElement("img");
          icon.src = this.suppliesIcon[normalizedKey]?.icon || "";
          icon.style = "width: 24px; height: 24px;";

          const name = document.createElement("span");
          let formattedKey = originalKey;
          if (formattedKey === "doublearmor" || formattedKey === "armor") {
              formattedKey = "doublearmor";
          } else if (formattedKey === "doubledamage" || formattedKey === "damage") {
              formattedKey = "doubledamage";
          } else if (formattedKey === "speed" || formattedKey === "nitro") {
              formattedKey = "nitro";
          }
          if (this.settings.settings.clickState.supplies.hasOwnProperty(formattedKey)) {
              name.innerText = this.settings.settings.clickState.supplies[formattedKey].name;
          } else if (this.settings.settings.clickState.hasOwnProperty(formattedKey)) {
              name.innerText = this.settings.settings.clickState[formattedKey].name;
          } else {
              name.innerText = "Unknown";
          }
          name.style = "flex-grow: 1; margin-left: 10px; color: white;";

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

          toggleButton.style = `color: white;border: none;padding: 5px 10px;border-radius: 3px;cursor: pointer;transition: background 0.5s ease;`;

          toggleButton.addEventListener("click", () => {
              supply.state = !supply.state;
              updateButtonState();
              this.settings.saveSettings();
              this.clickMechanic();
          });

          document.head.insertAdjacentHTML("beforeend", `<style>@keyframes blink {0% { opacity: 1; }100% { opacity: 0.6; }}</style>`);
          updateButtonState();

          const controlsContainer = document.createElement("div");
          controlsContainer.style = "display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 5px; border-top: 1px solid rgba(255, 255, 255, 0.1);";

          const rangeInput = document.createElement("input");
          rangeInput.type = "range";
          rangeInput.classList.add("custom-range");
          rangeInput.min = "1";
          rangeInput.max = "500";
          rangeInput.value = supply.delay;
          rangeInput.style.width = "calc(100% - 100px)";
          rangeInput.style.height = "4px";
          rangeInput.style.backgroundColor = "#ddd";
          rangeInput.style.border = "none";
          rangeInput.style.setProperty("--thumb-size", "14px");
          rangeInput.style.setProperty("--thumb-color", "rgb(255, 188, 9)");
          rangeInput.style.webkitAppearance = "none";
          rangeInput.style.MozAppearance = "none";
          rangeInput.style.cursor = "pointer";

          function updateRangeColor() {
              const percent = (rangeInput.value / rangeInput.max) * 100;
              rangeInput.style.background = `linear-gradient(to right, rgb(255, 188, 9) 0%, rgb(255, 188, 9) ${percent}%, rgba(255, 255, 255, 0.1) ${percent}%, rgba(255, 255, 255, 0.1) 100%)`;
          }

          rangeInput.addEventListener("input", updateRangeColor);
          updateRangeColor();

          const style = document.createElement("style");
          style.textContent = `
          .custom-range {-webkit-appearance: none;appearance: none;width: 100px;height: 6px;background: linear-gradient(to right, rgb(255, 188, 9) 0%, rgb(255, 188, 9) 12%, rgba(255, 255, 255, 0.1) 12%, rgba(255, 255, 255, 0.1) 100%);border-radius: 3px;outline: none;transition: background 0.15s ease-in-out;}
          .custom-range::-webkit-slider-thumb {-webkit-appearance: none;appearance: none;width: 14px;height: 14px;background: rgb(255, 188, 9);border-radius: 50%;cursor: pointer;border: none;box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);}
          .custom-range::-moz-range-thumb {width: 14px;height: 14px;background: rgb(255, 188, 9);border-radius: 50%;cursor: pointer;border: none;box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);}`;
          document.head.appendChild(style);

          const numberLabel = document.createElement("label");
          numberLabel.style = `color: #fff; font-size: 12px;`;
          numberLabel.textContent = `MS`;

          const numberInput = document.createElement("input");
          numberInput.type = "number";
          numberInput.min = "1";
          numberInput.max = "500";
          numberInput.value = supply.delay;
          numberInput.style = "width: 50px; padding: 8px; border: 1px solid rgba(255, 255, 255, 0.10); border-radius: 5px; background-color: #111112; color: #d1d1d1;";
          numberInput.addEventListener("input", () => {
              supply.delay = parseInt(numberInput.value);
              rangeInput.value = supply.delay;
              this.settings.saveSettings();
          });
          numberInput.addEventListener("keydown", (event) => event.stopPropagation());

          rangeInput.addEventListener("input", () => {
              supply.delay = parseInt(rangeInput.value);
              numberInput.value = supply.delay;
              updateRangeColor();
              this.settings.saveSettings();
          });
          rangeInput.addEventListener("keydown", (event) => event.stopPropagation());

          numberInput.addEventListener("input", () => {
              rangeInput.value = numberInput.value;
              supply.delay = parseInt(numberInput.value);
              updateRangeColor();
              this.settings.saveSettings();
          });

          controlsContainer.appendChild(rangeInput);
          controlsContainer.appendChild(numberLabel);
          controlsContainer.appendChild(numberInput);

          if (key === "mine" || key === "mines") {
              const numberLabel = document.createElement("label");
              numberLabel.style = `color: #fff; font-size: 12px;`;
              numberLabel.textContent = `MULT`;

              const multiplierInput = document.createElement("input");
              multiplierInput.type = "number";
              multiplierInput.min = "1";
              multiplierInput.max = "500";
              multiplierInput.value = supply.multiplier;
              multiplierInput.style = "width: 50px;padding: 8px;border: 1px solid rgba(255, 255, 255, 0.10);border-radius: 5px;background-color: #111112;color: #d1d1d1;";
              multiplierInput.addEventListener("input", () => {
                  supply.multiplier = Math.max(1, parseInt(multiplierInput.value));
                  this.settings.saveSettings();
              });
              multiplierInput.addEventListener("keydown", (event) => event.stopPropagation());

              controlsContainer.appendChild(numberLabel);
              controlsContainer.appendChild(multiplierInput);
          }

          supplyItem.appendChild(icon);
          supplyItem.appendChild(name);
          supplyItem.appendChild(toggleButton);

          const supplyWrapper = document.createElement("div");
          supplyWrapper.style = `border: 1px solid rgba(255, 255, 255, 0.10);border-radius: 5px;`;
          supplyWrapper.appendChild(supplyItem);

          supplyWrapper.appendChild(controlsContainer);
          suppliesContainer.appendChild(supplyWrapper);
      }

      updateUI(inBattle) {
          if (this.messageNotification) {
              this.messageNotification.style.display = inBattle ? "none" : "flex";
          }
          if (this.contentContainer) {
              this.contentContainer.style.height = `calc(100% - ${inBattle ? 240 : 145}px)`;
          }
      }

      antiIDLE() {
          this.antiIdlePaused = false;

          const fadeOut = (el) => {
              el.style.transition = 'opacity 0.3s ease';
              el.style.opacity = '0';
              setTimeout(() => {
                  el.style.pointerEvents = 'none';
              }, 300);
          };

          const isInactivityDialog = (el) => {
              if (!el) return false;

              const text = el.innerText?.toLowerCase() || '';
              return text.includes('você foi pausado') || text.includes('inatividade') || text.includes('kick');
          };

          const hasInteractiveElements = (el) => {
              return el.querySelector('input, button, textarea, select');
          };

          const handleIdleBypass = () => {
              if (this.antiIdlePaused || !this.utils.inBattle || !this.settings.settings.antiIDLE) return;

              const pauseDialog = document.querySelector(".DialogContainerComponentStyle-container");
              const modalRoot = document.querySelector(".ModalStyle-rootHover");
              const kickOutModal = document.querySelector("#modal-root > div");

              if (pauseDialog && isInactivityDialog(pauseDialog) && !hasInteractiveElements(pauseDialog)) {
                  fadeOut(pauseDialog);
              }

              if (modalRoot && isInactivityDialog(modalRoot) && !hasInteractiveElements(modalRoot)) {
                  fadeOut(modalRoot);
              }

              if (kickOutModal && isInactivityDialog(kickOutModal) && !hasInteractiveElements(kickOutModal)) {
                  kickOutModal.click();
              }
          };

          const mainObserver = new MutationObserver(handleIdleBypass);
          mainObserver.observe(document.body, {
              childList: true,
              subtree: true,
          });

          const garageObserver = new MutationObserver(() => {
              const garage = document.querySelector(".GarageCommonStyle-garageContainer");

              const visible = garage && getComputedStyle(garage).opacity !== "0" && garage.offsetParent !== null;
              this.antiIdlePaused = visible;
          });

          garageObserver.observe(document.body, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ['style', 'class']
          });

          this.idleObserver = mainObserver;
          this.garageObserver = garageObserver;
      }

      clickMechanic() {
          if (!this.utils.inBattle) return;

          const pressKey = (key) => {
              let keyCode = key.length === 1 ? `Key${key.toUpperCase()}` : key;
              const keyDownEvent = new KeyboardEvent("keydown", {
                  code: keyCode,
                  key: key,
                  bubbles: true,
                  cancelable: true,
              });
              document.dispatchEvent(keyDownEvent);

              const keyUpEvent = new KeyboardEvent("keyup", {
                  code: keyCode,
                  key: key,
                  bubbles: true,
                  cancelable: true,
              });
              document.dispatchEvent(keyUpEvent);
          };

          const startAutoclicking = (supply) => {
              if (supply.animationFrameId) {
                  cancelAnimationFrame(supply.animationFrameId);
              }

              if (!supply.timeouts) {
                  supply.timeouts = [];
              }

              let lastExecutionTime = performance.now();

              const autoclickLoop = (currentTime) => {
                  if (!supply.state) {
                      stopAutoclicking(supply);
                      return;
                  }

                  const elapsedTime = currentTime - lastExecutionTime;
                  if (elapsedTime >= supply.delay) {
                      lastExecutionTime = currentTime;

                      for (let i = 0; i < (supply.multiplier ?? 1); i++) {
                          const timeoutId = setTimeout(() => {
                              if (supply.state) {
                                  const keyToPress = supply.key;
                                  if (keyToPress) {
                                      pressKey(keyToPress);
                                  } else {
                                      console.warn(`Tecla não definida para ${supply.name}`);
                                  }
                              }
                          }, i * 20);

                          supply.timeouts.push(timeoutId);
                      }
                  }

                  supply.animationFrameId = requestAnimationFrame(autoclickLoop);
              };

              supply.animationFrameId = requestAnimationFrame(autoclickLoop);
          };

          const stopAutoclicking = (supply) => {
              if (supply.animationFrameId) {
                  cancelAnimationFrame(supply.animationFrameId);
                  supply.animationFrameId = null;
              }

              if (supply.timeouts) {
                  supply.timeouts.forEach(clearTimeout);
                  supply.timeouts = [];
              }
          };

          Object.values(this.settings.settings.clickState.supplies).forEach(supply => {
              if (this.suppliesClickEnabled && supply.state) {
                  startAutoclicking(supply);
              } else {
                  stopAutoclicking(supply);
              }
          });

          const mine = this.settings.settings.clickState.mine;
          if (mine.state) {
              startAutoclicking(mine);
          } else {
              stopAutoclicking(mine);
          }

          const goldbox = this.settings.settings.clickState.goldbox;
          if (goldbox.state) {
              startAutoclicking(goldbox);
          } else {
              stopAutoclicking(goldbox);
          }
      }
  }

  const utils = new Utils();
  const settings = new Settings();
  const arpilot = new ARpilot(settings, utils);
})();