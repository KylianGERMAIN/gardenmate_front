import "@testing-library/jest-dom/vitest";

// jsdom n'implémente pas <dialog>.showModal()/close() → polyfill minimal pour
// les composants qui pilotent un <dialog> natif (AddPlantDialog, ConfirmDialog).
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
}
if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
}
