document.addEventListener('DOMContentLoaded', function () {
    // === ELEMEN DOM & STATE ===
    const mapContainer = document.getElementById('potensi-map');
    const filtersContainer = document.getElementById('potensi-filters');
    const gridContainer = document.getElementById('potensi-grid');
    const locationStatus = document.getElementById('location-status');

    let potensiItems = []; // Akan diisi dari file JSON
    let userLocation = null;
    let routingControl = null;

    // === INISIALISASI PETA LEAFLET ===
    const map = L.map(mapContainer).setView([-7.5674, 110.1863], 16); // Center view antara dua titik
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const markerGroup = L.layerGroup().addTo(map);

    // === FUNGSI-FUNGSI UTAMA ===

    /**
     * Memuat dan memproses data potensi dari file JSON.
     */
    async function loadPotensiData() {
        try {
            const response = await fetch('data/tempat menarik.json'); // Tambahkan "data/" di depan nama file
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const geojsonData = await response.json();

            // Detail manual untuk setiap titik wisata
            const wisataDetails = [
                {
                    nama: 'Private Pool Kungkum', // NAMA DIUBAH
                    deskripsi: 'Sebuah kolam renang privat yang sejuk dan asri, cocok untuk bersantai bersama keluarga dan menikmati alam.',
                    gambar: 'image/dokumentasi/pemandangan/Sawah.jpg', // Gambar untuk titik pertama                
                },
                {
                    nama: 'Azzira Tirta Gemilang', // NAMA DIUBAH
                    deskripsi: 'Sebuah pemandian kolam air panas yang menyediakan kolam untuk anak kecil dan kolam dewasa.',
                    gambar: 'image/dokumentasi/infrastruktur/Kolam.jpg', // Gambar untuk titik kedua
                }
            ];

            // Ubah data GeoJSON ke format yang kita butuhkan
            potensiItems = geojsonData.features.map((feature, index) => {
                const props = feature.properties;
                const coords = feature.geometry.coordinates;
                const details = wisataDetails[index] || wisataDetails[0]; // Fallback jika data lebih banyak dari detail

                return {
                    id: `potensi-${props.OBJECTID}`,
                    nama: details.nama,
                    kategori: props.KETERANGAN === "4" ? 'Wisata' : 'Lainnya',
                    deskripsi: details.deskripsi,
                    gambar: details.gambar,
                    kontak_nama: details.kontak_nama,
                    kontak_telp: details.kontak_telp,
                    koordinat: [coords[1], coords[0]] // PENTING: Tukar [lng, lat] menjadi [lat, lng] untuk Leaflet
                };
            });

        } catch (error) {
            console.error('Gagal memuat data potensi:', error);
            gridContainer.innerHTML = '<div class="col-12"><p class="alert alert-danger">Gagal memuat data potensi dari server. Silakan coba lagi nanti.</p></div>';
        }
    }

    /**
     * Merender kartu-kartu potensi ke dalam grid.
     */
    function renderCards(filter = 'all') {
        gridContainer.innerHTML = '';
        const filteredItems = filter === 'all' ? potensiItems : potensiItems.filter(item => item.kategori === filter);

        if (filteredItems.length === 0) {
            gridContainer.innerHTML = '<div class="col-12"><p class="text-center text-muted">Tidak ada potensi dalam kategori ini.</p></div>';
            return;
        }

        filteredItems.forEach(item => {
            const card = document.createElement('div');
            card.className = 'col-md-6 col-lg-4';
            card.innerHTML = `
                <div class="card card-potensi h-100 shadow-sm">
                    <img src="${item.gambar}" class="card-img-top" alt="${item.nama}">
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-primary align-self-start mb-2">${item.kategori}</span>
                        <h5 class="card-title">${item.nama}</h5>
                        <p class="card-text text-muted small">${item.deskripsi}</p>
                        <div class="mt-auto pt-2">
                            <p class="mb-1 small"><strong>Kontak:</strong> ${item.kontak_nama} (${item.kontak_telp})</p>
                            <button class="btn btn-sm btn-success w-100 btn-get-route" 
                                    data-lat="${item.koordinat[0]}" 
                                    data-lng="${item.koordinat[1]}"
                                    data-name="${item.nama}"
                                    disabled
                                    title="Izinkan akses lokasi untuk mengaktifkan fitur ini">
                                <i class="fas fa-directions me-2"></i>Dapatkan Rute
                            </button>
                        </div>
                    </div>
                </div>
            `;
            gridContainer.appendChild(card);
        });

        // Aktifkan kembali tombol jika lokasi sudah ditemukan
        if (userLocation) {
            enableRouteButtons();
        }
    }

    /**
     * Merender marker untuk setiap titik potensi di peta.
     */
    function renderMarkers() {
        markerGroup.clearLayers();
        const customIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            shadowSize: [41, 41]
        });

        potensiItems.forEach(item => {
            L.marker(item.koordinat, { icon: customIcon })
                .addTo(markerGroup)
                .bindPopup(`<b>${item.nama}</b><br>${item.kategori}`);
        });
    }

    /**
     * Menangani proses pencarian lokasi pengguna.
     */
    function handleLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onLocationFound, onLocationError, { enableHighAccuracy: true });
        } else {
            locationStatus.className = 'alert alert-danger text-center';
            locationStatus.innerHTML = 'Geolocation tidak didukung oleh browser ini.';
        }
    }

    function onLocationFound(position) {
        userLocation = L.latLng(position.coords.latitude, position.coords.longitude);
        locationStatus.className = 'alert alert-success text-center';
        locationStatus.innerHTML = '<i class="fas fa-check-circle me-2"></i>Lokasi Anda ditemukan! Fitur rute sekarang aktif.';

        const userIcon = L.divIcon({
            className: 'user-location-icon',
            html: '<div style="background-color: #4a90e2; width: 16px; height: 16px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>',
            iconSize: [22, 22]
        });
        L.marker(userLocation, { icon: userIcon }).addTo(map).bindPopup('<b>Lokasi Anda</b>');
        map.flyTo(userLocation, 15);

        enableRouteButtons();
    }

    function enableRouteButtons() {
        document.querySelectorAll('.btn-get-route').forEach(button => {
            button.disabled = false;
            button.title = 'Dapatkan rute dari lokasi Anda ke tempat ini';
        });
    }

    function onLocationError(error) {
        locationStatus.className = 'alert alert-danger text-center';
        let message = '';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = "Akses lokasi ditolak. Fitur rute tidak dapat digunakan.";
                break;
            case error.POSITION_UNAVAILABLE:
                message = "Informasi lokasi tidak tersedia.";
                break;
            case error.TIMEOUT:
                message = "Waktu permintaan untuk mendapatkan lokasi habis.";
                break;
            default:
                message = "Terjadi kesalahan saat mengambil lokasi.";
                break;
        }
        locationStatus.innerHTML = `<i class="fas fa-times-circle me-2"></i>${message}`;
    }

    // === EVENT LISTENERS ===
    filtersContainer.addEventListener('click', function (e) {
        if (e.target.tagName === 'BUTTON' && !e.target.classList.contains('active')) {
            document.querySelector('#potensi-filters .btn.active').classList.remove('active');
            e.target.classList.add('active');
            renderCards(e.target.dataset.filter);
        }
    });

    gridContainer.addEventListener('click', function (e) {
        const button = e.target.closest('.btn-get-route');
        if (button && !button.disabled) {
            const lat = parseFloat(button.dataset.lat);
            const lng = parseFloat(button.dataset.lng);
            const name = button.dataset.name;
            const destination = L.latLng(lat, lng);

            if (routingControl) {
                map.removeControl(routingControl);
            }

            routingControl = L.Routing.control({
                waypoints: [
                    L.Routing.waypoint(userLocation, 'Lokasi Anda'),
                    L.Routing.waypoint(destination, name)
                ],
                routeWhileDragging: false,
                addWaypoints: false,
                lineOptions: { styles: [{ color: '#4a90e2', opacity: 0.8, weight: 6 }] },
                fitSelectedRoutes: true,
                showAlternatives: false
            }).addTo(map);

            // Scroll ke peta agar pengguna bisa lihat hasilnya
            mapContainer.scrollIntoView({ behavior: 'smooth' });
        }
    });

    /**
     * Fungsi utama untuk menginisialisasi halaman.
     */
    async function initializePage() {
        await loadPotensiData(); // Tunggu data selesai dimuat
        renderCards();           // Tampilkan semua kartu
        renderMarkers();         // Tampilkan semua marker
        handleLocation();        // Mulai cari lokasi pengguna
    }

    // === Jalankan Inisialisasi Halaman ===
    initializePage();
});