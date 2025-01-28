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
        // 簡単な画像解析（画像の幅と高さを表示）
        const img = new Image();
        img.onload = function() {
            document.getElementById("result").innerText = 
                `画像の幅: ${img.width}px, 高さ: ${img.height}px`;
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
});
