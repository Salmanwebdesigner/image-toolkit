# 🖼️ Image Toolkit

A modern, browser-based image processing toolkit built with **Next.js 15**, **React 19**, and **TypeScript**.

All image processing happens **locally in your browser**. No files are uploaded to any server, ensuring complete privacy and fast performance.

## ✨ Features

- 📦 Image Compression
- 🌐 Convert to WebP
- 🖼️ Convert to PNG
- 📷 Convert to JPG
- ⚡ Convert to AVIF
- 📐 Resize Images
- ✂️ Crop Images
- 🔄 Rotate & Flip Images
- 📊 View Image Metadata
- 📁 Bulk Image Conversion
- 📦 ZIP Download Support
- 🔒 100% Browser-side Processing
- 🚫 No Backend Required
- 📱 Responsive UI
- ⚡ Fast & Lightweight

---

## 🚀 Live Demo

https://salmanwebdesigner.github.io/image-toolkit/

---

## 🛠️ Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- JSZip
- React Easy Crop
- Lucide Icons

---

## 📂 Project Structure

```text
app/
components/
lib/
public/
│── images/
│── workers/
styles/
next.config.js
package.json
```

---

## 📦 Installation

Clone the repository

```bash
git clone https://github.com/salmanwebdesigner/image-toolkit.git
```

Go into the project

```bash
cd image-toolkit
```

Install dependencies

```bash
npm install
```

Start development server

```bash
npm run dev
```

Open

```
http://localhost:3000
```

---

## 🏗️ Production Build

```bash
npm run build
```

---

## 🌍 GitHub Pages Deployment

This project uses **Next.js Static Export**.

```js
// next.config.js

module.exports = {
  output: "export",
  images: {
    unoptimized: true,
  },
};
```

---

## 🔐 Privacy

Unlike online image editors, Image Toolkit processes everything directly in your browser.

- No uploads
- No tracking
- No server processing
- No image storage

Your files never leave your device.

---

## 📸 Supported Formats

### Input

- JPG
- JPEG
- PNG
- WebP
- AVIF

### Output

- JPG
- PNG
- WebP
- AVIF

---

## 📋 Browser Support

- Chrome
- Edge
- Firefox
- Safari
- Brave

Latest versions recommended.

---

## 📄 License

MIT License

---

## 👨‍💻 Author

**Mohd Salman**

Senior Frontend Developer

GitHub: https://github.com/salmanwebdesigner

---

## ⭐ Support

If you find this project useful, consider giving it a ⭐ on GitHub.
