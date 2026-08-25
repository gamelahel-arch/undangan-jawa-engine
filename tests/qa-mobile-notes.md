# Catatan QA Mobile

Versi lokal memuat sampul batik kawung dan amplop pembuka secara utuh. Aktivasi kontrol amplop berhasil menandai tombol sebagai terbuka, memutar animasi amplop, melepas overlay, dan menampilkan hero undangan. Hero, timeline, coverflow galeri, kartu mempelai, lokasi, serta amplop digital memakai komposisi yang lebih jelas untuk layar kecil.

Validasi otomatis viewport 390×844 memeriksa pembukaan melalui input sentuh, status overlay, jumlah elemen reveal, status coverflow, dan galat konsol. Uji dijalankan ulang setelah favicon inline ditambahkan untuk menghapus 404 non-aplikasi.

Tangkapan pasca-tap pada 390×844 telah diperiksa ulang. Overlay kini menghilang segera setelah urutan amplop selesai dan hero tampil penuh tanpa menunggu jeda tambahan.

Validasi akhir 390×844 lulus pada mode normal dan reduced motion. Pada kedua mode, tap sentuh membuka amplop, overlay beralih ke hero, 31 elemen reveal tersedia, satu kartu coverflow aktif, dan konsol tidak mencatat galat.
