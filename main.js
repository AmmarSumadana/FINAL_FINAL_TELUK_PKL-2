// Inisialisasi peta Leaflet, berpusat di Dusun Teluk
const map = L.map('map').setView([-7.5665, 110.1865], 17);

// Tambahkan Tile Layer OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 25
}).addTo(map);

// Definisikan warna default untuk layer Penggunaan Lahan berdasarkan 'KETERANGAN'
const lahanColors = {
    "Kebun Campur": "#bbdf7b",
    "Sawah": "#a0e0e0",
    "Pekarangan": "#bec0c0",
    "Transportasi": "#6b7c93",
    "Semak Belukar": "#e74c3c",
    "Lahan Terbuka (Tanah Kosong)": "#ecf0f1",
    "Perkebunan": "#b3e6b3",
    "Tempat Tinggal": "#f4b8b0",
    "Industri dan Perdagangan": "#f29560",
    "Peribadatan": "#c4a0d4",
    "Pemakaman": "#5a5a5a",
    "Sungai": "#a5f0fa",
    "Rumput": "#8acd6b",
    "Vegetasi Non Budidaya Lain": "#c4d8a8"
};

// Konfigurasi data GeoJSON dan urutan tampil
const config = {
    polygon: {
        path: "data/",
        files: [
            { name: "sungai.json", identitas: "KETERANGAN", defaultColors: lahanColors },
            { name: "bangunan.json", identitas: "KETERANGAN" },
            { name: "penggunaan lahan.json", identitas: "KETERANGAN", defaultColors: lahanColors },
        ]
    },
    garis: {
        path: "data/",
        files: [
            { name: "jalan.json", identitas: "KETERANGAN" },
            { name: "jembatan.json", identitas: "KETERANGAN" }
        ]
    },
    titik: {
        path: "data/",
        files: [
            { name: "industri.json", identitas: null, icon: 'fa-industry' },
            { name: "peribadatan.json", identitas: null, icon: 'fa-mosque' },
            { name: "pemakaman.json", identitas: null, icon: 'fa-cross' },
            { name: "tempat menarik.json", identitas: null, icon: 'fa-star' }
        ]
    },
    label: {
        path: "data/",
        files: [
            { name: "toponimi.json", identitas: "KETERANGAN" }
        ]
    }
};

const layerMap = new Map();
let layerCounter = 0;

function getLayerStorageKey(groupKey, fileName, layerName) {
    return `webgis_teluk_color_${fileName.replace('.json', '')}_${layerName.replace(/[^a-zA-Z0-9]/g, '')}`;
}

function makePopup(properties) {
    if (!properties) return "";
    return Object.entries(properties).map(([k, v]) => `<strong>${k}</strong>: ${v}<br>`).join('');
}

function randomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

function createLegendItem(name, layerObj, groupContainer, groupKey, fileName) {
    const row = document.createElement("div");
    row.className = "legend-entry d-flex align-items-center mb-1";
    row.dataset.layerId = layerObj.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.className = "form-check-input me-2";
    const visibilityKey = `webgis_teluk_visibility_${groupKey}_${fileName.replace('.json', '')}_${name.replace(/[^a-zA-Z0-9]/g, '_')}`;

    checkbox.addEventListener("change", () => {
        checkbox.checked ? map.addLayer(layerObj.layer) : map.removeLayer(layerObj.layer);
        updateLayerOrder();
        localStorage.setItem(visibilityKey, checkbox.checked);
    });

    const storedVisibility = localStorage.getItem(visibilityKey);
    if (storedVisibility !== null) {
        checkbox.checked = JSON.parse(storedVisibility);
        if (!checkbox.checked) {
            map.removeLayer(layerObj.layer);
        }
    }
    
    row.appendChild(checkbox);

    if (groupKey !== 'label') {
        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.value = layerObj.color;
        colorInput.className = "form-control-color mx-2";
        
        const storageKey = getLayerStorageKey(groupKey, fileName, name);
        colorInput.addEventListener("input", () => {
            const newColor = colorInput.value;
            layerObj.color = newColor;

            layerObj.layer.eachLayer(l => {
                if (l.setStyle) {
                    l.setStyle({ color: newColor, fillColor: newColor });
                }
                if (l.options.icon && l.options.icon.options.html) {
                    const iconElement = l.getElement().querySelector('.marker-pin');
                    if (iconElement) iconElement.style.backgroundColor = newColor;
                }
                 if (l.setText && l.options.attributes) {
                    l.setStyle({ fill: newColor });
                }
            });
            localStorage.setItem(storageKey, newColor);
        });
        row.appendChild(colorInput);
    }

    const label = document.createElement("span");
    label.textContent = name;
    row.appendChild(label);
    
    groupContainer.appendChild(row);
}

async function loadGeoJSON(path, fileObj, groupKey, groupContainer) {
    const { name, identitas, defaultColors } = fileObj;
    
    try {
        const res = await fetch(path + name);
        if (!res.ok) {
            throw new Error(`Gagal memuat file: ${name} (Status: ${res.status})`);
        }
        const data = await res.json();

        const grouped = {};
        if (identitas && data.features) {
            data.features.forEach(f => {
                const val = (f.properties && f.properties[identitas]) || "Lainnya";
                if (!grouped[val]) grouped[val] = [];
                grouped[val].push(f);
            });
        } else if (data.features) {
            const simpleName = name.replace(".json", "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
            grouped[simpleName] = data.features;
        } else {
             console.warn(`File ${name} tidak memiliki fitur (features).`);
             return;
        }

        for (const [key, features] of Object.entries(grouped)) {
            const storageKey = getLayerStorageKey(groupKey, name, key);
            let color = localStorage.getItem(storageKey) || (defaultColors && defaultColors[key]) || randomColor();
            localStorage.setItem(storageKey, color);

            let layer;
            
            if (groupKey === 'garis') {
                layer = L.geoJSON(features, {
                    style: (feature) => ({
                        color: color,
                        weight: (feature.properties.KETERANGAN === 'Lokal') ? 4 : 2.5,
                        opacity: 0.9,
                        lineCap: 'round',
                        lineJoin: 'round'
                    }),
                    onEachFeature: (feature, line) => {
                        line.bindPopup(makePopup(feature.properties));
                        if (feature.properties && feature.properties.KETERANGAN) {
                            line.setText(feature.properties.KETERANGAN, {
                                center: true,
                                offset: 10,
                                attributes: { fill: '#000', 'font-weight': 'bold', 'font-size': '11px' },
                                className: 'text-path'
                            });
                        }
                    }
                });
                layer.addTo(map);

            } else if (groupKey === 'titik') {
                layer = L.geoJSON(features, {
                    pointToLayer: (feature, latlng) => {
                        const iconHtml = `<div style="background-color:${color};" class="marker-pin"><i class="fas ${fileObj.icon || 'fa-map-marker-alt'} fa-inverse"></i></div>`;
                        const customIcon = L.divIcon({
                            html: iconHtml,
                            className: "custom-div-icon",
                            iconSize: [30, 42],
                            iconAnchor: [15, 42],
                            popupAnchor: [0, -35]
                        });
                        return L.marker(latlng, { icon: customIcon });
                    },
                    onEachFeature: (f, l) => l.bindPopup(makePopup(f.properties))
                }).addTo(map);

            } else if (groupKey === 'label') {
                layer = L.geoJSON(features, {
                    pointToLayer: (feature, latlng) => {
                        return L.marker(latlng, {
                            icon: L.divIcon({ className: 'hidden-icon' }) 
                        }).bindTooltip(feature.properties[identitas] || '', {
                            permanent: true, direction: 'center', className: 'map-label'
                        });
                    }
                }).addTo(map);
            } else { // Logika default untuk Polygon
                layer = L.geoJSON(features, {
                    style: {
                        color: color, fillColor: color, weight: 1.5, fillOpacity: 0.7
                    },
                    onEachFeature: (f, l) => l.bindPopup(makePopup(f.properties))
                }).addTo(map);
            }

            const id = `layer-${layerCounter++}`;
            const layerObj = { layer, color, id };
            layerMap.set(id, layerObj);
            createLegendItem(key, layerObj, groupContainer, groupKey, name);
        }
    } catch (error) {
        console.error(`Terjadi kesalahan saat memproses file ${name}:`, error);
        alert(`Tidak dapat memuat atau menampilkan data dari file "${name}". Silakan periksa Developer Console (F12) untuk detail error.`);
    }
}

async function init() {
    const legendContent = document.getElementById("legend-content");

    const groupOrder = ["polygon", "garis", "titik", "label"];
    const groupLabels = {
        polygon: "Area (Polygon)",
        garis: "Garis (Line)",
        titik: "Titik (Point)",
        label: "Label (Toponimi)"
    };
    const groups = {};

    for (const groupKey of groupOrder) {
        const wrapper = document.createElement("div");
        wrapper.className = "legend-group";
        wrapper.dataset.group = groupKey;

        const title = document.createElement("div");
        title.className = "legend-group-title";
        title.innerHTML = `<i class="fas fa-layer-group me-2"></i>${groupLabels[groupKey]}`;
        wrapper.appendChild(title);

        const container = document.createElement("div");
        container.className = "sortable-group";
        wrapper.appendChild(container);

        legendContent.appendChild(wrapper);
        groups[groupKey] = container;
    }

    for (const groupKey of groupOrder) {
        if (config[groupKey] && config[groupKey].files) {
            for (const fileObj of config[groupKey].files) {
                await loadGeoJSON(config[groupKey].path, fileObj, groupKey, groups[groupKey]);
            }
        }
    }

    const allLayersOnMap = [];
    layerMap.forEach(obj => {
        if(map.hasLayer(obj.layer)){
             allLayersOnMap.push(obj.layer);
        }
    });

    if (allLayersOnMap.length > 0) {
        const featureGroup = L.featureGroup(allLayersOnMap);
        if (featureGroup.getBounds().isValid()) {
            map.fitBounds(featureGroup.getBounds().pad(0.1));
        }
    }

    document.querySelectorAll(".sortable-group").forEach(container => {
        new Sortable(container, {
            animation: 150,
            onEnd: updateLayerOrder
        });
    });

    new Sortable(legendContent, {
        animation: 150,
        handle: ".legend-group-title",
        onEnd: updateLayerOrder
    });

    updateLayerOrder();
}

function updateLayerOrder() {
    const groupElems = Array.from(document.querySelectorAll("#legend-content .legend-group"));
    
    const zIndexOrder = {
        polygon: 10,
        garis: 20,
        titik: 30,
        label: 40
    };

    groupElems.forEach(groupEl => {
        const groupType = groupEl.dataset.group;
        const baseZIndex = zIndexOrder[groupType] || 0;
        
        const entries = groupEl.querySelectorAll(".sortable-group .legend-entry");
        entries.forEach((entry, index) => {
            const id = entry.dataset.layerId;
            const obj = layerMap.get(id);
            if (obj && obj.layer && typeof obj.layer.setZIndex === 'function') {
                if(map.hasLayer(obj.layer)){
                   obj.layer.setZIndex(baseZIndex + (entries.length - index));
                }
            }
        });
    });
}

init();


// =======================================================
// --- KODE TOGGLE LEGEND (VERSI FINAL & TERUJI) ---
// =======================================================

const legend = document.getElementById("legend");
const toggleBtn = document.getElementById("toggle-legend");
const mapElement = document.getElementById("map");

function updateLayout() {
    const isMobile = window.innerWidth <= 768;
    const isHidden = legend.classList.contains('hidden');

    // 1. Atur Tampilan Tombol dan Peta berdasarkan State
    if (isMobile) {
        // Mode Mobile: Peta selalu full width, tombol di tengah bawah
        mapElement.style.left = '0';
        toggleBtn.style.left = '50%';
        toggleBtn.style.transform = 'translateX(-50%)';
        toggleBtn.innerHTML = isHidden ? "⮝" : "⮟";
    } else {
        // Mode Desktop: Peta dan tombol bergeser
        mapElement.style.left = isHidden ? '0' : '320px';
        toggleBtn.style.left = isHidden ? '30px' : '340px';
        toggleBtn.style.transform = 'none'; // Hapus transform mobile
        toggleBtn.innerHTML = isHidden ? "⮞" : "⮜";
    }
}

// 2. Event Listener untuk Klik Tombol
toggleBtn.addEventListener("click", () => {
    // Aksi utama hanya toggle kelas 'hidden'
    legend.classList.toggle("hidden");
    
    // Perbarui layout setelah mengubah kelas
    updateLayout();
    
    // Beri waktu untuk animasi selesai sebelum map di-resize
    setTimeout(() => {
        map.invalidateSize();
    }, 400); 
});

// 3. Atur State Awal saat Halaman Dimuat
window.addEventListener('DOMContentLoaded', () => {
    // Di mobile, legenda harus selalu tersembunyi saat pertama kali dimuat.
    // Di desktop, biarkan state default dari HTML (tidak tersembunyi).
    if (window.innerWidth <= 768) {
        legend.classList.add('hidden');
    } else {
        legend.classList.remove('hidden'); // Pastikan terlihat di desktop
    }
    // Panggil updateLayout untuk mengatur posisi awal yang benar
    updateLayout();
});

// 4. Atur Ulang Layout saat Ukuran Jendela Berubah
window.addEventListener('resize', () => {
    // Panggil updateLayout untuk menyesuaikan tampilan secara dinamis
    updateLayout();
});