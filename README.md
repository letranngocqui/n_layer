# n_layer — Hướng dẫn cài đặt & chạy

API CRUD sản phẩm bằng Node.js thuần (không Express), dữ liệu lưu trong file `database.json`.

## 1. Cần cài

- **Node.js 18+ (LTS)**: https://nodejs.org
- **npm** (cài kèm Node.js)
- **Không cần** MySQL / PostgreSQL / MongoDB.

Kiểm tra:

```bash
node -v
npm -v
```

## 2. Chuẩn bị file

Đặt các file sau vào **thư mục gốc project** (cùng cấp với `server.js`):

```text
n_layer/
├── server.js
├── .env              ← file được gửi kèm
├── database.json     ← file được gửi kèm
└── ...
```

> Nếu nhận cả thư mục database, chỉ cần lấy file `database.json` bên trong đặt ra thư mục gốc.
>
> Nếu không có `database.json`, server vẫn chạy và tự tạo file rỗng khi ghi dữ liệu lần đầu.

File `.env` cần có:

```env
JWT_SECRET_KEY=...
```

## 3. Cài thư viện

Mở terminal tại thư mục project:

```bash
npm install
```

Lệnh này cài 2 thư viện cần thiết:

- `dotenv`
- `jsonwebtoken`

## 4. Chạy server

```bash
npm start
```

Kết quả:

```text
Server listening on http://localhost:3000
```

Mở trình duyệt:

```text
http://localhost:3000/products
```

Lần đầu chưa có dữ liệu sẽ thấy:

```json
[]
```

## 5. Test nhanh

Các API **GET** không cần token:

```bash
curl http://localhost:3000/products
curl http://localhost:3000/products/1
```

Các API **POST / PUT / PATCH / DELETE** cần JWT. Tạo token:

```bash
node -e "require('dotenv').config(); console.log(require('jsonwebtoken').sign({sub:'tester'}, process.env.JWT_SECRET_KEY, {expiresIn:'1h'}))"
```

Gửi kèm header:

```http
Authorization: Bearer <TOKEN>
```

Ví dụ tạo sản phẩm:

```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Keyboard","price":49.99}'
```

> Windows CMD: dùng Git Bash/WSL/Postman, hoặc PowerShell `Invoke-RestMethod`.

## 6. API tóm tắt

| Method | Endpoint | Auth |
|---|---|---|
| GET | `/products` | Không |
| GET | `/products?limit=n` | Không |
| GET | `/products/:id` | Không |
| POST | `/products` | Bearer |
| PUT | `/products/:id` | Bearer |
| PATCH | `/products/:id` | Bearer |
| DELETE | `/products/:id` | Bearer |

Product hợp lệ:

```json
{ "name": "Keyboard", "price": 49.99 }
```

- `name`: string không rỗng
- `price`: number >= 0
- `id` do server tự tăng

## 7. Lỗi thường gặp

| Lỗi | Cách xử lý |
|---|---|
| `JWT_SECRET_KEY is not set in the .env file` | Kiểm tra `.env` đã nằm đúng thư mục gốc chưa |
| `EADDRINUSE: address already in use :::3000` | Cổng 3000 đang bận — tắt app đang dùng cổng, hoặc sửa `PORT` trong `server.js` |
| `Object.hasOwn is not a function` | Node.js quá cũ — cài Node 18+ |
| `database.json` bị lỗi JSON | Xoá `database.json`, server sẽ tạo lại file rỗng |
| Gọi từ browser bị CORS | Server chưa bật CORS — dùng curl/Postman để test |

## 8. Lưu ý

- Server chạy cố định cổng **3000** (khai báo trong `server.js`).
- `.env` và `database.json` không commit lên Git.
- Đây là project học tập; file JSON không phù hợp cho production.
