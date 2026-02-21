import React, { useState, useEffect, useRef, useCallback } from "react";
import Album from "./components/Album";
import StickerPack from "./components/StickerPack";
import Sticker from "./components/Sticker";
import ANIMALS from "./assets/animals";
import "./styles.css";

// ─── localStorage helpers ──────────────────────────────────────────────────
const LS_KEYS = {
  collected: "stickerAlbum_collected",
  placements: "stickerAlbum_placements",
  lastPackDate: "stickerAlbum_lastPackDate",
  dailyPack: "stickerAlbum_dailyPack",
};

function loadState() {
  try {
    return {
      collected: JSON.parse(localStorage.getItem(LS_KEYS.collected) || "[]"),
      placements: JSON.parse(localStorage.getItem(LS_KEYS.placements) || "{}"),
      lastPackDate: localStorage.getItem(LS_KEYS.lastPackDate) || null,
      dailyPack: JSON.parse(localStorage.getItem(LS_KEYS.dailyPack) || "null"),
    };
  } catch {
    return { collected: [], placements: {}, lastPackDate: null, dailyPack: null };
  }
}

function saveState(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Helpers ──────────────────────────────────────────────────────────────
function todayString() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function generatePack(size) {
  var s = size || 5;
  // Fisher-Yates shuffle for unbiased randomisation
  var arr = ANIMALS.slice();
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr.slice(0, s);
}

// ─── Sticker Tray ─────────────────────────────────────────────────────────
function StickerTray({ collected, placements, onDropToAlbum }) {
  var trayIds = collected.filter(function(id) { return !placements[id]; });
  var animals = ANIMALS.filter(function(a) { return trayIds.includes(a.id); });

  var [ghost, setGhost] = useState(null);
  var ghostRef = useRef(null);

  var handleTrayMouseDown = useCallback(
    function(animal, e) {
      e.preventDefault();
      setGhost({ animal: animal, x: e.clientX, y: e.clientY });

      function move(me) {
        setGhost(function(g) { return g ? { animal: g.animal, x: me.clientX, y: me.clientY } : null; });
      }

      function up(ue) {
        onDropToAlbum(animal.id, { x: ue.clientX, y: ue.clientY });
        setGhost(null);
        window.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", up);
      }

      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    },
    [onDropToAlbum]
  );

  var handleTrayTouchStart = useCallback(
    function(animal, e) {
      var touch = e.touches[0];
      setGhost({ animal: animal, x: touch.clientX, y: touch.clientY });

      function move(te) {
        var t = te.touches[0];
        setGhost(function(g) { return g ? { animal: g.animal, x: t.clientX, y: t.clientY } : null; });
      }

      function end(te) {
        var t = te.changedTouches[0];
        onDropToAlbum(animal.id, { x: t.clientX, y: t.clientY });
        setGhost(null);
        window.removeEventListener("touchmove", move);
        window.removeEventListener("touchend", end);
      }

      window.addEventListener("touchmove", move, { passive: true });
      window.addEventListener("touchend", end);
    },
    [onDropToAlbum]
  );

  return (
    <>
      <div className="sticker-tray">
        <div className="sticker-tray-header">
          <h3 className="sticker-tray-title">🗂 Sticker Tray</h3>
          <span className="sticker-tray-count">{animals.length}</span>
        </div>

        {animals.length === 0 ? (
          <div className="sticker-tray-empty">
            <p>No stickers yet.</p>
            <p>Open your daily pack to get started! ☝️</p>
          </div>
        ) : (
          <div className="sticker-tray-grid">
            {animals.map(function(animal) {
              return (
                <div
                  key={animal.id}
                  className="sticker-tray-item"
                  onMouseDown={function(e) { handleTrayMouseDown(animal, e); }}
                  onTouchStart={function(e) { handleTrayTouchStart(animal, e); }}
                  title={"Drag " + animal.name + " onto the album"}
                >
                  <Sticker animal={animal} inTray={true} />
                  <p className="sticker-tray-item-name">{animal.name}</p>
                  <p className="sticker-tray-drag-hint">drag to album →</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {ghost && (
        <div
          ref={ghostRef}
          className="sticker-drag-ghost"
          style={{ left: ghost.x, top: ghost.y }}
        >
          <Sticker animal={ghost.animal} inTray={true} />
        </div>
      )}
    </>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────
function ProgressBar({ collected, total }) {
  var pct = total === 0 ? 0 : Math.round((collected / total) * 100);
  return (
    <div className="progress-bar-container">
      <p className="progress-bar-label">
        Collection: {collected} / {total} ({pct}%)
      </p>
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: pct + "%" }} />
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────
function App() {
  var initialState = loadState();
  var today = todayString();

  var [collected, setCollected] = useState(initialState.collected);
  var [placements, setPlacements] = useState(initialState.placements);
  var [lastPackDate, setLastPackDate] = useState(initialState.lastPackDate);
  var [dailyPack, setDailyPack] = useState(function() {
    if (initialState.lastPackDate === today && initialState.dailyPack) {
      return initialState.dailyPack;
    }
    return generatePack(5);
  });

  var alreadyOpenedToday = lastPackDate === today;

  // Generate a new pack each new day
  useEffect(function() {
    if (lastPackDate !== today) {
      var newPack = generatePack(5);
      setDailyPack(newPack);
      saveState(LS_KEYS.dailyPack, newPack);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(function() { saveState(LS_KEYS.collected, collected); }, [collected]);
  useEffect(function() { saveState(LS_KEYS.placements, placements); }, [placements]);
  useEffect(function() { saveState(LS_KEYS.dailyPack, dailyPack); }, [dailyPack]);

  var handleOpenPack = useCallback(function() {
    var t = todayString();
    setLastPackDate(t);
    saveState(LS_KEYS.lastPackDate, t);
  }, []);

  var handleAddToTray = useCallback(function(animals) {
    setCollected(function(prev) {
      var newIds = animals.map(function(a) { return a.id; }).filter(function(id) { return !prev.includes(id); });
      return prev.concat(newIds);
    });
  }, []);

  // Shared helper for updating a sticker placement and persisting it
  var updatePlacement = useCallback(function(id, pos) {
    setPlacements(function(prev) {
      var updated = { ...prev, [id]: { pos: pos } };
      saveState(LS_KEYS.placements, updated);
      return updated;
    });
  }, []);

  var handlePositionChange = updatePlacement;
  var handleDropToAlbum = updatePlacement;

  var uniqueCollected = Array.from(new Set(collected));

  return (
    <div className="app">
      <header className="app-header">
        <h1>🐾 Wild World Sticker Album</h1>
        <p>Collect, paste and discover amazing animals!</p>
      </header>

      <main className="app-body">
        <Album
          animals={ANIMALS}
          placements={placements}
          onPositionChange={handlePositionChange}
        />

        <aside className="right-panel">
          <ProgressBar
            collected={uniqueCollected.length}
            total={ANIMALS.length}
          />

          <StickerPack
            pack={dailyPack}
            alreadyOpened={alreadyOpenedToday}
            onOpen={handleOpenPack}
            onAddToTray={handleAddToTray}
          />

          <StickerTray
            collected={uniqueCollected}
            placements={placements}
            onDropToAlbum={handleDropToAlbum}
          />
        </aside>
      </main>
    </div>
  );
}

export default App;
