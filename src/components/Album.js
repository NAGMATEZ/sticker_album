import React from "react";
import FunFact from "./FunFact";
import Sticker from "./Sticker";

/**
 * AlbumSlot — a single empty or filled slot in the album.
 * Props:
 *   animal         – the animal this slot is for
 *   placedSticker  – the placed sticker data ({ id, pos }) or null
 *   onPositionChange(id, pos) – bubble up drag movements
 */
function AlbumSlot({ animal, placedSticker, onPositionChange }) {
  return (
    <div className="album-slot" data-id={animal.id}>
      {/* Placeholder background */}
      <div
        className="album-slot-placeholder"
        style={{
          backgroundImage: `url(${animal.image})`,
          backgroundColor: animal.color + "22",
          borderColor: animal.color + "66",
        }}
      >
        {!placedSticker && (
          <span className="album-slot-number">#{animal.id}</span>
        )}
      </div>

      {/* Placed sticker (draggable, positioned absolutely relative to the album) */}
      {placedSticker && (
        <Sticker
          animal={animal}
          initialPos={placedSticker.pos}
          onPositionChange={onPositionChange}
          inTray={false}
        />
      )}
    </div>
  );
}

/**
 * AlbumPage — one page of the album, containing a grid of slots and a fun fact.
 * Props:
 *   animals        – array of animal objects for this page
 *   placements     – map of { animalId: { pos } }
 *   onPositionChange(id, pos)
 *   pageIndex      – page number (0-based)
 */
function AlbumPage({ animals, placements, onPositionChange, pageIndex }) {
  return (
    <div className="album-page">
      <div className="album-page-header">
        <h2 className="album-page-title">
          Wild World — Page {pageIndex + 1}
        </h2>
        <p className="album-page-subtitle">Amazing Animals Collection</p>
      </div>

      <div className="album-page-body">
        <div className="album-slots-grid">
          {animals.map((animal) => (
            <AlbumSlot
              key={animal.id}
              animal={animal}
              placedSticker={placements[animal.id] || null}
              onPositionChange={onPositionChange}
            />
          ))}
        </div>

        <div className="album-page-sidebar">
          {animals.map((animal) => (
            <FunFact key={animal.id} animal={animal} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Album — the full album with multiple pages and navigation.
 * Props:
 *   animals      – full list of all animal objects
 *   placements   – map of { animalId: { pos } }
 *   onPositionChange(id, pos)
 */
function Album({ animals, placements, onPositionChange }) {
  const STICKERS_PER_PAGE = 4;
  const [currentPage, setCurrentPage] = React.useState(0);

  // Split animals into pages
  const pages = [];
  for (let i = 0; i < animals.length; i += STICKERS_PER_PAGE) {
    pages.push(animals.slice(i, i + STICKERS_PER_PAGE));
  }

  const totalPages = pages.length;

  return (
    <div className="album-container">
      <AlbumPage
        animals={pages[currentPage] || []}
        placements={placements}
        onPositionChange={onPositionChange}
        pageIndex={currentPage}
      />

      <div className="album-nav">
        <button
          className="album-nav-btn"
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          aria-label="Previous page"
        >
          ◀ Prev
        </button>
        <span className="album-nav-info">
          Page {currentPage + 1} / {totalPages}
        </span>
        <button
          className="album-nav-btn"
          onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={currentPage === totalPages - 1}
          aria-label="Next page"
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}

export default Album;
