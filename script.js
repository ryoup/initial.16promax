document.getElementById("uploadForm").addEventListener("submit", function(e) {
    e.preventDefault(); // ページリロードを防止

    console.log("✅ script.js が正常に読み込まれました");

    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        alert("画像を選択してください！");
        return;
    }

    console.log(`📡 画像を取得しました: ${fileInput.files[0].name}`);

    // データリスト（変換用）の取得
    fetch("https://ryoup.github.io/13xJKeuZFtK9269Zk8JZHT3V3y0tbz2EQkL6Hw9n9YC4zxp33QmkYN8zLtb2k2xSsA2DNQEvy0nW580arezuxdCme3hN1g03RXQT/data.csv?v=" + new Date().getTime())
        .then(response => response.text())
        .then(csvText => {
            console.log("📜 取得した CSV データ:", csvText);
            const conversionTable = parseCSV(csvText);
            console.log("🔍 変換リスト:", conversionTable);

            // 画像を解析
            processImage(fileInput.files[0], conversionTable);
        })
        .catch(error => {
            console.error("❌ データリストの読み込みエラー:", error);
            alert("データリストの読み込みに失敗しました");
        });
});

// CSVをパースしてオブジェクトに変換
function parseCSV(csvText) {
    const rows = csvText.trim().split("\n");
    let conversionTable = {};
    rows.forEach(row => {
        const [originalY, convertedValue] = row.split(",").map(Number);
        conversionTable[originalY] = convertedValue;
    });
    return conversionTable;
}

// 画像解析処理
function processImage(file, conversionTable) {
    const reader = new FileReader();

    reader.onload = function() {
        const img = new Image();
        img.onload = function() {
            let newWidth = img.width;
            let newHeight = img.height;

            console.log(`📏 画像サイズ: ${newWidth}×${newHeight}`);

            // 画像サイズが 1080x2400 でなければ警告を表示
            if (newWidth !== 1080 || newHeight !== 2400) {
                document.getElementById("result").innerHTML = `<p style="color: red;">⚠ 画像サイズが合っていません。</p>`;
                return;
            }

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
            const data = imageData.data;

            const xTargets = [218, 435, 650, 867]; // 検出するX座標
            let minYForX = {};
            let convertedValues = {};

            xTargets.forEach(x => {
                minYForX[x] = null;
                convertedValues[x] = "該当なし";
            });

            // 各X座標の最小Yを探索
            for (let y = 1300; y < newHeight; y++) {
                for (let x of xTargets) {
                    if (x >= newWidth) continue;

                    const index = (y * newWidth + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];

                    if (r >= 200 && g <= 100 && b <= 100) {
                        if (minYForX[x] === null) {
                            minYForX[x] = y;
                        }
                    }
                }
            }

            console.log("🔍 各 x=218,435,650,867 の最小Y:", minYForX);

            // データリストで変換
            xTargets.forEach(x => {
                if (minYForX[x] !== null) {
                    convertedValues[x] = conversionTable[minYForX[x]] || "該当なし";
                }
            });

            console.log("🔍 変換後の値:", convertedValues);

            // x=150, y=1751 の RGB 値を取得
            let rgb150_1751 = "取得不可";
            if (150 < newWidth && 1751 < newHeight) {
                const index = (1751 * newWidth + 150) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                rgb150_1751 = `R:${r}, G:${g}, B:${b}`;
            }

            console.log("🎨 x=150, y=1751 のRGB:", rgb150_1751);

            let resultsHTML = `<h2>解析結果</h2>`;
            xTargets.forEach(x => {
                resultsHTML += `<p>x=${x} の最小Y: ${minYForX[x] === null ? "条件を満たすピクセルなし" : minYForX[x]}（変換後: ${convertedValues[x]}）</p>`;
            });

            resultsHTML += `<p>x=150, y=1751 の RGB: ${rgb150_1751}</p>`;

            console.log("📊 結果のHTML:", resultsHTML);
            document.getElementById("result").innerHTML = resultsHTML;
        };

        img.src = reader.result;
    };

    reader.readAsDataURL(file);
}
