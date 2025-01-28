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
            // 画像解析処理
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            // ピクセルデータを取得
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;

            // x座標リスト
            const xCoords = [217, 434, 650, 866];
            const maxYForX = {};

            xCoords.forEach(x => {
                maxYForX[x] = -1; // 初期値
            });

            // 条件を満たすピクセルを探索
            for (let y = 0; y < img.height; y++) {
                for (let x of xCoords) {
                    const index = (y * img.width + x) * 4; // ピクセルインデックス
                    const r = data[index];     // 赤
                    const g = data[index + 1]; // 緑
                    const b = data[index + 2]; // 青

                    // 条件: R >= 200, G <= 100, B <= 100
                    if (r >= 200 && g <= 100 && b <= 100) {
                        maxYForX[x] = Math.max(maxYForX[x], y); // yの最大値を更新
                    }
                }
            }

            // 結果を表示
            const resultDiv = document.getElementById("result");
            resultDiv.innerHTML = `
                <p>217のときの最大Y: ${maxYForX[218]}</p>
                <p>434のときの最大Y: ${maxYForX[435]}</p>
                <p>650のときの最大Y: ${maxYForX[651]}</p>
                <p>866のときの最大Y: ${maxYForX[867]}</p>
            `;
        };

        img.src = reader.result;
    };

    reader.readAsDataURL(file);
});
