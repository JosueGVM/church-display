// --- ESTADOS INTERNOS DEL MÓDULO ---
let catalogMedia = [];    // Almacena los archivos escaneados físicamente
let cronograma = [];      // Almacena los medios programados en el cronograma

let selectedMedia = null;  // Medio en vista previa actual
let activeLiveMedia = null; // Medio transmitiéndose en vivo en la pantalla externa

// --- ELEMENTOS DE LA INTERFAZ ---
let mediaSearch, mediaCatalogList, btnImportMedia, mediaFileInput;
let cronogramaDropZone, mediaCronogramaList, btnClearCronograma;
let currentMediaTitle, currentMediaType;
let playerPreviewBox, previewImage, previewVideo, previewAudioContainer, previewAudio, previewEmptyMsg;
let btnClearBg, btnProjectMedia;

export async function init() {
    // 1. Vincular elementos
    mediaSearch = document.getElementById('media-search');
    mediaCatalogList = document.getElementById('media-catalog-list');
    btnImportMedia = document.getElementById('btn-import-media');
    mediaFileInput = document.getElementById('media-file-input');

    cronogramaDropZone = document.getElementById('cronograma-drop-zone');
    mediaCronogramaList = document.getElementById('media-cronograma-list');
    btnClearCronograma = document.getElementById('btn-clear-cronograma');

    currentMediaTitle = document.getElementById('current-media-title');
    currentMediaType = document.getElementById('current-media-type');

    playerPreviewBox = document.getElementById('player-preview-box');
    previewImage = document.getElementById('preview-image');
    previewVideo = document.getElementById('preview-video');
    previewAudioContainer = document.getElementById('preview-audio-container');
    previewAudio = document.getElementById('preview-audio');
    previewEmptyMsg = document.getElementById('preview-empty-msg');

    btnClearBg = document.getElementById('btn-clear-bg');
    btnProjectMedia = document.getElementById('btn-project-media');

    // 2. Escuchar botones de importación
    btnImportMedia.addEventListener('click', () => mediaFileInput.click());
    mediaFileInput.addEventListener('change', handleFileImport);

    // Búsqueda en catálogo
    mediaSearch.addEventListener('input', renderCatalog);

    // Limpieza de Cronograma y Fondo
    btnClearCronograma.addEventListener('click', clearCronograma);
    btnClearBg.addEventListener('click', clearLiveBackground);
    btnProjectMedia.addEventListener('click', () => {
        if (selectedMedia) projectMedia(selectedMedia);
    });

    // 3. Inicializar Drag and Drop (HTML5)
    setupDragAndDrop();

    // 4. Escuchar Teclado (ESC o ENTER en el reproductor)
    document.removeEventListener('keydown', handleMediaKeydown);
    document.addEventListener('keydown', handleMediaKeydown);

    // 5. Escanear y listar los archivos del directorio portátil
    await loadMediaCatalog();
}

// ================= LÓGICA DE CATÁLOGO (COLUMNA 1) =================

async function loadMediaCatalog() {
    try {
        const result = await window.api.scanMedia();
        if (result && result.success) {
            catalogMedia = result.files;
            renderCatalog();
        }
    } catch (err) {
        console.error("[Media] Error al escanear catálogo de archivos:", err);
    }
}

function renderCatalog() {
    mediaCatalogList.innerHTML = '';
    const query = mediaSearch.value.trim().toLowerCase();

    const filteredFiles = catalogMedia.filter(file => file.name.toLowerCase().includes(query));

    if (filteredFiles.length === 0) {
        mediaCatalogList.innerHTML = '<li style="font-size: 12px; color: var(--text-secondary); text-align: center; cursor: default;">No hay medios importados.</li>';
        return;
    }

    filteredFiles.forEach(file => {
        const li = document.createElement('li');
        li.draggable = true;

        const iconBadge = file.type === 'image' ? '🖼️' : (file.type === 'video' ? '🎥' : '🎵');

        // --- DIBUJAMOS EL BOTÓN 🗑️ JUNTO AL + ---
        li.innerHTML = `
            <div class="media-info">
                <span class="media-icon-badge">${iconBadge}</span>
                <div class="media-info-text">
                    <h4>${file.name}</h4>
                    <p>${file.type.toUpperCase()}</p>
                </div>
            </div>
            <div style="display: flex; gap: 4px; align-items: center;">
                <button class="cat-btn-add" title="Agregar al Cronograma">+</button>
                <button class="cat-btn-delete" title="Eliminar Archivo" style="background: none; border: none; color: var(--danger); font-size: 14px; cursor: pointer; padding: 0 4px;">🗑️</button>
            </div>
        `;

        // Eventos Drag-start
        li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('source', 'catalog');
            e.dataTransfer.setData('file-data', JSON.stringify(file));
            e.dataTransfer.effectAllowed = 'copy';
        });

        // Botón rápido de agregar
        li.querySelector('.cat-btn-add').addEventListener('click', (e) => {
            e.stopPropagation();
            addToCronograma(file);
        });

        // --- BOTÓN ELIMINAR (Confirmación nativa y borrado físico) ---
        li.querySelector('.cat-btn-delete').addEventListener('click', async (e) => {
            e.stopPropagation();
            const confirmar = confirm(`¿Estás seguro de que deseas eliminar permanentemente el archivo "${file.name}"?`);
            if (confirmar) {
                try {
                    const res = await window.api.deleteMedia(file.path);
                    if (res && res.success) {
                        // Volver a escanear carpeta para refrescar la lista
                        await loadMediaCatalog();
                    } else {
                        alert("No se pudo eliminar el archivo.");
                    }
                } catch (err) {
                    console.error("Error al borrar medio:", err);
                }
            }
        });

        li.addEventListener('click', () => {
            loadPreview(file);
        });

        mediaCatalogList.appendChild(li);
    });
}

// Lógica para importar archivos y convertirlos dinámicamente
async function handleFileImport(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const file of files) {
        // Limpiamos caracteres extraños del nombre
        const cleanName = file.name.replace(/\s+/g, "_");

        if (file.type.startsWith('image/')) {
            // IMAGENES: Conversión nativa a WebP usando HTML5 Canvas (Portabilidad C++ libre)
            try {
                const nameWithoutExt = cleanName.substring(0, cleanName.lastIndexOf('.')) || cleanName;
                const webpName = `${nameWithoutExt}.webp`;
                
                // Convertir imagen
                const base64Data = await convertToWebP(file);
                
                // Guardar WebP físicamente en la USB
                await window.api.saveWebP({ fileName: webpName, base64Data });
            } catch (err) {
                console.error("[Media] Error al convertir imagen a WebP:", err);
            }
        } else {
            // VIDEOS Y AUDIOS: Copiado físico directo al directorio portátil de la USB
            const type = file.type.startsWith('video/') ? 'video' : 'audio';
            try {
                await window.api.importMedia({ sourcePath: file.path, type });
            } catch (err) {
                console.error("[Media] Error al importar video/audio portátil:", err);
            }
        }
    }

    // Limpiar input y volver a escanear la carpeta portátil para refrescar el catálogo
    mediaFileInput.value = '';
    await loadMediaCatalog();
}

// Función Canvas para convertir imágenes de forma 100% nativa en el navegador
function convertToWebP(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                // Exportar como WebP en calidad óptima de 0.85
                const webpBase64 = canvas.toDataURL('image/webp', 0.85);
                resolve(webpBase64);
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ================= LÓGICA DE CRONOGRAMA (COLUMNA 2) =================

function addToCronograma(file) {
    const playlistItem = {
        ...file,
        cronoId: Date.now() + Math.random()
    };
    cronograma.push(playlistItem);
    renderCronograma();
}

function renderCronograma() {
    mediaCronogramaList.innerHTML = '';

    if (cronograma.length === 0) {
        mediaCronogramaList.innerHTML = '<li style="font-size: 11px; color: var(--text-secondary); text-align: center; border: none; cursor: default; background: none; padding-top: 15px;">Cronograma vacío. Arrastra medios aquí.</li>';
        return;
    }

    cronograma.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = `cronograma-item ${selectedMedia && selectedMedia.cronoId === item.cronoId ? 'active-item' : ''}`;
        li.draggable = true;
        li.dataset.index = index;

        li.innerHTML = `
            <span class="cronograma-item-title">${item.name}</span>
            <div class="cronograma-controls">
                <button class="btn-move btn-up" title="Subir">▲</button>
                <button class="btn-move btn-down" title="Bajar">▼</button>
                <button class="btn-remove-cron" title="Quitar">×</button>
            </div>
        `;

        li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('source', 'cronograma');
            e.dataTransfer.setData('index', index);
            e.dataTransfer.effectAllowed = 'move';
        });

        li.addEventListener('click', () => {
            loadPreview(item);
            renderCronograma();
        });

        li.querySelector('.btn-up').addEventListener('click', (e) => {
            e.stopPropagation();
            moveInCronograma(index, -1);
        });

        li.querySelector('.btn-down').addEventListener('click', (e) => {
            e.stopPropagation();
            moveInCronograma(index, 1);
        });

        li.querySelector('.btn-remove-cron').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromCronograma(index);
        });

        mediaCronogramaList.appendChild(li);
    });
}

function moveInCronograma(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < cronograma.length) {
        const temp = cronograma[index];
        cronograma[index] = cronograma[targetIndex];
        cronograma[targetIndex] = temp;
        renderCronograma();
    }
}

function removeFromCronograma(index) {
    if (selectedMedia && selectedMedia.cronoId === cronograma[index].cronoId) {
        resetPreview();
    }
    cronograma.splice(index, 1);
    renderCronograma();
}

function clearCronograma() {
    cronograma = [];
    resetPreview();
    renderCronograma();
}

// --- Drag and Drop ---
function setupDragAndDrop() {
    cronogramaDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        cronogramaDropZone.classList.add('drag-over');
    });

    cronogramaDropZone.addEventListener('dragleave', () => {
        cronogramaDropZone.classList.remove('drag-over');
    });

    cronogramaDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        cronogramaDropZone.classList.remove('drag-over');

        const source = e.dataTransfer.getData('source');

        if (source === 'catalog') {
            const fileData = JSON.parse(e.dataTransfer.getData('file-data'));
            addToCronograma(fileData);
        } else if (source === 'cronograma') {
            const sourceIndex = parseInt(e.dataTransfer.getData('index'));
            const targetLi = e.target.closest('.cronograma-item');
            if (targetLi) {
                const targetIndex = parseInt(targetLi.dataset.index);
                if (sourceIndex !== targetIndex) {
                    const itemToMove = cronograma[sourceIndex];
                    cronograma.splice(sourceIndex, 1);
                    cronograma.splice(targetIndex, 0, itemToMove);
                    renderCronograma();
                }
            }
        }
    });
}

// ================= LÓGICA DE PREVISUALIZACIÓN Y CONTROLES (COLUMNA 3) =================
function loadPreview(file) {
    selectedMedia = file;

    currentMediaTitle.textContent = file.name;
    currentMediaType.textContent = file.type.toUpperCase();

    // Apagar elementos visuales anteriores
    previewImage.style.display = 'none';
    previewVideo.style.display = 'none';
    previewVideo.pause();
    previewVideo.src = '';

    previewAudioContainer.style.display = 'none';
    previewAudioContainer.classList.remove('playing');
    previewAudio.pause();
    previewAudio.src = '';

    previewEmptyMsg.style.display = 'none';

    // --- USAMOS DIRECTAMENTE file.url ---
    if (file.type === 'image') {
        previewImage.src = file.url;
        previewImage.style.display = 'block';
    } else if (file.type === 'video') {
        previewVideo.src = file.url;
        previewVideo.style.display = 'block';
        previewVideo.load();
    } else if (file.type === 'audio') {
        previewAudio.src = file.url;
        previewAudioContainer.style.display = 'flex';
        previewAudio.load();

        previewAudio.onplay = () => previewAudioContainer.classList.add('playing');
        previewAudio.onpause = () => previewAudioContainer.classList.remove('playing');
    }
}

function resetPreview() {
    selectedMedia = null;
    currentMediaTitle.textContent = "Ningún medio seleccionado";
    currentMediaType.textContent = "";

    previewImage.style.display = 'none';
    previewImage.src = '';
    
    previewVideo.style.display = 'none';
    previewVideo.pause();
    previewVideo.src = '';

    previewAudioContainer.style.display = 'none';
    previewAudio.pause();
    previewAudio.src = '';

    previewEmptyMsg.style.display = 'block';
}

// Enviar proyección del fondo activo (En vivo)
function projectMedia(file) {
    activeLiveMedia = file;

    // Actualizar UI del operador (Columna 3 - indicando en vivo)
    playerPreviewBox.classList.add('live');

    if (file.type === 'image' || file.type === 'video') {
        // Enviamos la instrucción de dibujo al visor
        window.api.proyectarTexto({
            background: {
                path: file.url,
                type: file.type
            }
        });
    } else if (file.type === 'audio') {
        // El audio se reproduce localmente por la salida de audio de la PC
        previewAudio.play().catch(err => console.error("Error reproduciendo audio:", err));
    }
}

// Apagar el fondo proyectado (Dejando pantalla negra limpia)
function clearLiveBackground() {
    activeLiveMedia = null;
    playerPreviewBox.classList.remove('live');
    window.api.proyectarTexto({ clearBg: true });

    // Si había un audio local sonando, lo pausamos
    previewAudio.pause();
}

// --- TECLADO ---

function handleMediaKeydown(e) {
    if (e.key === 'Escape') {
        clearLiveBackground();
        return;
    }

    if (e.key === 'Enter') {
        if (selectedMedia) {
            projectMedia(selectedMedia);
        }
    }
}