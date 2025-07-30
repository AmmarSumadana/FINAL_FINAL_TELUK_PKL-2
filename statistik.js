// Konfigurasi file data spasial (DISESUAIKAN DENGAN SCREENSHOT)
const config = {
    polygon: {
        path: "data/",
        files: [{ name: "penggunaan lahan.json", identitas: "KETERANGAN" }] // DIUBAH dari pl_ar.json
    },
    garis: {
        path: "data/",
        files: [
            { name: "jalan.json" },      // DIUBAH dari jaringan_jalan.json
            { name: "jembatan.json" },
            { name: "sungai.json" }
        ]
    },
    titik: {
        path: "data/",
        files: [
            { name: "industri.json" },
            { name: "peribadatan.json" },  // DIUBAH dari masjid.json
            { name: "pemakaman.json" },
            { name: "tempat menarik.json" },// DIUBAH dari tempat_menarik.json (menggunakan spasi)
            { name: "bangunan.json" }      // DITAMBAHKAN dari file yang ada
        ]
    },
};


// Data demografi statis sesuai permintaan
const demografiData = {
    jumlah_kk: 83,
    laki_laki: 135,
    perempuan: 148
};

// State management untuk tabel
const tableState = {
    poligon: { data: [], currentPage: 1, rowsPerPage: 5, sortColumn: 'kategori', sortDir: 'asc', columns: { kategori: 'Kategori', luas: 'Total Luas (Hektar)' } },
    garis: { data: [], currentPage: 1, rowsPerPage: 5, sortColumn: 'kategori', sortDir: 'asc', columns: { kategori: 'Kategori', panjang: 'Total Panjang (km)' } },
    titik: { data: [], currentPage: 1, rowsPerPage: 5, sortColumn: 'kategori', sortDir: 'asc', columns: { kategori: 'Kategori', jumlah: 'Jumlah' } }
};

// --- Helper & Fungsi Rendering Tabel (Tidak ada perubahan) ---
const formatLabel = (fileName) => fileName.replace('.json', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
const formatNumber = (num, decimals = 2) => num.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
function renderTable(tableId) {
    const state = tableState[tableId];
    const tableBody = document.getElementById(`stats-${tableId}`);
    const paginationContainer = document.getElementById(`pagination-${tableId}`);
    if (!state || state.data.length === 0) { tableBody.innerHTML = `<tr><td colspan="${Object.keys(state.columns).length}" class="text-center">Tidak ada data.</td></tr>`; paginationContainer.innerHTML = ''; return; }
    const sortedData = [...state.data].sort((a, b) => { const valA = a[state.sortColumn]; const valB = b[state.sortColumn]; if (valA < valB) return state.sortDir === 'asc' ? -1 : 1; if (valA > valB) return state.sortDir === 'asc' ? 1 : -1; return 0; });
    const startIndex = (state.currentPage - 1) * state.rowsPerPage;
    const paginatedData = sortedData.slice(startIndex, startIndex + state.rowsPerPage);
    tableBody.innerHTML = paginatedData.map(row => `<tr>${Object.keys(state.columns).map(colKey => `<td>${typeof row[colKey] === 'number' ? formatNumber(row[colKey]) : row[colKey]}</td>`).join('')}</tr>`).join('');
    renderPagination(tableId, sortedData.length);
    updateSortIcons(tableId);
}
function renderPagination(tableId, totalRows) {
    const state = tableState[tableId];
    const paginationContainer = document.getElementById(`pagination-${tableId}`);
    const totalPages = Math.ceil(totalRows / state.rowsPerPage);
    if (totalPages <= 1) { paginationContainer.innerHTML = ''; return; }
    let paginationHTML = '<ul class="pagination pagination-sm">';
    paginationHTML += `<li class="page-item ${state.currentPage === 1 ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${state.currentPage - 1}">‹</a></li>`;
    for (let i = 1; i <= totalPages; i++) { paginationHTML += `<li class="page-item ${state.currentPage === i ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`; }
    paginationHTML += `<li class="page-item ${state.currentPage === totalPages ? 'disabled' : ''}"><a class="page-link" href="#" data-page="${state.currentPage + 1}">›</a></li>`;
    paginationHTML += '</ul>';
    paginationContainer.innerHTML = paginationHTML;
    paginationContainer.querySelectorAll('.page-link').forEach(link => { link.addEventListener('click', (e) => { e.preventDefault(); const page = parseInt(e.target.dataset.page); if (page && page !== state.currentPage) { state.currentPage = page; renderTable(tableId); } }); });
}
function updateSortIcons(tableId) {
    const state = tableState[tableId];
    document.getElementById(`header-${tableId}`).querySelectorAll('th[data-sort]').forEach(th => { th.querySelector('.sort-icon').innerHTML = (th.dataset.sort === state.sortColumn) ? (state.sortDir === 'asc' ? '▲' : '▼') : ''; });
}
function setupEventListeners() {
    Object.keys(tableState).forEach(tableId => {
        document.getElementById(`header-${tableId}`).querySelectorAll('th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const state = tableState[tableId];
                const sortKey = th.dataset.sort;
                state.sortDir = (state.sortColumn === sortKey && state.sortDir === 'asc') ? 'desc' : 'asc';
                state.sortColumn = sortKey;
                state.currentPage = 1;
                renderTable(tableId);
            });
        });
    });
}

// --- Fungsi Utama (Tidak ada perubahan) ---
async function main() {
    Object.keys(tableState).forEach(id => {
        const tableBody = document.getElementById(`stats-${id}`);
        if (tableBody) {
             tableBody.innerHTML = `<tr><td colspan="${Object.keys(tableState[id].columns).length}" class="text-center"><div class="spinner-border spinner-border-sm"></div> Memuat...</td></tr>`;
        }
    });

    const totalPenduduk = demografiData.laki_laki + demografiData.perempuan;
    const rasioGender = (demografiData.laki_laki / demografiData.perempuan) * 100;

    document.getElementById('total-penduduk').textContent = totalPenduduk.toLocaleString('id-ID');
    document.getElementById('jumlah-kk').textContent = demografiData.jumlah_kk.toLocaleString('id-ID');
    document.getElementById('rasio-gender').textContent = rasioGender.toFixed(1);
    
    try {
        for (const fileObj of config.titik.files) {
            const res = await fetch(config.titik.path + fileObj.name);
            if (!res.ok) throw new Error(`Gagal memuat ${fileObj.name}`);
            const data = await res.json();
            tableState.titik.data.push({ kategori: formatLabel(fileObj.name), jumlah: data.features.length });
        }
        for (const fileObj of config.garis.files) {
            const res = await fetch(config.garis.path + fileObj.name);
            if (!res.ok) throw new Error(`Gagal memuat ${fileObj.name}`);
            const data = await res.json();
            tableState.garis.data.push({ kategori: formatLabel(fileObj.name), panjang: data.features.reduce((sum, feat) => sum + turf.length(feat, { units: 'kilometers' }), 0) });
        }
        const plArFile = config.polygon.files[0];
        const resPolygon = await fetch(config.polygon.path + plArFile.name);
        if (!resPolygon.ok) throw new Error(`Gagal memuat ${plArFile.name}`);
        const dataPolygon = await resPolygon.json();
        const polygonAggregates = dataPolygon.features.reduce((acc, feature) => {
            const category = feature.properties[plArFile.identitas] || 'Tidak Diketahui';
            acc[category] = (acc[category] || 0) + (turf.area(feature) / 10000);
            return acc;
        }, {});
        tableState.poligon.data = Object.entries(polygonAggregates).map(([k, v]) => ({ kategori: k, luas: v }));
        
        Object.keys(tableState).forEach(id => renderTable(id));
        setupEventListeners();

        const pointStats = tableState.titik.data.reduce((acc, curr) => ({ ...acc, [curr.kategori]: curr.jumlah }), {});
        const lineStats = tableState.garis.data;
        renderCharts(polygonAggregates, pointStats, demografiData, lineStats);
    
    } catch (error) {
        console.error("Kesalahan saat memuat data spasial:", error);
        Object.keys(tableState).forEach(id => {
            const tableBody = document.getElementById(`stats-${id}`);
            if(tableBody) {
                tableBody.innerHTML = `<tr><td colspan="${Object.keys(tableState[id].columns).length}" class="text-danger text-center"><strong>Gagal Memuat Data.</strong><br><small>${error.message}</small></td></tr>`;
            }
        });
    }
}

// --- Fungsi Render Grafik (Tidak ada perubahan) ---
function renderCharts(polygonStats, pointStats, demografiStats, lineStats) {
    if(window.myCharts) { Object.values(window.myCharts).forEach(chart => chart.destroy()); }
    window.myCharts = {};

    const chartColors = ['#4a90e2', '#50e3c2', '#f5a623', '#f8e71c', '#bd10e0', '#9013fe', '#417505', '#d0021b', '#b8e986', '#7ed321', '#c4a0d4', '#bec0c0'];

    window.myCharts.penggunaanLahan = new Chart(document.getElementById('penggunaanLahanChart').getContext('2d'), { 
        type: 'pie', 
        data: { 
            labels: Object.keys(polygonStats), 
            datasets: [{ data: Object.values(polygonStats), backgroundColor: chartColors, borderColor: '#fff', borderWidth: 2 }] 
        }, 
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } } 
    });

    window.myCharts.fasilitas = new Chart(document.getElementById('fasilitasChart').getContext('2d'), { 
        type: 'bar', 
        data: { 
            labels: Object.keys(pointStats), 
            datasets: [{ label: 'Jumlah Unit', data: Object.values(pointStats), backgroundColor: '#4a90e2' }] 
        }, 
        options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } } 
    });

    window.myCharts.komposisi = new Chart(document.getElementById('komposisiPendudukChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Laki-laki', 'Perempuan'],
            datasets: [{
                label: 'Jumlah Penduduk',
                data: [demografiStats.laki_laki, demografiStats.perempuan],
                backgroundColor: ['rgba(74, 144, 226, 0.8)', 'rgba(245, 166, 35, 0.8)'],
                borderColor: ['rgba(74, 144, 226, 1)', 'rgba(245, 166, 35, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });

    window.myCharts.jaringan = new Chart(document.getElementById('jaringanChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels: lineStats.map(item => item.kategori),
            datasets: [{
                label: 'Total Panjang (km)',
                data: lineStats.map(item => item.panjang),
                backgroundColor: 'rgba(80, 227, 194, 0.8)',
                borderColor: 'rgba(80, 227, 194, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true } }
        }
    });
}

document.addEventListener('DOMContentLoaded', main);