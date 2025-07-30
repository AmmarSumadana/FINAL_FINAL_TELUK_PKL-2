document.addEventListener('DOMContentLoaded', function () {
    // === DATA KONFIGURASI ===
    // Data ini disesuaikan dengan struktur folder di screenshot Anda.
    // PERHATIAN: File .HEIC dan .TIF harus diubah ke .jpg atau .png agar bisa tampil!

    // Data untuk Galeri Peta
    const mapGalleryItems = [
        { src: 'image/peta/PETA BANK SAMPAH.png', title: 'Peta Bank Sampah' },
        { src: 'image/peta/PETA FOTO UDARA.png', title: 'Peta Foto Udara' },
        { src: 'image/peta/PETA JALAN.png', title: 'Peta Jaringan Jalan' },
        { src: 'image/peta/PETA PENGGUNAAN LAHAN.png', title: 'Peta Penggunaan Lahan' },
        { src: 'image/peta/PETA PERSENTASE PENGANGGURAN.png', title: 'Peta Persentase Pengangguran' },
        { src: 'image/peta/PETA SARANA PRASARANA.png', title: 'Peta Sarana & Prasarana' },
        { src: 'image/peta/PETA SEBARAN JUMLAH PENDUDUK.png', title: 'Peta Sebaran Jumlah Penduduk' },
        { src: 'image/peta/PETA TITIK SAMPEL.png', title: 'Peta Titik Sampel' }
        // Catatan: File .TIF berikut mungkin tidak akan tampil di browser. Harap konversi ke JPG/PNG.
        // { src: 'image/peta/PETA SURVEI BATAS ADMINISTRASI.tif', title: 'Peta Survei Batas Administrasi' },
        // { src: 'image/peta/PETA SURVEI PENGGUNAAN LAHAN.tif', title: 'Peta Survei Penggunaan Lahan' }
    ];

    // Data untuk Galeri Dokumentasi (dengan kategori untuk filter)
    const docGalleryItems = [
        // Kategori: pemandangan
        { src: 'image/dokumentasi/pemandangan/Sawah.jpg', title: 'Pemandangan Sawah', category: 'pemandangan' },
        { src: 'image/dokumentasi/pemandangan/Sungai.jpg', title: 'Pemandangan Sungai', category: 'pemandangan' },

        // Kategori: kegiatan
        { src: 'image/dokumentasi/kegiatan warga/Kerja Bakti 1.jpg', title: 'Kerja Bakti Warga', category: 'kegiatan' },
        { src: 'image/dokumentasi/kegiatan warga/Kerja Bakti 2.jpg', title: 'Kerja Bakti Warga', category: 'kegiatan' },
        { src: 'image/dokumentasi/kegiatan warga/Yasinan.jpg', title: 'Kegiatan Yasinan', category: 'kegiatan' },
        { src: 'image/dokumentasi/kegiatan warga/Yasinan 2.jpg', title: 'Kegiatan Yasinan', category: 'kegiatan' },
        // Catatan: File .HEIC berikut tidak akan tampil. Harap konversi ke JPG.
        // { src: 'image/dokumentasi/kegiatan warga/Foto Bersama.HEIC', title: 'Foto Bersama Warga', category: 'kegiatan' },

        // Kategori: infrastruktur
        { src: 'image/dokumentasi/infrastruktur/Kolam.jpg', title: 'Kolam Azizia Tirta', category: 'infrastruktur' },
        { src: 'image/dokumentasi/infrastruktur/Jaringan Jalan.jpg', title: 'Jaringan Jalan Dusun', category: 'infrastruktur' },
        { src: 'image/dokumentasi/infrastruktur/Jembatan.jpg', title: 'Jembatan Dusun', category: 'infrastruktur' },
        { src: 'image/dokumentasi/infrastruktur/Masjid.jpg', title: 'Masjid Dusun', category: 'infrastruktur' },
        { src: 'image/dokumentasi/infrastruktur/Pemakaman.jpg', title: 'Area Pemakaman', category: 'infrastruktur' }
        // Catatan: File .HEIC berikut tidak akan tampil. Harap konversi ke JPG.
        // { src: 'image/dokumentasi/infrastruktur/Bank Sampah.HEIC', title: 'Bank Sampah', category: 'infrastruktur' },
    ];

    const newsItems = [
        {
            title: 'Pembinaan Kesejahteraan Keluarga (PKK) Dusun Teluk',
            date: '00-00-0000',
            excerpt: 'Kegiatan Pembinaan Kesejahteraan Keluarga (PKK) di Dusun Teluk dilakukan setiap bulan sekali sebagai upaya peningkatan kesejahteraan dan peran aktif masyarakat, khususnya kaum ibu. Kegiatan ini meliputi pertemuan rutin, penyuluhan kesehatan dan gizi keluarga, pelatihan keterampilan rumah tangga, serta arisan dan gotong royong. Selain memperkuat hubungan sosial antarwarga, kegiatan PKK juga mendorong kemandirian ekonomi keluarga melalui program Usaha Peningkatan Pendapatan Keluarga (UP2K).'
        },
        {
            title: 'Perbaikan Jalan Utama Selesai, Akses Warga Semakin Lancar (Kerja Bakti)',
            date: '00-00-0000',
            excerpt: 'Perbaikan jalan utama Dusun Teluk telah selesai dilaksanakan melalui kegiatan kerja bakti bersama warga. Kegiatan ini melibatkan partisipasi aktif masyarakat dalam memperbaiki jalan yang sebelumnya rusak dan berlubang. Dengan semangat gotong royong, proses perbaikan dilakukan secara bertahap hingga selesai. Kini, akses jalan menjadi lebih baik, mempermudah mobilitas warga, distribusi hasil pertanian, serta mendukung kelancaran kegiatan sehari-hari.'
        },
        {
            title: 'Yasinan Rutin Bulanan',
            date: '00-00-0000',
            excerpt: 'Yasinan rutin bulanan merupakan kegiatan keagamaan yang dilaksanakan oleh warga Dusun Teluk sebagai bentuk syukur dan doa bersama. Kegiatan ini biasanya dilakukan secara bergiliran di rumah warga setiap bulannya. Selain pembacaan Surat Yasin dan doa bersama, momen ini juga menjadi ajang mempererat silaturahmi antarwarga, memperkuat nilai-nilai spiritual, serta menjaga kekompakan dan keharmonisan lingkungan masyarakat.'
        }
    ];

    // === ELEMEN DOM ===
    const mainContent = document.getElementById('gallery-page');
    const mapGalleryGrid = document.getElementById('map-gallery-grid');
    const docGalleryGrid = document.getElementById('doc-gallery-grid');
    const docFilterControls = document.getElementById('doc-gallery-controls');
    const newsList = document.getElementById('news-list');

    const galleryModal = new bootstrap.Modal(document.getElementById('galleryModal'));
    const modalImage = document.getElementById('modal-img');
    const modalTitle = document.getElementById('galleryModalLabel');

    // === LOGIKA LAZY LOADING (Berlaku untuk semua gambar) ===
    const lazyLoadObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.getAttribute('data-src');
                img.setAttribute('src', src);
                img.classList.remove('lazy');
                img.onload = () => img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '0px 0px 200px 0px' });

    // === FUNGSI RENDER GALERI (Reusable) ===
    function renderGalleryItems(container, items) {
        container.innerHTML = '';
        if (!items || items.length === 0) {
            container.innerHTML = '<div class="col-12"><p class="text-center text-muted">Tidak ada gambar untuk ditampilkan.</p></div>';
            return;
        }

        items.forEach(item => {
            const col = document.createElement('div');
            col.className = 'col-lg-3 col-md-4 col-sm-6';
            // Perhatikan penggunaan encodeURI untuk menangani spasi di nama file
            col.innerHTML = `
                <div class="gallery-item shadow-sm">
                    <img src="image/placeholder.gif" 
                         data-src="${encodeURI(item.src)}" 
                         alt="${item.title}" 
                         class="gallery-img lazy">
                    <div class="gallery-overlay">
                        <h6 class="gallery-title">${item.title}</h6>
                        <button class="btn-zoom" data-src="${encodeURI(item.src)}" data-title="${item.title}">
                            <i class="fas fa-search-plus"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(col);
        });

        const lazyImages = container.querySelectorAll('.lazy');
        lazyImages.forEach(img => lazyLoadObserver.observe(img));
    }

    // === FUNGSI SPESIFIK UNTUK TIAP GALERI ===
    function renderMapGallery() {
        renderGalleryItems(mapGalleryGrid, mapGalleryItems);
    }

    function renderDocGallery(filter = 'all') {
        const filteredItems = filter === 'all'
            ? docGalleryItems
            : docGalleryItems.filter(item => item.category === filter);
        renderGalleryItems(docGalleryGrid, filteredItems);
    }

    function renderNews() {
        newsList.innerHTML = '';
        newsItems.forEach(news => {
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4';
            col.innerHTML = `
                <div class="card news-item h-100 shadow-sm">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${news.title}</h5>
                        <p class="card-subtitle mb-2 text-muted news-date">${news.date}</p>
                        <p class="card-text flex-grow-1">${news.excerpt}</p>
                    </div>
                </div>
            `;
            newsList.appendChild(col);
        });
    }

    // === EVENT LISTENERS ===

    // Listener untuk filter galeri dokumentasi
    docFilterControls.addEventListener('click', function (e) {
        if (e.target.tagName === 'BUTTON') {
            const currentActive = docFilterControls.querySelector('.btn.active');
            if (currentActive) currentActive.classList.remove('active');

            e.target.classList.add('active');
            renderDocGallery(e.target.dataset.filter);
        }
    });

    // Listener tunggal untuk membuka modal dari galeri manapun (Event Delegation)
    mainContent.addEventListener('click', function (e) {
        const zoomButton = e.target.closest('.btn-zoom');
        if (zoomButton) {
            const src = zoomButton.dataset.src;
            const title = zoomButton.dataset.title;
            modalImage.src = src;
            modalTitle.textContent = title;
            galleryModal.show();
        }
    });

    // === INISIALISASI HALAMAN ===
    renderMapGallery();
    renderDocGallery();
    renderNews();
});