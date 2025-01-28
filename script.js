document.getElementById("uploadForm").addEventListener("submit", function(e) {
    e.preventDefault(); // ページリロードを防止

    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) {
        alert("画像を選択してください！");
        return;
    }

    const file = fileInput.files[0];
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

            const xCoords = [217, 434, 650, 866];
            const minYForX = {};

            // 各 x 座標に対して初期値を設定（最小値を探すので初期値は画像高さより大きい値）
            xCoords.forEach(x => {
                minYForX[x] = null; // 初期値は null（条件を満たすピクセルがないことを判定するため）
            });

            // 条件を満たすピクセルを探索
            for (let y = 0; y < img.height; y++) {
                for (let x of xCoords) {
                    if (x >= img.width) continue; // x座標が画像幅を超える場合スキップ
                    const index = (y * img.width + x) * 4;
                    const r = data[index];     // 赤
                    const g = data[index + 1]; // 緑
                    const b = data[index + 2]; // 青

                    // 条件: R >= 250, G <= 100, B <= 100
                    if (r >= 200 && g <= 100 && b <= 100) {
                        if (minYForX[x] === null) {
                            minYForX[x] = y; // 初回値
                        } else {
                            minYForX[x] = Math.min(minYForX[x], y); // 最小値を更新
                        }
                    }
                }
            }

            // 結果を表示
            const resultDiv = document.getElementById("result");
            resultDiv.innerHTML = `
                <p>217のときの最小Y: ${minYForX[217] === null ? "条件を満たすピクセルなし" : minYForX[217]}</p>
                <p>434のときの最小Y: ${minYForX[434] === null ? "条件を満たすピクセルなし" : minYForX[434]}</p>
                <p>650のときの最小Y: ${minYForX[650] === null ? "条件を満たすピクセルなし" : minYForX[650]}</p>
                <p>866のときの最小Y: ${minYForX[866] === null ? "条件を満たすピクセルなし" : minYForX[866]}</p>
            `;
        };

        img.src = reader.result;
    };

    reader.readAsDataURL(file);
});
