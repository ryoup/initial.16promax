document.getElementById("uploadForm").addEventListener("submit", function(e) {
    e.preventDefault(); // ページリロードを防止

    console.log("✅ script.js が正常に読み込まれました");

    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        alert("画像を選択してください！");
        return;
    }

    console.log(`📡 ${fileInput.files.length} 枚の画像を取得しました`);

    // データリスト（変換用）の取得
    fetch("https://ryoup.github.io/13xJKeuZFtK9269Zk8JZHT3V3y0tbz2EQkL6Hw9n9YC4zxp33QmkYN8zLtb2k2xSsA2DNQEvy0nW580arezuxdCme3hN1g03RXQT/data.csv?v=" + new Date().getTime())
        .then(response => response.text())
        .then(csvText => {
            console.log("📜 取得した CSV データ:", csvText);
            const conversionTable = parseCSV(csvText);
            console.log("🔍 変換リスト:", conversionTable);

            // 全画像を順番に処理
            processAllImages(fileInput.files, conversionTable);
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
        const [originalDiff, convertedValue] = row.split(",").map(Number);
        conversionTable[originalDiff] = convertedValue;
    });
    return conversionTable;
}

// 全画像を処理する関数
function processAllImages(files, conversionTable) {
    let resultsHTML = `<h2>解析結果</h2>`;
    let fileIndex = 0;

    function processNextImage() {
        if (fileIndex >= files.length) {
            document.getElementById("result").innerHTML = resultsHTML;
            return;
        }

        const file = files[fileIndex];
        console.log(`🖼️ 画像解析開始 (${fileIndex + 1}/${files.length}): ${file.name}`);

        processImage(file, conversionTable, (resultHTML) => {
            resultsHTML += `<h3>画像: ${file.name}</h3>${resultHTML}`;
            fileIndex++;
            processNextImage(); // 次の画像を処理
        });
    }

    processNextImage();
}

// 画像解析処理
function processImage(file, conversionTable, callback) {
    const reader = new FileReader();

    reader.onload = function() {
        const img = new Image();
        img.onload = function() {
            let newWidth = img.width;
            let newHeight = img.height;

            if (newWidth !== 1080) {
                const scaleFactor = 1080 / newWidth;
                newWidth = 1080;
                newHeight = Math.round(img.height * scaleFactor);
            }

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
            const data = imageData.data;

            const targetX = 435; // x=435 の最小Yのみを取得
            let minYForX435 = null;
            let rgbForX435 = null;

            // 条件: x=435 の最小Yを探す
            for (let y = 1300; y < newHeight; y++) {
                if (targetX >= newWidth) continue;

                const index = (y * newWidth + targetX) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];

                if (r >= 200 && g <= 100 && b <= 100) {
                    if (minYForX435 === null) {
                        minYForX435 = y;
                        rgbForX435 = { R: r, G: g, B: b };
                    }
                }
            }

            console.log("🔍 x=435 の最小Y:", minYForX435, "RGB:", rgbForX435);

            let resultHTML = "";
            if (minYForX435 !== null) {
                resultHTML = `<p>x=435 の最小Y: ${minYForX435}</p>`;
            } else {
                resultHTML = `<p>x=435 の最小Y: 条件を満たすピクセルなし</p>`;
            }

            console.log("📊 結果のHTML:", resultHTML);
            callback(resultHTML);
        };

        img.src = reader.result;
    };

    reader.readAsDataURL(file);
}
