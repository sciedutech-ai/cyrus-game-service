import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// --- 1. KONFIGURASI FIREBASE ---
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
const auth = getAuth(app);

let accounts = [];
let currentUser = null;

// --- 2. KONFIGURASI IMGBB ---
const IMGBB_API_KEY = "f15cbcefc2e45d6d061ceb8c8c862d70";

// --- 3. SISTEM AUTH & LOGIN ---
onAuthStateChanged(auth, (user) => {
    const loginOverlay = document.getElementById('login-overlay');
    if (user) {
        currentUser = user;
        loginOverlay.classList.add('hidden');
        loadData(); 
    } else {
        currentUser = null;
        loginOverlay.classList.remove('hidden');
    }
});

window.handleLogin = async function(event) {
    event.preventDefault();
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;
    const btnLogin = document.getElementById('btn-login');
    
    btnLogin.disabled = true;
    btnLogin.innerText = "Memproses...";

    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        alert("Login Gagal! Periksa email dan password.");
        btnLogin.disabled = false;
        btnLogin.innerText = "MASUK DASHBOARD";
    }
};

window.handleLogout = () => confirm("Keluar?") && signOut(auth);

// --- 4. FUNGSI GAMBAR (PREVIEW, COMPRESS, UPLOAD) ---

// A. Preview Multiple Image
window.previewMultipleImages = function(event) {
    const files = event.target.files;
    const container = document.getElementById('image-preview-container');
    
    if (files.length > 10) {
        alert("Maksimal 10 foto!");
        event.target.value = ""; // Reset
        return;
    }

    container.innerHTML = ""; // Bersihkan preview lama
    container.classList.remove('hidden');

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const div = document.createElement('div');
            div.className = "relative h-20 bg-darker rounded-lg overflow-hidden border border-gray-600";
            div.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
            container.appendChild(div);
        }
        reader.readAsDataURL(file);
    });
};

// B. Kompresi Gambar
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; 
                let width = img.width;
                let height = img.height;
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7);
            };
        };
    });
}

// C. Upload Multiple ke ImgBB
async function uploadMultipleImages(files) {
    const uploadPromises = Array.from(files).map(async (file) => {
        const compressed = await compressImage(file);
        const formData = new FormData();
        formData.append("image", compressed);
        
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData
        });
        const res = await response.json();
        if(res.success) return res.data.url;
        else throw new Error("Gagal upload");
    });

    return await Promise.all(uploadPromises);
}

// --- 5. CRUD DATA (LOAD & SAVE) ---

function loadData() {
    onValue(ref(db, 'accounts'), (snapshot) => {
        const data = snapshot.val();
        accounts = [];
        if (data) {
            Object.keys(data).forEach(key => {
                accounts.push({ id: key, ...data[key] });
            });
            accounts.reverse();
        }
        renderTable();
        renderStats();
    });
}

window.saveAccount = async function(event) {
    event.preventDefault();
    const btnSubmit = event.target.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.innerText = "Memproses...";

    try {
        const id = document.getElementById('inp-id').value;
        const fileInput = document.getElementById('inp-image-file');
        const oldImagesJson = document.getElementById('inp-images-old').value;
        
        let finalImages = [];

        // Logika: Jika ada file baru diupload, pakai yang baru. Jika tidak, pakai yang lama.
        if (fileInput.files.length > 0) {
            btnSubmit.innerText = `Mengupload ${fileInput.files.length} Foto...`;
            finalImages = await uploadMultipleImages(fileInput.files);
        } else if (oldImagesJson) {
            finalImages = JSON.parse(oldImagesJson); // Pakai data lama
        }

        if (finalImages.length === 0) throw new Error("Wajib upload minimal 1 foto!");

        const accountData = {
            title: document.getElementById('inp-title').value,
            price: document.getElementById('inp-price').value,
            rank: document.getElementById('inp-rank').value,
            skin: document.getElementById('inp-skin').value,
            wr: document.getElementById('inp-wr').value,
            desc: document.getElementById('inp-desc').value,
            sold: document.getElementById('inp-sold').checked,
            images: finalImages, // SIMPAN SEBAGAI ARRAY
            image: finalImages[0], // Fallback agar Table Admin tetap jalan (ambil foto pertama)
            updatedAt: Date.now()
        };

        if (id) {
            await update(ref(db, 'accounts/' + id), accountData);
        } else {
            await set(push(ref(db, 'accounts')), accountData);
        }

        window.closeModal();
        alert("Berhasil disimpan!");
    } catch (e) {
        alert("Error: " + e.message);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = "SIMPAN DATA";
    }
};

// --- 6. UI FUNCTIONS (Table, Stats, Modal) ---

function renderTable() {
    const tbody = document.getElementById('account-table-body');
    tbody.innerHTML = accounts.map(acc => `
        <tr class="hover:bg-gray-800 transition border-b border-gray-700">
            <td class="px-6 py-4 flex items-center gap-3">
                <img src="${acc.image}" class="w-10 h-10 md:w-12 md:h-12 object-cover rounded-lg bg-darker">
                <div class="md:hidden">
                    <div class="font-bold text-white text-xs">${acc.title.substring(0, 20)}...</div>
                    <div class="text-primary text-[10px]">Rp ${parseInt(acc.price).toLocaleString('id-ID')}</div>
                </div>
            </td>
            <td class="px-6 py-4 font-bold text-white hidden md:table-cell">${acc.title}</td>
            <td class="px-6 py-4 text-primary hidden md:table-cell">Rp ${parseInt(acc.price).toLocaleString('id-ID')}</td>
            <td class="px-6 py-4 text-[10px] md:text-xs">
                <span class="bg-gray-800 px-2 py-1 rounded border border-gray-700">${acc.rank}</span>
            </td>
            <td class="px-6 py-4">
                ${acc.sold ? '<span class="text-red-500 font-bold text-[10px]">SOLD</span>' : '<span class="text-green-500 font-bold text-[10px]">READY</span>'}
            </td>
            <td class="px-6 py-4 text-right space-x-3">
                <button onclick="editAccount('${acc.id}')" class="text-blue-400 hover:text-white"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteAccount('${acc.id}')" class="text-red-500 hover:text-white"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderStats() {
    document.getElementById('stat-total').innerText = accounts.length;
    document.getElementById('stat-active').innerText = accounts.filter(a => !a.sold).length;
    document.getElementById('stat-sold').innerText = accounts.filter(a => a.sold).length;
}

window.editAccount = (id) => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;

    document.getElementById('inp-id').value = acc.id;
    document.getElementById('inp-title').value = acc.title;
    document.getElementById('inp-price').value = acc.price;
    document.getElementById('inp-rank').value = acc.rank;
    document.getElementById('inp-skin').value = acc.skin;
    document.getElementById('inp-wr').value = acc.wr;
    document.getElementById('inp-desc').value = acc.desc;
    document.getElementById('inp-sold').checked = acc.sold;

    // Handle Gambar (Load Array atau Single String)
    const container = document.getElementById('image-preview-container');
    container.innerHTML = "";
    
    // Support data lama (image string) dan data baru (images array)
    let imagesArray = acc.images || (acc.image ? [acc.image] : []);
    
    if (imagesArray.length > 0) {
        document.getElementById('inp-images-old').value = JSON.stringify(imagesArray);
        container.classList.remove('hidden');
        imagesArray.forEach(url => {
            const div = document.createElement('div');
            div.className = "relative h-20 bg-darker rounded-lg overflow-hidden border border-gray-600";
            div.innerHTML = `<img src="${url}" class="w-full h-full object-cover">`;
            container.appendChild(div);
        });
    } else {
        document.getElementById('image-preview-container').classList.add('hidden');
    }

    document.getElementById('modal-title').innerText = "Edit Akun";
    window.openModal(true);
};

window.deleteAccount = (id) => confirm("Hapus akun ini?") && remove(ref(db, 'accounts/' + id));

window.openModal = (isEdit = false) => {
    document.getElementById('account-modal').classList.remove('hidden');
    if(!isEdit) {
        document.getElementById('account-form').reset();
        window.removeImage();
    }
};

window.closeModal = () => document.getElementById('account-modal').classList.add('hidden');

// Fungsi Reset Input Gambar
window.removeImage = () => {
    document.getElementById('inp-image-file').value = "";
    document.getElementById('inp-images-old').value = "";
    document.getElementById('image-preview-container').innerHTML = "";
    document.getElementById('image-preview-container').classList.add('hidden');
};