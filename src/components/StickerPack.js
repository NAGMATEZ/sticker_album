import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sticker from "./Sticker";

/**
 * StickerPack component — handles daily sticker pack opening.
 * Props:
 *   pack            – array of animal objects in the pack (null if no pack available)
 *   alreadyOpened   – boolean, true if today's pack was already opened
 *   onOpen()        – callback when the pack is opened
 *   onAddToTray(animals) – callback to add animals to collected list
 */
function StickerPack({ pack, alreadyOpened, onOpen, onAddToTray }) {
  const [opened, setOpened] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const handleOpen = () => {
    if (alreadyOpened || !pack) return;
    onOpen();
    setOpened(true);
    // Reveal stickers after the pack "tear" animation
    setTimeout(() => {
      setRevealed(true);
      onAddToTray(pack);
    }, 800);
  };

  if (!pack && !alreadyOpened) {
    return (
      <div className="sticker-pack sticker-pack--unavailable">
        <p>No pack available.</p>
      </div>
    );
  }

  if (alreadyOpened && !opened) {
    return (
      <div className="sticker-pack sticker-pack--used">
        <div className="sticker-pack-icon">📦</div>
        <p className="sticker-pack-label">Come back tomorrow for a new pack!</p>
        <p className="sticker-pack-sublabel">You already opened today's pack.</p>
      </div>
    );
  }

  return (
    <div className="sticker-pack-area">
      <AnimatePresence>
        {!opened && (
          <motion.div
            key="pack"
            className="sticker-pack sticker-pack--available"
            whileHover={{ scale: 1.05, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            exit={{ scale: 0, opacity: 0, rotate: 30 }}
            transition={{ duration: 0.4 }}
            onClick={handleOpen}
          >
            <div className="sticker-pack-icon">🎁</div>
            <p className="sticker-pack-label">Daily Sticker Pack</p>
            <p className="sticker-pack-sublabel">Click to open!</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revealed && (
          <motion.div
            key="stickers"
            className="sticker-pack-reveal"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="sticker-pack-reveal-title">🎉 New stickers!</h3>
            <div className="sticker-pack-reveal-grid">
              {pack.map((animal, i) => (
                <motion.div
                  key={animal.id}
                  initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.12, type: "spring", stiffness: 200 }}
                >
                  <Sticker animal={animal} inTray={true} />
                </motion.div>
              ))}
            </div>
            <p className="sticker-pack-reveal-hint">
              Find them in your sticker tray below!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StickerPack;
