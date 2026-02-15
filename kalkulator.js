/* --- DATABASE HARGA & STRUKTUR RANK --- */
// steps: jumlah bintang total dalam satu Tier
const rankData = [
    { id: 0, name: 'Epic', price: 5000, steps: 25, icon: 'fa-shield-cat' },      // Epic V-I (5x5)
    { id: 1, name: 'Legend', price: 8000, steps: 25, icon: 'fa-dragon' },        // Legend V-I (5x5)
    { id: 2, name: 'Mythic', price: 12000, steps: 25, icon: 'fa-khanda' },       // 0-24
    { id: 3, name: 'Mythical Honor', price: 15000, steps: 25, icon: 'fa-medal' }, // 25-49
    { id: 4, name: 'Mythical Glory', price: 20000, steps: 50, icon: 'fa-crown' }, // 50-99
    { id: 5, name: 'Mythical Immortal', price: 30000, steps: 9999, icon: 'fa-fire' } // 100+
];

/* --- STATE GLOBAL --- */
let activeTab = 'eceran';
let selectedRankEceran = null;
let starCountEceran = 1;

// State untuk Paket
let selectedStartTier = 0; 
let selectedTargetTier = 1; 
let startStarCount = 0; // Bintang yang sudah dimiliki user di tier awal

/* --- 1. LOGIKA UI & TABS --- */
const contentEceran = document.getElementById('content-eceran');
const contentPaket = document.getElementById('content-paket');
const tabEceran = document.getElementById('tab-eceran');
const tabPaket = document.getElementById('tab-paket');
const detailEceran = document.getElementById('detail-eceran');
const detailPaket = document.getElementById('detail-paket');
const summaryMode = document.getElementById('summary-mode');

function switchTab(mode) {
    activeTab = mode;
    
    if (mode === 'eceran') {
        contentEceran.classList.remove('hidden');
        contentPaket.classList.add('hidden');
        detailEceran.classList.remove('hidden');
        detailPaket.classList.add('hidden');
        
        tabEceran.classList.add('bg-primary', 'text-darker', 'border-primary', 'shadow-[0_0_15px_rgba(212,175,55,0.4)]');
        tabEceran.classList.remove('text-gray-400', 'border-gray-600');
        tabPaket.classList.remove('bg-primary', 'text-darker', 'border-primary', 'shadow-[0_0_15px_rgba(212,175,55,0.4)]');
        tabPaket.classList.add('text-gray-400', 'border-gray-600');
        
        summaryMode.innerText = "ECERAN / PER BINTANG";
        calculateTotal();
    } else {
        contentEceran.classList.add('hidden');
        contentPaket.classList.remove('hidden');
        detailEceran.classList.add('hidden');
        detailPaket.classList.remove('hidden');

        tabPaket.classList.add('bg-primary', 'text-darker', 'border-primary', 'shadow-[0_0_15px_rgba(212,175,55,0.4)]');
        tabPaket.classList.remove('text-gray-400', 'border-gray-600');
        tabEceran.classList.remove('bg-primary', 'text-darker', 'border-primary', 'shadow-[0_0_15px_rgba(212,175,55,0.4)]');
        tabEceran.classList.add('text-gray-400', 'border-gray-600');

        summaryMode.innerText = "PAKET TIER KE TIER";
        calculatePaket();
    }
}

/* --- 2. LOGIKA MODAL T&C --- */
let isAgreed = false;
const btnAgree = document.getElementById('btn-agree');
const checkboxIcon = document.getElementById('checkbox-icon');
const checkboxBox = document.getElementById('checkbox-box');
const modal = document.getElementById('tnc-modal');
const body = document.getElementById('body-content');

function toggleCheckbox() {
    isAgreed = !isAgreed;
    if (isAgreed) {
        checkboxIcon.classList.remove('opacity-0');
        checkboxBox.classList.remove('border-gray-500');
        checkboxBox.classList.add('bg-primary', 'border-primary');
        btnAgree.disabled = false;
        btnAgree.classList.remove('bg-gray-600', 'cursor-not-allowed', 'text-gray-400');
        btnAgree.classList.add('bg-primary', 'hover:bg-yellow-400', 'text-darker');
    } else {
        checkboxIcon.classList.add('opacity-0');
        checkboxBox.classList.add('border-gray-500');
        checkboxBox.classList.remove('bg-primary', 'border-primary');
        btnAgree.disabled = true;
        btnAgree.classList.add('bg-gray-600', 'cursor-not-allowed', 'text-gray-400');
        btnAgree.classList.remove('bg-primary', 'hover:bg-yellow-400', 'text-darker');
    }
}

btnAgree.addEventListener('click', () => {
    modal.classList.add('opacity-0', 'pointer-events-none');
    body.classList.remove('overflow-hidden');
    renderRankOptions(); 
    initPaketDropdowns();
});

/* --- 3. LOGIKA HITUNG ECERAN --- */
const rankContainer = document.getElementById('rank-options');
const summaryRank = document.getElementById('summary-rank');
const summaryQty = document.getElementById('summary-qty');
const totalPriceEl = document.getElementById('total-price');
const starInput = document.getElementById('star-input');

function renderRankOptions() {
    rankContainer.innerHTML = '';
    rankData.forEach((rank, index) => {
        const div = document.createElement('div');
        div.className = `cursor-pointer rounded-xl p-3 border border-gray-700 bg-gray-800 hover:border-gray-500 transition flex flex-col items-center justify-center text-center h-24 rank-card group`;
        div.id = `rank-ecer-${index}`; 
        div.onclick = () => selectRankEceran(index);
        div.innerHTML = `
            <i class="fa-solid ${rank.icon} text-2xl mb-2 text-gray-400 group-hover:text-primary transition rank-icon"></i>
            <span class="text-xs font-bold text-gray-300 group-hover:text-white">${rank.name}</span>
            <span class="text-[10px] text-primary font-mono mt-1">Rp ${rank.price.toLocaleString()}/⭐</span>
        `;
        rankContainer.appendChild(div);
    });
    selectRankEceran(0);
}

function selectRankEceran(index) {
    selectedRankEceran = rankData[index];
    document.querySelectorAll('.rank-card').forEach(el => {
        el.className = `cursor-pointer rounded-xl p-3 border border-gray-700 bg-gray-800 transition flex flex-col items-center justify-center text-center h-24 rank-card group`;
        el.querySelector('.rank-icon').classList.remove('text-primary');
    });
    const active = document.getElementById(`rank-ecer-${index}`);
    active.className = `cursor-pointer rounded-xl p-3 border-2 border-primary bg-secondary shadow-lg transition flex flex-col items-center justify-center text-center h-24 rank-card group transform scale-105`;
    active.querySelector('.rank-icon').classList.add('text-primary');
    calculateTotal();
}

function updateStars(num) {
    let val = parseInt(starInput.value) || 0;
    val = val + num;
    if (val < 1) val = 1;
    starInput.value = val;
    starCountEceran = val;
    calculateTotal();
}

starInput.addEventListener('input', (e) => {
    let val = parseInt(e.target.value);
    if (!val || val < 1) val = 1;
    starCountEceran = val;
    calculateTotal();
});

function calculateTotal() {
    if (!selectedRankEceran) return;
    summaryRank.innerText = selectedRankEceran.name;
    summaryQty.innerText = `${starCountEceran} Bintang`;
    const total = selectedRankEceran.price * starCountEceran;
    totalPriceEl.innerText = `Rp ${total.toLocaleString()}`;
}

/* --- 4. LOGIKA HITUNG PAKET (TIER KE TIER) --- */
const startSelect = document.getElementById('start-tier-select');
const targetSelect = document.getElementById('target-tier-select');
const startStarInput = document.getElementById('start-star-input');
const maxStarHint = document.getElementById('max-star-hint');
const summaryFrom = document.getElementById('summary-from');
const summaryTo = document.getElementById('summary-to');
const summaryStartStars = document.getElementById('summary-start-stars');
const summaryNote = document.getElementById('summary-note');

function initPaketDropdowns() {
    startSelect.innerHTML = '';
    rankData.forEach((rank, index) => {
        if (index < rankData.length - 1) { 
            const opt = document.createElement('option');
            opt.value = index;
            opt.text = rank.name;
            startSelect.appendChild(opt);
        }
    });

    startSelect.addEventListener('change', (e) => {
        selectedStartTier = parseInt(e.target.value);
        startStarCount = 0; // Reset bintang awal saat ganti rank
        startStarInput.value = 0;
        updateTargetDropdown();
        updateStartStarValidation();
        calculatePaket();
    });

    targetSelect.addEventListener('change', (e) => {
        selectedTargetTier = parseInt(e.target.value);
        calculatePaket();
    });

    startStarInput.addEventListener('input', (e) => {
        let val = parseInt(e.target.value);
        const maxStars = rankData[selectedStartTier].steps - 1; // Maksimal bintang = steps - 1 (karena kalau steps full berarti naik rank)
        
        if (!val || val < 0) val = 0;
        if (val > maxStars) val = maxStars;
        
        startStarInput.value = val;
        startStarCount = val;
        calculatePaket();
    });

    updateTargetDropdown(); 
    updateStartStarValidation(); // Init validasi pertama
    calculatePaket(); 
}

function updateStartStars(num) {
    let val = parseInt(startStarInput.value) || 0;
    const maxStars = rankData[selectedStartTier].steps - 1;

    val = val + num;
    if (val < 0) val = 0;
    if (val > maxStars) val = maxStars;

    startStarInput.value = val;
    startStarCount = val;
    calculatePaket();
}

function updateStartStarValidation() {
    const currentTier = rankData[selectedStartTier];
    // Hint text: Maksimal X bintang
    maxStarHint.innerText = `Maksimal ${currentTier.steps - 1} bintang di tier ini sebelum naik rank.`;
}

function updateTargetDropdown() {
    targetSelect.innerHTML = '';
    rankData.forEach((rank, index) => {
        if (index > selectedStartTier) {
            const opt = document.createElement('option');
            opt.value = index;
            opt.text = rank.name;
            targetSelect.appendChild(opt);
        }
    });
    if (targetSelect.options.length > 0) {
        selectedTargetTier = parseInt(targetSelect.options[0].value);
    }
}

function calculatePaket() {
    const startIdx = selectedStartTier;
    const targetIdx = selectedTargetTier;

    const fromName = rankData[startIdx].name;
    const toName = rankData[targetIdx].name;

    summaryFrom.innerText = fromName;
    summaryTo.innerText = toName;
    summaryStartStars.innerText = `(Punya: ${startStarCount} ⭐)`;

    let totalCost = 0;
    let totalStarsNeeded = 0;

    // 1. Hitung sisa bintang di Tier Awal
    // Contoh: Epic (25 step). User punya 5. Sisa = 20.
    const firstTierSteps = rankData[startIdx].steps - startStarCount;
    totalCost += (firstTierSteps * rankData[startIdx].price);
    totalStarsNeeded += firstTierSteps;

    // 2. Hitung tier-tier selanjutnya (Full)
    // Loop dari (startIdx + 1) sampai (targetIdx - 1)
    for (let i = startIdx + 1; i < targetIdx; i++) {
        const tier = rankData[i];
        totalCost += (tier.steps * tier.price);
        totalStarsNeeded += tier.steps;
    }

    summaryNote.innerText = `Butuh ${totalStarsNeeded} Bintang lagi untuk mencapai ${toName}.`;
    totalPriceEl.innerText = `Rp ${totalCost.toLocaleString()}`;
}

/* --- 5. LOGIKA WHATSAPP --- */
function orderViaWA() {
    const phoneNumber = "6281234567890"; // GANTI NOMOR WA
    let message = "";

    if (activeTab === 'eceran') {
        const total = selectedRankEceran.price * starCountEceran;
        message = `Halo Admin CYRUS, saya mau order Joki ECERAN:%0A%0A` +
                  `🎮 Rank: ${selectedRankEceran.name}%0A` +
                  `⭐ Jumlah: ${starCountEceran} Bintang%0A` +
                  `💰 Total: Rp ${total.toLocaleString()}%0A%0A` +
                  `Mohon diproses!`;
    } else {
        const fromName = rankData[selectedStartTier].name;
        const toName = rankData[selectedTargetTier].name;
        const priceText = totalPriceEl.innerText;
        message = `Halo Admin CYRUS, saya mau order Joki PAKET:%0A%0A` +
                  `🚀 Start: ${fromName} (Punya ${startStarCount} ⭐)%0A` +
                  `🏁 Target: ${toName}%0A` +
                  `💰 Estimasi: ${priceText}%0A%0A` +
                  `Apakah slot tersedia?`;
    }

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
}