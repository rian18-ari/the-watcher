# The Watcher 🟢

> **Lightweight, Zero-Config Screen-Edge HUD for Active Dev Ports & Background Servers.**

The Watcher sits completely transparent and click-through on the leftmost edge of your screen. Whenever you run a local server (`npm run dev`, `docker`, `python`, etc.) in ANY terminal, The Watcher automatically detects the listening port and project name. 

When you slide your mouse to the screen edge, it smoothly expands with spring physics, giving you a live view of all your running servers with 1-click browser access and 1-click port killer.

---

## ✨ Features

- 🖥️ **Zero-Config Auto-Discovery**: No CLI prefix needed! Run your code normally in VS Code, Windows Terminal, or CMD.
- 🟢 **Live Port Status**: Automatically detects ports (`:5173`, `:3000`, `:8080`, etc.) and displays the project/script name with `[Dev]` and `[System]` tags.
- ⏱️ **Active Duration Tracker**: See how long each server has been running so you don't leave forgotten servers running in the background.
- 🌐 **1-Click Open**: Instantly open `http://localhost:<port>` in your browser.
- 🛑 **1-Click Port Killer**: Kill stubborn or forgotten processes (`taskkill /F /T`) right from the shelf.
- 🪟 **Edge-Drop Screen Mechanics**: Click-through when closed (`WS_EX_NOACTIVATE`), 0-px intrusive zone, and smooth spring physics on hover.
- 🎛️ **System Tray Integration**: Quietly resides in your Windows taskbar tray (near the clock) with right-click menu:
  - Live port status counter
  - **"Start on Windows Boot"** toggle
  - **"Quit The Watcher"**
- ⚡ **Lightweight Production Mode**: Runs silently with no terminal windows, consuming minimal system resources (~45MB RAM).

---

## 🚀 How to Launch The Watcher

### Option A: From Desktop or Start Menu (Recommended)
- **Desktop**: Double-click the **The Watcher** shortcut created on your Desktop.
- **Start Menu**: Press the Windows key, type `The Watcher`, and hit Enter.

### Option B: From Terminal (Production Mode)
```powershell
npm start
```

### Option C: Development Mode (Hot Reload)
```powershell
npm run dev
```

---

## ⚙️ Auto-Start on Windows Boot

1. Right-click **The Watcher** tray icon (near your clock in the bottom-right taskbar).
2. Check **"Start on Windows Boot"**.
3. Now The Watcher will automatically launch in the background every time you turn on your laptop!
