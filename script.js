// Initial Elements
const initialElements = [
    { name: "Water", emoji: "💧" },
    { name: "Fire", emoji: "🔥" },
    { name: "Earth", emoji: "🌍" },
    { name: "Wind", emoji: "💨" }
];

// Recipes (Key: "Element1+Element2" sorted alphabetically)
const recipes = {
    "Fire+Water": { name: "Steam", emoji: "💨" },
    "Earth+Water": { name: "Plant", emoji: "🌱" },
    "Fire+Wind": { name: "Smoke", emoji: "🌫️" },
    "Earth+Fire": { name: "Lava", emoji: "🌋" },
    "Earth+Wind": { name: "Dust", emoji: "🌫️" },
    "Water+Wind": { name: "Wave", emoji: "🌊" },
    "Earth+Plant": { name: "Tree", emoji: "🌳" },
    "Fire+Plant": { name: "Ash", emoji: "⚱️" },
    "Plant+Water": { name: "Swamp", emoji: "🐊" },
    "Fire+Swamp": { name: "Dragon", emoji: "🐉" },
    "Lava+Water": { name: "Stone", emoji: "🪨" },
    "Stone+Wind": { name: "Sand", emoji: "🏖️" },
    "Fire+Sand": { name: "Glass", emoji: "🥃" },
    "Sand+Water": { name: "Beach", emoji: "🏖️" },
    "Plant+Wind": { name: "Dandelion", emoji: "🌼" },
    "Dandelion+Water": { name: "Wine", emoji: "🍷" },
    "Fire+Tree": { name: "Charcoal", emoji: "⚫" },
    "Steam+Water": { name: "Cloud", emoji: "☁️" },
    "Cloud+Water": { name: "Rain", emoji: "🌧️" },
    "Rain+Water": { name: "Flood", emoji: "🌊" },
    "Earth+Rain": { name: "Mud", emoji: "💩" }, // Fun variant
    "Fire+Mud": { name: "Brick", emoji: "🧱" },
    "Brick+Brick": { name: "Wall", emoji: "🧱" },
    "Wall+Wall": { name: "House", emoji: "🏠" },
    "House+House": { name: "Village", emoji: "🏘️" },
    "Village+Village": { name: "City", emoji: "🏙️" },
    "Earth+Life": { name: "Human", emoji: "🧑" }, // Placeholder for Life
    "Dust+Wind": { name: "Storm", emoji: "⛈️" },
    "Cloud+Electricity": { name: "Lightning", emoji: "⚡" }, // Placeholder
    "Fire+Stone": { name: "Metal", emoji: "🤘" },
    "Metal+Steam": { name: "Engine", emoji: "🚂" },
    "Engine+Water": { name: "Steamboat", emoji: "🚢" },
    "Engine+Wind": { name: "Car", emoji: "🚗" },
    "Car+Car": { name: "Traffic", emoji: "🚦" },
    "Earth+Earth": { name: "Mountain", emoji: "⛰️" },
    "Mountain+Water": { name: "Lake", emoji: "🏞️" },
    "Lake+Water": { name: "Ocean", emoji: "🌊" },
    "Ocean+Wind": { name: "Tsunami", emoji: "🌊" },
    "Swamp+Tree": { name: "Mangrove", emoji: "🌳" },
    "Ash+Water": { name: "Puddle", emoji: "💧" },
    "Lava+Sea": { name: "Obsidian", emoji: "🖤" }, // Placeholder
    "Stone+Stone": { name: "Boulder", emoji: "🪨" },
    "Boulder+Stone": { name: "Rock", emoji: "🪨" }
};

// State
let discoveredElements = JSON.parse(localStorage.getItem('craft_all_elements')) || [...initialElements];
let draggingElement = null;
let offsetX = 0;
let offsetY = 0;
let zIndexCounter = 10;

// DOM Elements
const sidebarList = document.getElementById('elements-list');
const playground = document.getElementById('playground');
const playgroundContent = document.getElementById('playground-content');
const searchInput = document.getElementById('search-input');
const clearBtn = document.getElementById('clear-btn');
const resetBtn = document.getElementById('reset-btn');

// Initialization
function init() {
    renderSidebar();
    setupEventListeners();
}

// Render Sidebar
function renderSidebar(filter = "") {
    sidebarList.innerHTML = '';
    const filtered = discoveredElements.filter(el =>
        el.name.toLowerCase().includes(filter.toLowerCase())
    );

    // Sort alphabetically
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    filtered.forEach(el => {
        const div = document.createElement('div');
        div.className = 'element';
        div.innerHTML = `<span class="element-emoji">${el.emoji}</span><span class="element-name">${el.name}</span>`;
        div.draggable = true; // For sidebar dragging

        // Sidebar drag start
        div.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify(el));
            e.dataTransfer.effectAllowed = 'copy';
        });

        // Click to add to center (optional UX)
        div.addEventListener('click', () => {
            spawnElement(el, playground.offsetWidth / 2 - 50, playground.offsetHeight / 2 - 20);
        });

        sidebarList.appendChild(div);
    });
}

// Spawn Element on Playground
function spawnElement(elementData, x, y, isNew = false) {
    const elDiv = document.createElement('div');
    elDiv.className = 'element element-instance';
    if (isNew) elDiv.classList.add('new-element');
    elDiv.innerHTML = `<span class="element-emoji">${elementData.emoji}</span><span class="element-name">${elementData.name}</span>`;

    elDiv.style.left = `${x}px`;
    elDiv.style.top = `${y}px`;
    elDiv.dataset.name = elementData.name;
    elDiv.dataset.emoji = elementData.emoji;

    // Mouse events for dragging within playground
    elDiv.addEventListener('mousedown', onMouseDown);
    elDiv.addEventListener('touchstart', onTouchStart, { passive: false });

    playgroundContent.appendChild(elDiv);
    return elDiv;
}

// Dragging Logic (Playground)
function onMouseDown(e) {
    if (e.button !== 0) return; // Only left click

    draggingElement = e.currentTarget;
    const rect = draggingElement.getBoundingClientRect();
    const parentRect = playgroundContent.getBoundingClientRect();

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    draggingElement.classList.add('dragging');
    draggingElement.style.zIndex = ++zIndexCounter;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e) {
    if (!draggingElement) return;

    const parentRect = playgroundContent.getBoundingClientRect();
    let x = e.clientX - parentRect.left - offsetX;
    let y = e.clientY - parentRect.top - offsetY;

    // Boundary checks (optional, but good)
    // x = Math.max(0, Math.min(x, parentRect.width - draggingElement.offsetWidth));
    // y = Math.max(0, Math.min(y, parentRect.height - draggingElement.offsetHeight));

    draggingElement.style.left = `${x}px`;
    draggingElement.style.top = `${y}px`;
}

function onMouseUp(e) {
    if (!draggingElement) return;

    draggingElement.classList.remove('dragging');

    // Check for collisions
    checkCollision(draggingElement);

    draggingElement = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

// Touch Events
function onTouchStart(e) {
    if (e.touches.length > 1) return; // Ignore multi-touch
    e.preventDefault(); // Prevent scrolling

    draggingElement = e.currentTarget;
    const rect = draggingElement.getBoundingClientRect();
    const touch = e.touches[0];

    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;

    draggingElement.classList.add('dragging');
    draggingElement.style.zIndex = ++zIndexCounter;

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
}

function onTouchMove(e) {
    if (!draggingElement) return;
    e.preventDefault(); // Prevent scrolling

    const parentRect = playgroundContent.getBoundingClientRect();
    const touch = e.touches[0];

    let x = touch.clientX - parentRect.left - offsetX;
    let y = touch.clientY - parentRect.top - offsetY;

    draggingElement.style.left = `${x}px`;
    draggingElement.style.top = `${y}px`;
}

function onTouchEnd(e) {
    if (!draggingElement) return;

    draggingElement.classList.remove('dragging');

    // Check for collisions
    checkCollision(draggingElement);

    draggingElement = null;
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
}

// Collision Detection & Combination
function checkCollision(activeEl) {
    const activeRect = activeEl.getBoundingClientRect();
    const elements = Array.from(document.querySelectorAll('.element-instance'));

    for (const otherEl of elements) {
        if (otherEl === activeEl) continue;

        const otherRect = otherEl.getBoundingClientRect();

        // Simple AABB collision
        if (
            activeRect.left < otherRect.right &&
            activeRect.right > otherRect.left &&
            activeRect.top < otherRect.bottom &&
            activeRect.bottom > otherRect.top
        ) {
            // Collision detected! Try to combine
            combineElements(activeEl, otherEl);
            return; // Only combine with one element at a time
        }
    }
}

function combineElements(el1, el2) {
    const name1 = el1.dataset.name;
    const name2 = el2.dataset.name;

    // Sort names to match recipe key
    const key = [name1, name2].sort().join('+');
    const result = recipes[key];

    if (result) {
        // Successful combination
        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();
        const parentRect = playgroundContent.getBoundingClientRect();

        // Calculate center position for new element
        const centerX = (rect1.left + rect2.left) / 2 - parentRect.left;
        const centerY = (rect1.top + rect2.top) / 2 - parentRect.top;

        // Remove parents
        el1.remove();
        el2.remove();

        // Spawn child
        spawnElement(result, centerX, centerY, true);

        // Discover new element
        discoverElement(result);
    } else {
        // No combination - maybe push away slightly or just do nothing
        // For now, do nothing, they just stack
    }
}

function discoverElement(element) {
    const exists = discoveredElements.some(e => e.name === element.name);
    if (!exists) {
        discoveredElements.push(element);
        saveProgress();
        renderSidebar(searchInput.value);

        // Scroll sidebar to bottom to show new element (optional)
        // sidebarList.scrollTop = sidebarList.scrollHeight;
    }
}

function saveProgress() {
    localStorage.setItem('craft_all_elements', JSON.stringify(discoveredElements));
}

// Sidebar Drag & Drop (Drop onto playground)
playground.addEventListener('dragover', (e) => {
    e.preventDefault(); // Allow drop
    e.dataTransfer.dropEffect = 'copy';
});

playground.addEventListener('drop', (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    try {
        const elementData = JSON.parse(data);
        const parentRect = playgroundContent.getBoundingClientRect();
        const x = e.clientX - parentRect.left - 40; // Center offset approx
        const y = e.clientY - parentRect.top - 20;

        spawnElement(elementData, x, y);
    } catch (err) {
        console.error("Drop error", err);
    }
});

// Event Listeners
function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        renderSidebar(e.target.value);
    });

    clearBtn.addEventListener('click', () => {
        playgroundContent.innerHTML = '';
    });

    resetBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres reiniciar todo tu progreso?')) {
            discoveredElements = [...initialElements];
            saveProgress();
            renderSidebar();
            playgroundContent.innerHTML = '';
        }
    });
}

// Start
init();
