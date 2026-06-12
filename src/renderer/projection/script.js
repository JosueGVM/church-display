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

    // 2. MANEJAR LIMPIEZA EXPLÍCITA DEL FONDO (Black screen de fondo)
    if (datos.clearBg) {
        clearActiveBackgrounds();
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