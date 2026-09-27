// Slot strings look like "18:00-19:00". These helpers parse/sort/validate them.

function parseSlot(slot) {
  const [start, end] = String(slot).split("-");
  return { start, end };
}

function sortSlots(slots) {
  return [...slots].sort((a, b) => parseSlot(a).start.localeCompare(parseSlot(b).start));
}

// Slots must be contiguous (each slot's end === next slot's start) to form one valid booking block
function areSlotsContiguous(sortedSlots) {
  for (let i = 0; i < sortedSlots.length - 1; i++) {
    if (parseSlot(sortedSlots[i]).end !== parseSlot(sortedSlots[i + 1]).start) {
      return false;
    }
  }
  return true;
}

function isDateInPast(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return target.getTime() < today.getTime();
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = { parseSlot, sortSlots, areSlotsContiguous, isDateInPast, todayStr };
