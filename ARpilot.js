(function () {
  "use strict";

  function template(html) {
    const temp = document.createElement("template");
    temp.innerHTML = html.trim();
    return temp.content.firstChild;
  }

  function createSignal(initialValue) {
    let value = initialValue;
    const subscribers = [];
    const set = (newValue) => {
      value = newValue;
      subscribers.forEach((callback) => callback(value));
    };
    const get = () => value;
    const subscribe = (callback) => {
      subscribers.push(callback);
      callback(value);
    };
    return [get, set, subscribe];
  }

  function SuppliesUI(hotkeys) {
    const supplies = [
      {
        key: "FIRST_AID",
        color: "#BFE500",
        digit: 1,
        isActive: false,
      },
      {
        key: "DOUBLE_ARMOR",
        color: "#EADC99",
        amount: 2,
        digit: 2,
        isActive: false,
      },
      {
        key: "DOUBLE_DAMAGE",
        color: "#FF3333",
        amount: 3,
        digit: 3,
        isActive: false,
      },
      {
        key: "NITRO",
        color: "#FFFF00",
        amount: 4,
        digit: 4,
        isActive: false,
      },
      {
        key: "MINE",
        color: "#36B24A",
        amount: 5,
        digit: 5,
        isActive: false,
        multiplier: 1,
      },
      {
        key: "GOLD_BOX",
        color: "#FFBD00",
        amount: 6,
        digit: 6,
        isActive: false,
      },
    ];

    const container = template(
      `<div class="supply-container" style="display: flex; flex-direction: column; gap: 10px;"></div>`
    );

    supplies.forEach((supply) => {
      const supplyElement = template(`
            <div class="supply" style="display: flex; align-items: center; background-color: rgb(26 26 26 / 84%); padding: 10px; border: 1px solid rgb(53 53 53); border-radius: 5px; transition: all 0.3s;">
                <div class="icon" style="background-color: ${
                  supply.color
                }; width: 20px; height: 20px; margin-right: 10px; border-radius: 50%;"></div>
                <input type="range" min="1" max="1000" value="300"
                    style="flex-grow: 1; margin-right: 10px; border: 1px solid #4C0000; border-radius: 5px; background-color: rgba(255, 255, 255, 0.8);"
                    class="ms-range">
                <div class="input-group" style="display: flex; align-items: center; margin-right: 10px; font-size: 10px;">
                    <span style="padding: 2px 5px; background-color: #000;">MS</span>
                    <input type="number" value="300" min="1" max="1000"
                        style="width: 60px; border: none; outline: none; text-align: center; background-color: #353535; color: #ead7d7; padding: 4px;"
                        class="ms-input">
                </div>
                ${
                  supply.key === "MINE"
                    ? `
                <div class="input-group" style="display: flex; align-items: center; margin-right: 10px; font-size: 10px;">
                    <span style="padding: 2px 5px; background-color: #000; ">MULT</span>
                    <input type="number" value="1" min="1" max="10"
                        style="width: 60px; border: none; outline: none; text-align: center; background-color: #353535; color: #ead7d7; padding: 4px;"
                        class="multiply-input" title="Multiplier">
                </div>
                `
                    : ""
                }
                <span style="font-weight: bold; color: white;">${
                  supply.key
                }</span>
                <button class="activate-button"
                    style="margin-left: 10px; padding: 5px 10px; border: none; border-radius: 5px; background-color: #B22222; color: white; cursor: pointer; transition: background-color 0.3s;">
                    Activate
                </button>
            </div>
        `);

      const rangeInput = supplyElement.querySelector(".ms-range");
      rangeInput.style.height = "6px";
      rangeInput.style.backgroundColor = "#ddd";
      rangeInput.style.border = "none";
      rangeInput.style.setProperty("--thumb-size", "16px");
      rangeInput.style.setProperty("--thumb-color", "#4C0000");
      rangeInput.style.webkitAppearance = "none";
      rangeInput.style.MozAppearance = "none";

      const style = document.createElement("style");
      style.textContent = `
            .ms-range::-webkit-slider-thumb {
            width: 15px;
            height: 15px;
            background-color: rgb(255, 188, 9);
            border-radius: 50%;
            cursor: pointer;
            -webkit-appearance: none;
            }

            .ms-range::-moz-range-thumb {
            width: 15px;
            height: 15px;
            background-color: rgb(255, 188, 9);
            border-radius: 50%;
            cursor: pointer;
            }

            .ms-input,
    .multiply-input {
        -moz-appearance: textfield;
    }

    .ms-input::-webkit-inner-spin-button,
    .ms-input::-webkit-outer-spin-button,
    .multiply-input::-webkit-inner-spin-button,
    .multiply-input::-webkit-outer-spin-button {
        appearance: auto;
        -webkit-appearance: auto;
        background: transparent;
        color: white;
        filter: invert(1); /* Deixa as setas brancas */
    }
            `;
      document.head.appendChild(style);

      const numberInput = supplyElement.querySelector(".ms-input");
      const multiplyInput = supplyElement.querySelector(".multiply-input");

      const button = supplyElement.querySelector(".activate-button");
      let autoclickingInterval = null;

      rangeInput.addEventListener("input", function () {
        const percent = (this.value / this.max) * 100;
        this.style.background = `linear-gradient(to right, rgb(255, 188, 9) 0%, rgb(255, 188, 9) ${percent}%, rgba(255, 255, 255, 0.1) ${percent}%, rgba(255, 255, 255, 0.1) 100%)`;
      });

      function updateRangeColor() {
        const percent = (rangeInput.value / rangeInput.max) * 100;
        rangeInput.style.background = `linear-gradient(to right, rgb(255, 188, 9) 0%, rgb(255, 188, 9) ${percent}%, rgba(255, 255, 255, 0.1) ${percent}%, rgba(255, 255, 255, 0.1) 100%)`;
      }

      updateRangeColor();
      rangeInput.addEventListener("input", updateRangeColor);

      rangeInput.addEventListener("mousedown", (e) => {
        e.stopPropagation();
      });

      [numberInput, multiplyInput].forEach((inp) => {
        if (inp) {
          inp.addEventListener("keydown", (e) => {
            e.stopPropagation();
          });
        }
      });

      const startAutoclicking = () => {
        const delay = Number(numberInput.value);
        const multiplier = multiplyInput ? Number(multiplyInput.value) : 1;
        autoclickingInterval = setInterval(() => {
          for (let i = 0; i < multiplier; i++) {
            pressKey(supply.digit);
          }
        }, delay);
      };

      const stopAutoclicking = () => {
        if (autoclickingInterval) {
          clearInterval(autoclickingInterval);
          autoclickingInterval = null;
        }
      };

      const updateSpeed = () => {
        if (supply.isActive) {
          stopAutoclicking();
          startAutoclicking();
        }
      };

      const toggleActivation = () => {
        if (supply.isActive) {
          stopAutoclicking();
          supply.isActive = false;
          button.style.backgroundColor = "#B22222";
          button.textContent = "Activate";
        } else {
          supply.isActive = true;
          button.style.backgroundColor = "#FF0000";
          button.textContent = "Deactivate";
          startAutoclicking();
        }
      };

      rangeInput.addEventListener("input", () => {
        numberInput.value = rangeInput.value;
        updateSpeed();
        updateRangeColor();
      });

      numberInput.addEventListener("input", () => {
        rangeInput.value = numberInput.value;
        updateSpeed();
        updateRangeColor();
      });

      if (multiplyInput) {
        multiplyInput.addEventListener("input", updateSpeed);
      }

      button.addEventListener("click", toggleActivation);
      supply.button = button;
      supply.startAutoclicking = startAutoclicking;
      supply.stopAutoclicking = stopAutoclicking;

      container.appendChild(supplyElement);
    });

    return { supplies, container };
  }

  function pressKey(digit) {
    const keyCode = `Digit${digit}`;
    const keyDownEvent = new KeyboardEvent("keydown", {
      code: keyCode,
      key: digit.toString(),
      keyCode: digit,
      which: digit,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(keyDownEvent);
    const keyUpEvent = new KeyboardEvent("keyup", {
      code: keyCode,
      key: digit.toString(),
      keyCode: digit,
      which: digit,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(keyUpEvent);
  }

  function makeDraggable(element) {
    let offsetX, offsetY;

    const mouseDownHandler = function (e) {
      offsetX = e.clientX - element.getBoundingClientRect().left;
      offsetY = e.clientY - element.getBoundingClientRect().top;

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    };

    const mouseMoveHandler = function (e) {
      element.style.left = `${e.clientX - offsetX}px`;
      element.style.top = `${e.clientY - offsetY}px`;
    };

    const mouseUpHandler = function () {
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };

    element.addEventListener("mousedown", mouseDownHandler);
  }

  function mainComponent(isVisible, setIsVisible, hotkeys) {
    const updateDisplay = () => {
      element.style.display = isVisible() ? "block" : "none";
    };

    const toggleVisibility = (event) => {
      if (event.code === "Digit0") {
        setIsVisible(!isVisible());
        updateDisplay();
      }
    };

    document.addEventListener("keyup", toggleVisibility);

    const element = template(`
        <div class="app-ui" style="display: ${
          isVisible() ? "block" : "none"
        }; position: absolute; top: 10%; left: 10%; background-color: rgb(3 8 13 / 78%); backdrop-filter: blur(5px); border: 1px solid rgb(53 53 53); padding: 10px; border-radius: 10px; box-shadow: 0 2px 20px rgba(0, 0, 0, 0.5); z-index: 1000;">
            <h2 style="text-align: center; font-family: Arial, sans-serif; color: white;"><svg width="140" height="69" viewBox="0 0 140 69" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M48.2969 42.6875C44.5469 42.8125 41.7969 42.875 40.0469 42.875C37.3594 42.875 33.6406 42.8125 28.8906 42.6875C27.8906 43.7812 26.6719 45.0781 25.2344 46.5781C23.7969 48.0469 22.4375 49.4219 21.1562 50.7031C19.875 51.9531 18.7656 53.0312 17.8281 53.9375C16.9219 54.8125 16.1719 55.5469 15.5781 56.1406C12.1094 59.5156 9.84375 61.7188 8.78125 62.75C7.75 63.7812 6.65625 64.7031 5.5 65.5156C4.34375 66.3594 3.28125 66.7812 2.3125 66.7812C1.21875 66.7812 0.671875 66.2812 0.671875 65.2812C0.671875 64.1875 1.45312 62.5 3.01562 60.2188C4.57812 57.9375 6.34375 55.9219 8.3125 54.1719C10.2812 52.4219 11.8906 51.5469 13.1406 51.5469C13.4844 51.5469 13.9688 51.7031 14.5938 52.0156L23.5 42.5C22.375 42.3438 20.9062 42.25 19.0938 42.2188C17.2812 42.1562 16.0625 42.0156 15.4375 41.7969C14.8125 41.5781 14.5 41.0469 14.5 40.2031C14.5 38.8594 15.9375 36.75 18.8125 33.875C20.375 32.2812 21.8438 31.2656 23.2188 30.8281C24.5938 30.3906 27.2188 30.1562 31.0938 30.125C28.8125 30.4375 27.1875 30.8125 26.2188 31.25C25.2812 31.6562 24.7656 32.2812 24.6719 33.125C25.5781 33.125 26.4062 33.125 27.1562 33.125C27.9375 33.125 28.9375 33.125 30.1562 33.125C31.4062 33.0938 32.3281 33.0625 32.9219 33.0312C38.0469 28.0312 42.7031 23.6875 46.8906 20C51.0781 16.2812 55.4844 12.7656 60.1094 9.45312C64.7656 6.10938 69.7188 3.04688 74.9688 0.265625C76 1.60938 76.5156 3.01562 76.5156 4.48438C76.5156 5.70312 76.1094 7.10938 75.2969 8.70312C74.5156 10.2969 72.8281 13.2969 70.2344 17.7031C67.6719 22.0781 65.0625 26.7344 62.4062 31.6719C63.2812 31.6719 64 31.6875 64.5625 31.7188C65.1562 31.7188 65.7812 31.7344 66.4375 31.7656C68.2188 31.7656 69.2969 31.7969 69.6719 31.8594C70.0781 31.9219 70.2812 32.2344 70.2812 32.7969C70.2812 33.0469 70.0312 33.5 69.5312 34.1562C69.0625 34.7812 68.2188 35.8438 67 37.3438C65.7812 38.8125 64.5938 40.3125 63.4375 41.8438L56.5469 42.4062C52.8906 49.2812 51.0625 53.1562 51.0625 54.0312C51.0625 55.3125 51.7344 55.9531 53.0781 55.9531C53.7344 55.9531 56.4531 54.5781 61.2344 51.8281L60.8594 54.3125C58.2969 56.25 56.2969 57.7812 54.8594 58.9062C53.4531 60 52.2188 60.9219 51.1562 61.6719C50.125 62.3906 49.1719 62.9219 48.2969 63.2656C47.4531 63.6406 46.5938 63.8281 45.7188 63.8281C44.6875 63.8281 43.6719 63.3438 42.6719 62.375C41.6719 61.4375 41.1719 60.0938 41.1719 58.3438C41.1719 57.625 41.4375 56.6094 41.9688 55.2969C42.5 53.9531 43.0625 52.6719 43.6562 51.4531C44.2812 50.2344 45.8281 47.3125 48.2969 42.6875ZM39.4375 32.0469L54.625 31.7656C56.4062 28.7344 57.8438 26.2812 58.9375 24.4062C60.0625 22.5312 61.2812 20.5 62.5938 18.3125C63.9375 16.0938 65.0781 14.2188 66.0156 12.6875C66.9844 11.1562 68.0469 9.42188 69.2031 7.48438C66.9531 8.89062 64.6562 10.4531 62.3125 12.1719C59.9688 13.8906 57.3281 15.9688 54.3906 18.4062C51.4531 20.8125 48.8438 23.0625 46.5625 25.1562C44.2812 27.2188 41.9062 29.5156 39.4375 32.0469ZM103.844 57.6875L86.1719 49.0625C81.6719 55.2188 79.1562 59.2812 78.625 61.25C78.25 62.6562 77.4062 63.8281 76.0938 64.7656C74.8125 65.7344 73.8906 66.2188 73.3281 66.2188C71.7344 66.2188 70.9375 65.6094 70.9375 64.3906C70.9375 63.7031 71.875 61.7344 73.75 58.4844C75.6562 55.2031 78.2656 51.3438 81.5781 46.9062C79.7344 46.1562 78.5938 45.6562 78.1562 45.4062C77.7188 45.1562 77.5469 44.6875 77.6406 44C77.7344 43.2812 78.2812 42.1719 79.2812 40.6719C80.1562 39.3594 80.8125 38.4844 81.25 38.0469C81.6875 37.5781 82.2031 37.2188 82.7969 36.9688C83.3906 36.6875 84.0156 36.5 84.6719 36.4062C85.3281 36.3125 87.1719 36.0781 90.2031 35.7031C92.6719 32.3594 95.3438 28.75 98.2188 24.875C101.125 21 103.391 17.9844 105.016 15.8281C100.109 16.4844 96.6875 17.0312 94.75 17.4688C92.6875 17.875 90.9531 18.2188 89.5469 18.5C88.1719 18.75 87.2031 18.9844 86.6406 19.2031C86.0781 19.3906 85.7969 19.6719 85.7969 20.0469C85.7969 20.3906 86.1406 20.625 86.8281 20.75C87.5156 20.875 88.375 20.9375 89.4062 20.9375C90.4688 20.9375 91.2812 20.9844 91.8438 21.0781C92.4375 21.1406 92.7344 21.3125 92.7344 21.5938C92.7344 21.9062 92.3438 22.0938 91.5625 22.1562C90.8125 22.1875 88.6719 22.2812 85.1406 22.4375C83.1406 22.5 81.4531 22.5625 80.0781 22.625C78.7344 22.6875 77.7969 22.7188 77.2656 22.7188C76.5469 22.7188 75.9844 22.5 75.5781 22.0625C75.1719 21.625 74.9688 21.0469 74.9688 20.3281C74.9688 19.7969 75.2656 18.8125 75.8594 17.375C76.4531 15.9375 77.2969 14.4844 78.3906 13.0156C79.4844 11.5469 80.7344 10.4062 82.1406 9.59375C83.7344 8.625 86.2031 7.65625 89.5469 6.6875C92.9219 5.6875 96.6562 4.89062 100.75 4.29688C104.875 3.67188 108.953 3.35938 112.984 3.35938C115.422 3.35938 117.797 3.5 120.109 3.78125C122.453 4.0625 124.562 4.40625 126.438 4.8125C128.344 5.21875 129.844 5.625 130.938 6.03125C133.781 6.96875 135.953 8.39062 137.453 10.2969C138.984 12.2031 139.75 14.2969 139.75 16.5781C139.75 18.7969 139.359 20.9688 138.578 23.0938C137.828 25.1875 136.656 27.1406 135.062 28.9531C133.5 30.7344 131.609 32.1875 129.391 33.3125C127.578 34.25 124.828 35.2031 121.141 36.1719C117.453 37.1406 113 38 107.781 38.75C102.562 39.5 96.7344 40.0469 90.2969 40.3906C95.1094 42.0781 99.5938 43.7812 103.75 45.5C107.938 47.1875 111.453 48.7031 114.297 50.0469C117.172 51.3594 119.422 52.4375 121.047 53.2812C123.328 54.4688 124.812 55.3281 125.5 55.8594C126.188 56.3906 126.641 57.0781 126.859 57.9219C127.078 58.7656 127.188 60.1562 127.188 62.0938C127.188 64.2812 127.047 65.8906 126.766 66.9219C126.516 67.9844 125.953 68.5156 125.078 68.5156C124.797 68.5156 124.047 68.2031 122.828 67.5781C121.641 66.9844 119.984 66.0938 117.859 64.9062C115.734 63.75 113.797 62.7188 112.047 61.8125C110.328 60.875 107.594 59.5 103.844 57.6875ZM107.969 15.3594C108 15.5781 108.016 15.7812 108.016 15.9688C108.047 16.1562 108.062 16.4219 108.062 16.7656C108.062 17.6406 107.781 18.6562 107.219 19.8125C106.688 20.9375 105.984 22.1094 105.109 23.3281C104.266 24.5156 102.984 26.2344 101.266 28.4844C99.5781 30.7031 98.0156 32.75 96.5781 34.625C103.141 33.375 108.734 32.1719 113.359 31.0156C118.016 29.8594 121.844 28.7031 124.844 27.5469C127.844 26.3594 130.094 25.125 131.594 23.8438C133.125 22.5312 133.891 21.1719 133.891 19.7656C133.891 18.2031 132.297 16.9844 129.109 16.1094C125.953 15.2031 122.078 14.75 117.484 14.75C116.547 14.75 115.547 14.7812 114.484 14.8438C113.453 14.875 112.203 14.9688 110.734 15.125C109.297 15.25 108.375 15.3281 107.969 15.3594Z" fill="white"/>
</svg></h2>
            <label style="color: white; display: flex; align-items: center; margin-bottom: 5px;">
                <input type="checkbox" id="draggableCheckbox" checked />
                Draggable
            </label>
            <div class="supplies-section" style="margin-bottom: 10px;"></div>
            <div class="hotkeys-section" style="color: white; width: 100%; display: flex; flex-direction: column; gap: 10px;">
    <div style="text-align: center; font-weight: bold;">Toggle UI - Set as 0</div>

    <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>Supplies - <span class="supplies-hotkey">${
          hotkeys.supplies || "Hotkey currently unset"
        }</span></span>
        <button class="set-supplies-hotkey"
            style="padding: 5px 10px; border: none; border-radius: 5px; background-color: black; color: white; cursor: pointer; transition: background-color 0.3s;">
            Set Hotkey
        </button>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>Mines - <span class="mining-hotkey">${
          hotkeys.mining || "Hotkey currently unset"
        }</span></span>
        <button class="set-mining-hotkey"
            style="padding: 5px 10px; border: none; border-radius: 5px; background-color: black; color: white; cursor: pointer; transition: background-color 0.3s;">
            Set Hotkey
        </button>
    </div>
</div>

        </div>
    `);

    const draggableCheckbox = element.querySelector("#draggableCheckbox");

    // Criando o elemento checkbox
    draggableCheckbox.style.appearance = "none";
    draggableCheckbox.style.width = "18px";
    draggableCheckbox.style.height = "18px";
    draggableCheckbox.style.border = "2px solid white";
    draggableCheckbox.style.borderRadius = "4px";
    draggableCheckbox.style.backgroundColor = "#222";
    draggableCheckbox.style.cursor = "pointer";
    draggableCheckbox.style.display = "inline-block";
    draggableCheckbox.style.marginRight = "5px";
    draggableCheckbox.style.position = "relative";
    draggableCheckbox.style.transition = "all 0.3s";

    // Criando um elemento para o checkmark
    const checkmark = document.createElement("span");
    checkmark.style.position = "absolute";
    checkmark.style.top = "50%";
    checkmark.style.left = "50%";
    checkmark.style.transform = "translate(-50%, -50%)";
    checkmark.style.fontSize = "12px";
    checkmark.style.color = "white";
    checkmark.style.display = "none"; // Inicialmente escondido
    checkmark.textContent = "✔"; // O checkmark em si
    draggableCheckbox.appendChild(checkmark);

    // Função para alternar o estado
    draggableCheckbox.addEventListener("change", function () {
      if (draggableCheckbox.checked) {
        draggableCheckbox.style.backgroundColor = "rgb(255 188 9 / 35%)";
        draggableCheckbox.style.borderColor = "rgb(255 188 9)";
        checkmark.style.display = "block"; // Exibe o checkmark quando marcado
      } else {
        draggableCheckbox.style.backgroundColor = "#222";
        draggableCheckbox.style.borderColor = "white";
        checkmark.style.display = "none"; // Esconde o checkmark quando não marcado
      }
    });

    if (draggableCheckbox.checked) {
      draggableCheckbox.style.backgroundColor = "rgb(255 188 9 / 35%)";
      draggableCheckbox.style.borderColor = "rgb(255 188 9)";
      checkmark.style.display = "block"; // Exibe o checkmark se já estiver marcado
    }

    const makeDraggable = () => {
      let offsetX, offsetY;
      let isDragging = false;

      const mouseDownHandler = function (e) {
        if (draggableCheckbox.checked) {
          isDragging = true;
          offsetX = e.clientX - element.getBoundingClientRect().left;
          offsetY = e.clientY - element.getBoundingClientRect().top;
          element.style.cursor = "grabbing";
        }
      };

      const mouseMoveHandler = function (e) {
        if (isDragging) {
          element.style.left = `${e.clientX - offsetX}px`;
          element.style.top = `${e.clientY - offsetY}px`;
        }
      };

      const mouseUpHandler = function () {
        isDragging = false;
        element.style.cursor = "move";
      };

      element.addEventListener("mousedown", mouseDownHandler);
      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);

      draggableCheckbox.addEventListener("change", (e) => {
        if (!e.target.checked) {
          element.removeEventListener("mousedown", mouseDownHandler);
          document.removeEventListener("mousemove", mouseMoveHandler);
          document.removeEventListener("mouseup", mouseUpHandler);
        } else {
          element.addEventListener("mousedown", mouseDownHandler);
          document.addEventListener("mousemove", mouseMoveHandler);
          document.addEventListener("mouseup", mouseUpHandler);
        }
      });
    };

    makeDraggable();

    const suppliesHotkeyElement = element.querySelector(".supplies-hotkey");
    const miningHotkeyElement = element.querySelector(".mining-hotkey");

    const changeHotkey = (hotkeyElement, setHotkeyFunction) => {
      const listener = (event) => {
        if (event.key.length === 1 || event.key === "Shift") {
          const newHotkey = event.key.toLowerCase();
          hotkeyElement.textContent = newHotkey;
          setHotkeyFunction(newHotkey);
          document.removeEventListener("keydown", listener);
        }
      };
      document.addEventListener("keydown", listener);
    };

    element
      .querySelector(".set-supplies-hotkey")
      .addEventListener("click", () => {
        suppliesHotkeyElement.textContent = "Press a key...";
        changeHotkey(suppliesHotkeyElement, (newHotkey) => {
          hotkeys.supplies = newHotkey;
          console.log(`Supplies hotkey changed to: ${newHotkey}`);
        });
      });

    element
      .querySelector(".set-mining-hotkey")
      .addEventListener("click", () => {
        miningHotkeyElement.textContent = "Press a key...";
        changeHotkey(miningHotkeyElement, (newHotkey) => {
          hotkeys.mining = newHotkey;
          console.log(`Mining hotkey changed to: ${newHotkey}`);
        });
      });

    const suppliesData = SuppliesUI(hotkeys);
    element
      .querySelector(".supplies-section")
      .appendChild(suppliesData.container);

    updateDisplay();

    return { element, suppliesData, hotkeys };
  }

  function render(Component, container, isVisible, setIsVisible, hotkeys) {
    const { element, suppliesData } = Component(
      isVisible,
      setIsVisible,
      hotkeys
    );
    container.appendChild(element);

    document.addEventListener("keydown", (event) => {
      let supplyToToggle;

      if (event.key.toLowerCase() === hotkeys.supplies) {
        const suppliesToActivate = [
          "FIRST_AID",
          "DOUBLE_ARMOR",
          "DOUBLE_DAMAGE",
          "NITRO",
        ];
        suppliesToActivate.forEach((key) => {
          supplyToToggle = suppliesData.supplies.find((s) => s.key === key);
          if (supplyToToggle) {
            const button = supplyToToggle.button;
            if (supplyToToggle.isActive) {
              supplyToToggle.stopAutoclicking();
              supplyToToggle.isActive = false;
              button.style.backgroundColor = "#B22222";
              button.textContent = "Activate";
            } else {
              supplyToToggle.startAutoclicking();
              supplyToToggle.isActive = true;
              button.style.backgroundColor = "#FF0000";
              button.textContent = "Deactivate";
            }
          }
        });
      }

      if (event.key.toLowerCase() === hotkeys.mining) {
        supplyToToggle = suppliesData.supplies.find((s) => s.key === "MINE");
        if (supplyToToggle) {
          const button = supplyToToggle.button;
          if (supplyToToggle.isActive) {
            supplyToToggle.stopAutoclicking();
            supplyToToggle.isActive = false;
            button.style.backgroundColor = "#B22222";
            button.textContent = "Activate";
          } else {
            supplyToToggle.startAutoclicking();
            supplyToToggle.isActive = true;
            button.style.backgroundColor = "#FF0000";
            button.textContent = "Deactivate";
          }
        }
      }
    });
  }

  const hotkeys = {
    supplies: "unset",
    mining: "unset",
  };

  const container = document.body.appendChild(
    template(
      `<div class="app-container" style="position: fixed; top: 0; left: 0; z-index: 9999;"></div>`
    )
  );
  const isVisibleSignal = createSignal(true);
  render(
    mainComponent,
    container,
    isVisibleSignal[0],
    isVisibleSignal[1],
    hotkeys
  );
})();