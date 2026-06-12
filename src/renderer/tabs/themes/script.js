import { selectTab } from '../../control/script.js';

// --- ESTADOS INTERNOS DEL MÓDULO ---
let settingsData = null;
let scannedFonts = [];
let scannedMedia = [];

let selectedThemeId = null;
let activeAlignH = 'center';
let activeAlignV = 'center';

// --- ELEMENTOS DE LA INTERFAZ ---
let themesList, btnCreateTheme;
let selectGlobalBible, selectGlobalSongs, selectGlobalNotes;
let editorHeaderTitle, themeNameInput, themeFontSelect, themeSizeSlider, themeSizeVal;
let themeLineHeight, themeLineHeightVal, themeLetterSpacing, themeLetterSpacingVal;
let themeCheckBold, themeCheckItalic, themeCheckUppercase;
let themeColorInput, themeShadowColorInput;

// Contorno, Caja de Relleno, Título y Comentarios
let themeCheckStroke, strokeControlsRow, themeStrokeColor, themeStrokeWidth, themeStrokeWidthVal;
let themeCheckFillbox, fillboxControlsRow, themeFillboxColor, themeFillboxOpacity, themeFillboxOpacityVal;
let themeTitlePos, titleBarControlsRow, themeTitleBarColor, themeTitleBarOpacity, themeTitleBarOpacityVal;
let themeCheckComments;

let themeBgTypeSelect, groupBgMedia, themeBgMediaSelect, groupBgColor, themeBgColorInput;
let btnDeleteTheme, btnSaveTheme;
let settingsSaveStatus;

// Vista Previa (Elementos fijos de título)
let themePreviewBox, previewBgVideo, previewBgImage, previewTextOverlay, previewTextContent;
let previewTextBox;
let previewTitleBarTop, previewTitleBarBottom, previewTitleInlineTop, previewTitleInlineBottom;

export async function init() {
    // 1. Vincular elementos del catálogo de temas
    themesList = document.getElementById('themes-list');
    btnCreateTheme = document.getElementById('btn-create-theme');
    selectGlobalBible = document.getElementById('select-global-bible');
    selectGlobalSongs = document.getElementById('select-global-songs');
    selectGlobalNotes = document.getElementById('select-global-notes');

    // Vincular controles de Atributos
    editorHeaderTitle = document.getElementById('editor-header-title');
    themeNameInput = document.getElementById('theme-name');
    themeFontSelect = document.getElementById('theme-font-select');
    
    themeSizeSlider = document.getElementById('theme-size-slider');
    themeSizeVal = document.getElementById('theme-size-val');
    
    themeLineHeight = document.getElementById('theme-line-height');
    themeLineHeightVal = document.getElementById('theme-line-height-val');
    themeLetterSpacing = document.getElementById('theme-letter-spacing');
    themeLetterSpacingVal = document.getElementById('theme-letter-spacing-val');

    themeCheckBold = document.getElementById('theme-check-bold');
    themeCheckItalic = document.getElementById('theme-check-italic');
    themeCheckUppercase = document.getElementById('theme-check-uppercase');

    themeColorInput = document.getElementById('theme-color');
    themeShadowColorInput = document.getElementById('theme-shadow-color');

    // Contorno, Caja y Título
    themeCheckStroke = document.getElementById('theme-check-stroke');
    strokeControlsRow = document.getElementById('stroke-controls-row');
    themeStrokeColor = document.getElementById('theme-stroke-color');
    themeStrokeWidth = document.getElementById('theme-stroke-width');
    themeStrokeWidthVal = document.getElementById('theme-stroke-width-val');

    themeCheckFillbox = document.getElementById('theme-check-fillbox');
    fillboxControlsRow = document.getElementById('fillbox-controls-row');
    themeFillboxColor = document.getElementById('theme-fillbox-color');
    themeFillboxOpacity = document.getElementById('theme-fillbox-opacity');
    themeFillboxOpacityVal = document.getElementById('theme-fillbox-opacity-val');

    themeTitlePos = document.getElementById('theme-title-pos');
    titleBarControlsRow = document.getElementById('title-bar-controls-row');
    themeTitleBarColor = document.getElementById('theme-title-bar-color');
    themeTitleBarOpacity = document.getElementById('theme-title-bar-opacity');
    themeTitleBarOpacityVal = document.getElementById('theme-title-bar-opacity-val');

    themeCheckComments = document.getElementById('theme-check-comments');

    themeBgTypeSelect = document.getElementById('theme-bg-type');
    groupBgMedia = document.getElementById('group-bg-media');
    themeBgMediaSelect = document.getElementById('theme-bg-media');
    groupBgColor = document.getElementById('group-bg-color');
    themeBgColorInput = document.getElementById('theme-bg-color');

    btnDeleteTheme = document.getElementById('btn-delete-theme');
    btnSaveTheme = document.getElementById('btn-save-theme');
    settingsSaveStatus = document.getElementById('settings-save-status');

    // Vincular Vista Previa
    themePreviewBox = document.getElementById('theme-preview-box');
    previewBgVideo = document.getElementById('preview-bg-video');
    previewBgImage = document.getElementById('preview-bg-image');
    previewTextOverlay = document.getElementById('preview-text-overlay');
    previewTextContent = document.getElementById('preview-text-content');
    previewTextBox = document.getElementById('preview-text-box');
    
    // Las 4 posiciones del título en el HTML
    previewTitleBarTop = document.getElementById('preview-title-bar-top');
    previewTitleBarBottom = document.getElementById('preview-title-bar-bottom');
    previewTitleInlineTop = document.getElementById('preview-title-inline-top');
    previewTitleInlineBottom = document.getElementById('preview-title-inline-bottom');

    // 2. Escuchar cambios de interfaz en tiempo real (Live Preview)
    themeNameInput.addEventListener('input', updatePreview);
    themeFontSelect.addEventListener('change', updatePreview);
    
    themeSizeSlider.addEventListener('input', () => {
        themeSizeVal.textContent = `${themeSizeSlider.value} vh`;
        updatePreview();
    });
    themeLineHeight.addEventListener('input', () => {
        themeLineHeightVal.textContent = themeLineHeight.value;
        updatePreview();
    });
    themeLetterSpacing.addEventListener('input', () => {
        themeLetterSpacingVal.textContent = `${themeLetterSpacing.value} px`;
        updatePreview();
    });

    themeCheckBold.addEventListener('change', updatePreview);
    themeCheckItalic.addEventListener('change', updatePreview);
    themeCheckUppercase.addEventListener('change', updatePreview);

    themeColorInput.addEventListener('input', updatePreview);
    themeShadowColorInput.addEventListener('input', updatePreview);

    // Contorno (Toggle)
    themeCheckStroke.addEventListener('change', () => {
        strokeControlsRow.classList.toggle('hidden', !themeCheckStroke.checked);
        updatePreview();
    });
    themeStrokeColor.addEventListener('input', updatePreview);
    themeStrokeWidth.addEventListener('input', () => {
        themeStrokeWidthVal.textContent = `${themeStrokeWidth.value} px`;
        updatePreview();
    });

    // Caja de Relleno (Toggle)
    themeCheckFillbox.addEventListener('change', () => {
        fillboxControlsRow.classList.toggle('hidden', !themeCheckFillbox.checked);
        updatePreview();
    });
    themeFillboxColor.addEventListener('input', updatePreview);
    themeFillboxOpacity.addEventListener('input', () => {
        themeFillboxOpacityVal.textContent = `${Math.round(themeFillboxOpacity.value * 100)} %`;
        updatePreview();
    });

    // Título de Biblia (Toggle)
    themeTitlePos.addEventListener('change', () => {
        const isBar = themeTitlePos.value.startsWith('bar-');
        titleBarControlsRow.classList.toggle('hidden', !isBar);
        updatePreview();
    });
    themeTitleBarColor.addEventListener('input', updatePreview);
    themeTitleBarOpacity.addEventListener('input', () => {
        themeTitleBarOpacityVal.textContent = `${Math.round(themeTitleBarOpacity.value * 100)} %`;
        updatePreview();
    });

    themeBgTypeSelect.addEventListener('change', handleBgTypeChange);
    themeBgMediaSelect.addEventListener('change', updatePreview);
    themeBgColorInput.addEventListener('input', updatePreview);

    // Alineación
    const alignHButtons = document.querySelectorAll('#align-h-grid .btn-align');
    const alignVGrid = document.querySelectorAll('#align-v-grid .btn-align');
    alignHButtons.forEach(btn => btn.addEventListener('click', () => setAlignH(btn.dataset.align)));
    alignVGrid.forEach(btn => btn.addEventListener('click', () => setAlignV(btn.dataset.align)));

    // Guardado y eliminación
    btnCreateTheme.addEventListener('click', createNewTheme);
    btnSaveTheme.addEventListener('click', saveActiveTheme);
    btnDeleteTheme.addEventListener('click', deleteActiveTheme);

    // Sincronización automática de temas globales
    selectGlobalBible.addEventListener('change', saveGlobalThemeAssociations);
    selectGlobalSongs.addEventListener('change', saveGlobalThemeAssociations);
    selectGlobalNotes.addEventListener('change', saveGlobalThemeAssociations);

    // 3. Inicializar datos portátiles (USB)
    await loadPortableFonts();
    await loadPortableMedia();
    await loadSettingsAndRender();
}

// ================= UTILERÍA CONVERSORA HEXADECIMAL A RGBA =================

function hexToRgba(hex, opacity) {
    let num = parseInt(hex.replace("#", ""), 16);
    let R = (num >> 16);
    let G = (num >> 8 & 0x00FF);
    let B = (num & 0x0000FF);
    return `rgba(${R}, ${G}, ${B}, ${opacity})`;
}

// ================= GESTIÓN DE CONFIGURACIONES Y RECURSOS PORTÁTILES =================

async function loadPortableFonts() {
    try {
        themeFontSelect.innerHTML = '';
        const defaultFonts = ['Segoe UI', 'Arial', 'Georgia', 'Times New Roman', 'Impact', 'Monospace'];
        defaultFonts.forEach(font => {
            const opt = document.createElement('option');
            opt.value = font;
            opt.textContent = font;
            themeFontSelect.appendChild(opt);
        });

        const result = await window.api.getFonts();
        if (result && result.success && result.fonts.length > 0) {
            scannedFonts = result.fonts;
            for (const font of scannedFonts) {
                try {
                    const fontFace = new FontFace(font.name, `url("${font.url}")`);
                    const loadedFace = await fontFace.load();
                    document.fonts.add(loadedFace);

                    const opt = document.createElement('option');
                    opt.value = font.name;
                    opt.textContent = `📂 ${font.name}`;
                    themeFontSelect.appendChild(opt);
                } catch (fontErr) {
                    console.error("[Themes] Error al registrar fuente:", fontErr);
                }
            }
        }
    } catch (err) {
        console.error("[Themes] Error al inicializar fuentes:", err);
    }
}

async function loadPortableMedia() {
    try {
        themeBgMediaSelect.innerHTML = '';
        const result = await window.api.scanMedia();
        if (result && result.success) {
            scannedMedia = result.files.filter(f => f.type === 'image' || f.type === 'video');
            
            if (scannedMedia.length > 0) {
                scannedMedia.forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m.url;
                    opt.textContent = `${m.type === 'image' ? '🖼️' : '🎥'} ${m.name}`;
                    themeBgMediaSelect.appendChild(opt);
                });
            } else {
                const opt = document.createElement('option');
                opt.textContent = "No hay medios en tu USB";
                themeBgMediaSelect.appendChild(opt);
            }
        }
    } catch (err) {
        console.error("[Themes] Error al cargar catálogo de medios:", err);
    }
}

async function loadSettingsAndRender() {
    try {
        settingsData = await window.api.getSettings();
        if (!settingsData.themes) settingsData.themes = [];
        if (!settingsData.songThemes) settingsData.songThemes = {};

        renderThemesList();
        renderGlobalSelectors();

        if (settingsData.themes.length > 0) {
            loadThemeForEditing(settingsData.themes[0].id);
        }
    } catch (err) {
        console.error("[Themes] Error al cargar configuraciones:", err);
    }
}

function renderThemesList() {
    themesList.innerHTML = '';
    settingsData.themes.forEach(theme => {
        const li = document.createElement('li');
        li.textContent = theme.name;
        li.dataset.id = theme.id;
        if (theme.id === selectedThemeId) li.className = 'active';

        li.addEventListener('click', () => {
            loadThemeForEditing(theme.id);
        });

        themesList.appendChild(li);
    });
}

function renderGlobalSelectors() {
    [selectGlobalBible, selectGlobalSongs, selectGlobalNotes].forEach(select => {
        select.innerHTML = '';
        settingsData.themes.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = t.name;
            select.appendChild(opt);
        });
    });

    selectGlobalBible.value = settingsData.defaultBibleTheme || 'default';
    selectGlobalSongs.value = settingsData.defaultSongsTheme || 'default';
    selectGlobalNotes.value = settingsData.defaultNotesTheme || 'default';
}

async function saveGlobalThemeAssociations() {
    settingsData.defaultBibleTheme = selectGlobalBible.value;
    settingsData.defaultSongsTheme = selectGlobalSongs.value;
    settingsData.defaultNotesTheme = selectGlobalNotes.value;

    try {
        await window.api.saveSettings(settingsData);
        showStatus("✓ Temas predeterminados guardados.");
    } catch (err) {
        console.error("[Themes] Error al guardar asociaciones globales:", err);
    }
}

// ================= CARGA DE TEMA EN EL EDITOR (COLUMNA 2) =================

function loadThemeForEditing(themeId) {
    selectedThemeId = themeId;
    renderThemesList();

    const theme = settingsData.themes.find(t => t.id === themeId);
    if (!theme) return;

    editorHeaderTitle.textContent = `Editar: ${theme.name}`;
    themeNameInput.value = theme.name;
    themeFontSelect.value = theme.fontFamily;
    themeSizeSlider.value = theme.fontSize;
    themeSizeVal.textContent = `${theme.fontSize} vh`;

    themeLineHeight.value = theme.lineHeight || 1.4;
    themeLineHeightVal.textContent = theme.lineHeight || 1.4;
    themeLetterSpacing.value = theme.letterSpacing || 0;
    themeLetterSpacingVal.textContent = `${theme.letterSpacing || 0} px`;

    themeCheckBold.checked = !!theme.isBold;
    themeCheckItalic.checked = !!theme.isItalic;
    themeCheckUppercase.checked = !!theme.isUppercase;

    themeColorInput.value = theme.fontColor;
    themeShadowColorInput.value = theme.textShadowColor || '#000000';

    setAlignH(theme.alignH || 'center');
    setAlignV(theme.alignV || 'center');

    // Contorno (Stroke)
    themeCheckStroke.checked = !!theme.hasStroke;
    strokeControlsRow.classList.toggle('hidden', !theme.hasStroke);
    themeStrokeColor.value = theme.strokeColor || '#000000';
    themeStrokeWidth.value = theme.strokeWidth || 1;
    themeStrokeWidthVal.textContent = `${theme.strokeWidth || 1} px`;

    // Caja de relleno (Fill Box)
    themeCheckFillbox.checked = !!theme.hasFillBox;
    fillboxControlsRow.classList.toggle('hidden', !theme.hasFillBox);
    themeFillboxColor.value = theme.fillBoxColorHex || '#000000';
    themeFillboxOpacity.value = theme.fillBoxOpacity !== undefined ? theme.fillBoxOpacity : 0.5;
    themeFillboxOpacityVal.textContent = `${Math.round((theme.fillBoxOpacity !== undefined ? theme.fillBoxOpacity : 0.5) * 100)} %`;

    // Título de Biblia
    themeTitlePos.value = theme.verseTitlePos || 'top';
    const isBar = themeTitlePos.value.startsWith('bar-');
    titleBarControlsRow.classList.toggle('hidden', !isBar);
    themeTitleBarColor.value = theme.titleBarColorHex || '#000000';
    themeTitleBarOpacity.value = theme.titleBarOpacity !== undefined ? theme.titleBarOpacity : 0.6;
    themeTitleBarOpacityVal.textContent = `${Math.round((theme.titleBarOpacity !== undefined ? theme.titleBarOpacity : 0.6) * 100)} %`;

    // Comentarios
    themeCheckComments.checked = theme.hideComments !== undefined ? theme.hideComments : true;

    themeBgTypeSelect.value = theme.bgType || 'color';
    handleBgTypeChange();

    if (theme.bgType === 'color') {
        themeBgColorInput.value = theme.bgPath || '#131316';
    } else {
        themeBgMediaSelect.value = theme.bgPath || '';
    }

    btnDeleteTheme.disabled = theme.id === 'default';

    updatePreview();
}

function handleBgTypeChange() {
    const type = themeBgTypeSelect.value;
    if (type === 'color') {
        groupBgColor.style.display = 'flex';
        groupBgMedia.style.display = 'none';
    } else {
        groupBgColor.style.display = 'none';
        groupBgMedia.style.display = 'flex';
    }
    updatePreview();
}

function setAlignH(align) {
    activeAlignH = align;
    const alignHButtons = document.querySelectorAll('#align-h-grid .btn-align');
    alignHButtons.forEach(btn => {
        if (btn.dataset.align === align) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    updatePreview();
}

function setAlignV(align) {
    activeAlignV = align;
    const alignVGrid = document.querySelectorAll('#align-v-grid .btn-align');
    alignVGrid.forEach(btn => {
        if (btn.dataset.align === align) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    updatePreview();
}

// ================= VISTA PREVIA COMPLETA EN TIEMPO REAL (CONTAINER QUERIES) =================

function updatePreview() {
    // --- TRUCO CLAVE: Pasar el tamaño, interlineado y espaciado a variables CSS en el contenedor ---
    // De esta forma, el CSS de Container Queries escala la letra proporcionalmente al alto del visor (cqh)
    themePreviewBox.style.setProperty('--theme-font-size', themeSizeSlider.value);
    themePreviewBox.style.setProperty('--theme-line-height', themeLineHeight.value);
    themePreviewBox.style.setProperty('--theme-letter-spacing', `${themeLetterSpacing.value}px`);

    // 1. Estilo y formato de fuente
    previewTextContent.style.fontFamily = themeFontSelect.value;
    previewTextContent.style.color = themeColorInput.value;

    // Estilos tipográficos (Negrita, Cursiva, Mayúsculas)
    previewTextContent.style.fontWeight = themeCheckBold.checked ? 'bold' : 'normal';
    previewTextContent.style.fontStyle = themeCheckItalic.checked ? 'italic' : 'normal';
    previewTextContent.style.textTransform = themeCheckUppercase.checked ? 'uppercase' : 'none';

    // Sombra del texto
    const shadowColor = themeShadowColorInput.value;
    previewTextContent.style.textShadow = `2px 2px 8px ${shadowColor}`;

    // 2. Contorno de texto (Stroke)
    if (themeCheckStroke.checked) {
        previewTextContent.style.webkitTextStroke = `${themeStrokeWidth.value}px ${themeStrokeColor.value}`;
    } else {
        previewTextContent.style.webkitTextStroke = '0px transparent';
    }

    // 3. Caja de relleno de texto única (Bounding Box)
    if (themeCheckFillbox.checked) {
        const rgbaColor = hexToRgba(themeFillboxColor.value, themeFillboxOpacity.value);
        previewTextBox.style.backgroundColor = rgbaColor;
        previewTextBox.style.padding = '3% 5%'; // Usamos porcentajes para que la caja también sea adaptativa
    } else {
        previewTextBox.style.backgroundColor = 'transparent';
        previewTextBox.style.padding = '0';
    }

    // 4. Lógica de Títulos Fijos (Apagar todos y encender solo el activo)
    previewTitleBarTop.style.display = 'none';
    previewTitleBarBottom.style.display = 'none';
    previewTitleInlineTop.style.display = 'none';
    previewTitleInlineBottom.style.display = 'none';

    const tPos = themeTitlePos.value;

    if (tPos === 'top') {
        previewTitleInlineTop.style.display = 'block';
        previewTitleInlineTop.style.color = themeColorInput.value; // Hereda el color del texto
        previewTitleInlineTop.style.backgroundColor = 'transparent';
    } else if (tPos === 'bottom') {
        previewTitleInlineBottom.style.display = 'block';
        previewTitleInlineBottom.style.color = themeColorInput.value;
        previewTitleInlineBottom.style.backgroundColor = 'transparent';
    } else if (tPos.startsWith('bar-')) {
        const rgbaBarColor = hexToRgba(themeTitleBarColor.value, themeTitleBarOpacity.value);
        
        if (tPos === 'bar-top') {
            previewTitleBarTop.style.display = 'block';
            previewTitleBarTop.style.backgroundColor = rgbaBarColor;
            previewTitleBarTop.style.color = '#ffffff';
        } else if (tPos === 'bar-bottom') {
            previewTitleBarBottom.style.display = 'block';
            previewTitleBarBottom.style.backgroundColor = rgbaBarColor;
            previewTitleBarBottom.style.color = '#ffffff';
        }
    }

    // 5. Alineación Horizontal con Flexbox
    if (activeAlignH === 'left') {
        previewTextOverlay.style.justifyContent = 'flex-start';
        previewTextContent.style.textAlign = 'left';
    } else if (activeAlignH === 'right') {
        previewTextOverlay.style.justifyContent = 'flex-end';
        previewTextContent.style.textAlign = 'right';
    } else {
        previewTextOverlay.style.justifyContent = 'center';
        previewTextContent.style.textAlign = 'center';
    }

    // 6. Alineación Vertical con Flexbox
    if (activeAlignV === 'top') {
        previewTextOverlay.style.alignItems = 'flex-start';
    } else if (activeAlignV === 'bottom') {
        previewTextOverlay.style.alignItems = 'flex-end';
    } else {
        previewTextOverlay.style.alignItems = 'center';
    }

    // 7. Renderizar Fondo Dinámico de Vista Previa
    const bgType = themeBgTypeSelect.value;
    previewBgImage.style.display = 'none';
    previewBgVideo.style.display = 'none';
    previewBgVideo.pause();
    previewBgVideo.src = '';

    if (bgType === 'color') {
        themePreviewBox.style.backgroundColor = themeBgColorInput.value;
    } else {
        themePreviewBox.style.backgroundColor = '#000';
        const selectedUrl = themeBgMediaSelect.value;

        if (selectedUrl) {
            if (bgType === 'image') {
                previewBgImage.src = selectedUrl;
                previewBgImage.style.display = 'block';
            } else if (bgType === 'video') {
                previewBgVideo.src = selectedUrl;
                previewBgVideo.style.display = 'block';
                previewBgVideo.play().catch(err => console.error("Error vista previa video:", err));
            }
        }
    }
}

// ================= GUARDADO Y ELIMINACIÓN DE TEMAS =================

function createNewTheme() {
    const newId = `theme-${Date.now()}`;
    const newThemeObj = {
        id: newId,
        name: "Nuevo Tema",
        fontFamily: "Segoe UI",
        fontSize: 5,
        lineHeight: 1.4,
        letterSpacing: 0,
        isBold: false,
        isItalic: false,
        isUppercase: false,
        fontColor: "#ffffff",
        textShadowColor: "#000000",
        hasStroke: false,
        strokeColor: "#000000",
        strokeWidth: 1,
        hasFillBox: false,
        fillBoxColorHex: "#000000",
        fillBoxOpacity: 0.5,
        verseTitlePos: "top",
        titleBarColorHex: "#000000",
        titleBarOpacity: 0.6,
        hideComments: true,
        alignH: "center",
        alignV: "center",
        bgType: "color",
        bgPath: "#131316"
    };

    settingsData.themes.push(newThemeObj);
    loadThemeForEditing(newId);
    showStatus("✓ Tema creado.");
}

async function saveActiveTheme() {
    const themeIndex = settingsData.themes.findIndex(t => t.id === selectedThemeId);
    if (themeIndex === -1) return;

    const theme = settingsData.themes[themeIndex];
    theme.name = themeNameInput.value.trim() || "Tema sin nombre";
    theme.fontFamily = themeFontSelect.value;
    theme.fontSize = parseFloat(themeSizeSlider.value);
    
    theme.lineHeight = parseFloat(themeLineHeight.value);
    theme.letterSpacing = parseInt(themeLetterSpacing.value);

    theme.isBold = themeCheckBold.checked;
    theme.isItalic = themeCheckItalic.checked;
    theme.isUppercase = themeCheckUppercase.checked;

    theme.fontColor = themeColorInput.value;
    theme.textShadowColor = themeShadowColorInput.value;
    theme.alignH = activeAlignH;
    theme.alignV = activeAlignV;

    // Contorno (Stroke)
    theme.hasStroke = themeCheckStroke.checked;
    theme.strokeColor = themeStrokeColor.value;
    theme.strokeWidth = parseFloat(themeStrokeWidth.value);

    // Caja de relleno (Fill Box)
    theme.hasFillBox = themeCheckFillbox.checked;
    theme.fillBoxColorHex = themeFillboxColor.value;
    theme.fillBoxOpacity = parseFloat(themeFillboxOpacity.value);

    // Título de Biblia
    theme.verseTitlePos = themeTitlePos.value;
    theme.titleBarColorHex = themeTitleBarColor.value;
    theme.titleBarOpacity = parseFloat(themeTitleBarOpacity.value);

    // Comentarios
    theme.hideComments = themeCheckComments.checked;

    theme.bgType = themeBgTypeSelect.value;
    if (theme.bgType === 'color') {
        theme.bgPath = themeBgColorInput.value;
    } else {
        theme.bgPath = themeBgMediaSelect.value;
    }

    try {
        const result = await window.api.saveSettings(settingsData);
        if (result && result.success) {
            window.dispatchEvent(new CustomEvent('settings-updated'));
            renderThemesList();
            renderGlobalSelectors();
            showStatus("✓ Tema guardado con éxito.");
        }
    } catch (err) {
        console.error("[Themes] Error al guardar tema:", err);
        showStatus("✗ Error al guardar el tema.");
    }
}

async function deleteActiveTheme() {
    if (selectedThemeId === 'default') return;
    const confirmar = confirm(`¿Estás seguro de que deseas eliminar permanentemente este tema?`);
    if (!confirmar) return;

    settingsData.themes = settingsData.themes.filter(t => t.id !== selectedThemeId);

    if (settingsData.defaultBibleTheme === selectedThemeId) settingsData.defaultBibleTheme = 'default';
    if (settingsData.defaultSongsTheme === selectedThemeId) settingsData.defaultSongsTheme = 'default';
    if (settingsData.defaultNotesTheme === selectedThemeId) settingsData.defaultNotesTheme = 'default';

    for (const songId in settingsData.songThemes) {
        if (settingsData.songThemes[songId] === selectedThemeId) {
            delete settingsData.songThemes[songId];
        }
    }

    try {
        await window.api.saveSettings(settingsData);
        window.dispatchEvent(new CustomEvent('settings-updated'));
        
        loadThemeForEditing('default');
        showStatus("✓ Tema eliminado.");
    } catch (err) {
        console.error("[Themes] Error al eliminar tema:", err);
    }
}

function showStatus(msg) {
    settingsSaveStatus.textContent = msg;
    setTimeout(() => {
        settingsSaveStatus.textContent = "";
    }, 3000);
}