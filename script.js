/**
 * 1. KONFIGURASI TAILWIND
 * Kita mendefinisikan warna custom CYRUS di sini
 */
tailwind.config = {
    theme: {
        extend: {
            colors: {
                dark: '#1a1b21',      // Latar belakang utama
                darker: '#121317',    // Navbar/Footer
                primary: '#d4af37',   // Warna Emas/Gold (Brand Color)
                secondary: '#2d2f36'  // Warna kartu/elemen
            }
        }
    }
}

/**
 * 2. LOGIKA INTERAKTIF
 * Menunggu dokumen selesai dimuat sebelum menjalankan script
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // Fitur: Tombol Kategori (Semua, Joki Game, dll)
    // Ambil semua tombol dengan class 'category-btn'
    const categoryButtons = document.querySelectorAll('.category-btn');

    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Hapus class 'active' dari semua tombol
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Tambahkan class 'active' ke tombol yang baru saja diklik
            this.classList.add('active');
            
            // (Opsional) Di sini nanti kita bisa tambahkan logika 
            // untuk memfilter konten berdasarkan kategori yang dipilih
            console.log('Kategori dipilih:', this.innerText);
        });
    });

    // Fitur: Efek Klik pada Kartu Layanan
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Contoh sederhana: Menampilkan alert nama layanan
            const serviceName = card.querySelector('h3').innerText;
            alert('Kamu memilih layanan: ' + serviceName + '\n(Fitur detail akan segera hadir!)');
        });
    });

    
});