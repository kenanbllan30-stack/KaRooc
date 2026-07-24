<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KaRooc Games - الألعاب وعجلة الحظ</title>
    <style>
        body { background-color: #12121c; color: #fff; font-family: Tahoma, sans-serif; margin: 0; padding: 0; }
        .header { background: linear-gradient(135deg, #4a148c, #7b1fa2); padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); position: sticky; top: 0; z-index: 10; }
        .balance-box, .id-box { font-size: 12px; font-weight: bold; background: rgba(0,0,0,0.3); padding: 6px 10px; border-radius: 20px; }
        .container { padding: 15px; max-width: 600px; margin: auto; }
        
        .wheel-section { background: #1e1e2f; border: 2px solid #ffab00; border-radius: 12px; padding: 15px; text-align: center; margin-bottom: 20px; }
        .wheel-container { position: relative; width: 220px; height: 220px; margin: 15px auto; border-radius: 50%; border: 6px solid #ffab00; background: conic-gradient(#ff5252 0deg 90deg, #ffab00 90deg 180deg, #00e676 180deg 270deg, #7c4dff 270deg 360deg); display: flex; align-items: center; justify-content: center; transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99); }
        .wheel-center { width: 60px; height: 60px; background: #12121c; border-radius: 50%; border: 3px solid #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 10px; text-align: center; }
        .spin-btn { background: #ffab00; color: #12121c; border: none; padding: 8px 20px; font-weight: bold; border-radius: 20px; cursor: pointer; font-size: 13px; }

        h3 { text-align: center; color: #ffab00; margin-bottom: 15px; }
        .games-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .game-card { background: #1e1e2f; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.4); text-align: center; padding-bottom: 12px; border: 1px solid #2a2a40; transition: transform 0.2s; }
        .game-card:hover { transform: translateY(-3px); }
        .game-card img { width: 100%; height: 110px; object-fit: cover; }
        .game-title { font-size: 13px; font-weight: bold; margin: 8px 0 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 5px; }
        .game-rtp { font-size: 11px; color: #00e676; margin-bottom: 8px; }
        .btn-group { display: flex; justify-content: center; gap: 6px; padding: 0 8px; }
        .btn { padding: 6px 10px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; }
        .btn-demo { background: #7c4dff; color: #fff; }
        .btn-play { background: #ffab00; color: #12121c; }
        
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 1000; flex-direction: column; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; background: #1a1a2e; }
        .close-btn { background: #ff5252; color: white; padding: 6px 14px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 12px; }
        .modal iframe { width: 100%; height: calc(100vh - 50px); border: none; }
    </style>
</head>
<body>

    <div class="header">
        <div class="balance-box">💰 الرصيد: <span id="userBalance">5000</span> ل.س</div>
        <div class="id-box">🎮 ID: <span id="userId">7956980808</span></div>
    </div>

    <div class="container">
        
        <!-- قسم عجلة الحظ بالخيارات الجديدة -->
        <div class="wheel-section" id="wheel">
            <h3 style="margin:0 0 5px;">🎡 عجلة الحظ الكبرى 🎡</h3>
            <p style="font-size: 11px; color: #aaa; margin: 0 0 10px;">اربح (25% استرداد، 1000 ل.س، 5000 ل.س، أو سحب بدون نسبة)!</p>
            <div class="wheel-container" id="spinWheel">
                <div class="wheel-center">KaRooc</div>
            </div>
            <button class="spin-btn" onclick="spinTheWheel()">أبرم العجلة الآن 🎰</button>
        </div>

        <h3>🎰 قسم الألعاب المميزة 🎰</h3>
        <div class="games-grid" id="gamesGrid"></div>
    </div>

    <div class="modal" id="gameModal">
        <div class="modal-header">
            <span id="activeGameTitle" style="font-weight:bold; font-size: 14px;">جاري اللعب...</span>
            <button class="close-btn" onclick="closeGame()">إغلاق ❌</button>
        </div>
        <iframe id="gameFrame" src=""></iframe>
    </div>

    <script>
        let realBalance = 5000;
        let currentRotation = 0;

        const gamesList = [
            { name: "Gates of Zeus", symbol: "vs20olympgate", rtp: "96.50%", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300" },
            { name: "King Lion", symbol: "vs20safarigold", rtp: "97.10%", img: "https://images.unsplash.com/photo-1534188753412-3e26d1d618d6?w=300" },
            { name: "Sweet Bonanza", symbol: "vs20fruitsw", rtp: "96.48%", img: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=300" },
            { name: "Sugar Rush", symbol: "vs20sugarrush", rtp: "96.52%", img: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=300" },
            { name: "Book of Dead", symbol: "vswaitz", rtp: "96.21%", img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300" },
            { name: "Wolf Gold", symbol: "vs25wolfgold", rtp: "96.01%", img: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=300" },
            { name: "The Dog House", symbol: "vs20doghouse", rtp: "96.51%", img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300" },
            { name: "Starburst", symbol: "starburst", rtp: "96.09%", img: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=300" },
            { name: "Gonzo's Quest", symbol: "gonzo", rtp: "95.97%", img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300" },
            { name: "Big Bass Bonanza", symbol: "vs10bbbonanza", rtp: "96.71%", img: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300" }
        ];

        function renderGames() {
            const grid = document.getElementById('gamesGrid');
            grid.innerHTML = "";
            gamesList.forEach((game) => {
                grid.innerHTML += `
                    <div class="game-card">
                        <img src="${game.img}" alt="${game.name}">
                        <div class="game-title">${game.name}</div>
                        <div class="game-rtp">RTP: ${game.rtp} 📊</div>
                        <div class="btn-group">
                            <button class="btn btn-demo" onclick="playGame('${game.name}', '${game.symbol}', true)">تجريبي</button>
                            <button class="btn btn-play" onclick="playGame('${game.name}', '${game.symbol}', false)">العب (حقيقي)</button>
                        </div>
                    </div>
                `;
            });
        }

        function updateUI() {
            document.getElementById('userBalance').innerText = realBalance;
        }

        function spinTheWheel() {
            const wheel = document.getElementById('spinWheel');
            const randomDegree = Math.floor(Math.random() * 3600) + 720;
            currentRotation += randomDegree;
            wheel.style.transform = `rotate(${currentRotation}deg)`;

            setTimeout(() => {
                const results = [
                    { type: 'bonus', amount: 1000, text: 'ربحت إضافة 1000 ل.س لرصيدك!' },
                    { type: 'bonus', amount: 5000, text: 'ربحت إضافة 5000 ل.س لرصيدك!' },
                    { type: 'percent', text: 'ربحت تفعيل ميزة استرداد 25% على شحنتك القادمة!' },
                    { type: 'withdraw', text: 'مبروك! ربحت ميزة سحب أرباح من دون أي نسبة اقتطاع!' }
                ];
                const won = results[Math.floor(Math.random() * results.length)];

                if (won.type === 'bonus') {
                    realBalance += won.amount;
                    updateUI();
                }

                alert(`🎉 مبروك يا بطل!\n✨ ${won.text}`);
            }, 4000);
        }

        function playGame(gameName, symbol, isDemo) {
            const modal = document.getElementById('gameModal');
            const frame = document.getElementById('gameFrame');
            
            if (isDemo) {
                document.getElementById('activeGameTitle').innerText = `🎮 ${gameName} [وضع التجربة]`;
            } else {
                if (realBalance < 100) {
                    alert('⚠️ رصيدك غير كافٍ! يرجى شحن حسابك عبر البوت.');
                    return;
                }
                realBalance -= 100;
                updateUI();
                document.getElementById('activeGameTitle').innerText = `🎮 ${gameName} [الرصيد الحقيقي]`;
            }

            frame.src = `https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=${symbol}&jurisdiction=99`;
            modal.style.display = "flex";
        }

        function closeGame() {
            document.getElementById('gameModal').style.display = "none";
            document.getElementById('gameFrame').src = "";
        }

        renderGames();
        updateUI();
    </script>
</body>
</html>
                 
