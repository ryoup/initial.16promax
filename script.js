document.getElementById("uploadForm").addEventListener("submit", function(e) {
    e.preventDefault(); // ページリロードを防止

    console.log("✅ script.js が正常に読み込まれました");

    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        alert("画像を選択してください！");
        return;
    }

    console.log("📡 データリストを取得開始");

    // データリスト（変換用）の取得
    fetch("https://ryoup.github.io/13xJKeuZFtK9269Zk8JZHT3V3y0tbz2EQkL6Hw9n9YC4zxp33QmkYN8zLtb2k2xSsA2DNQEvy0nW580arezuxdCme3hN1g03RXQT/data.csv?v=" + new Date().getTime())
        .then(response => response.text())
        .then(csvText => {
            console.log("📜 取得した CSV データ:", csvText);
            const conversionTable = parseCSV(csvText);
            console.log("🔍 変換リスト:", conversionTable);
            processImage(conversionTable); // 画像解析と変換処理を実行
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

// 画像解析処理（Canvas を使わずに RGB を取得）
function processImage(conversionTable) {
    console.log("🖼️ 画像処理開始: conversionTable =", conversionTable);

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;

        img.onload = function() {
            const newWidth = img.width;
            const newHeight = img.height;

            // 🔴 画像サイズチェック（1080x2400 以外ならエラー）
            if (newWidth !== 1080 || newHeight !== 2400) {
                alert(`❌ 画像サイズが正しくありません！ 1080x2400 の画像を使用してください。\n現在の画像サイズ: ${newWidth}x${newHeight}`);
                console.error(`❌ エラー: 画像サイズが ${newWidth}x${newHeight} です。 1080x2400 の画像を使用してください。`);
                return;
            }

            console.log("✅ 画像サイズOK:", newWidth, "x", newHeight);

            // Canvas を使わずに元画像の RGB を直接取得
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d", { willReadFrequently: true });

            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
            const data = imageData.data;

            const xCoords = [150, 250]; // x=150, 250 の両方で条件を満たすYを探す
            const xTargets = [218, 435, 650, 867]; // x=218, 435, 650, 867 の最小Yを探す

            let minCommonY = null;
            let minYForX = {};
            let rgbForX = {}; // 各 x 座標の RGB 値を保存

            xTargets.forEach(x => {
                minYForX[x] = null;
                rgbForX[x] = null;
            });

            // 条件1: x=150, 250 の両方で条件を満たす最小Y
            for (let y = 1650; y < newHeight; y++) {
                let meetsCondition = true;
                for (let x of xCoords) {
                    if (x >= newWidth) {
                        meetsCondition = false;
                        break;
                    }
                    const index = (y * newWidth + x) * 4;
                    const g = data[index + 1];
                    const b = data[index + 2];

                    if (!(g >= 200 && b <= 10)) {
                        meetsCondition = false;
                        break;
                    }
                }

                if (meetsCondition) {
                    minCommonY = y;
                    break;
                }
            }

            // 条件2: x=218, 435, 650, 867 の最小Yを探す
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
                            rgbForX[x] = { R: r, G: g, B: b }; // RGB 値を保存
                        }
                    }
                }
            }

            console.log("🔍 x=150,250 の最小Y:", minCommonY);
            console.log("🔍 各 x=218,435,650,867 の最小Y:", minYForX);
            console.log("🎨 各 x=218,435,650,867 の RGB:", rgbForX);

            let resultsHTML = `<p>画像サイズ: ${newWidth}x${newHeight}（OK）</p>`;
            resultsHTML += `<p>x=150, x=250 の両方で条件を満たす最小Y: ${minCommonY === null ? "条件を満たすピクセルなし" : minCommonY}</p>`;

            xTargets.forEach(x => {
                const yValue = minYForX[x] === null ? "条件を満たすピクセルなし" : minYForX[x];
                const rgbValue = rgbForX[x] ? `R:${rgbForX[x].R}, G:${rgbForX[x].G}, B:${rgbForX[x].B}` : "なし";
                console.log(`x=${x} の元のY値:`, yValue, "RGB:", rgbValue);

                resultsHTML += `<p>x=${x} の Y: ${yValue}</p>`;
                resultsHTML += `<p>x=${x} の RGB: ${rgbValue}</p>`;
            });

            console.log("📊 結果のHTML:", resultsHTML);
            document.getElementById("result").innerHTML = resultsHTML;
        };
    };

    reader.readAsDataURL(file);
}
