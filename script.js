document.getElementById("uploadForm").addEventListener("submit", function(e) {
    e.preventDefault(); // ページリロードを防止

    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        document.getElementById("result").innerHTML = `<p style="color: red;">画像を選択してください。</p>`;
        return;
    }

    // データリスト（変換用）の取得
    fetch("https://ryoup.github.io/13xJKeuZFtK9269Zk8JZHT3V3y0tbz2EQkL6Hw9n9YC4zxp33QmkYN8zLtb2k2xSsA2DNQEvy0nW580arezuxdCme3hN1g03RXQT/data.csv?v=" + new Date().getTime())
        .then(response => response.text())
        .then(csvText => {
            const conversionTable = parseCSV(csvText);
            validateImage(fileInput.files[0], conversionTable);
        })
        .catch(error => {
            document.getElementById("result").innerHTML = `<p style="color: red;">データリストの読み込みに失敗しました。</p>`;
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

// 画像の事前チェック
function validateImage(file, conversionTable) {
    const reader = new FileReader();

    reader.onload = function() {
        const img = new Image();
        img.onload = function() {
            // 画像サイズチェック
            if (img.width !== 1080 || img.height !== 2400) {
                document.getElementById("result").innerHTML = `<p style="color: red;">画像サイズが合っていません。</p>`;
                return;
            }

            // キャンバスに画像を描画
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;

            // x=150, y=1751 の RGB 値を取得
            const checkX = 150;
            const checkY = 1751;
            const index = (checkY * img.width + checkX) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];

            // RGB 値チェック
            if (r !== 67 || g !== 219 || b !== 0) {
                document.getElementById("result").innerHTML = `<p style="color: red;">設定を確認してください。</p>`;
                return;
            }

            // すべての条件をクリア → 解析実行
            processImage(file, conversionTable);
        };

        img.src = reader.result;
    };

    reader.readAsDataURL(file);
}

// 画像解析処理
function processImage(file, conversionTable) {
    const reader = new FileReader();

    reader.onload = function() {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;

            const xTargets = [218, 435, 650, 867]; // 検出するX座標
            let minYForX = {};
            let convertedValues = {};

            xTargets.forEach(x => {
                minYForX[x] = null;
                convertedValues[x] = "該当なし";
            });

            // 各X座標の最小Yを探索
            for (let y = 1300; y < img.height; y++) {
                for (let x of xTargets) {
                    if (x >= img.width) continue;

                    const index = (y * img.width + x) * 4;
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

            // データリストで変換
            xTargets.forEach(x => {
                if (minYForX[x] !== null) {
                    convertedValues[x] = conversionTable[minYForX[x]] || "該当なし";
                }
            });

            // 出力は "1P: 数値", "2P: 数値", "3P: 数値", "4P: 数値"
            let resultsHTML = `<h2>解析結果</h2>`;
            resultsHTML += `<p>1P : ${convertedValues[218]}</p>`;
            resultsHTML += `<p>2P : ${convertedValues[435]}</p>`;
            resultsHTML += `<p>3P : ${convertedValues[650]}</p>`;
            resultsHTML += `<p>4P : ${convertedValues[867]}</p>`;

            document.getElementById("result").innerHTML = resultsHTML;
        };

        img.src = reader.result;
    };

    reader.readAsDataURL(file);
}
