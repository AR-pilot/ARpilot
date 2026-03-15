!function() {
    const t = "arpilot-v3-config",
          n = 320,
          e = 400,
          i = 360,
          a = 520,
          s = {
              glass: {
                  bg: "rgba(20, 20, 22, 0.75)",
                  bgSolid: "rgba(28, 28, 30, 0.95)",
                  border: "rgba(255, 255, 255, 0.08)",
                  highlight: "rgba(255, 255, 255, 0.12)"
              },
              accent: {
                  primary: "#0A84FF",
                  secondary: "#5E5CE6",
                  success: "#30D158",
                  warning: "#FF9F0A",
                  danger: "#FF453A"
              },
              text: {
                  primary: "#FFFFFF",
                  secondary: "rgba(255, 255, 255, 0.7)",
                  tertiary: "rgba(255, 255, 255, 0.5)",
                  inverse: "#000000"
              }
          },
          r = {
              system: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
              mono: '"SF Mono", "Monaco", "Inconsolata", monospace'
          },
          o = {
              firstaid: "https://tankionline.com/play/static/images/Repair.13e5e240.svg",
              doublearmor: "https://tankionline.com/play/static/images/Shield.6319a2d0.svg",
              doubledamage: "https://tankionline.com/play/static/images/DoubleDamage.c601a4b1.svg",
              nitro: "https://tankionline.com/play/static/images/Speed.3b207b8e.svg",
              mine: "https://tankionline.com/play/static/images/Mine.230cdfaa.svg",
              goldbox: "https://tankionline.com/play/static/images/GoldBox.61e0017c.svg"
          };
    class l {
        constructor() {
            this.data = this.load(), this.listeners = new Map
        }
        load() {
            const n = {
                ui: {
                    position: {
                        x: 20,
                        y: 20
                    },
                    size: {
                        width: i,
                        height: a
                    },
                    isOpen: !0,
                    activeTab: "supplies",
                    lastSize: null,
                    isMinimized: !1
                },
                settings: {
                    developerMode: !1,
                    antiIdle: !1,
                    clickStats: {
                        totalClicks: 0,
                        sessionClicks: 0,
                        lastReset: Date.now()
                    }
                },
                keybinds: {
                    toggleUI: "Digit0",
                    toggleSupplies: "Digit8",
                    toggleMines: "Digit9"
                },
                supplies: {
                    globalEnabled: !1,
                    items: {
                        firstaid: {
                            active: !1,
                            delay: 300,
                            key: "Digit1",
                            name: "First Aid"
                        },
                        doublearmor: {
                            active: !1,
                            delay: 300,
                            key: "Digit2",
                            name: "Double Armor"
                        },
                        doubledamage: {
                            active: !1,
                            delay: 300,
                            key: "Digit3",
                            name: "Double Damage"
                        },
                        nitro: {
                            active: !1,
                            delay: 300,
                            key: "Digit4",
                            name: "Nitro"
                        },
                        mine: {
                            active: !1,
                            delay: 300,
                            key: "Digit5",
                            name: "Mines",
                            multiplier: 1
                        },
                        goldbox: {
                            active: !1,
                            delay: 300,
                            key: "Digit6",
                            name: "Gold Box"
                        }
                    }
                },
                actions: {
                    autoDisable: []
                },
                notifications: {
                    enabled: !0,
                    queue: []
                }
            };
            try {
                const e = JSON.parse(localStorage.getItem(t));
                return this.deepMerge(n, e || {})
            } catch {
                return n
            }
        }
        save() {
            localStorage.setItem(t, JSON.stringify(this.data)), this.notify("save")
        }
        get(t) {
            return t.split(".").reduce((t, n) => t?.[n], this.data)
        }
        set(t, n) {
            const e = t.split("."),
                  i = e.pop();
            e.reduce((t, n) => (t[n] || (t[n] = {}), t[n]), this.data)[i] = n, this.save(), this.notify(t, n)
        }
        deepMerge(t, n) {
            const e = {
                ...t
            };
            for (const i in n) n[i] && "object" == typeof n[i] && !Array.isArray(n[i]) ? e[i] = this.deepMerge(t[i] || {}, n[i]) : e[i] = n[i];
            return e
        }
        notify(t, n) {
            this.listeners.forEach((e, i) => {
                t.startsWith(i) && e.forEach(t => t(n))
            })
        }
        subscribe(t, n) {
            return this.listeners.has(t) || this.listeners.set(t, new Set), this.listeners.get(t).add(n), () => this.listeners.get(t)?.delete(n)
        }
    }
    class p {
        constructor() {
            this.container = null, this.init()
        }
        init() {
            this.container = document.createElement("div"), this.container.style.cssText = "\n                position: fixed;\n                top: 20px;\n                right: 20px;\n                z-index: 2147483647;\n                display: flex;\n                flex-direction: column;\n                gap: 10px;\n                pointer-events: none;\n            ", document.body.appendChild(this.container)
        }
        show(t, n = "info", e = 3e3) {
            const i = document.createElement("div"),
                  a = {
                      info: s.accent.primary,
                      success: s.accent.success,
                      warning: s.accent.warning,
                      error: s.accent.danger
                  };
            Object.assign(i.style, {
                background: a[n] || a.info,
                backdropFilter: "blur(10px)",
                color: "white",
                padding: "12px 24px",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset",
                transform: "translateX(400px)",
                transition: "transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
                cursor: "pointer",
                pointerEvents: "auto",
                maxWidth: "300px",
                wordBreak: "break-word"
            }), i.textContent = t, this.container.appendChild(i), setTimeout(() => i.style.transform = "translateX(0)", 10);
            const r = setTimeout(() => {
                i.style.transform = "translateX(400px)", setTimeout(() => i.remove(), 300)
            }, e);
            i.addEventListener("click", () => {
                clearTimeout(r), i.style.transform = "translateX(400px)", setTimeout(() => i.remove(), 300)
            })
        }
    }
    class d {
        constructor(t) {
            this.inBattle = !1, this.isChatOpen = !1, this.listeners = new Set, this.notifications = t, this.init()
        }
        init() {
            new MutationObserver(() => this.check()).observe(document.body, {
                childList: !0,
                subtree: !0
            }), this.check(), document.addEventListener("focusin", () => {
                setTimeout(() => {
                    const t = this.isChatOpen;
                    this.isChatOpen = null !== document.querySelector('input[type="text"]:focus'), t !== this.isChatOpen && this.isChatOpen
                }, 50)
            }), document.addEventListener("focusout", () => {
                this.isChatOpen = !1
            })
        }
        check() {
            const t = this.inBattle;
            this.inBattle = null !== document.querySelector(".BattleChatComponentStyle-rootDesktop"), t !== this.inBattle && (this.listeners.forEach(t => t(this.inBattle)), this.inBattle ? this.notifications.show("Battle detected - Auto-supplies active", "success", 2e3) : this.notifications.show("Left battle - Auto-supplies paused", "warning", 2e3))
        }
        onChange(t) {
            return this.listeners.add(t), () => this.listeners.delete(t)
        }
    }
    class c {
        constructor(t, n, e) {
            this.state = t, this.detector = n, this.notifications = e, this.activeIntervals = new Map, this.keyState = new Map,
                // CORREÇÃO: Garantir que pare tudo quando sair da batalha
                n.onChange(t => {
                if (t) {
                    this.startAll();
                } else {
                    this.stopAll();
                    // Limpar keyState ao sair da batalha
                    this.keyState.clear();
                }
            })
        }
        sync() {
            const t = this.state.get("supplies.items"),
                  n = this.state.get("supplies.globalEnabled");

            // Parar todos os intervals primeiro
            this.stopAll();

            // Iniciar apenas os que devem estar ativos
            Object.entries(t).forEach(([t, i]) => {
                if (i.active && ("mine" === t || "goldbox" === t || n) && this.detector.inBattle) {
                    this.start(t, i);
                }
            });

            if (this.detector.inBattle && this.activeIntervals.size > 0) {
                this.notifications.show("Auto-supplies running", "info", 1e3);
            }
        }
        // CORREÇÃO: Método start melhorado com verificações mais rigorosas
        start(t, n) {
            if (this.activeIntervals.has(t)) return;

            const e = () => {
                // Verificação crítica: se não está em batalha, para imediatamente
                if (!this.detector.inBattle) {
                    this.stop(t);
                    return;
                }

                // Verificar se o supply ainda está ativo
                const supplies = this.state.get("supplies.items");
                if (!supplies[t] || !supplies[t].active) {
                    this.stop(t);
                    return;
                }

                // Verificar global enabled (exceto para mines/goldbox)
                const globalEnabled = this.state.get("supplies.globalEnabled");
                if (t !== "mine" && t !== "goldbox" && !globalEnabled) {
                    this.stop(t);
                    return;
                }

                const key = n.key,
                      now = performance.now();

                // Prevenir cliques muito próximos
                if (now - (this.keyState.get(key) || 0) > 50) { // Aumentado de 5ms para 50ms
                    this.keyState.set(key, now);

                    const stats = this.state.get("settings.clickStats");
                    stats.totalClicks++;
                    stats.sessionClicks++;
                    this.state.set("settings.clickStats", stats);

                    const event = {
                        code: key,
                        key: key.replace("Digit", ""),
                        bubbles: !0,
                        cancelable: !0
                    };

                    // Usar setTimeout para evitar acumulação de eventos
                    setTimeout(() => {
                        document.dispatchEvent(new KeyboardEvent("keydown", event));
                        setTimeout(() => {
                            document.dispatchEvent(new KeyboardEvent("keyup", event));
                        }, 10);
                    }, 0);
                }
            };

            const i = n.multiplier || 1,
                  a = Math.max(100, n.delay); // Mínimo de 100ms para evitar cliques muito rápidos

            if (i > 1 && "mine" === t) {
                const n = setInterval(() => {
                    for (let t = 0; t < i; t++) {
                        setTimeout(e, 50 * t); // Espaçamento entre cliques múltiplos
                    }
                }, a);
                this.activeIntervals.set(t, n);
            } else {
                const n = setInterval(e, a);
                this.activeIntervals.set(t, n);
            }
        }
        stop(t) {
            const n = this.activeIntervals.get(t);
            if (n) {
                clearInterval(n);
                this.activeIntervals.delete(t);
            }
        }
        // CORREÇÃO: stopAll melhorado
        stopAll() {
            this.activeIntervals.forEach((interval, supply) => {
                clearInterval(interval);
            });
            this.activeIntervals.clear();
        }
        startAll() {
            this.sync();
        }
        disableSupply(t) {
            const n = this.state.get("supplies.items");
            if (n[t]) {
                n[t].active = !1;
                this.state.set("supplies.items", n);
                this.stop(t); // Parar o intervalo imediatamente
                this.notifications.show(`${n[t].name} disabled`, "warning", 1500);
            }
        }
        resetSessionStats() {
            const t = this.state.get("settings.clickStats");
            t.sessionClicks = 0;
            t.lastReset = Date.now();
            this.state.set("settings.clickStats", t);
            this.notifications.show("Session stats reset", "info", 1500);
        }
    }
    class g {
        constructor(t, n, e, s) {
            this.state = t, this.detector = n, this.engine = e, this.notifications = s, this.container = null, this.miniBar = null, this.dragState = {
                isDragging: !1,
                offsetX: 0,
                offsetY: 0
            }, this.miniBarDragState = {
                isDragging: !1,
                offsetX: 0,
                offsetY: 0
            }, this.timerInterval = null, this.originalSize = {
                width: i,
                height: a
            }, this.recordingKey = null, this.initStyles(), this.build(), this.attachEvents()
        }
        initStyles() {
            const t = document.createElement("style");
            t.textContent = `\n                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');\n\n                :root {\n                    --arp-glass: ${s.glass.bg};\n                    --arp-glass-solid: ${s.glass.bgSolid};\n                    --arp-border: ${s.glass.border};\n                    --arp-accent: ${s.accent.primary};\n                    --arp-success: ${s.accent.success};\n                    --arp-danger: ${s.accent.danger};\n                    --arp-text: ${s.text.primary};\n                    --arp-text-sec: ${s.text.secondary};\n                    --arp-text-ter: ${s.text.tertiary};\n                }\n\n                .arpilot-container {\n                    position: fixed;\n                    font-family: ${r.system};\n                    background: var(--arp-glass);\n                    backdrop-filter: blur(20px) saturate(180%);\n                    -webkit-backdrop-filter: blur(20px) saturate(180%);\n                    border: 1px solid var(--arp-border);\n                    border-radius: 20px;\n                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset;\n                    overflow: hidden;\n                    z-index: 2147483647;\n                    display: flex;\n                    flex-direction: column;\n                    transition: box-shadow 0.2s, opacity 0.2s, height 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n                    user-select: none;\n                    opacity: 1;\n                }\n\n                .arpilot-container.hidden {\n                    display: none !important;\n                }\n\n                .arpilot-container.minimized {\n                    height: 48px !important;\n                    min-height: 48px !important;\n                    transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n                }\n\n                .arpilot-mini-bar {\n                    position: fixed;\n                    font-family: ${r.system};\n                    background: var(--arp-glass);\n                    backdrop-filter: blur(20px) saturate(180%);\n                    -webkit-backdrop-filter: blur(20px) saturate(180%);\n                    border: 1px solid var(--arp-border);\n                    border-radius: 30px;\n                    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);\n                    z-index: 2147483646;\n                    display: flex;\n                    align-items: center;\n                    padding: 8px 16px;\n                    gap: 12px;\n                    cursor: pointer;\n                    transition: all 0.2s;\n                    opacity: 0;\n                    transform: scale(0.8);\n                    pointer-events: none;\n                }\n\n                .arpilot-mini-bar.visible {\n                    opacity: 1;\n                    transform: scale(1);\n                    pointer-events: all;\n                }\n\n                .arpilot-mini-bar:hover {\n                    background: rgba(40, 40, 45, 0.9);\n                    transform: scale(1.05);\n                }\n\n                .arp-mini-logo {\n                    width: 24px;\n                    height: 24px;\n                    background: var(--arp-accent);\n                    border-radius: 8px;\n                    display: flex;\n                    align-items: center;\n                    justify-content: center;\n                    font-weight: bold;\n                    color: white;\n                }\n\n                .arp-mini-status {\n                    width: 8px;\n                    height: 8px;\n                    border-radius: 50%;\n                    background: var(--arp-text-ter);\n                    transition: all 0.3s;\n                }\n\n                .arp-mini-status.active {\n                    background: var(--arp-success);\n                    box-shadow: 0 0 10px var(--arp-success);\n                }\n\n                .arp-header {\n                    height: 48px;\n                    background: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%);\n                    border-bottom: 1px solid var(--arp-border);\n                    display: flex;\n                    align-items: center;\n                    justify-content: space-between;\n                    padding: 0 16px;\n                    cursor: grab;\n                    position: relative;\n                }\n\n                .arp-header:active { cursor: grabbing; }\n\n                .arp-window-controls {\n                    display: flex;\n                    gap: 8px;\n                }\n\n                .arp-window-btn {\n                    width: 12px;\n                    height: 12px;\n                    border-radius: 50%;\n                    border: none;\n                    cursor: pointer;\n                    transition: all 0.2s;\n                }\n\n                .arp-window-btn:hover { transform: scale(1.1); }\n                .arp-window-btn.close { background: #FF5F57; }\n                .arp-window-btn.minimize { background: #FFBD2E; }\n                .arp-window-btn.maximize { background: #27C93F; }\n\n                .arp-logo {\n                    position: absolute;\n                    left: 50%;\n                    transform: translateX(-50%);\n                    display: flex;\n                    align-items: center;\n                    gap: 8px;\n                }\n\n                .arp-logo svg {\n                    width: 50px;\n                    height: 24px;\n                    transition: transform 0.3s;\n                }\n\n                .arp-logo svg:hover {\n                    transform: rotate(10deg);\n                }\n\n                .arp-logo-text {\n                    font-size: 14px;\n                    font-weight: 600;\n                    background: linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%);\n                    -webkit-background-clip: text;\n                    -webkit-text-fill-color: transparent;\n                }\n\n                .arp-tabs {\n                    display: flex;\n                    padding: 8px 12px;\n                    gap: 4px;\n                    background: rgba(0,0,0,0.2);\n                }\n\n                .arp-tab {\n                    flex: 1;\n                    padding: 8px 12px;\n                    border: none;\n                    background: transparent;\n                    color: var(--arp-text-sec);\n                    font-size: 13px;\n                    font-weight: 500;\n                    border-radius: 8px;\n                    cursor: pointer;\n                    transition: all 0.2s;\n                    position: relative;\n                }\n\n                .arp-tab:hover {\n                    background: rgba(255,255,255,0.05);\n                    color: var(--arp-text);\n                }\n\n                .arp-tab.active {\n                    background: rgba(255,255,255,0.1);\n                    color: var(--arp-text);\n                }\n\n                .arp-tab.active::after {\n                    content: '';\n                    position: absolute;\n                    bottom: -8px;\n                    left: 20%;\n                    right: 20%;\n                    height: 2px;\n                    background: var(--arp-accent);\n                    border-radius: 2px;\n                    animation: slideUp 0.2s ease;\n                }\n\n                .arp-content {\n                    flex: 1;\n                    overflow: hidden;\n                    position: relative;\n                }\n\n                .arp-panel {\n                    position: absolute;\n                    inset: 0;\n                    padding: 16px;\n                    overflow-y: auto;\n                    opacity: 0;\n                    transform: translateX(20px);\n                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n                    pointer-events: none;\n                }\n\n                .arp-panel.active {\n                    opacity: 1;\n                    transform: translateX(0);\n                    pointer-events: all;\n                }\n\n                .arp-global-toggle {\n                    background: linear-gradient(135deg, rgba(10, 132, 255, 0.1) 0%, rgba(94, 92, 230, 0.1) 100%);\n                    border: 1px solid rgba(10, 132, 255, 0.3);\n                    border-radius: 12px;\n                    padding: 16px;\n                    margin-bottom: 16px;\n                    display: flex;\n                    align-items: center;\n                    justify-content: space-between;\n                    transition: all 0.3s;\n                }\n\n                .arp-global-toggle.active {\n                    background: linear-gradient(135deg, rgba(48, 209, 88, 0.15) 0%, rgba(48, 209, 88, 0.05) 100%);\n                    border-color: var(--arp-success);\n                }\n\n                .arp-global-title {\n                    font-size: 15px;\n                    font-weight: 600;\n                    color: var(--arp-text);\n                }\n\n                .arp-global-subtitle {\n                    font-size: 12px;\n                    color: var(--arp-text-sec);\n                }\n\n                .arp-supply-card {\n                    background: rgba(255,255,255,0.03);\n                    border: 1px solid var(--arp-border);\n                    border-radius: 12px;\n                    padding: 12px;\n                    margin-bottom: 8px;\n                    transition: all 0.2s;\n                }\n\n                .arp-supply-card:hover {\n                    background: rgba(255,255,255,0.05);\n                    transform: translateY(-1px);\n                }\n\n                .arp-supply-card.active {\n                    border-color: var(--arp-success);\n                    background: rgba(48, 209, 88, 0.1);\n                }\n\n                .arp-supply-header {\n                    display: flex;\n                    align-items: center;\n                    justify-content: space-between;\n                    margin-bottom: 12px;\n                }\n\n                .arp-supply-info {\n                    display: flex;\n                    align-items: center;\n                    gap: 10px;\n                }\n\n                .arp-supply-icon {\n                    width: 28px;\n                    height: 28px;\n                    transition: transform 0.2s;\n                }\n\n                .arp-supply-icon:hover {\n                    transform: scale(1.1);\n                }\n\n                .arp-supply-name {\n                    font-size: 14px;\n                    font-weight: 600;\n                    color: var(--arp-text);\n                }\n\n                .arp-status-dot {\n                    width: 8px;\n                    height: 8px;\n                    border-radius: 50%;\n                    background: var(--arp-text-ter);\n                    transition: all 0.3s;\n                }\n\n                .arp-status-dot.active {\n                    background: var(--arp-success);\n                    box-shadow: 0 0 8px var(--arp-success);\n                }\n\n                .arp-toggle {\n                    position: relative;\n                    width: 48px;\n                    height: 26px;\n                    cursor: pointer;\n                }\n\n                .arp-toggle input {\n                    opacity: 0;\n                    width: 0;\n                    height: 0;\n                }\n\n                .arp-toggle-slider {\n                    position: absolute;\n                    inset: 0;\n                    background: rgba(255,255,255,0.2);\n                    border-radius: 26px;\n                    transition: 0.3s;\n                }\n\n                .arp-toggle-slider::before {\n                    content: '';\n                    position: absolute;\n                    height: 22px;\n                    width: 22px;\n                    left: 2px;\n                    bottom: 2px;\n                    background: white;\n                    border-radius: 50%;\n                    transition: 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);\n                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);\n                }\n\n                .arp-toggle input:checked + .arp-toggle-slider {\n                    background: var(--arp-success);\n                }\n\n                .arp-toggle input:checked + .arp-toggle-slider::before {\n                    transform: translateX(22px);\n                }\n\n                .arp-controls {\n                    display: flex;\n                    flex-direction: column;\n                    gap: 12px;\n                    padding-top: 12px;\n                    border-top: 1px solid var(--arp-border);\n                }\n\n                .arp-control-row {\n                    display: flex;\n                    align-items: center;\n                    justify-content: space-between;\n                }\n\n                .arp-control-label {\n                    font-size: 12px;\n                    color: var(--arp-text-sec);\n                    font-weight: 500;\n                }\n\n                .arp-slider-container {\n                    display: flex;\n                    align-items: center;\n                    justify-content: flex-end;\n                    gap: 12px;\n                    flex: 1;\n                    margin-left: 16px;\n                }\n\n                .arp-slider {\n                    flex: 1;\n                    height: 4px;\n                    -webkit-appearance: none;\n                    background: rgba(255,255,255,0.1);\n                    border-radius: 2px;\n                    outline: none;\n                }\n\n                .arp-slider::-webkit-slider-thumb {\n                    -webkit-appearance: none;\n                    width: 16px;\n                    height: 16px;\n                    background: var(--arp-accent);\n                    border-radius: 50%;\n                    cursor: pointer;\n                    box-shadow: 0 2px 8px rgba(10, 132, 255, 0.4);\n                    transition: transform 0.1s;\n                }\n\n                .arp-slider::-webkit-slider-thumb:hover {\n                    transform: scale(1.2);\n                }\n\n                .arp-slider-value {\n                    text-align: right;\n                    font-size: 13px;\n                    font-weight: 600;\n                    color: var(--arp-accent);\n                    font-family: ${r.mono};\n                }\n\n                .arp-stats-card {\n                    background: rgba(255,255,255,0.03);\n                    border: 1px solid var(--arp-border);\n                    border-radius: 12px;\n                    padding: 16px;\n                    margin-bottom: 16px;\n                }\n\n                .arp-stats-title {\n                    font-size: 14px;\n                    font-weight: 600;\n                    color: var(--arp-text);\n                    margin-bottom: 12px;\n                }\n\n                .arp-stats-grid {\n                    display: grid;\n                    grid-template-columns: 1fr 1fr;\n                    gap: 12px;\n                }\n\n                .arp-stat-item {\n                    background: rgba(0,0,0,0.2);\n                    border-radius: 8px;\n                    padding: 10px;\n                    text-align: center;\n                }\n\n                .arp-stat-value {\n                    font-size: 18px;\n                    font-weight: 700;\n                    color: var(--arp-accent);\n                }\n\n                .arp-stat-label {\n                    font-size: 11px;\n                    color: var(--arp-text-sec);\n                    margin-top: 4px;\n                }\n\n                .arp-setting-item {\n                    background: rgba(255,255,255,0.03);\n                    border: 1px solid var(--arp-border);\n                    border-radius: 12px;\n                    padding: 14px;\n                    margin-bottom: 10px;\n                    display: flex;\n                    align-items: center;\n                    justify-content: space-between;\n                }\n\n                .arp-setting-info h4 {\n                    font-size: 14px;\n                    font-weight: 600;\n                    color: var(--arp-text);\n                    margin: 0 0 4px 0;\n                }\n\n                .arp-setting-info p {\n                    font-size: 12px;\n                    color: var(--arp-text-sec);\n                    margin: 0;\n                }\n\n                .arp-keybind {\n                    background: rgba(0,0,0,0.3);\n                    border: 1px solid var(--arp-border);\n                    border-radius: 8px;\n                    padding: 8px 16px;\n                    font-size: 12px;\n                    font-weight: 600;\n                    color: var(--arp-text);\n                    font-family: ${r.mono};\n                    cursor: pointer;\n                    transition: all 0.2s;\n                    min-width: 80px;\n                    text-align: center;\n                }\n\n                .arp-keybind:hover {\n                    border-color: var(--arp-accent);\n                    background: rgba(10, 132, 255, 0.1);\n                }\n\n                .arp-keybind.recording {\n                    border-color: var(--arp-accent);\n                    color: var(--arp-accent);\n                    animation: pulse 1s infinite;\n                }\n\n                .arp-dev-section {\n                    background: rgba(0,0,0,0.2);\n                    border-radius: 12px;\n                    padding: 16px;\n                    margin-top: 16px;\n                }\n\n                .arp-dev-title {\n                    font-size: 13px;\n                    font-weight: 600;\n                    color: var(--arp-text);\n                    margin-bottom: 12px;\n                }\n\n                .arp-dev-item {\n                    display: flex;\n                    align-items: center;\n                    justify-content: space-between;\n                    padding: 8px 0;\n                }\n\n                .arp-dev-label {\n                    font-size: 13px;\n                    color: var(--arp-text-sec);\n                }\n\n                .arp-dev-value {\n                    background: rgba(0,0,0,0.3);\n                    padding: 4px 12px;\n                    border-radius: 6px;\n                    font-size: 12px;\n                    color: var(--arp-accent);\n                    font-family: ${r.mono};\n                }\n\n                .arp-timer-item {\n                    background: rgba(255,255,255,0.03);\n                    border: 1px solid var(--arp-border);\n                    border-radius: 10px;\n                    padding: 12px;\n                    margin-bottom: 8px;\n                    display: flex;\n                    align-items: center;\n                    justify-content: space-between;\n                    transition: all 0.2s;\n                }\n\n                .arp-timer-item:hover {\n                    background: rgba(255,255,255,0.05);\n                }\n\n                .arp-timer-info {\n                    display: flex;\n                    align-items: center;\n                    gap: 12px;\n                }\n\n                .arp-timer-icon {\n                    width: 24px;\n                    height: 24px;\n                }\n\n                .arp-timer-details {\n                    display: flex;\n                    flex-direction: column;\n                }\n\n                .arp-timer-name {\n                    font-size: 13px;\n                    font-weight: 600;\n                    color: var(--arp-text);\n                }\n\n                .arp-timer-time {\n                    font-size: 12px;\n                    color: var(--arp-text-sec);\n                    font-family: ${r.mono};\n                }\n\n                .arp-timer-remove {\n                    background: rgba(255, 69, 58, 0.1);\n                    border: 1px solid rgba(255, 69, 58, 0.3);\n                    border-radius: 6px;\n                    padding: 6px 12px;\n                    color: var(--arp-danger);\n                    font-size: 12px;\n                    font-weight: 600;\n                    cursor: pointer;\n                    transition: all 0.2s;\n                }\n\n                .arp-timer-remove:hover {\n                    background: rgba(255, 69, 58, 0.2);\n                }\n\n                .arp-input {\n                    background: rgba(0,0,0,0.3);\n                    border: 1px solid var(--arp-border);\n                    border-radius: 8px;\n                    padding: 8px 12px;\n                    color: var(--arp-text);\n                    font-size: 13px;\n                }\n\n                .arp-input:focus {\n                    outline: none;\n                    border-color: var(--arp-accent);\n                }\n\n                .arp-button {\n                    background: var(--arp-accent);\n                    border: none;\n                    border-radius: 8px;\n                    padding: 10px 16px;\n                    color: white;\n                    font-size: 13px;\n                    font-weight: 600;\n                    cursor: pointer;\n                    transition: all 0.2s;\n                }\n\n                .arp-button:hover {\n                    filter: brightness(1.1);\n                    transform: translateY(-1px);\n                }\n\n                .arp-button:active {\n                    transform: translateY(0);\n                }\n\n                .arp-panel::-webkit-scrollbar {\n                    width: 6px;\n                }\n\n                .arp-panel::-webkit-scrollbar-track {\n                    background: transparent;\n                }\n\n                .arp-panel::-webkit-scrollbar-thumb {\n                    background: rgba(255,255,255,0.1);\n                    border-radius: 3px;\n                }\n\n                .arp-panel::-webkit-scrollbar-thumb:hover {\n                    background: rgba(255,255,255,0.2);\n                }\n\n.arp-modal-overlay {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    background: rgba(0, 0, 0, 0.5);\n    backdrop-filter: blur(5px);\n    z-index: 2147483647;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    opacity: 0;\n    visibility: hidden;\n    transition: all 0.2s;\n}\n\n.arp-modal-overlay.active {\n    opacity: 1;\n    visibility: visible;\n}\n\n.arp-modal {\n    background: var(--arp-glass-solid);\n    backdrop-filter: blur(20px);\n    border: 1px solid var(--arp-border);\n    border-radius: 16px;\n    padding: 20px;\n    width: 280px;\n    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);\n    transform: scale(0.9);\n    transition: transform 0.2s;\n}\n\n.arp-modal-overlay.active .arp-modal {\n    transform: scale(1);\n}\n\n.arp-modal-header {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    margin-bottom: 16px;\n}\n\n.arp-modal-title {\n    font-size: 16px;\n    font-weight: 600;\n    color: var(--arp-text);\n}\n\n.arp-modal-close {\n    width: 24px;\n    height: 24px;\n    border-radius: 6px;\n    border: none;\n    background: rgba(255, 255, 255, 0.1);\n    color: var(--arp-text);\n    cursor: pointer;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    transition: all 0.2s;\n}\n\n.arp-modal-close:hover {\n    background: rgba(255, 255, 255, 0.2);\n}\n\n.arp-modal-input-group {\n    margin-bottom: 16px;\n}\n\n.arp-modal-label {\n    display: block;\n    font-size: 12px;\n    color: var(--arp-text-sec);\n    margin-bottom: 8px;\n}\n\n.arp-modal-input-wrapper {\n    display: flex;\n    align-items: center;\n    gap: 8px;\n}\n\n.arp-modal-input {\n    flex: 1;\n    background: rgba(0, 0, 0, 0.3);\n    border: 1px solid var(--arp-border);\n    border-radius: 8px;\n    padding: 10px 12px;\n    color: var(--arp-text);\n    font-size: 14px;\n    font-family: ${r.mono};\n}\n\n.arp-modal-input:focus {\n    outline: none;\n    border-color: var(--arp-accent);\n}\n\n.arp-modal-btn {\n    width: 36px;\n    height: 36px;\n    border-radius: 8px;\n    border: none;\n    background: rgba(255, 255, 255, 0.1);\n    color: var(--arp-text);\n    font-size: 18px;\n    font-weight: 600;\n    cursor: pointer;\n    transition: all 0.2s;\n}\n\n.arp-modal-btn:hover {\n    background: var(--arp-accent);\n}\n\n.arp-modal-footer {\n    display: flex;\n    gap: 8px;\n    margin-top: 20px;\n}\n\n.arp-modal-save {\n    flex: 1;\n    background: var(--arp-accent);\n    border: none;\n    border-radius: 8px;\n    padding: 10px;\n    color: white;\n    font-size: 13px;\n    font-weight: 600;\n    cursor: pointer;\n    transition: all 0.2s;\n}\n\n.arp-modal-save:hover {\n    filter: brightness(1.1);\n}\n\n.arp-modal-cancel {\n    flex: 1;\n    background: rgba(255, 255, 255, 0.1);\n    border: 1px solid var(--arp-border);\n    border-radius: 8px;\n    padding: 10px;\n    color: var(--arp-text);\n    font-size: 13px;\n    font-weight: 600;\n    cursor: pointer;\n    transition: all 0.2s;\n}\n\n.arp-modal-cancel:hover {\n    background: rgba(255, 255, 255, 0.2);\n}\n\n                @keyframes pulse {\n                    0%, 100% { opacity: 1; }\n                    50% { opacity: 0.5; }\n                }\n\n                @keyframes slideIn {\n                    from { transform: translateX(100px); opacity: 0; }\n                    to { transform: translateX(0); opacity: 1; }\n                }\n\n                @keyframes slideOut {\n                    from { transform: translateX(0); opacity: 1; }\n                    to { transform: translateX(100px); opacity: 0; }\n                }\n\n                @keyframes slideUp {\n                    from { transform: translateY(10px); opacity: 0; }\n                    to { transform: translateY(0); opacity: 1; }\n                }\n\n                @keyframes spin {\n                    from { transform: rotate(0deg); }\n                    to { transform: rotate(360deg); }\n                }\n            `, document.head.appendChild(t)
        }
        updateMiniBarVisibility() {
            this.state.get("ui.isMinimized") ? this.miniBar.classList.add("visible") : this.miniBar.classList.remove("visible")
        }
        updateMiniBarVisibility() {
            const t = this.state.get("ui.isOpen"),
                  n = this.state.get("ui.isMinimized");
            t || n ? this.miniBar.classList.remove("visible") : this.miniBar.classList.add("visible")
        }
        showFullUI() {
            this.state.set("ui.isOpen", !0), this.state.set("ui.isMinimized", !1), this.container.classList.remove("hidden", "minimized"), this.updateMiniBarVisibility();
            const t = this.state.get("ui.activeTab");
            "supplies" === t ? this.renderSuppliesPanel() : "actions" === t ? this.renderActionsPanel() : "settings" === t && this.renderSettingsPanel()
        }
        build() {
            const t = this.state.get("ui.position"),
                  i = this.state.get("ui.size"),
                  a = this.state.get("ui.isOpen");
            this.state.get("ui.isMinimized");
            this.container = document.createElement("div"), this.container.className = "arpilot-container " + (a ? "" : "hidden"), this.container.id = "arpilot-ui", this.container.style.cssText = `\n                left: ${t.x}px;\n                top: ${t.y}px;\n                width: ${i.width}px;\n                height: ${i.height}px;\n                min-width: ${n}px;\n                min-height: ${e}px;\n            `, this.originalSize = {
                width: i.width,
                height: i.height
            }, this.container.innerHTML = `\n                <div class="arp-header">\n                    <div class="arp-window-controls">\n                        <button class="arp-window-btn close" title="Close (Ctrl+W)"></button>\n                        <button class="arp-window-btn minimize" title="Minimize"></button>\n                        <button class="arp-window-btn maximize" title="Reset Size"></button>\n                    </div>\n                    <div class="arp-logo">\n                        <svg width="80" height="40" viewBox="0 0 140 69" fill="none" xmlns="http://www.w3.org/2000/svg">\n                            <path d="M48.2969 42.6875C44.5469 42.8125 41.7969 42.875 40.0469 42.875C37.3594 42.875 33.6406 42.8125 28.8906 42.6875C27.8906 43.7812 26.6719 45.0781 25.2344 46.5781C23.7969 48.0469 22.4375 49.4219 21.1562 50.7031C19.875 51.9531 18.7656 53.0312 17.8281 53.9375C16.9219 54.8125 16.1719 55.5469 15.5781 56.1406C12.1094 59.5156 9.84375 61.7188 8.78125 62.75C7.75 63.7812 6.65625 64.7031 5.5 65.5156C4.34375 66.3594 3.28125 66.7812 2.3125 66.7812C1.21875 66.7812 0.671875 66.2812 0.671875 65.2812C0.671875 64.1875 1.45312 62.5 3.01562 60.2188C4.57812 57.9375 6.34375 55.9219 8.3125 54.1719C10.2812 52.4219 11.8906 51.5469 13.1406 51.5469C13.4844 51.5469 13.9688 51.7031 14.5938 52.0156L23.5 42.5C22.375 42.3438 20.9062 42.25 19.0938 42.2188C17.2812 42.1562 16.0625 42.0156 15.4375 41.7969C14.8125 41.5781 14.5 41.0469 14.5 40.2031C14.5 38.8594 15.9375 36.75 18.8125 33.875C20.375 32.2812 21.8438 31.2656 23.2188 30.8281C24.5938 30.3906 27.2188 30.1562 31.0938 30.125C28.8125 30.4375 27.1875 30.8125 26.2188 31.25C25.2812 31.6562 24.7656 32.2812 24.6719 33.125C25.5781 33.125 26.4062 33.125 27.1562 33.125C27.9375 33.125 28.9375 33.125 30.1562 33.125C31.4062 33.0938 32.3281 33.0625 32.9219 33.0312C38.0469 28.0312 42.7031 23.6875 46.8906 20C51.0781 16.2812 55.4844 12.7656 60.1094 9.45312C64.7656 6.10938 69.7188 3.04688 74.9688 0.265625C76 1.60938 76.5156 3.01562 76.5156 4.48438C76.5156 5.70312 76.1094 7.10938 75.2969 8.70312C74.5156 10.2969 72.8281 13.2969 70.2344 17.7031C67.6719 22.0781 65.0625 26.7344 62.4062 31.6719C63.2812 31.6719 64 31.6875 64.5625 31.7188C65.1562 31.7188 65.7812 31.7344 66.4375 31.7656C68.2188 31.7656 69.2969 31.7969 69.6719 31.8594C70.0781 31.9219 70.2812 32.2344 70.2812 32.7969C70.2812 33.0469 70.0312 33.5 69.5312 34.1562C69.0625 34.7812 68.2188 35.8438 67 37.3438C65.7812 38.8125 64.5938 40.3125 63.4375 41.8438L56.5469 42.4062C52.8906 49.2812 51.0625 53.1562 51.0625 54.0312C51.0625 55.3125 51.7344 55.9531 53.0781 55.9531C53.7344 55.9531 56.4531 54.5781 61.2344 51.8281L60.8594 54.3125C58.2969 56.25 56.2969 57.7812 54.8594 58.9062C53.4531 60 52.2188 60.9219 51.1562 61.6719C50.125 62.3906 49.1719 62.9219 48.2969 63.2656C47.4531 63.6406 46.5938 63.8281 45.7188 63.8281C44.6875 63.8281 43.6719 63.3438 42.6719 62.375C41.6719 61.4375 41.1719 60.0938 41.1719 58.3438C41.1719 57.625 41.4375 56.6094 41.9688 55.2969C42.5 53.9531 43.0625 52.6719 43.6562 51.4531C44.2812 50.2344 45.8281 47.3125 48.2969 42.6875ZM39.4375 32.0469L54.625 31.7656C56.4062 28.7344 57.8438 26.2812 58.9375 24.4062C60.0625 22.5312 61.2812 20.5 62.5938 18.3125C63.9375 16.0938 65.0781 14.2188 66.0156 12.6875C66.9844 11.1562 68.0469 9.42188 69.2031 7.48438C66.9531 8.89062 64.6562 10.4531 62.3125 12.1719C59.9688 13.8906 57.3281 15.9688 54.3906 18.4062C51.4531 20.8125 48.8438 23.0625 46.5625 25.1562C44.2812 27.2188 41.9062 29.5156 39.4375 32.0469ZM103.844 57.6875L86.1719 49.0625C81.6719 55.2188 79.1562 59.2812 78.625 61.25C78.25 62.6562 77.4062 63.8281 76.0938 64.7656C74.8125 65.7344 73.8906 66.2188 73.3281 66.2188C71.7344 66.2188 70.9375 65.6094 70.9375 64.3906C70.9375 63.7031 71.875 61.7344 73.75 58.4844C75.6562 55.2031 78.2656 51.3438 81.5781 46.9062C79.7344 46.1562 78.5938 45.6562 78.1562 45.4062C77.7188 45.1562 77.5469 44.6875 77.6406 44C77.7344 43.2812 78.2812 42.1719 79.2812 40.6719C80.1562 39.3594 80.8125 38.4844 81.25 38.0469C81.6875 37.5781 82.2031 37.2188 82.7969 36.9688C83.3906 36.6875 84.0156 36.5 84.6719 36.4062C85.3281 36.3125 87.1719 36.0781 90.2031 35.7031C92.6719 32.3594 95.3438 28.75 98.2188 24.875C101.125 21 103.391 17.9844 105.016 15.8281C100.109 16.4844 96.6875 17.0312 94.75 17.4688C92.6875 17.875 90.9531 18.2188 89.5469 18.5C88.1719 18.75 87.2031 18.9844 86.6406 19.2031C86.0781 19.3906 85.7969 19.6719 85.7969 20.0469C85.7969 20.3906 86.1406 20.625 86.8281 20.75C87.5156 20.875 88.375 20.9375 89.4062 20.9375C90.4688 20.9375 91.2812 20.9844 91.8438 21.0781C92.4375 21.1406 92.7344 21.3125 92.7344 21.5938C92.7344 21.9062 92.3438 22.0938 91.5625 22.1562C90.8125 22.1875 88.6719 22.2812 85.1406 22.4375C83.1406 22.5 81.4531 22.5625 80.0781 22.625C78.7344 22.6875 77.7969 22.7188 77.2656 22.7188C76.5469 22.7188 75.9844 22.5 75.5781 22.0625C75.1719 21.625 74.9688 21.0469 74.9688 20.3281C74.9688 19.7969 75.2656 18.8125 75.8594 17.375C76.4531 15.9375 77.2969 14.4844 78.3906 13.0156C79.4844 11.5469 80.7344 10.4062 82.1406 9.59375C83.7344 8.625 86.2031 7.65625 89.5469 6.6875C92.9219 5.6875 96.6562 4.89062 100.75 4.29688C104.875 3.67188 108.953 3.35938 112.984 3.35938C115.422 3.35938 117.797 3.5 120.109 3.78125C122.453 4.0625 124.562 4.40625 126.438 4.8125C128.344 5.21875 129.844 5.625 130.938 6.03125C133.781 6.96875 135.953 8.39062 137.453 10.2969C138.984 12.2031 139.75 14.2969 139.75 16.5781C139.75 18.7969 139.359 20.9688 138.578 23.0938C137.828 25.1875 136.656 27.1406 135.062 28.9531C133.5 30.7344 131.609 32.1875 129.391 33.3125C127.578 34.25 124.828 35.2031 121.141 36.1719C117.453 37.1406 113 38 107.781 38.75C102.562 39.5 96.7344 40.0469 90.2969 40.3906C95.1094 42.0781 99.5938 43.7812 103.75 45.5C107.938 47.1875 111.453 48.7031 114.297 50.0469C117.172 51.3594 119.422 52.4375 121.047 53.2812C123.328 54.4688 124.812 55.3281 125.5 55.8594C126.188 56.3906 126.641 57.0781 126.859 57.9219C127.078 58.7656 127.188 60.1562 127.188 62.0938C127.188 64.2812 127.047 65.8906 126.766 66.9219C126.516 67.9844 125.953 68.5156 125.078 68.5156C124.797 68.5156 124.047 68.2031 122.828 67.5781C121.641 66.9844 119.984 66.0938 117.859 64.9062C115.734 63.75 113.797 62.7188 112.047 61.8125C110.328 60.875 107.594 59.5 103.844 57.6875ZM107.969 15.3594C108 15.5781 108.016 15.7812 108.016 15.9688C108.047 16.1562 108.062 16.4219 108.062 16.7656C108.062 17.6406 107.781 18.6562 107.219 19.8125C106.688 20.9375 105.984 22.1094 105.109 23.3281C104.266 24.5156 102.984 26.2344 101.266 28.4844C99.5781 30.7031 98.0156 32.75 96.5781 34.625C103.141 33.375 108.734 32.1719 113.359 31.0156C118.016 29.8594 121.844 28.7031 124.844 27.5469C127.844 26.3594 130.094 25.125 131.594 23.8438C133.125 22.5312 133.891 21.1719 133.891 19.7656C133.891 18.2031 132.297 16.9844 129.109 16.1094C125.953 15.2031 122.078 14.75 117.484 14.75C116.547 14.75 115.547 14.7812 114.484 14.8438C113.453 14.875 112.203 14.9688 110.734 15.125C109.297 15.25 108.375 15.3281 107.969 15.3594Z" fill="var(--arp-accent)"/>\n                        </svg>\n                        <span class="arp-logo-text">ARpilot</span>\n                    </div>\n                    <div style="width: 60px;"></div>\n                </div>\n\n                <div class="arp-tabs">\n                    <button class="arp-tab ${"supplies"===this.state.get("ui.activeTab")?"active":""}" data-tab="supplies">Supplies</button>\n                    <button class="arp-tab ${"actions"===this.state.get("ui.activeTab")?"active":""}" data-tab="actions">Actions</button>\n                    <button class="arp-tab ${"settings"===this.state.get("ui.activeTab")?"active":""}" data-tab="settings">Settings</button>\n                </div>\n\n                <div class="arp-content">\n                    <div class="arp-panel ${"supplies"===this.state.get("ui.activeTab")?"active":""}" data-panel="supplies"></div>\n                    <div class="arp-panel ${"actions"===this.state.get("ui.activeTab")?"active":""}" data-panel="actions"></div>\n                    <div class="arp-panel ${"settings"===this.state.get("ui.activeTab")?"active":""}" data-panel="settings"></div>\n                </div>\n            `;
            const s = document.createElement("div");
            Object.assign(s.style, {
                height: "5px",
                width: "120px",
                background: "rgba(255, 255, 255, 0.3)",
                borderRadius: "100px",
                margin: "8px auto",
                position: "relative",
                bottom: "-1px",
                transition: "all 0.2s"
            }), s.addEventListener("mouseenter", () => {
                s.style.background = "rgba(255, 255, 255, 0.5)", s.style.width = "130px"
            }), s.addEventListener("mouseleave", () => {
                s.style.background = "rgba(255, 255, 255, 0.3)", s.style.width = "120px"
            }), this.container.appendChild(s), document.body.appendChild(this.container), this.renderSuppliesPanel(), this.renderActionsPanel(), this.renderSettingsPanel(), this.timerInterval = setInterval(() => this.updateTimersList(), 1e3), setInterval(() => {
                const t = this.miniBar?.querySelector(".arp-mini-status");
                if (t) {
                    const n = this.state.get("supplies.globalEnabled") && this.detector.inBattle;
                    t.className = "arp-mini-status " + (n ? "active" : "")
                }
            }, 500)
        }
        createValueModal(t, n, e, i, a, s) {
            const r = document.querySelector(".arp-modal-overlay");
            r && r.remove();
            const o = document.createElement("div");
            o.className = "arp-modal-overlay";
            const l = "delay" === t ? "Delay (ms)" : "Multiplier",
                  p = {
                      firstaid: "First Aid",
                      doublearmor: "Double Armor",
                      doubledamage: "Double Damage",
                      nitro: "Nitro",
                      mine: "Mines",
                      goldbox: "Gold Box"
                  } [n] || n;
            o.innerHTML = `\n        <div class="arp-modal">\n            <div class="arp-modal-header">\n                <span class="arp-modal-title">${p} - ${l}</span>\n                <button class="arp-modal-close">✕</button>\n            </div>\n            <div class="arp-modal-input-group">\n                <label class="arp-modal-label">Value</label>\n                <div class="arp-modal-input-wrapper">\n                    <button class="arp-modal-btn" data-action="decrease">−</button>\n                    <input type="number" class="arp-modal-input" value="${e}" min="${i}" max="${a}" step="${"delay"===t?"10":"1"}">\n                    <button class="arp-modal-btn" data-action="increase">+</button>\n                </div>\n            </div>\n            <div class="arp-modal-footer">\n                <button class="arp-modal-save">Save</button>\n                <button class="arp-modal-cancel">Cancel</button>\n            </div>\n        </div>\n    `, document.body.appendChild(o);
            const d = o.querySelector(".arp-modal-input"),
                  c = o.querySelector('[data-action="decrease"]'),
                  g = o.querySelector('[data-action="increase"]'),
                  u = o.querySelector(".arp-modal-save"),
                  h = o.querySelector(".arp-modal-cancel"),
                  b = o.querySelector(".arp-modal-close"),
                  m = "delay" === t ? 10 : 1;
            c.addEventListener("click", () => {
                let t = parseInt(d.value) - m;
                t < i && (t = i), d.value = t
            }), g.addEventListener("click", () => {
                let t = parseInt(d.value) + m;
                t > a && (t = a), d.value = t
            });
            const v = () => {
                o.classList.remove("active"), setTimeout(() => o.remove(), 200)
            };
            u.addEventListener("click", () => {
                let t = parseInt(d.value);
                isNaN(t) && (t = i), t < i && (t = i), t > a && (t = a), s(t), v()
            }), h.addEventListener("click", v), b.addEventListener("click", v), o.addEventListener("click", t => {
                t.target === o && v()
            }), setTimeout(() => o.classList.add("active"), 10)
        }
        renderSuppliesPanel() {
            const t = this.container.querySelector('[data-panel="supplies"]');
            if (!t) return;
            const n = this.state.get("supplies.items"),
                  e = this.state.get("supplies.globalEnabled");
            t.innerHTML = `\n        <div class="arp-global-toggle ${e?"active":""}">\n            <div>\n                <div class="arp-global-title">Auto-Supplies</div>\n                <div class="arp-global-subtitle">${e?"System Active":"System Standby"}</div>\n            </div>\n            <label class="arp-toggle">\n                <input type="checkbox" ${e?"checked":""} id="global-toggle">\n                <span class="arp-toggle-slider"></span>\n            </label>\n        </div>\n        <div class="arp-supplies-list">\n            ${Object.entries(n).map(([t,n])=>`\n                <div class="arp-supply-card ${n.active?"active":""}" data-supply="${t}">\n                    <div class="arp-supply-header">\n                        <div class="arp-supply-info">\n                            <img src="${o[t]||o.mine}" class="arp-supply-icon" alt="">\n                            <span class="arp-supply-name">${n.name}</span>\n                        </div>\n                        <div style="display: flex; align-items: center; gap: 8px;">\n                            <div class="arp-status-dot ${n.active?"active":""}"></div>\n                            <label class="arp-toggle">\n                                <input type="checkbox" ${n.active?"checked":""} data-supply-toggle="${t}">\n                                <span class="arp-toggle-slider"></span>\n                            </label>\n                        </div>\n                    </div>\n                    <div class="arp-controls">\n                        <div class="arp-control-row">\n                            <span class="arp-control-label">Delay (ms)</span>\n                            <div class="arp-slider-container">\n                                <span class="arp-slider-value" style="cursor: pointer; background: rgba(255,255,255,0.05); padding: 4px 12px; border-radius: 6px;" data-delay-value="${t}">${n.delay}</span>\n                            </div>\n                        </div>\n                        ${"mine"===t?`\n                        <div class="arp-control-row">\n                            <span class="arp-control-label">Multiplier</span>\n                            <div class="arp-slider-container">\n                                <span class="arp-slider-value" style="cursor: pointer; background: rgba(255,255,255,0.05); padding: 4px 12px; border-radius: 6px;" data-multiplier-value="${t}">${n.multiplier||1}x</span>\n                            </div>\n                        </div>\n                        `:""}\n                    </div>\n                </div>\n            `).join("")}\n        </div>\n    `, t.querySelector("#global-toggle")?.addEventListener("change", t => {
                this.state.set("supplies.globalEnabled", t.target.checked), this.renderSuppliesPanel(), this.engine.sync();
                const n = this.miniBar?.querySelector(".arp-mini-status");
                n && (n.className = "arp-mini-status " + (t.target.checked ? "active" : ""))
            }), t.querySelectorAll("[data-supply-toggle]").forEach(t => {
                t.addEventListener("change", t => {
                    const n = t.target.dataset.supplyToggle,
                          e = this.state.get("supplies.items");
                    e[n].active = t.target.checked, this.state.set("supplies.items", e), this.engine.sync();
                    const i = t.target.closest(".arp-supply-card");
                    i.style.transform = "scale(0.98)", setTimeout(() => i.style.transform = "", 150), setTimeout(() => this.renderSuppliesPanel(), 50)
                })
            }), t.querySelectorAll("[data-delay-value]").forEach(t => {
                t.addEventListener("click", t => {
                    const n = t.target.dataset.delayValue,
                          e = this.state.get("supplies.items"),
                          i = e[n].delay;
                    this.createValueModal("delay", n, i, 50, 1e3, t => {
                        e[n].delay = t, this.state.set("supplies.items", e), this.renderSuppliesPanel(), this.notifications.show(`${e[n].name} delay set to ${t}ms`, "success", 1500)
                    })
                })
            }), t.querySelectorAll("[data-multiplier-value]").forEach(t => {
                t.addEventListener("click", t => {
                    const n = t.target.dataset.multiplierValue,
                          e = this.state.get("supplies.items"),
                          i = e[n].multiplier || 1;
                    this.createValueModal("multiplier", n, i, 1, 100, t => {
                        e[n].multiplier = t, this.state.set("supplies.items", e), this.renderSuppliesPanel(), this.notifications.show(`${e[n].name} multiplier set to ${t}x`, "success", 1500)
                    })
                })
            })
        }
        renderActionsPanel() {
            const t = this.container.querySelector('[data-panel="actions"]');
            if (!t) return;
            const n = this.state.get("settings.clickStats");
            t.innerHTML = `\n                <div class="arp-stats-card">\n                    <div class="arp-stats-title">Click Statistics</div>\n                    <div class="arp-stats-grid">\n                        <div class="arp-stat-item">\n                            <div class="arp-stat-value">${n.totalClicks.toLocaleString()}</div>\n                            <div class="arp-stat-label">Total Clicks</div>\n                        </div>\n                        <div class="arp-stat-item">\n                            <div class="arp-stat-value">${n.sessionClicks.toLocaleString()}</div>\n                            <div class="arp-stat-label">Session Clicks</div>\n                        </div>\n                    </div>\n                    <button id="reset-stats" class="arp-button" style="width: 100%; margin-top: 12px;">Reset Session Stats</button>\n                </div>\n\n                <div class="arp-setting-item" style="flex-direction: column; align-items: stretch; gap: 16px;">\n                    <div style="display: flex; align-items: center; justify-content: space-between;">\n                        <div class="arp-setting-info">\n                            <h4>Auto-Disable Timer</h4>\n                            <p>Automatically disable supplies after set time</p>\n                        </div>\n                        <label class="arp-toggle">\n                            <input type="checkbox" id="auto-disable-toggle">\n                            <span class="arp-toggle-slider"></span>\n                        </label>\n                    </div>\n\n                    <div id="auto-disable-config" style="display: none;">\n                        <div style="display: flex; gap: 12px; margin-bottom: 12px;">\n                            <select id="auto-disable-supply" class="arp-input" style="flex: 1;">\n                                <option value="firstaid">First Aid</option>\n                                <option value="doublearmor">Double Armor</option>\n                                <option value="doubledamage">Double Damage</option>\n                                <option value="nitro">Nitro</option>\n                                <option value="mine">Mines</option>\n                                <option value="goldbox">Gold Box</option>\n                            </select>\n                            <input type="number" id="auto-disable-time" class="arp-input" placeholder="Minutes" min="1" max="180" value="5" style="width: 100px;">\n                        </div>\n                        <button id="add-auto-disable" class="arp-button" style="width: 100%;">Add Timer</button>\n                    </div>\n                </div>\n\n                <div style="margin-top: 20px;">\n                    <h4 style="color: var(--arp-text); font-size: 14px; margin-bottom: 12px; font-weight: 600;">Active Timers</h4>\n                    <div id="active-timers-list"></div>\n                </div>\n            `, t.querySelector("#reset-stats")?.addEventListener("click", () => {
                this.engine.resetSessionStats(), this.renderActionsPanel()
            });
            const e = t.querySelector("#auto-disable-toggle"),
                  i = t.querySelector("#auto-disable-config");
            e.addEventListener("change", t => {
                i.style.display = t.target.checked ? "block" : "none"
            }), t.querySelector("#add-auto-disable").addEventListener("click", () => {
                const n = t.querySelector("#auto-disable-supply").value,
                      e = parseInt(t.querySelector("#auto-disable-time").value);
                e && e > 0 && e <= 180 && (this.addAutoDisableTimer(n, e), t.querySelector("#auto-disable-toggle").checked = !1, i.style.display = "none")
            }), this.updateTimersList()
        }
        addAutoDisableTimer(t, n) {
            const e = this.state.get("actions.autoDisable") || [],
                  i = {
                      firstaid: "First Aid",
                      doublearmor: "Double Armor",
                      doubledamage: "Double Damage",
                      nitro: "Nitro",
                      mine: "Mines",
                      goldbox: "Gold Box"
                  };
            e.push({
                supply: t,
                minutes: n,
                startTime: Date.now(),
                displayName: i[t] || t
            }), this.state.set("actions.autoDisable", e), this.updateTimersList(), this.notifications.show(`Timer set: ${i[t]} will disable in ${n}m`, "info", 2e3), setTimeout(() => {
                this.engine.disableSupply(t), this.notifications.show(`${i[t]} auto-disabled`, "warning", 2e3)
            }, 6e4 * n)
        }
        removeAutoDisableTimer(t) {
            const n = this.state.get("actions.autoDisable") || [],
                  e = n[t];
            n.splice(t, 1), this.state.set("actions.autoDisable", n), this.updateTimersList(), e && this.notifications.show(`Timer for ${e.displayName} removed`, "info", 1500)
        }
        updateTimersList() {
            const t = this.container.querySelector("#active-timers-list");
            if (!t) return;
            const n = this.state.get("actions.autoDisable") || [];
            0 !== n.length ? (t.innerHTML = n.map((t, n) => {
                const e = Date.now() - t.startTime,
                      i = Math.max(0, 6e4 * t.minutes - e),
                      a = Math.floor(i / 6e4),
                      s = Math.floor(i % 6e4 / 1e3),
                      r = i < 6e4;
                return `\n                    <div class="arp-timer-item" data-timer-index="${n}">\n                        <div class="arp-timer-info">\n                            <img src="${o[t.supply]||o.mine}" class="arp-timer-icon" alt="">\n                            <div class="arp-timer-details">\n                                <span class="arp-timer-name">${t.displayName}</span>\n                                <span class="arp-timer-time" style="color: ${r?"var(--arp-danger)":"var(--arp-text-sec)"};">\n                                    ${a}m ${s.toString().padStart(2,"0")}s\n                                </span>\n                            </div>\n                        </div>\n                        <button class="arp-timer-remove" data-timer-index="${n}">Remove</button>\n                    </div>\n                `
            }).join(""), t.querySelectorAll(".arp-timer-remove").forEach(t => {
                t.addEventListener("click", t => {
                    t.stopPropagation();
                    const n = parseInt(t.target.dataset.timerIndex);
                    this.removeAutoDisableTimer(n)
                })
            })) : t.innerHTML = '<p style="color: var(--arp-text-ter); text-align: center; font-size: 12px; padding: 20px;">No active timers</p>'
        }
        renderSettingsPanel() {
            const t = this.container.querySelector('[data-panel="settings"]');
            if (!t) return;
            const n = this.state.get("keybinds"),
                  e = this.state.get("settings");
            t.innerHTML = `\n                <div class="arp-setting-item">\n                    <div class="arp-setting-info">\n                        <h4>Developer Mode</h4>\n                        <p>Show advanced options and debugging info</p>\n                    </div>\n                    <label class="arp-toggle">\n                        <input type="checkbox" ${e.developerMode?"checked":""} id="dev-mode-toggle">\n                        <span class="arp-toggle-slider"></span>\n                    </label>\n                </div>\n\n                <div class="arp-setting-item">\n                    <div class="arp-setting-info">\n                        <h4>Notifications</h4>\n                        <p>Show system notifications</p>\n                    </div>\n                    <label class="arp-toggle">\n                        <input type="checkbox" ${this.state.get("notifications.enabled")?"checked":""} id="notifications-toggle">\n                        <span class="arp-toggle-slider"></span>\n                    </label>\n                </div>\n\n                <div style="margin-top: 24px;">\n                    <h4 style="color: var(--arp-text); font-size: 14px; margin-bottom: 12px; font-weight: 600;">Keybinds</h4>\n\n                    <div class="arp-setting-item">\n                        <div class="arp-setting-info">\n                            <h4>Toggle UI</h4>\n                            <p>Show/hide this interface</p>\n                        </div>\n                        <button class="arp-keybind" data-bind="toggleUI">${n.toggleUI.replace("Digit","")}</button>\n                    </div>\n\n                    <div class="arp-setting-item">\n                        <div class="arp-setting-info">\n                            <h4>Toggle Supplies</h4>\n                            <p>Enable/disable all supplies</p>\n                        </div>\n                        <button class="arp-keybind" data-bind="toggleSupplies">${n.toggleSupplies.replace("Digit","")}</button>\n                    </div>\n\n                    <div class="arp-setting-item">\n                        <div class="arp-setting-info">\n                            <h4>Toggle Mines</h4>\n                            <p>Quick toggle for mines</p>\n                        </div>\n                        <button class="arp-keybind" data-bind="toggleMines">${n.toggleMines.replace("Digit","")}</button>\n                    </div>\n                </div>\n\n                ${e.developerMode?`\n                <div class="arp-dev-section">\n                    <div class="arp-dev-title">Supply Keybinds</div>\n                    ${Object.entries(this.state.get("supplies.items")).map(([t,n])=>`\n                        <div class="arp-dev-item">\n                            <span class="arp-dev-label">${n.name}</span>\n                            <button class="arp-keybind" data-supply-bind="${t}" style="min-width: 60px;">${n.key.replace("Digit","")}</button>\n                        </div>\n                    `).join("")}\n                </div>\n                `:""}\n\n                <div style="margin-top: 16px; display: flex; gap: 8px;">\n                    <button id="reset-keybinds" class="arp-button" style="flex: 1; background: var(--arp-danger);">Reset All Keybinds</button>\n                    <button id="reset-supply-keybinds" class="arp-button" style="flex: 1; background: var(--arp-warning);">Reset Supply Keys</button>\n                </div>\n            `, t.querySelector("#dev-mode-toggle")?.addEventListener("change", t => {
                this.state.set("settings.developerMode", t.target.checked), this.renderSettingsPanel()
            }), t.querySelector("#notifications-toggle")?.addEventListener("change", t => {
                this.state.set("notifications.enabled", t.target.checked)
            }), t.querySelectorAll(".arp-keybind[data-bind], .arp-keybind[data-supply-bind]").forEach(t => {
                t.addEventListener("click", () => {
                    if (t.classList.contains("recording")) return;
                    this.recordingKey = t, t.classList.add("recording"), t.textContent = "Press key...";
                    const n = e => {
                        if (e.preventDefault(), t.dataset.bind) {
                            const n = t.dataset.bind,
                                  i = this.state.get("keybinds");
                            i[n] = e.code, this.state.set("keybinds", i), this.notifications.show(`Keybind updated: ${e.code.replace("Digit","")}`, "success", 1500)
                        } else if (t.dataset.supplyBind) {
                            const n = t.dataset.supplyBind,
                                  i = this.state.get("supplies.items");
                            i[n].key = e.code, this.state.set("supplies.items", i), this.notifications.show(`${i[n].name} key updated`, "success", 1500)
                        }
                        t.textContent = e.code.replace("Digit", ""), t.classList.remove("recording"), this.recordingKey = null, document.removeEventListener("keydown", n)
                    };
                    document.addEventListener("keydown", n), setTimeout(() => {
                        t.classList.contains("recording") && (t.classList.remove("recording"), t.dataset.bind ? t.textContent = this.state.get("keybinds")[t.dataset.bind].replace("Digit", "") : t.dataset.supplyBind && (t.textContent = this.state.get("supplies.items")[t.dataset.supplyBind].key.replace("Digit", "")), this.recordingKey = null, document.removeEventListener("keydown", n))
                    }, 5e3)
                })
            }), t.querySelector("#reset-keybinds")?.addEventListener("click", () => {
                const n = {
                    toggleUI: "Digit0",
                    toggleSupplies: "Digit8",
                    toggleMines: "Digit9"
                };
                this.state.set("keybinds", n), t.querySelectorAll("[data-bind]").forEach(t => {
                    const e = t.dataset.bind;
                    t.textContent = n[e].replace("Digit", "")
                }), this.notifications.show("Keybinds restored to default", "info", 1500)
            }), t.querySelector("#reset-supply-keybinds")?.addEventListener("click", () => {
                const t = this.state.get("supplies.items");
                Object.entries({
                    firstaid: "Digit1",
                    doublearmor: "Digit2",
                    doubledamage: "Digit3",
                    nitro: "Digit4",
                    mine: "Digit5",
                    goldbox: "Digit6"
                }).forEach(([n, e]) => {
                    t[n] && (t[n].key = e)
                }), this.state.set("supplies.items", t), this.state.get("settings.developerMode") && this.renderSettingsPanel(), this.notifications.show("Supply keys restored to default", "info", 1500)
            })
        }
        attachEvents() {
            const t = this.container.querySelector(".arp-header");
            t.addEventListener("mousedown", n => {
                n.target.closest(".arp-window-btn") || (this.dragState.isDragging = !0, this.dragState.offsetX = n.clientX - this.container.offsetLeft, this.dragState.offsetY = n.clientY - this.container.offsetTop, t.style.cursor = "grabbing")
            }), document.addEventListener("mousemove", t => {
                if (this.dragState.isDragging) {
                    const n = t.clientX - this.dragState.offsetX,
                          e = t.clientY - this.dragState.offsetY,
                          i = window.innerWidth - this.container.offsetWidth,
                          a = window.innerHeight - this.container.offsetHeight,
                          s = Math.max(0, Math.min(i, n)),
                          r = Math.max(0, Math.min(a, e));
                    this.container.style.left = `${s}px`, this.container.style.top = `${r}px`, this.miniBar && (this.miniBar.style.left = `${s}px`, this.miniBar.style.top = `${r}px`)
                }
                if (this.miniBarDragState.isDragging) {
                    const n = t.clientX - this.miniBarDragState.offsetX,
                          e = t.clientY - this.miniBarDragState.offsetY,
                          i = window.innerWidth - this.miniBar.offsetWidth,
                          a = window.innerHeight - this.miniBar.offsetHeight,
                          s = Math.max(0, Math.min(i, n)),
                          r = Math.max(0, Math.min(a, e));
                    this.miniBar.style.left = `${s}px`, this.miniBar.style.top = `${r}px`
                }
            }), document.addEventListener("mouseup", () => {
                if (this.dragState.isDragging) {
                    this.dragState.isDragging = !1, t.style.cursor = "grab";
                    const n = {
                        x: parseInt(this.container.style.left) || 20,
                        y: parseInt(this.container.style.top) || 20
                    };
                    this.state.set("ui.position", n), this.miniBar && (this.miniBar.style.left = n.x + "px", this.miniBar.style.top = n.y + "px")
                }
                if (this.miniBarDragState.isDragging) {
                    this.miniBarDragState.isDragging = !1, this.miniBar.style.cursor = "pointer";
                    const t = {
                        x: parseInt(this.miniBar.style.left) || 20,
                        y: parseInt(this.miniBar.style.top) || 20
                    };
                    this.state.set("ui.position", t)
                }
            }), this.container.querySelector(".arp-window-btn.close").addEventListener("click", () => {
                this.state.set("ui.isOpen", !1), this.state.set("ui.isMinimized", !1), this.container.classList.add("hidden"), this.container.classList.remove("minimized"), this.updateMiniBarVisibility(), this.notifications.show("ARpilot hidden - Press 0 to show", "info", 1500)
            }), this.container.querySelectorAll(".arp-tab").forEach(t => {
                t.addEventListener("click", () => {
                    const n = t.dataset.tab;
                    this.container.querySelectorAll(".arp-tab").forEach(t => t.classList.remove("active")), t.classList.add("active"), this.container.querySelectorAll(".arp-panel").forEach(t => t.classList.remove("active"));
                    this.container.querySelector(`[data-panel="${n}"]`).classList.add("active"), this.state.set("ui.activeTab", n), "supplies" === n ? this.renderSuppliesPanel() : "actions" === n ? this.renderActionsPanel() : "settings" === n && this.renderSettingsPanel()
                })
            }), document.addEventListener("keydown", t => {
                if (this.detector.isChatOpen) return this.recordingKey ? void t.preventDefault() : void 0;
                const n = this.state.get("keybinds");
                if (t.code === n.toggleUI) {
                    this.state.get("ui.isOpen") ? (this.state.set("ui.isOpen", !1), this.state.set("ui.isMinimized", !1), this.container.classList.add("hidden"), this.container.classList.remove("minimized")) : this.showFullUI(), this.updateMiniBarVisibility(), t.preventDefault()
                }
                if (t.code === n.toggleSupplies) {
                    const n = this.state.get("supplies.globalEnabled");
                    this.state.set("supplies.globalEnabled", !n), this.renderSuppliesPanel(), this.engine.sync();
                    const e = this.miniBar?.querySelector(".arp-mini-status");
                    e && (e.className = "arp-mini-status " + (n ? "" : "active")), t.preventDefault()
                }
                if (t.code === n.toggleMines) {
                    const n = this.state.get("supplies.items");
                    n.mine.active = !n.mine.active, this.state.set("supplies.items", n), this.engine.sync(), this.renderSuppliesPanel(), t.preventDefault()
                }
            }), window.addEventListener("resize", () => {
                const t = this.container.getBoundingClientRect(),
                      n = window.innerWidth - t.width,
                      e = window.innerHeight - t.height;
                let i = t.left,
                    a = t.top;
                t.left > n && (i = n), t.top > e && (a = e), t.left < 0 && (i = 0), t.top < 0 && (a = 0), i === t.left && a === t.top || (this.container.style.left = i + "px", this.container.style.top = a + "px", this.state.set("ui.position", {
                    x: i,
                    y: a
                }), this.miniBar && (this.miniBar.style.left = i + "px", this.miniBar.style.top = a + "px"))
            })
        }
        destroy() {
            this.timerInterval && clearInterval(this.timerInterval), this.container?.remove(), this.miniBar?.remove()
        }
    }

    function u() {
        document.getElementById("arpilot-ui") && document.getElementById("arpilot-ui").remove(), document.querySelector(".arpilot-mini-bar") && document.querySelector(".arpilot-mini-bar").remove();
        const t = new l,
              n = new p,
              e = new d(n),
              i = new c(t, e, n),
              a = new g(t, e, i, n);
        window.ARpilot = {
            state: t,
            detector: e,
            engine: i,
            ui: a,
            notifications: n
        }, setTimeout(() => {
            n.show("ARpilot v3 initialized - Press 0 to toggle UI", "info", 3e3)
        }, 1e3), console.log("[ARpilot v3.2] Initialized")
    }
    "loading" === document.readyState ? document.addEventListener("DOMContentLoaded", u) : u()
}();