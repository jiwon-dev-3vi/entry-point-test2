'use strict';

const items = [
  { id: '1', title: '샘플 항목', done: false, createdAt: new Date().toISOString() },
];

let nextId = 2;

function listItems() {
  return [...items];
}

function createItem(title) {
  const item = {
    id: String(nextId++),
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };
  items.push(item);
  return item;
}

function toggleItem(id) {
  const item = items.find((entry) => entry.id === id);
  if (!item) return null;
  item.done = !item.done;
  return item;
}

function deleteItem(id) {
  const index = items.findIndex((entry) => entry.id === id);
  if (index === -1) return false;
  items.splice(index, 1);
  return true;
}

module.exports = {
  listItems,
  createItem,
  toggleItem,
  deleteItem,
};
