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
        .then(response => {
            console.log("✅ データリストのレスポンス:", response);
            return response.text();
        })
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
        const [originalY, convertedValue] = row.split(",").map(Number);
        conversionTable[originalY] = convertedValue;
    });
    return conversionTable;
}

// 画像解析処理
function processImage(conversionTable) {
    console.log("🖼️ 画像処理開始: conversionTable =", conversionTable);

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
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

            const xCoords = [150, 250];
            const xTargets = [218, 435, 650, 867];

            let minCommonY = null;
            let minYForX = {};

            xTargets.forEach(x => {
                minYForX[x] = null;
            });

            // 条件1の解析
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

            // 条件2の解析
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

            // デバッグ: minYForX の内容を表示
            console.log("🔍 各x座標の最小Y値:", minYForX);

            let resultsHTML = `<p>画像リサイズ後のサイズ: ${newWidth}x${newHeight}</p>`;
            resultsHTML += `<p>x=150, x=250 の両方で条件を満たす最小Y: ${minCommonY === null ? "条件を満たすピクセルなし" : minCommonY}</p>`;

            xTargets.forEach(x => {
                const yValue = minYForX[x] === null ? "条件を満たすピクセルなし" : minYForX[x];
                console.log(`x=${x} の元のY値:`, yValue);

                const convertedY = conversionTable[minYForX[x]] || "該当なし";
                console.log(`x=${x} の変換後のY値:`, convertedY);

                const diff = (minCommonY !== null && minYForX[x] !== null) ? (minCommonY - minYForX[x]) : "計算不可";
                resultsHTML += `<p>x=${x} の最小Y: ${yValue}（変換後: ${convertedY}）</p>`;
                resultsHTML += `<p>Yの引き算 (minCommonY - minYForX[${x}]): ${diff}</p>`;
            });

            console.log("📊 結果のHTML:", resultsHTML);
            document.getElementById("result").innerHTML = resultsHTML;
        };

        img.src = reader.result;
    };

    reader.readAsDataURL(file);
}
