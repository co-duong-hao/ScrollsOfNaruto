# Scrolls of Naruto

Đấu thẻ bài chiến thuật 4 nguyên tố (**Phong · Thủy · Hỏa · Lôi**) hỗ trợ chơi **Offline** (Hotseat / Bot) và **Online Real-time** (Express + Socket.IO).

## Cấu trúc thư mục

```text
ScrollsOfNaruto/
├── docs/                   # Tài liệu luật chơi & dữ liệu gốc
│   ├── RULEBOOK.md         # Sổ tay Luật chơi & đặc tả hệ thống
│   └── naruto-cards.xlsx   # Bảng dữ liệu 96 thẻ bài
├── archive/                # Bản demo nguyên mẫu ban đầu
│   └── Naruto Card Game.html
├── shared/                 # Logic dùng chung cho Server (Online) & Client (Offline)
│   ├── cards.js            # Danh sách 96 thẻ, tộc, nguyên tố, mô tả
│   └── engine.js           # Engine luật chơi, pipeline sát thương, phản ứng, bot AI
├── server/                 # Backend Node.js (Express + Socket.IO)
│   └── index.js
├── public/                 # Giao diện Web (HTML, CSS, ES Modules)
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── main.js
│       ├── ui.js
│       ├── cardArt.js
│       └── sound.js
├── tests/                  # Unit tests
│   └── engine.test.js
├── package.json
└── render.yaml             # Cấu hình deploy Render
```

## Chạy cục bộ & Kiểm thử

```powershell
npm install
npm test      # Chạy unit tests
npm start     # Mở server tại http://localhost:3000
```

## Chơi Online cùng bạn bè

- **Nhanh nhất (Cloudflare Tunnel):** Chạy `cloudflared tunnel --url http://localhost:3000` và gửi link HTTPS cho bạn bè.
- **Deploy 24/7:** Đẩy lên GitHub rồi deploy bằng Render (`render.yaml`) hoặc Railway.
