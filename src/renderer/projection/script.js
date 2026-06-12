const displayTexto = document.getElementById('texto-proyectado');
const bgVideo = document.getElementById('proj-bg-video');
const bgImage = document.getElementById('proj-bg-image');

// Escuchar el canal de proyecciones
window.api.alActualizarProyeccion((datos) => {
        console.log("[Proyector Debug] Datos recibidos en tiempo real:", datos);

    // 1. MANEJAR LA CAPA DE FONDO MULTIMEDIA
    if (datos.background) {
        // Formateamos la ruta absoluta local para que sea compatible con Chromium (evitando bloqueos de ruta)
        const pathNormalizado = datos.background.path; 
        
        if (datos.background.type === 'video') {
            bgImage.style.display = 'none';
            bgImage.src = '';
            
            bgVideo.src = pathNormalizado;
            bgVideo.style.display = 'block';
            bgVideo.play().catch(err => console.error("Error al reproducir video de fondo:", err));
        } else if (datos.background.type === 'image') {
            bgVideo.style.display = 'none';
            bgVideo.pause();
            bgVideo.src = '';
            
            bgImage.src = pathNormalizado;
            bgImage.style.display = 'block';
        }
    }

    if (datos.clearBg) {
        clearActiveBackgrounds();
    }

        // 2. MANEJAR ESTILOS AVANZADOS DEL TEMA EMITIDO
    if (datos.estilo) {
        const est = datos.estilo;

        // Estilos de tipografía
        displayTexto.style.fontFamily = est.fontFamily || 'Segoe UI';
        displayTexto.style.fontSize = est.fontSize ? `${est.fontSize}vh` : '5vh';
        displayTexto.style.color = est.fontColor || '#ffffff';
        displayTexto.style.lineHeight = est.lineHeight || 1.4;
        displayTexto.style.letterSpacing = est.letterSpacing ? `${est.letterSpacing}px` : '0px';

        displayTexto.style.fontWeight = est.isBold ? 'bold' : 'normal';
        displayTexto.style.fontStyle = est.isItalic ? 'italic' : 'normal';
        displayTexto.style.textTransform = est.isUppercase ? 'uppercase' : 'none';

        // Sombra
        displayTexto.style.textShadow = est.textShadowColor ? `2px 2px 8px ${est.textShadowColor}` : '2px 2px 8px rgba(0,0,0,0.9)';

        // Contorno (Stroke)
        if (est.hasStroke) {
            displayTexto.style.webkitTextStroke = `${est.strokeWidth}px ${est.strokeColor}`;
        } else {
            displayTexto.style.webkitTextStroke = '0px transparent';
        }

        // Caja de relleno de texto única (Bounding Box)
        const textBox = document.getElementById('preview-text-box') || document.querySelector('.preview-text-box');
        if (textBox) {
            if (est.hasFillBox) {
                // Función inline de conversión hex a rgba
                const num = parseInt(est.fillBoxColorHex.replace("#", ""), 16);
                const R = (num >> 16);
                const G = (num >> 8 & 0x00FF);
                const B = (num & 0x0000FF);
                const rgbaColor = `rgba(${R}, ${G}, ${B}, ${est.fillBoxOpacity})`;

                textBox.style.backgroundColor = rgbaColor;
                textBox.style.padding = '15px 25px';
                textBox.style.borderRadius = '8px';
            } else {
                textBox.style.backgroundColor = 'transparent';
                textBox.style.padding = '0';
            }
        }

        // Alineación Horizontal con Flexbox
        const overlay = document.getElementById('preview-text-overlay') || document.querySelector('.preview-text-overlay') || document.querySelector('.display-container');
        if (overlay) {
            if (est.alignH === 'left') {
                overlay.style.justifyContent = 'flex-start';
                displayTexto.style.textAlign = 'left';
            } else if (est.alignH === 'right') {
                overlay.style.justifyContent = 'flex-end';
                displayTexto.style.textAlign = 'right';
            } else {
                overlay.style.justifyContent = 'center';
                displayTexto.style.textAlign = 'center';
            }

            // Alineación Vertical con Flexbox
            if (est.alignV === 'top') {
                overlay.style.alignItems = 'flex-start';
            } else if (est.alignV === 'bottom') {
                overlay.style.alignItems = 'flex-end';
            } else {
                overlay.style.alignItems = 'center';
            }
        }
    }

    // 3. MANEJAR TEXTO (BIBLIA / CANCIONES)
    if (datos.texto !== undefined) {
        displayTexto.classList.remove('active');
        
        setTimeout(() => {
            displayTexto.textContent = datos.texto;
            if (datos.texto) {
                displayTexto.classList.add('active');
            }
        }, 150);
    }
});

// Al presionar ESC: Oculta texto y apaga el fondo activo (dejando la pantalla negra temporalmente)
window.api.alLimpiarPantalla(() => {
    // Limpiar texto con desvanecimiento
    displayTexto.classList.remove('active');
    setTimeout(() => {
        displayTexto.textContent = '';
    }, 300);
    
    // Limpiar fondos multimedia activos
    clearActiveBackgrounds();
});

// Función de limpieza de fondos
function clearActiveBackgrounds() {
    bgVideo.style.display = 'none';
    bgVideo.pause();
    bgVideo.src = '';
    
    bgImage.style.display = 'none';
    bgImage.src = '';
}