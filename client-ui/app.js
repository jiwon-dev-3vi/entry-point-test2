'use strict';

const API_BASE = window.API_BASE || 'http://localhost:3000';

const healthBadge = document.getElementById('health-badge');
const healthDetail = document.getElementById('health-detail');
const itemForm = document.getElementById('item-form');
const itemInput = document.getElementById('item-input');
const itemList = document.getElementById('item-list');
const refreshBtn = document.getElementById('refresh-btn');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `request failed (${response.status})`);
  }
  return data;
}

async function loadHealth() {
  try {
    const data = await request('/health');
    healthBadge.textContent = '연결됨';
    healthBadge.className = 'badge ok';
    healthDetail.textContent = `${data.service} · ${data.entry} · ${data.timestamp}`;
  } catch (error) {
    healthBadge.textContent = '연결 실패';
    healthBadge.className = 'badge error';
    healthDetail.textContent = error.message;
  }
}

function renderItems(items) {
  if (!items.length) {
    itemList.innerHTML = '<li class="empty">항목이 없습니다. 위에서 추가해 보세요.</li>';
    return;
  }

  itemList.innerHTML = items
    .map(
      (item) => `
        <li class="${item.done ? 'done' : ''}" data-id="${item.id}">
          <span class="item-title">${escapeHtml(item.title)}</span>
          <span class="item-meta">${item.createdAt.slice(0, 19)}</span>
          <button type="button" class="secondary toggle-btn">완료 토글</button>
          <button type="button" class="danger delete-btn">삭제</button>
        </li>
      `,
    )
    .join('');
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

async function loadItems() {
  try {
    const data = await request('/api/items');
    renderItems(data.items);
  } catch (error) {
    itemList.innerHTML = `<li class="empty">목록 로드 실패: ${escapeHtml(error.message)}</li>`;
  }
}

itemForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = itemInput.value.trim();
  if (!title) return;

  try {
    await request('/api/items', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    itemInput.value = '';
    await loadItems();
  } catch (error) {
    alert(error.message);
  }
});

itemList.addEventListener('click', async (event) => {
  const row = event.target.closest('li[data-id]');
  if (!row) return;

  const id = row.dataset.id;

  try {
    if (event.target.classList.contains('toggle-btn')) {
      await request(`/api/items/${id}/toggle`, { method: 'PATCH' });
      await loadItems();
    }

    if (event.target.classList.contains('delete-btn')) {
      await request(`/api/items/${id}`, { method: 'DELETE' });
      await loadItems();
    }
  } catch (error) {
    alert(error.message);
  }
});

refreshBtn.addEventListener('click', async () => {
  await Promise.all([loadHealth(), loadItems()]);
});

loadHealth();
loadItems();
