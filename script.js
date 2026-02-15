import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

/**
 * 1. KONFIGURASI TAILWIND
 */
tailwind.config = {
    theme: {
        extend: {
            colors: {
                dark: '#1a1b21',
                darker: '#121317',
                primary: '#d4af37',
                secondary: '#2d2f36'
            }
        }
    }
}

/**
 * 2. KONFIGURASI FIREBASE
 */
const firebaseConfig = {
    apiKey: "AIzaSyDt2GpxK5iba_dY90ViL09k2XUALjIQv5c",
    authDomain: "momoostoree-game.firebaseapp.com",
    projectId: "momoostoree-game",
    databaseURL: "https://momoostoree-game-default-rtdb.firebaseio.com",
    storageBucket: "momoostoree-game.firebasestorage.app",
    messagingSenderId: "421360156113",
    appId: "1:421360156113:web:aad0558f69adec292db4f0"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Simpan data global untuk Modal Preview
let allAccountsData = []; 

/**
 * 3. LOGIKA UTAMA & FILTER SECTION
 */
document.addEventListener('DOMContentLoaded', () => {
    
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    // Daftar semua ID Section di HTML
    const allSections = [
        'section-popular', 
        'section-games', 
        'section-joki', 
        'section-market', 
        'section-rekber', 
        'section-bengkel'
    ];

    // Peta: Jika tombol X diklik, tampilkan Section Y
    const categoryMap = {
        "Semua": allSections,
        "Joki Game": ['section-games', 'section-joki'],
        "Jual Akun": ['section-rekber'],
        "Beli Akun": ['section-market'],
        "Rekber": ['section-rekber'],
        "Bengkel Akun": ['section-bengkel']
    };

    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update UI Tombol
            categoryButtons.forEach(btn => {
                btn.classList.remove('active', 'font-bold');
                btn.classList.add('font-medium');
            });
            this.classList.add('active', 'font-bold');
            this.classList.remove('font-medium');
            
            // Filter Section (Tampil/Sembunyi)
            const selectedCategory = this.innerText.trim();
            const sectionsToShow = categoryMap[selectedCategory] || allSections;

            allSections.forEach(sectionId => {
                const el = document.getElementById(sectionId);
                if (el) {
                    if (sectionsToShow.includes(sectionId)) {
                        el.classList.remove('hidden');
                        el.classList.add('fade-in'); 
                    } else {
                        el.classList.add('hidden');
                        el.classList.remove('fade-in');
                    }
                }
            });
        });
    });

    // Jalankan Firebase Data Fetcher
    renderPublicAccounts();
});

/**
 * 4. FUNGSI FIREBASE (LOAD DATA AKUN)
 */
function renderPublicAccounts() {
    const container = document.getElementById('account-list-container');
    const emptyState = document.getElementById('empty-state');
    
    if (!container) return;

    const accountsRef = ref(db, 'accounts');
    
    onValue(accountsRef, (snapshot) => {
        const data = snapshot.val();
        container.innerHTML = ''; 

        if (!data) {
            container.classList.add('hidden');
            if(emptyState) emptyState.classList.remove('hidden');
            allAccountsData = [];
            return;
        }

        container.classList.remove('hidden');
        if(emptyState) emptyState.classList.add('hidden');

        // Simpan ke variabel global untuk Modal
        allAccountsData = [];
        Object.keys(data).forEach(key => {
            allAccountsData.push({ id: key, ...data[key] });
        });

        // Render Data (Reverse agar yang terbaru diatas)
        allAccountsData.slice().reverse().forEach(acc => {
            const priceFormatted = "Rp " + parseInt(acc.price).toLocaleString('id-ID');
            
            // Handle Gambar (Array atau String)
            const images = acc.images || (acc.image ? [acc.image] : []);
            const firstImage = images.length > 0 ? images[0] : 'assets/placeholder.png'; // Fallback
            
            // Badge Jumlah Foto
            const galleryBadge = images.length > 1 ? 
                `<div class="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm z-10">
                    <i class="fa-regular fa-images"></i> ${images.length}
                 </div>` : '';

            const soldOverlay = acc.sold ? `
                <div class="absolute inset-0 bg-black/70 z-20 flex items-center justify-center backdrop-blur-sm rounded-xl">
                    <div class="bg-red-600 text-white font-black text-xl px-4 py-1 rounded-lg -rotate-12 border-2 border-white shadow-2xl">SOLD OUT</div>
                </div>` : '';

            // Tombol Aksi: Sekarang membuka Modal Detail
            const btnAction = acc.sold ? `
                <button disabled class="bg-gray-600 text-gray-400 px-4 py-1.5 rounded-lg text-sm font-bold cursor-not-allowed">Terjual</button>` : `
                <button onclick="openProductModal('${acc.id}')" class="bg-primary text-darker px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-yellow-400 transition">Lihat Detail</button>`;

            // Card HTML (Menambahkan onclick event ke card wrapper juga)
            const cardHTML = `
                <div class="relative bg-secondary rounded-xl overflow-hidden group border border-gray-700 hover:border-primary transition duration-300 shadow-lg cursor-pointer" onclick="openProductModal('${acc.id}')">
                    ${soldOverlay}
                    <div class="h-48 overflow-hidden relative">
                        <div class="absolute top-3 right-3 z-10 bg-primary text-darker text-[10px] font-extrabold px-3 py-1 rounded-full shadow-md uppercase">${acc.rank}</div>
                        
                        <img src="${firstImage}" alt="${acc.title}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                        ${galleryBadge}
                        
                        <div class="absolute inset-0 bg-gradient-to-t from-secondary via-transparent to-transparent"></div>
                    </div>
                    <div class="p-5">
                        <h3 class="text-xl font-bold text-white group-hover:text-primary transition line-clamp-1">${acc.title}</h3>
                        <p class="text-sm text-gray-400 mt-1 mb-4 line-clamp-2 h-10">${acc.desc}</p>
                        <div class="flex flex-wrap gap-2 mb-4">
                            <span class="bg-gray-800 text-gray-300 text-[10px] px-2 py-1 rounded border border-gray-600"><i class="fa-solid fa-shirt mr-1"></i>${acc.skin} Skin</span>
                            <span class="bg-gray-800 text-gray-300 text-[10px] px-2 py-1 rounded border border-gray-600"><i class="fa-solid fa-chart-simple mr-1"></i>WR ${acc.wr}</span>
                        </div>
                        <div class="flex justify-between items-center border-t border-gray-700 pt-4">
                            <span class="text-primary font-bold text-lg">${priceFormatted}</span>
                            ${btnAction}
                        </div>
                    </div>
                </div>`;
            container.innerHTML += cardHTML;
        });
    });
}

/**
 * 5. FITUR PRODUCT MODAL & GALLERY
 */
window.openProductModal = function(id) {
    // Cari data berdasarkan ID dari memory
    const acc = allAccountsData.find(item => item.id === id);
    if (!acc) return;

    const modal = document.getElementById('product-modal');
    const images = acc.images || (acc.image ? [acc.image] : []);

    // Isi Data Teks
    document.getElementById('modal-title').innerText = acc.title;
    document.getElementById('modal-price').innerText = "Rp " + parseInt(acc.price).toLocaleString('id-ID');
    document.getElementById('modal-rank').innerText = acc.rank;
    document.getElementById('modal-skin').innerText = acc.skin;
    document.getElementById('modal-wr').innerText = acc.wr;
    document.getElementById('modal-desc').innerText = acc.desc;

    // Handle Gambar Utama & Thumbnail
    const mainImg = document.getElementById('modal-main-image');
    const thumbContainer = document.getElementById('modal-thumbnails');
    
    mainImg.src = images[0] || ''; // Set default gambar pertama
    thumbContainer.innerHTML = ''; // Reset thumbnails

    if (images.length > 1) {
        images.forEach((imgSrc, index) => {
            const thumb = document.createElement('img');
            thumb.src = imgSrc;
            thumb.className = `w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition hover:scale-105 ${index === 0 ? 'border-primary' : 'border-transparent'}`;
            
            // Klik thumbnail ganti gambar utama
            thumb.onclick = (e) => {
                e.stopPropagation(); // Mencegah klik tembus
                mainImg.src = imgSrc;
                // Update border active
                Array.from(thumbContainer.children).forEach(t => t.classList.replace('border-primary', 'border-transparent'));
                thumb.classList.replace('border-transparent', 'border-primary');
            };
            thumbContainer.appendChild(thumb);
        });
    }

    // Handle Tombol Beli di Modal
    const btnBuy = document.getElementById('modal-buy-btn');
    if (acc.sold) {
        btnBuy.innerHTML = "❌ TERJUAL";
        btnBuy.className = "w-full bg-gray-600 text-gray-400 font-bold py-4 rounded-xl cursor-not-allowed";
        btnBuy.onclick = null;
    } else {
        btnBuy.innerHTML = `<i class="fa-brands fa-whatsapp text-2xl"></i> Beli Sekarang`;
        btnBuy.className = "w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition shadow-lg hover:shadow-green-500/20 group";
        const priceStr = "Rp " + parseInt(acc.price).toLocaleString('id-ID');
        btnBuy.onclick = () => buyAccount(acc.id, acc.title, priceStr);
    }

    // Tampilkan Modal
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10); // Animasi fade in
}

window.closeProductModal = function() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('opacity-0');
    setTimeout(() => modal.classList.add('hidden'), 300); // Tunggu animasi selesai
}

// Tutup modal jika klik di area gelap (luar konten)
document.getElementById('product-modal').addEventListener('click', function(e) {
    if (e.target === this) closeProductModal();
});

// Fungsi Integrasi WhatsApp (Global)
window.buyAccount = function(id, title, price) {
    const phoneNumber = "6285748175548"; 
    const message = encodeURIComponent(`Halo Admin MOMO STORE, saya tertarik membeli akun:\n\nID: #${id}\nJudul: ${title}\nHarga: ${price}\n\nApakah masih ready?`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
}