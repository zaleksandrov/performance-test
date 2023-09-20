"use strict";
const electron = require("electron");
const node_os = require("node:os");
const node_path = require("node:path");
const electronUpdater = require("electron-updater");
const three = require("three");
function update(win2) {
  electronUpdater.autoUpdater.autoDownload = false;
  electronUpdater.autoUpdater.disableWebInstaller = false;
  electronUpdater.autoUpdater.allowDowngrade = false;
  electronUpdater.autoUpdater.on("checking-for-update", function() {
  });
  electronUpdater.autoUpdater.on("update-available", (arg) => {
    win2.webContents.send("update-can-available", { update: true, version: electron.app.getVersion(), newVersion: arg == null ? void 0 : arg.version });
  });
  electronUpdater.autoUpdater.on("update-not-available", (arg) => {
    win2.webContents.send("update-can-available", { update: false, version: electron.app.getVersion(), newVersion: arg == null ? void 0 : arg.version });
  });
  electron.ipcMain.handle("check-update", async () => {
    if (!electron.app.isPackaged) {
      const error = new Error("The update feature is only available after the package.");
      return { message: error.message, error };
    }
    try {
      return await electronUpdater.autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      return { message: "Network error", error };
    }
  });
  electron.ipcMain.handle("start-download", (event) => {
    startDownload(
      (error, progressInfo) => {
        if (error) {
          event.sender.send("update-error", { message: error.message, error });
        } else {
          event.sender.send("download-progress", progressInfo);
        }
      },
      () => {
        event.sender.send("update-downloaded");
      }
    );
  });
  electron.ipcMain.handle("quit-and-install", () => {
    electronUpdater.autoUpdater.quitAndInstall(false, true);
  });
}
function startDownload(callback, complete) {
  electronUpdater.autoUpdater.on("download-progress", (info) => callback(null, info));
  electronUpdater.autoUpdater.on("error", (error) => callback(error, null));
  electronUpdater.autoUpdater.on("update-downloaded", complete);
  electronUpdater.autoUpdater.downloadUpdate();
}
const WORKER_TO_RENDERER = "worker-to-renderer";
const RENDERER_TO_WORKER = "renderer-to-worker";
const refreshRate = 10;
const iterationCount = 1e3;
const speed = 0.25;
const height = 20;
const DRONE_MAX_COUNT = 1e4;
const GRID_SIZE_X = 100;
const semiMajorAxis = 6378137;
const ellipsoidFlattening = 1 / 298.257223563;
const calculateAuxiliaryVariable = (latitude) => {
  return semiMajorAxis / Math.sqrt(1 - ellipsoidFlattening * (2 - ellipsoidFlattening) * Math.pow(Math.sin(latitude), 2));
};
const convertToGPS = (position) => {
  const latitude = Math.atan(position.z / Math.sqrt(position.x * position.x + position.y * position.y));
  const longitude = Math.atan2(position.y, position.x);
  const N = calculateAuxiliaryVariable(latitude);
  const positionMag = position.length();
  const altitude = positionMag / Math.cos(latitude) - N;
  return { longitude, latitude, altitude };
};
const sleep = async (time) => new Promise((r) => setTimeout(r, time));
const replyLoop = async (event) => {
  let counter = -1;
  let iteration = 1;
  const messages = [];
  const position = new three.Vector3();
  while (true) {
    for (let i = 0; i < iterationCount; i++) {
      counter++;
      if (counter === DRONE_MAX_COUNT) {
        counter = 0;
        iteration++;
      }
      const y = Math.sin((counter + iteration) % GRID_SIZE_X * speed) * height;
      if (counter >= messages.length)
        messages.push(`${WORKER_TO_RENDERER}${counter}`);
      position.set(0, y, 0);
      const data = { id: counter, position: convertToGPS(position), timestamp: 0 };
      event.sender.send(messages[counter], data);
    }
    await sleep(refreshRate);
  }
};
electron.ipcMain.on(RENDERER_TO_WORKER, (event, message) => {
  console.log("Received message in worker: ", message);
  replyLoop(event);
});
const { add } = require("../../build/Release/addon.node");
console.log("C++ addon - Add Function 2 + 3: ", add(2, 3));
process.env.DIST_ELECTRON = node_path.join(__dirname, "../");
process.env.DIST = node_path.join(process.env.DIST_ELECTRON, "../dist");
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL ? node_path.join(process.env.DIST_ELECTRON, "../public") : process.env.DIST;
if (node_os.release().startsWith("6.1"))
  electron.app.disableHardwareAcceleration();
if (process.platform === "win32")
  electron.app.setAppUserModelId(electron.app.getName());
if (!electron.app.requestSingleInstanceLock()) {
  electron.app.quit();
  process.exit(0);
}
let win = null;
const preload = node_path.join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = node_path.join(process.env.DIST, "index.html");
async function createWindow() {
  win = new electron.BrowserWindow({
    title: "Main window",
    icon: node_path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false
    }
  });
  if (url) {
    win.loadURL(url);
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.setWindowOpenHandler(({ url: url2 }) => {
    if (url2.startsWith("https:"))
      electron.shell.openExternal(url2);
    return { action: "deny" };
  });
  update(win);
}
electron.app.whenReady().then(createWindow);
electron.app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin")
    electron.app.quit();
});
electron.app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized())
      win.restore();
    win.focus();
  }
});
electron.app.on("activate", () => {
  const allWindows = electron.BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
electron.ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new electron.BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
//# sourceMappingURL=index.js.map
