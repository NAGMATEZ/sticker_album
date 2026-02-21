import React, { useState, useRef, useCallback } from "react";

/**
 * Sticker component — draggable, flippable sticker with front/back sides.
 * Props:
 *   animal       – animal data object { id, name, emoji, color, image, fact }
 *   initialPos   – { x, y } starting position (or null = in the tray)
 *   onPositionChange(id, pos) – callback when sticker is moved
 *   inTray       – when true the sticker is shown in the sticker tray (not on the album)
 */
function Sticker({ animal, initialPos, onPositionChange, inTray = false }) {
  const [flipped, setFlipped] = useState(false);
  const [pos, setPos] = useState(initialPos || { x: 0, y: 0 });

  // drag state kept in a ref so it doesn't trigger re-renders during the drag
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e) => {
      if (inTray) return; // tray stickers are not draggable in-place
      e.preventDefault();
      dragging.current = true;
      dragOffset.current = {
        x: e.clientX - pos.x,
        y: e.clientY - pos.y,
      };

      const handleMouseMove = (me) => {
        if (!dragging.current) return;
        const newPos = {
          x: me.clientX - dragOffset.current.x,
          y: me.clientY - dragOffset.current.y,
        };
        setPos(newPos);
        if (onPositionChange) onPositionChange(animal.id, newPos);
      };

      const handleMouseUp = () => {
        dragging.current = false;
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [pos, animal.id, onPositionChange, inTray]
  );

  // Touch support
  const handleTouchStart = useCallback(
    (e) => {
      if (inTray) return;
      const touch = e.touches[0];
      dragging.current = true;
      dragOffset.current = {
        x: touch.clientX - pos.x,
        y: touch.clientY - pos.y,
      };

      const handleTouchMove = (te) => {
        if (!dragging.current) return;
        const t = te.touches[0];
        const newPos = {
          x: t.clientX - dragOffset.current.x,
          y: t.clientY - dragOffset.current.y,
        };
        setPos(newPos);
        if (onPositionChange) onPositionChange(animal.id, newPos);
      };

      const handleTouchEnd = () => {
        dragging.current = false;
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", handleTouchEnd);
      };

      window.addEventListener("touchmove", handleTouchMove, { passive: true });
      window.addEventListener("touchend", handleTouchEnd);
    },
    [pos, animal.id, onPositionChange, inTray]
  );

  const handleFlip = useCallback(
    (e) => {
      // only flip on click (not after a drag)
      if (!dragging.current) {
        e.stopPropagation();
        setFlipped((f) => !f);
      }
    },
    []
  );

  const stickerStyle = inTray
    ? {}
    : {
        position: "absolute",
        left: pos.x,
        top: pos.y,
        zIndex: 100,
        cursor: "grab",
      };

  return (
    <div
      className={`sticker-wrapper${inTray ? " sticker-in-tray" : ""}`}
      style={stickerStyle}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleFlip}
    >
      <div className={`sticker-inner${flipped ? " flipped" : ""}`}>
        {/* Front */}
        <div
          className="sticker-face sticker-front"
          style={{ backgroundColor: animal.color + "33" }}
        >
          <div
            className="sticker-image"
            style={{ backgroundImage: `url(${animal.image})` }}
            role="img"
            aria-label={animal.name}
          />
          <span className="sticker-id">#{animal.id}</span>
        </div>

        {/* Back */}
        <div className="sticker-face sticker-back">
          <span className="sticker-back-emoji">{animal.emoji}</span>
          <p className="sticker-back-name">{animal.name}</p>
          <p className="sticker-back-number">#{animal.id}</p>
        </div>
      </div>
    </div>
  );
}

export default Sticker;
