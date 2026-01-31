/* --- FITUR: LOAD MORE GAMES (25 GAME) --- */
    
    // 1. Database Game Sederhana (Array)
    const gamesData = [
        { name: "Mobile Legends", img: "assets/game-banner/mobile-legend.webp" },
        { name: "Magic Chess", img: "assets/game-banner/magic-chess.webp" },
        { name: "PUBG Mobile", img: "assets/game-banner/pubg.jpg" },
        { name: "Free Fire MAX", img: "assets/game-banner/free-fire.jpeg" },
        { name: "Honor of Kings", img: "assets/game-banner/honor-of-king.jpeg" },
        { name: "Delta Force", img: "assets/game-banner/delta-force.jpg" },
        { name: "Age of Empires", img: "assets/game-banner/age-of-empires.jpg" },
        { name: "Point Blank", img: "assets/game-banner/point-blank.jpg" },
        { name: "Genshin Impact", img: "assets/game-banner/genshin-impact.jpeg" },
        { name: "Valorant", img: "assets/game-banner/valorant.webp" },
        { name: "EA Sports FC Mobile", img: "assets/game-banner/ea-sports-fc.jpg" },
        { name: "Clash of Clans", img: "assets/game-banner/clash-of-clans.jpg" },
        // --- Batas Awal (12 Game) ---
        { name: "Call of Duty", img: "assets/game-banner/call-of-dut.jpg" },
        { name: "Roblox", img: "assets/game-banner/roblox.jpg" },
        { name: "Brawl Stars", img: "assets/game-banner/brawl-stars.webp" },
        { name: "Minecraft", img: "assets/game-banner/minecraft.jpg" },
        { name: "Ragnarok Origin", img: "assets/game-banner/ragnarok-origin.webp" },
        { name: "Black Clover M", img: "assets/game-banner/black-clover-m.jpg" },
        { name: "Undawn", img: "assets/game-banner/undawn.png" },
        { name: "Metal Slug", img: "assets/game-banner/metal-slug.jpg" },
        { name: "Sausage Man", img: "assets/game-banner/sausage-man.webp" },
        { name: "Farlight 84", img: "assets/game-banner/farlight-84.jpg" },
        { name: "LifeAfter", img: "assets/game-banner/lifeafter.jpg" },
        { name: "Tower of Fantasy", img: "assets/game-banner/tower-of-fantasy.jpg" },
        { name: "Lords Mobile", img: "assets/game-banner/lords-mobile.png" },
        { name: "Hago", img: "assets/game-banner/hago.png" },
        { name: "Domino Higgs", img: "assets/game-banner/high-domino.jpg" },
        { name: "Super Sus", img: "assets/game-banner/super-sus.jpg" },
        { name: "Arena of Valor", img: "assets/game-banner/arena-of-valor.jpg" },
        { name: "League of Legends", img: "assets/game-banner/league-of-legends.webp" },
    ];

    const gridContainer = document.getElementById('game-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    let itemsToShow = 12; // Jumlah game yang muncul pertama kali

    // Fungsi untuk membuat HTML Card Game
    function createGameCard(game) {
        return `
            <div class="relative group rounded-xl overflow-hidden aspect-[3/4] cursor-pointer shadow-lg border border-transparent hover:border-primary transition duration-300">
                <img src="${game.img}" alt="${game.name}" class="w-full h-full object-cover transition duration-500 group-hover:scale-110 group-hover:rotate-1">
                
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition"></div>
                
                <div class="absolute bottom-0 left-0 p-4 w-full">
                    <h3 class="text-white font-bold text-sm md:text-base leading-tight group-hover:text-primary transition">${game.name}</h3>
                </div>
            </div>
        `;
    }

    // Fungsi Render Game
    function renderGames(limit) {
        gridContainer.innerHTML = ''; // Bersihkan container dulu
        
        // Loop data game sesuai limit
        gamesData.slice(0, limit).forEach(game => {
            gridContainer.innerHTML += createGameCard(game);
        });

        // Cek tombol Load More
        if (limit >= gamesData.length) {
            loadMoreContainer.style.display = 'none'; // Sembunyikan tombol jika semua game sudah muncul
        }
    }

    // Jalankan Render Pertama Kali
    renderGames(itemsToShow);

    // Event Listener Tombol Load More
    loadMoreBtn.addEventListener('click', () => {
        itemsToShow = gamesData.length; // Ubah limit menjadi total semua game (25)
        renderGames(itemsToShow); // Render ulang
    });