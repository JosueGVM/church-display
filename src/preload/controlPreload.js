const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // Proyección
    proyectarTexto: (payload) => {
    if (typeof payload === 'string') {
        // Si es un texto (Biblia/Canciones), lo envolvemos para mantener compatibilidad
        ipcRenderer.send('proyectar-contenido', { texto: payload });
    } else {
        // Si es un objeto (Multimedia/Fondos), lo enviamos directo
        ipcRenderer.send('proyectar-contenido', payload);
    }
    },
    limpiarPantalla: () => ipcRenderer.send('limpiar-proyeccion'),

    // Consultas de base de datos
    getVersions: () => ipcRenderer.invoke('db:get-versions'),
    getBooks: (version) => ipcRenderer.invoke('db:get-books', version),
    searchVerses: (params) => ipcRenderer.invoke('db:search-verses', params),

    // Configuraciones de usuario (settings.json)
    getSettings: () => ipcRenderer.invoke('db:get-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('db:save-settings', settings),
    
    // Consultas del catálogo de canciones (songs.db)
    searchSongs: (query) => ipcRenderer.invoke('db:search-songs', query),
    saveSong: (song) => ipcRenderer.invoke('db:save-song', song),
    deleteSong: (id) => ipcRenderer.invoke('db:delete-song', id),

     // Consultas de Multimedia portátil (media folders)
    scanMedia: () => ipcRenderer.invoke('db:scan-media'),
    saveWebP: (params) => ipcRenderer.invoke('db:save-webp', params),
    importMedia: (params) => ipcRenderer.invoke('db:import-media', params),
    deleteMedia: (filePath) => ipcRenderer.invoke('db:delete-media', filePath)
});