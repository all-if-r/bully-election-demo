# 🧠 Bully Election Algorithm Visualization

Interactive visualization of the **Bully Election Algorithm** built with **React + TailwindCSS + Framer Motion**.

## 🔗 Live Demo

Akses simulasi langsung di browser (tanpa install apa pun):
[https://all-if-r.github.io/bully-election-demo](https://all-if-r.github.io/bully-election-demo)

## 🚀 Cara pakai di halaman demo

1. **Auto-play**
   Menjalankan seluruh proses pemilihan otomatis dari awal sampai leader baru diumumkan.
2. **Previous step / Next step**
   Jalan mundur / maju satu langkah supaya bisa jelasin ke orang lain pelan-pelan.
3. **Fail current leader**
   Mematikan node dengan ID paling tinggi yang masih hidup (seolah node itu crash).
   Setelah itu jalankan election lagi dan lihat siapa jadi leader baru.
4. Klik node (N1, N2, …)
   Toggle statusnya `up/down` (hidup/mati).

## 🧠 Ringkasan Algoritma Bully

1. Node yang curiga leader mati akan mulai election. Misalnya Node 3.
2. Node 3 kirim pesan **ELECTION** ke semua node dengan ID lebih besar (4, 5, 6).
3. Node 4/5/6 balas **OK** = “aku hidup dan aku lebih kuat daripada kamu”.
4. Node dengan ID terbesar yang masih aktif (misal Node 6) broadcast **COORDINATOR** ke semua node lain dan jadi leader resmi.
5. Kalau leader itu mati (misal Node 6 dimatikan), nanti Node 5 yang bakal jadi leader, dan seterusnya.

## 🖥 Run locally (dev mode)

```bash
git clone https://github.com/all-if-r/bully-election-demo.git
cd bully-election-demo
npm install
npm start
```

## 🛠 Tech stack

* React (Create React App)
* TailwindCSS (utility-first styling)
* Framer Motion (arrow animation, smooth motion)
* GitHub Pages (deployment)
