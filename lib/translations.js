const translations = {
  id: {
    nav: {
      catalog: "Katalog Software",
      renew: "Perpanjang Lisensi",
      check: "Cek Lisensi",
      support: "Bantuan",
      cta: "Beli Lisensi",
      themeDark: "Ganti ke Tema Gelap",
      themeLight: "Ganti ke Tema Cerah"
    },
    hero: {
      title: "Beli Lisensi Software Digital Resmi & Bergaransi",
      subtitle: "Dapatkan akses resmi aplikasi bisnis, automasi, dan produktivitas digital dari Primadev Digital Technology dengan aktivasi instan otomatis 24/7.",
      btnBrowse: "Lihat Semua Software",
      btnRenew: "Perpanjang Lisensi Anda",
      stat1_val: "100%",
      stat1_label: "Lisensi Original & Resmi",
      stat2_val: "24/7",
      stat2_label: "Aktivasi Otomatis Instan",
      stat3_val: "Bergaransi",
      stat3_label: "Dukungan Teknis Penuh"
    },
    catalog: {
      title: "Katalog Produk & Software",
      subtitle: "Pilih software berkualitas tinggi untuk menunjang operasional dan skalabilitas bisnis Anda.",
      filterAll: "Semua",
      filterAndroid: "Android App",
      filterIos: "iOS",
      filterExtension: "Extension",
      iosNoticeTitle: "Layanan iOS Segera Hadir",
      iosNoticeDesc: "Kami akan segera membuka layanan pembuatan aplikasi untuk iOS. Ikuti terus perkembangan kami.",
      planMonthly: "Bulanan",
      planYearly: "Tahunan",
      planLifetime: "Lifetime",
      monthlyShort: "/bln",
      yearlyShort: "/thn",
      lifetimeShort: "sekali bayar",
      btnBuy: "Beli Lisensi",
      btnDetail: "Detail Aplikasi",
      noProducts: "Belum ada produk software pada kategori ini.",
      modalTitle: "Detail Aplikasi & Lisensi",
      modalClose: "Tutup",
      modalFeatures: "Fitur & Keunggulan Software",
      modalBuy: "Beli Lisensi Sekarang",
      modalConsult: "Konsultasi via WhatsApp"
    },
    features: {
      title: "Mengapa Memilih Primadev Store?",
      subtitle: "Keamanan transaksi dan kemudahan aktivasi adalah prioritas utama kami.",
      f1_title: "Aktivasi Otomatis Instan",
      f1_desc: "License key langsung ditampilkan di layar dan dikirim ke email Anda secara real-time setelah pembayaran terkonfirmasi.",
      f2_title: "Metode Pembayaran Lengkap",
      f2_desc: "Mendukung QRIS instan, Virtual Account semua bank nasional, E-Wallet, hingga outlet retail terdekat.",
      f3_title: "Legalitas Usaha Resmi",
      f3_desc: "Primadev Digital Technology adalah entitas bisnis berbadan hukum resmi dengan sertifikat SK AHU dari Kemenkumham RI.",
      f4_title: "Update & Garansi Software",
      f4_desc: "Mendapatkan update fitur berkala, perbaikan bug gratis, dan konsultasi teknis langsung dengan tim pengembang."
    },
    supportPage: {
      badge: "Pusat Bantuan & Kontak",
      title: "Ada yang Bisa Kami Bantu?",
      subtitle: "Tim teknis kami siap membantu pertanyaan seputar aktivasi lisensi, status pembayaran, atau kendala aplikasi.",
      formTitle: "Kirim Pesan Bantuan",
      nameLabel: "Nama Lengkap *",
      namePlaceholder: "CONTOH: BUDI SANTOSO",
      emailLabel: "Alamat Email *",
      emailPlaceholder: "nama@email.com",
      phoneLabel: "Nomor WhatsApp / HP *",
      phonePlaceholder: "812-3456-7890",
      phoneHint: "Nomor WhatsApp aktif untuk konfirmasi respon cepat.",
      licenseKeyLabel: "License Key (Jika ada)",
      licenseKeyPlaceholder: "PRIMA-XXXX-XXXX-XXXX",
      topicLabel: "Topik Kendala / Pertanyaan *",
      topicPlaceholder: "Pilih topik pertanyaan...",
      topicOptions: [
        { value: "aktivasi", label: "Kendala Aktivasi License Key", desc: "Gagal aktivasi di aplikasi atau key tidak valid" },
        { value: "pembayaran", label: "Konfirmasi & Status Pembayaran", desc: "Verifikasi transaksi QRIS, VA, atau e-wallet" },
        { value: "perpanjangan", label: "Pertanyaan Perpanjangan Lisensi", desc: "Akumulasi masa aktif atau upgrade paket software" },
        { value: "bug", label: "Laporan Kendala Teknis / Bug", desc: "Error sistem atau kendala fungsional pada aplikasi" },
        { value: "lainnya", label: "Pertanyaan & Bantuan Lainnya", desc: "Konsultasi produk dan pertanyaan umum lainnya" }
      ],
      messageLabel: "Jelaskan Kendala atau Pesan Anda *",
      messagePlaceholder: "Tuliskan detail kendala atau pertanyaan Anda secara rinci...",
      btnSubmit: "Kirim Pesan Bantuan",
      submitting: "Mengirimkan Pesan...",
      successTitle: "Pesan Bantuan Berhasil Terkirim!",
      successDesc: "Konfirmasi tiket telah dikirimkan ke email Anda. Tim teknis Primadev akan meninjau dan merespon dalam 1x24 jam kerja.",
      directWaTitle: "Butuh Respon Cepat?",
      directWaDesc: "Hubungi tim teknis kami langsung melalui WhatsApp resmi Primadev.",
      btnChatWa: "Chat WhatsApp"
    },
    country_modal: {
      title: "Pilih Kode Negara",
      subtitle: "Cari berdasarkan nama negara, kode ISO, atau kode telepon",
      search_placeholder: "Cari negara atau kode (+62, ID, Indonesia)...",
      select_country: "Pilih kode negara",
      country_trigger_title: (name, code) => `Pilih kode negara: ${name} (${code})`,
      results_count: (count) => `${count} negara tersedia`,
      empty: (query) => `Tidak ada negara yang cocok dengan "${query}"`,
      reset_btn: "Tampilkan Semua Negara",
      close: "Tutup"
    },
    countries: [
      {
            "code": "+62",
            "name": "Indonesia",
            "flag": "🇮🇩",
            "iso": "ID"
      },
      {
            "code": "+60",
            "name": "Malaysia",
            "flag": "🇲🇾",
            "iso": "MY"
      },
      {
            "code": "+65",
            "name": "Singapura",
            "flag": "🇸🇬",
            "iso": "SG"
      },
      {
            "code": "+673",
            "name": "Brunei Darussalam",
            "flag": "🇧🇳",
            "iso": "BN"
      },
      {
            "code": "+66",
            "name": "Thailand",
            "flag": "🇹🇭",
            "iso": "TH"
      },
      {
            "code": "+63",
            "name": "Filipina",
            "flag": "🇵🇭",
            "iso": "PH"
      },
      {
            "code": "+84",
            "name": "Vietnam",
            "flag": "🇻🇳",
            "iso": "VN"
      },
      {
            "code": "+61",
            "name": "Australia",
            "flag": "🇦🇺",
            "iso": "AU"
      },
      {
            "code": "+1",
            "name": "Amerika Serikat / Kanada",
            "flag": "🇺🇸",
            "iso": "US"
      },
      {
            "code": "+44",
            "name": "Inggris (UK)",
            "flag": "🇬🇧",
            "iso": "GB"
      },
      {
            "code": "+81",
            "name": "Jepang",
            "flag": "🇯🇵",
            "iso": "JP"
      },
      {
            "code": "+82",
            "name": "Korea Selatan",
            "flag": "🇰🇷",
            "iso": "KR"
      },
      {
            "code": "+966",
            "name": "Arab Saudi",
            "flag": "🇸🇦",
            "iso": "SA"
      },
      {
            "code": "+971",
            "name": "Uni Emirat Arab",
            "flag": "🇦🇪",
            "iso": "AE"
      },
      {
            "code": "+974",
            "name": "Qatar",
            "flag": "🇶🇦",
            "iso": "QA"
      },
      {
            "code": "+90",
            "name": "Turki",
            "flag": "🇹🇷",
            "iso": "TR"
      },
      {
            "code": "+49",
            "name": "Jerman",
            "flag": "🇩🇪",
            "iso": "DE"
      },
      {
            "code": "+33",
            "name": "Prancis",
            "flag": "🇫🇷",
            "iso": "FR"
      },
      {
            "code": "+31",
            "name": "Belanda",
            "flag": "🇳🇱",
            "iso": "NL"
      },
      {
            "code": "+41",
            "name": "Swiss",
            "flag": "🇨🇭",
            "iso": "CH"
      },
      {
            "code": "+39",
            "name": "Italia",
            "flag": "🇮🇹",
            "iso": "IT"
      },
      {
            "code": "+34",
            "name": "Spanyol",
            "flag": "🇪🇸",
            "iso": "ES"
      },
      {
            "code": "+91",
            "name": "India",
            "flag": "🇮🇳",
            "iso": "IN"
      },
      {
            "code": "+86",
            "name": "Tiongkok (China)",
            "flag": "🇨🇳",
            "iso": "CN"
      },
      {
            "code": "+852",
            "name": "Hong Kong",
            "flag": "🇭🇰",
            "iso": "HK"
      },
      {
            "code": "+886",
            "name": "Taiwan",
            "flag": "🇹🇼",
            "iso": "TW"
      },
      {
            "code": "+64",
            "name": "Selandia Baru",
            "flag": "🇳🇿",
            "iso": "NZ"
      },
      {
            "code": "+20",
            "name": "Mesir",
            "flag": "🇪🇬",
            "iso": "EG"
      },
      {
            "code": "+27",
            "name": "Afrika Selatan",
            "flag": "🇿🇦",
            "iso": "ZA"
      },
      {
            "code": "+55",
            "name": "Brasil",
            "flag": "🇧🇷",
            "iso": "BR"
      },
      {
            "code": "+52",
            "name": "Meksiko",
            "flag": "🇲🇽",
            "iso": "MX"
      },
      {
            "code": "+7",
            "name": "Rusia",
            "flag": "🇷🇺",
            "iso": "RU"
      }
],
    faq: {
      title: "Pertanyaan yang Sering Diajukan",
      subtitle: "Semua hal penting yang perlu Anda ketahui mengenai lisensi dan aplikasi Primadev.",
      q1: "Bagaimana cara mendapatkan License Key setelah pembayaran?",
      a1: "License Key akan langsung muncul di halaman sukses setelah transaksi terverifikasi dan otomatis dikirimkan ke alamat email Anda.",
      q2: "Apakah bisa memperpanjang lisensi sebelum masa aktif habis?",
      a2: "Bisa. Anda cukup membuka menu 'Perpanjang Lisensi', memasukkan License Key Anda saat ini, dan memilih durasi perpanjangan. Masa aktif akan otomatis terakumulasi.",
      q3: "Metode pembayaran apa saja yang didukung?",
      a3: "Kami mendukung QRIS (semua e-wallet dan m-banking), Virtual Account (BCA, BRI, BNI, Mandiri, Permata), GoPay, ShopeePay, DANA, OVO, dan Alfamart/Indomaret.",
      q4: "Apakah saya mendapatkan invoice resmi?",
      a4: "Ya, invoice digital berformat PDF dengan rincian transaksi lengkap dapat diunduh langsung di halaman pembayaran sukses dan juga dilampirkan dalam email."
    },
    footer: {
      tagline: "Toko resmi pembelian lisensi software digital dari PT Primadev Digital Technology. Solusi automasi dan aplikasi bisnis terpercaya.",
      services_heading: "Layanan",
      link_buy: "Beli Lisensi",
      link_renew: "Perpanjang Lisensi",
      link_check: "Cek Lisensi",
      quick_heading: "Tautan Cepat",
      info_heading: "INFORMASI PERUSAHAAN",
      info_desc: "Primadev Digital Technology adalah entitas bisnis berbadan hukum resmi berbentuk PT Perorangan yang telah terdaftar dan disahkan oleh Kementerian Hukum dan Hak Asasi Manusia Republik Indonesia (Kemenkumham RI).",
      info_legal_institution: "Kemenkumham RI",
      info_legal_sk_label: "Nomor SK AHU",
      info_legal_sk: "AHU-A104134.AH.01.30.Tahun 2026",
      info_legal_url: "https://elayanan.ahu.go.id/perseroan-perseorangan/sertifikat/Pendirian/PRIMADEV%20DIGITAL%20TECHNOLOGY",
      terms: "Syarat & Ketentuan",
      privacy: "Kebijakan Privasi",
      disclaimer: "Sanggahan / Disclaimer",
      copyright: (year) => `© ${year} Primadev Digital Technology. Hak Cipta Dilindungi.`
    }
  },
  en: {
    nav: {
      catalog: "Software Catalog",
      renew: "Renew License",
      check: "Check License",
      support: "Support",
      cta: "Buy License",
      themeDark: "Switch to Dark Mode",
      themeLight: "Switch to Light Mode"
    },
    hero: {
      title: "Buy Genuine Digital Software Licenses with Confidence",
      subtitle: "Get official access to business, automation, and digital productivity software by Primadev Digital Technology with 24/7 instant automatic activation.",
      btnBrowse: "Browse All Software",
      btnRenew: "Renew Your License",
      stat1_val: "100%",
      stat1_label: "Original & Official License",
      stat2_val: "24/7",
      stat2_label: "Instant Auto Activation",
      stat3_val: "Guaranteed",
      stat3_label: "Full Technical Support"
    },
    catalog: {
      title: "Software & Products Catalog",
      subtitle: "Select state-of-the-art software to boost your business and operational efficiency.",
      filterAll: "All",
      filterAndroid: "Android App",
      filterIos: "iOS",
      filterExtension: "Extension",
      iosNoticeTitle: "iOS Services Coming Soon",
      iosNoticeDesc: "We will soon launch application development services for iOS. Stay tuned for our updates.",
      planMonthly: "Monthly",
      planYearly: "Yearly",
      planLifetime: "Lifetime",
      monthlyShort: "/mo",
      yearlyShort: "/yr",
      lifetimeShort: "one-time",
      btnBuy: "Buy License",
      btnDetail: "View Details",
      noProducts: "No products found in this category.",
      modalTitle: "Application & License Details",
      modalClose: "Close",
      modalFeatures: "Features & Highlights",
      modalBuy: "Buy License Now",
      modalConsult: "Consult via WhatsApp"
    },
    features: {
      title: "Why Choose Primadev Store?",
      subtitle: "Secure transactions and seamless activation are our top priorities.",
      f1_title: "Instant Activation",
      f1_desc: "Your License Key is instantly displayed and delivered to your email as soon as payment is confirmed.",
      f2_title: "Comprehensive Payment Methods",
      f2_desc: "Supports Dynamic QRIS, Major Bank Virtual Accounts, E-Wallets, and convenience store retail outlets.",
      f3_title: "Official & Registered Entity",
      f3_desc: "Primadev Digital Technology is a registered software house holding an official AHU Legal Certification.",
      f4_title: "Continuous Updates & Warranty",
      f4_desc: "Receive regular performance patches, new features, and direct technical consultations."
    },
    supportPage: {
      badge: "Help Center & Customer Support",
      title: "How Can We Help You?",
      subtitle: "Our technical team is ready to assist with license activation, payment inquiries, or software guidance.",
      formTitle: "Send Support Request",
      nameLabel: "Full Name *",
      namePlaceholder: "E.G. BUDI SANTOSO",
      emailLabel: "Email Address *",
      emailPlaceholder: "name@email.com",
      phoneLabel: "WhatsApp / Phone Number *",
      phonePlaceholder: "812-3456-7890",
      phoneHint: "Active WhatsApp number for prompt assistance.",
      licenseKeyLabel: "License Key (If applicable)",
      licenseKeyPlaceholder: "PRIMA-XXXX-XXXX-XXXX",
      topicLabel: "Inquiry Topic *",
      topicPlaceholder: "Select inquiry topic...",
      topicOptions: [
        { value: "aktivasi", label: "License Key Activation Issue", desc: "Activation failures or invalid key error" },
        { value: "pembayaran", label: "Payment Verification & Status", desc: "Confirming QRIS, VA, or e-wallet payments" },
        { value: "perpanjangan", label: "License Renewal Questions", desc: "Duration accumulation or plan upgrades" },
        { value: "bug", label: "Technical Bug / Software Issue", desc: "System crashes or feature glitches" },
        { value: "lainnya", label: "General Questions & Inquiries", desc: "Product consultations and general questions" }
      ],
      messageLabel: "Describe Your Issue or Message *",
      messagePlaceholder: "Please describe your question or issue in detail...",
      btnSubmit: "Submit Support Request",
      submitting: "Submitting...",
      successTitle: "Support Request Sent Successfully!",
      successDesc: "A confirmation has been sent to your email. Our team will review and reply within 1 business day.",
      directWaTitle: "Need Instant Assistance?",
      directWaDesc: "Contact our technical support directly via official WhatsApp.",
      btnChatWa: "Chat via WhatsApp"
    },
    country_modal: {
      title: "Select Country Code",
      subtitle: "Search by country name, ISO code, or dial code",
      search_placeholder: "Search country or code (+1, US, United States)...",
      select_country: "Select country code",
      country_trigger_title: (name, code) => `Select country code: ${name} (${code})`,
      results_count: (count) => `${count} countries available`,
      empty: (query) => `No country matches "${query}"`,
      reset_btn: "Show All Countries",
      close: "Close"
    },
    countries: [
      {
            "code": "+62",
            "name": "Indonesia",
            "flag": "🇮🇩",
            "iso": "ID"
      },
      {
            "code": "+60",
            "name": "Malaysia",
            "flag": "🇲🇾",
            "iso": "MY"
      },
      {
            "code": "+65",
            "name": "Singapura",
            "flag": "🇸🇬",
            "iso": "SG"
      },
      {
            "code": "+673",
            "name": "Brunei Darussalam",
            "flag": "🇧🇳",
            "iso": "BN"
      },
      {
            "code": "+66",
            "name": "Thailand",
            "flag": "🇹🇭",
            "iso": "TH"
      },
      {
            "code": "+63",
            "name": "Filipina",
            "flag": "🇵🇭",
            "iso": "PH"
      },
      {
            "code": "+84",
            "name": "Vietnam",
            "flag": "🇻🇳",
            "iso": "VN"
      },
      {
            "code": "+61",
            "name": "Australia",
            "flag": "🇦🇺",
            "iso": "AU"
      },
      {
            "code": "+1",
            "name": "Amerika Serikat / Kanada",
            "flag": "🇺🇸",
            "iso": "US"
      },
      {
            "code": "+44",
            "name": "Inggris (UK)",
            "flag": "🇬🇧",
            "iso": "GB"
      },
      {
            "code": "+81",
            "name": "Jepang",
            "flag": "🇯🇵",
            "iso": "JP"
      },
      {
            "code": "+82",
            "name": "Korea Selatan",
            "flag": "🇰🇷",
            "iso": "KR"
      },
      {
            "code": "+966",
            "name": "Arab Saudi",
            "flag": "🇸🇦",
            "iso": "SA"
      },
      {
            "code": "+971",
            "name": "Uni Emirat Arab",
            "flag": "🇦🇪",
            "iso": "AE"
      },
      {
            "code": "+974",
            "name": "Qatar",
            "flag": "🇶🇦",
            "iso": "QA"
      },
      {
            "code": "+90",
            "name": "Turki",
            "flag": "🇹🇷",
            "iso": "TR"
      },
      {
            "code": "+49",
            "name": "Jerman",
            "flag": "🇩🇪",
            "iso": "DE"
      },
      {
            "code": "+33",
            "name": "Prancis",
            "flag": "🇫🇷",
            "iso": "FR"
      },
      {
            "code": "+31",
            "name": "Belanda",
            "flag": "🇳🇱",
            "iso": "NL"
      },
      {
            "code": "+41",
            "name": "Swiss",
            "flag": "🇨🇭",
            "iso": "CH"
      },
      {
            "code": "+39",
            "name": "Italia",
            "flag": "🇮🇹",
            "iso": "IT"
      },
      {
            "code": "+34",
            "name": "Spanyol",
            "flag": "🇪🇸",
            "iso": "ES"
      },
      {
            "code": "+91",
            "name": "India",
            "flag": "🇮🇳",
            "iso": "IN"
      },
      {
            "code": "+86",
            "name": "Tiongkok (China)",
            "flag": "🇨🇳",
            "iso": "CN"
      },
      {
            "code": "+852",
            "name": "Hong Kong",
            "flag": "🇭🇰",
            "iso": "HK"
      },
      {
            "code": "+886",
            "name": "Taiwan",
            "flag": "🇹🇼",
            "iso": "TW"
      },
      {
            "code": "+64",
            "name": "Selandia Baru",
            "flag": "🇳🇿",
            "iso": "NZ"
      },
      {
            "code": "+20",
            "name": "Mesir",
            "flag": "🇪🇬",
            "iso": "EG"
      },
      {
            "code": "+27",
            "name": "Afrika Selatan",
            "flag": "🇿🇦",
            "iso": "ZA"
      },
      {
            "code": "+55",
            "name": "Brasil",
            "flag": "🇧🇷",
            "iso": "BR"
      },
      {
            "code": "+52",
            "name": "Meksiko",
            "flag": "🇲🇽",
            "iso": "MX"
      },
      {
            "code": "+7",
            "name": "Rusia",
            "flag": "🇷🇺",
            "iso": "RU"
      }
],
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about software licensing and activation.",
      q1: "How do I receive my license key after payment?",
      a1: "The License Key is generated on screen immediately after payment confirmation and sent to your registered email.",
      q2: "Can I renew my license before it expires?",
      a2: "Yes. Simply visit the 'Renew License' page, enter your current License Key, and select your renewal period. The duration will accumulate automatically.",
      q3: "Which payment channels are supported?",
      a3: "We support QRIS (all e-wallets & mobile banking), Virtual Accounts (BCA, BRI, BNI, Mandiri, Permata), GoPay, ShopeePay, DANA, OVO, and retail chains.",
      q4: "Can I download an official PDF invoice?",
      a4: "Yes, official PDF invoices are readily downloadable from both the success page and the receipt email."
    },
    footer: {
      tagline: "Official software license store from PT Primadev Digital Technology. Reliable enterprise solutions and automation tools.",
      services_heading: "Services",
      link_buy: "Buy License",
      link_renew: "Renew License",
      link_check: "Check License",
      quick_heading: "Quick Links",
      info_heading: "Company Information",
      info_desc: "Primadev Digital Technology is a legally registered business entity as an Individual Corporation (PT Perorangan) certified and ratified by the Ministry of Law and Human Rights of the Republic of Indonesia (Kemenkumham RI).",
      info_legal_institution: "Kemenkumham RI",
      info_legal_sk_label: "AHU Decree Number",
      info_legal_sk: "AHU-A104134.AH.01.30.Tahun 2026",
      info_legal_url: "https://elayanan.ahu.go.id/perseroan-perseorangan/sertifikat/Pendirian/PRIMADEV%20DIGITAL%20TECHNOLOGY",
      terms: "Terms & Conditions",
      privacy: "Privacy Policy",
      disclaimer: "Disclaimer",
      copyright: (year) => `© ${year} Primadev Digital Technology. All rights reserved.`
    }
  }
};

export default translations;
