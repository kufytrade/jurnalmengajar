import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, Users, Clock, FileText, Plus, Edit2, Trash2, Save, X, Search, Download, Filter, Sparkles, School, User, BarChart3, FileSpreadsheet, Database, GraduationCap, BookOpenCheck, ClipboardList } from 'lucide-react';

export default function JurnalMengajarGuru() {
  const [jurnalList, setJurnalList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterKelas, setFilterKelas] = useState('');
  const [filterMapel, setFilterMapel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [aiLoading, setAiLoading] = useState(false);
  const [aiField, setAiField] = useState(null);
  const [showKehadiranDetail, setShowKehadiranDetail] = useState(false);
  const [siswaList, setSiswaList] = useState({
    sakit: [],
    izin: [],
    alpa: []
  });
  const [siswaTempData, setSiswaTempData] = useState({
    nama: '',
    alasan: '',
    kategori: 'sakit'
  });
  const [showIdentitasForm, setShowIdentitasForm] = useState(false);
  const [showRekapKehadiran, setShowRekapKehadiran] = useState(false);
  const [rekapPeriode, setRekapPeriode] = useState('bulan');
  const [rekapFilter, setRekapFilter] = useState({
    minggu: new Date().toISOString().split('T')[0],
    bulan: new Date().toISOString().slice(0, 7),
    semester: '1',
    tahunAjaran: new Date().getFullYear()
  });
  const [showDataMaster, setShowDataMaster] = useState(false);
  const [masterTab, setMasterTab] = useState('kelas');
  const [dataKelas, setDataKelas] = useState([]);
  const [dataSiswa, setDataSiswa] = useState([]);
  const [dataMapel, setDataMapel] = useState([]);
  const [dataJadwal, setDataJadwal] = useState([]);
  const [showFormMaster, setShowFormMaster] = useState(false);
  const [editingMasterId, setEditingMasterId] = useState(null);
  const [formMaster, setFormMaster] = useState({
    // Kelas
    namaKelas: '',
    tingkat: '',
    jurusan: '',
    waliKelas: '',
    // Siswa
    nis: '',
    namaSiswa: '',
    kelasId: '',
    jenisKelamin: '',
    tempatLahir: '',
    tanggalLahir: '',
    // Mapel
    kodeMapel: '',
    namaMapel: '',
    kelompok: '',
    // Jadwal
    hari: '',
    jamMulaiJadwal: '',
    jamSelesaiJadwal: '',
    kelasIdJadwal: '',
    mapelIdJadwal: '',
    ruangan: ''
  });
  const [identitasData, setIdentitasData] = useState({
    namaSekolah: '',
    npsn: '',
    alamatSekolah: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    namaGuru: '',
    nip: '',
    email: '',
    noTelepon: '',
    mapelDiampu: ''
  });

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    kelas: '',
    mapel: '',
    fase: '',
    elemen: '',
    capaianPembelajaran: '',
    tujuanPembelajaran: '',
    kegiatanPembelajaran: '',
    materiPokok: '',
    metode: [],
    mediaPembelajaran: '',
    asesmen: '',
    jamMulai: '',
    jamSelesai: '',
    jumlahSiswa: '',
    siswaHadir: '',
    siswaIzin: '',
    siswaAlfa: '',
    siswaSakit: '',
    detailKehadiran: {
      sakit: [],
      izin: [],
      alpa: []
    },
    catatan: '',
    refleksi: '',
    tindakLanjut: ''
  });

  const kelasList = ['VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const faseList = ['A', 'B', 'C', 'D', 'E', 'F'];
  const metodeList = [
    'Ceramah',
    'Diskusi',
    'Project Based Learning',
    'Problem Based Learning',
    'Discovery Learning',
    'Inquiry Learning',
    'Cooperative Learning',
    'Blended Learning',
    'Praktikum',
    'Demonstrasi'
  ];
  const asesmenList = ['Formatif', 'Sumatif', 'Diagnostik'];

  useEffect(() => {
    loadData();
    loadIdentitas();
    loadDataMaster();
  }, []);

  useEffect(() => {
    if (formData.detailKehadiran) {
      setSiswaList(formData.detailKehadiran);
    }
  }, [formData.detailKehadiran]);

  const loadIdentitas = async () => {
    try {
      const result = await window.storage.get('identitas-guru');
      if (result) {
        setIdentitasData(JSON.parse(result.value));
      }
    } catch (error) {
      console.log('Belum ada identitas tersimpan');
    }
  };

  const saveIdentitas = async () => {
    try {
      await window.storage.set('identitas-guru', JSON.stringify(identitasData));
      setShowIdentitasForm(false);
      alert('Identitas berhasil disimpan!');
    } catch (error) {
      alert('Gagal menyimpan identitas: ' + error.message);
    }
  };

  const loadDataMaster = async () => {
    try {
      const [kelasRes, siswaRes, mapelRes, jadwalRes] = await Promise.all([
        window.storage.get('master-kelas'),
        window.storage.get('master-siswa'),
        window.storage.get('master-mapel'),
        window.storage.get('master-jadwal')
      ]);
      
      if (kelasRes) setDataKelas(JSON.parse(kelasRes.value));
      if (siswaRes) setDataSiswa(JSON.parse(siswaRes.value));
      if (mapelRes) setDataMapel(JSON.parse(mapelRes.value));
      if (jadwalRes) setDataJadwal(JSON.parse(jadwalRes.value));
    } catch (error) {
      console.log('Memulai dengan data master kosong');
    }
  };

  const saveMasterData = async (type, data) => {
    try {
      await window.storage.set(`master-${type}`, JSON.stringify(data));
    } catch (error) {
      alert(`Gagal menyimpan data ${type}: ` + error.message);
    }
  };

  const handleAddMaster = () => {
    if (masterTab === 'kelas') {
      if (!formMaster.namaKelas || !formMaster.tingkat) {
        alert('Nama kelas dan tingkat harus diisi!');
        return;
      }
      const newData = {
        id: editingMasterId || `kelas-${Date.now()}`,
        namaKelas: formMaster.namaKelas,
        tingkat: formMaster.tingkat,
        jurusan: formMaster.jurusan,
        waliKelas: formMaster.waliKelas
      };
      
      let updatedData;
      if (editingMasterId) {
        updatedData = dataKelas.map(k => k.id === editingMasterId ? newData : k);
      } else {
        updatedData = [...dataKelas, newData];
      }
      setDataKelas(updatedData);
      saveMasterData('kelas', updatedData);
      
    } else if (masterTab === 'siswa') {
      if (!formMaster.namaSiswa || !formMaster.kelasId) {
        alert('Nama siswa dan kelas harus diisi!');
        return;
      }
      const newData = {
        id: editingMasterId || `siswa-${Date.now()}`,
        nis: formMaster.nis,
        namaSiswa: formMaster.namaSiswa,
        kelasId: formMaster.kelasId,
        jenisKelamin: formMaster.jenisKelamin,
        tempatLahir: formMaster.tempatLahir,
        tanggalLahir: formMaster.tanggalLahir
      };
      
      let updatedData;
      if (editingMasterId) {
        updatedData = dataSiswa.map(s => s.id === editingMasterId ? newData : s);
      } else {
        updatedData = [...dataSiswa, newData];
      }
      setDataSiswa(updatedData);
      saveMasterData('siswa', updatedData);
      
    } else if (masterTab === 'mapel') {
      if (!formMaster.namaMapel) {
        alert('Nama mata pelajaran harus diisi!');
        return;
      }
      const newData = {
        id: editingMasterId || `mapel-${Date.now()}`,
        kodeMapel: formMaster.kodeMapel,
        namaMapel: formMaster.namaMapel,
        kelompok: formMaster.kelompok
      };
      
      let updatedData;
      if (editingMasterId) {
        updatedData = dataMapel.map(m => m.id === editingMasterId ? newData : m);
      } else {
        updatedData = [...dataMapel, newData];
      }
      setDataMapel(updatedData);
      saveMasterData('mapel', updatedData);
      
    } else if (masterTab === 'jadwal') {
      if (!formMaster.hari || !formMaster.kelasIdJadwal || !formMaster.mapelIdJadwal) {
        alert('Hari, kelas, dan mata pelajaran harus diisi!');
        return;
      }
      const newData = {
        id: editingMasterId || `jadwal-${Date.now()}`,
        hari: formMaster.hari,
        jamMulaiJadwal: formMaster.jamMulaiJadwal,
        jamSelesaiJadwal: formMaster.jamSelesaiJadwal,
        kelasId: formMaster.kelasIdJadwal,
        mapelId: formMaster.mapelIdJadwal,
        ruangan: formMaster.ruangan
      };
      
      let updatedData;
      if (editingMasterId) {
        updatedData = dataJadwal.map(j => j.id === editingMasterId ? newData : j);
      } else {
        updatedData = [...dataJadwal, newData];
      }
      setDataJadwal(updatedData);
      saveMasterData('jadwal', updatedData);
    }
    
    resetFormMaster();
    alert(editingMasterId ? 'Data berhasil diupdate!' : 'Data berhasil ditambahkan!');
  };

  const handleEditMaster = (item) => {
    setEditingMasterId(item.id);
    
    if (masterTab === 'kelas') {
      setFormMaster({
        ...formMaster,
        namaKelas: item.namaKelas,
        tingkat: item.tingkat,
        jurusan: item.jurusan,
        waliKelas: item.waliKelas
      });
    } else if (masterTab === 'siswa') {
      setFormMaster({
        ...formMaster,
        nis: item.nis,
        namaSiswa: item.namaSiswa,
        kelasId: item.kelasId,
        jenisKelamin: item.jenisKelamin,
        tempatLahir: item.tempatLahir,
        tanggalLahir: item.tanggalLahir
      });
    } else if (masterTab === 'mapel') {
      setFormMaster({
        ...formMaster,
        kodeMapel: item.kodeMapel,
        namaMapel: item.namaMapel,
        kelompok: item.kelompok
      });
    } else if (masterTab === 'jadwal') {
      setFormMaster({
        ...formMaster,
        hari: item.hari,
        jamMulaiJadwal: item.jamMulaiJadwal,
        jamSelesaiJadwal: item.jamSelesaiJadwal,
        kelasIdJadwal: item.kelasId,
        mapelIdJadwal: item.mapelId,
        ruangan: item.ruangan
      });
    }
    
    setShowFormMaster(true);
  };

  const handleDeleteMaster = async (id) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;
    
    if (masterTab === 'kelas') {
      const updated = dataKelas.filter(k => k.id !== id);
      setDataKelas(updated);
      saveMasterData('kelas', updated);
    } else if (masterTab === 'siswa') {
      const updated = dataSiswa.filter(s => s.id !== id);
      setDataSiswa(updated);
      saveMasterData('siswa', updated);
    } else if (masterTab === 'mapel') {
      const updated = dataMapel.filter(m => m.id !== id);
      setDataMapel(updated);
      saveMasterData('mapel', updated);
    } else if (masterTab === 'jadwal') {
      const updated = dataJadwal.filter(j => j.id !== id);
      setDataJadwal(updated);
      saveMasterData('jadwal', updated);
    }
    
    alert('Data berhasil dihapus!');
  };

  const resetFormMaster = () => {
    setFormMaster({
      namaKelas: '',
      tingkat: '',
      jurusan: '',
      waliKelas: '',
      nis: '',
      namaSiswa: '',
      kelasId: '',
      jenisKelamin: '',
      tempatLahir: '',
      tanggalLahir: '',
      kodeMapel: '',
      namaMapel: '',
      kelompok: '',
      hari: '',
      jamMulaiJadwal: '',
      jamSelesaiJadwal: '',
      kelasIdJadwal: '',
      mapelIdJadwal: '',
      ruangan: ''
    });
    setEditingMasterId(null);
    setShowFormMaster(false);
  };

  const getKelasName = (kelasId) => {
    const kelas = dataKelas.find(k => k.id === kelasId);
    return kelas ? kelas.namaKelas : '-';
  };

  const getMapelName = (mapelId) => {
    const mapel = dataMapel.find(m => m.id === mapelId);
    return mapel ? mapel.namaMapel : '-';
  };

  const loadData = async () => {
    try {
      const result = await window.storage.list('jurnal:');
      if (result && result.keys) {
        const jurnalData = await Promise.all(
          result.keys.map(async (key) => {
            const data = await window.storage.get(key);
            return data ? { id: key, ...JSON.parse(data.value) } : null;
          })
        );
        setJurnalList(jurnalData.filter(Boolean).sort((a, b) => 
          new Date(b.tanggal) - new Date(a.tanggal)
        ));
      }
    } catch (error) {
      console.log('Memulai dengan data kosong');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMetodeChange = (metode) => {
    setFormData(prev => ({
      ...prev,
      metode: prev.metode.includes(metode)
        ? prev.metode.filter(m => m !== metode)
        : [...prev.metode, metode]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = editingId || `jurnal:${Date.now()}`;
    const dataToSave = editingId ? formData : { ...formData, createdAt: new Date().toISOString() };
    
    try {
      await window.storage.set(id, JSON.stringify(dataToSave));
      await loadData();
      resetForm();
      alert(editingId ? 'Jurnal berhasil diperbarui!' : 'Jurnal berhasil disimpan!');
    } catch (error) {
      alert('Gagal menyimpan jurnal: ' + error.message);
    }
  };

  const handleEdit = (jurnal) => {
    setFormData(jurnal);
    setSiswaList(jurnal.detailKehadiran || { sakit: [], izin: [], alpa: [] });
    setEditingId(jurnal.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus jurnal ini?')) {
      try {
        await window.storage.delete(id);
        await loadData();
        alert('Jurnal berhasil dihapus!');
      } catch (error) {
        alert('Gagal menghapus jurnal: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      kelas: '',
      mapel: '',
      fase: '',
      elemen: '',
      capaianPembelajaran: '',
      tujuanPembelajaran: '',
      kegiatanPembelajaran: '',
      materiPokok: '',
      metode: [],
      mediaPembelajaran: '',
      asesmen: '',
      jamMulai: '',
      jamSelesai: '',
      jumlahSiswa: '',
      siswaHadir: '',
      siswaIzin: '',
      siswaAlfa: '',
      siswaSakit: '',
      detailKehadiran: {
        sakit: [],
        izin: [],
        alpa: []
      },
      catatan: '',
      refleksi: '',
      tindakLanjut: ''
    });
    setSiswaList({ sakit: [], izin: [], alpa: [] });
    setEditingId(null);
    setShowForm(false);
    setShowKehadiranDetail(false);
  };

  const addSiswaDetail = () => {
    if (!siswaTempData.nama.trim()) {
      alert('Nama siswa harus diisi!');
      return;
    }

    const kategori = siswaTempData.kategori;
    const newSiswa = {
      id: Date.now(),
      nama: siswaTempData.nama,
      alasan: siswaTempData.alasan
    };

    const updatedList = {
      ...siswaList,
      [kategori]: [...siswaList[kategori], newSiswa]
    };

    setSiswaList(updatedList);
    setFormData(prev => ({
      ...prev,
      detailKehadiran: updatedList,
      siswaSakit: String(updatedList.sakit.length),
      siswaIzin: String(updatedList.izin.length),
      siswaAlfa: String(updatedList.alpa.length)
    }));

    setSiswaTempData({
      nama: '',
      alasan: '',
      kategori: 'sakit'
    });
  };

  const deleteSiswaDetail = (kategori, id) => {
    const updatedList = {
      ...siswaList,
      [kategori]: siswaList[kategori].filter(s => s.id !== id)
    };

    setSiswaList(updatedList);
    setFormData(prev => ({
      ...prev,
      detailKehadiran: updatedList,
      siswaSakit: String(updatedList.sakit.length),
      siswaIzin: String(updatedList.izin.length),
      siswaAlfa: String(updatedList.alpa.length)
    }));
  };

  const generateAIContent = async (fieldType) => {
    setAiLoading(true);
    setAiField(fieldType);

    try {
      let prompt = '';
      const context = `Mata Pelajaran: ${formData.mapel || 'belum diisi'}
Kelas: ${formData.kelas || 'belum diisi'}
Fase: ${formData.fase || 'belum diisi'}
Materi Pokok: ${formData.materiPokok || 'belum diisi'}
Tujuan Pembelajaran: ${formData.tujuanPembelajaran || 'belum diisi'}
Kegiatan Pembelajaran: ${formData.kegiatanPembelajaran || 'belum diisi'}
Metode: ${formData.metode.join(', ') || 'belum diisi'}
Jumlah Siswa: ${formData.jumlahSiswa || 'belum diisi'}
Siswa Hadir: ${formData.siswaHadir || 'belum diisi'}`;

      if (fieldType === 'catatan') {
        prompt = `Berdasarkan data pembelajaran berikut:
${context}

Buatkan catatan khusus yang profesional dan relevan tentang pembelajaran hari ini. Fokus pada hal-hal penting yang perlu dicatat seperti kondisi kelas, kendala yang dihadapi, atau hal menarik yang terjadi. Maksimal 2-3 kalimat, singkat dan to the point.`;
      } else if (fieldType === 'refleksi') {
        prompt = `Berdasarkan data pembelajaran berikut:
${context}

Buatkan refleksi pembelajaran yang mendalam dan profesional untuk guru. Refleksi harus mencakup:
1. Evaluasi ketercapaian tujuan pembelajaran
2. Efektivitas metode dan media yang digunakan
3. Respons siswa terhadap pembelajaran
4. Hal yang sudah baik dan yang perlu diperbaiki

Tuliskan dalam 3-4 kalimat yang padat dan bermakna sesuai prinsip Kurikulum Merdeka.`;
      } else if (fieldType === 'tindakLanjut') {
        prompt = `Berdasarkan data pembelajaran berikut:
${context}

Buatkan rencana tindak lanjut yang konkret dan actionable untuk pembelajaran berikutnya. Tindak lanjut harus:
1. Spesifik dan dapat dilaksanakan
2. Sesuai dengan hasil pembelajaran hari ini
3. Mendukung perbaikan proses pembelajaran
4. Memperhatikan kebutuhan siswa

Tuliskan dalam 2-3 kalimat yang jelas dan operasional.`;
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      const data = await response.json();
      const aiContent = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');

      setFormData(prev => ({
        ...prev,
        [fieldType]: aiContent
      }));
    } catch (error) {
      alert('Gagal menghasilkan konten AI: ' + error.message);
    } finally {
      setAiLoading(false);
      setAiField(null);
    }
  };

  const filteredJurnal = jurnalList.filter(jurnal => {
    const matchKelas = !filterKelas || jurnal.kelas === filterKelas;
    const matchMapel = !filterMapel || jurnal.mapel.toLowerCase().includes(filterMapel.toLowerCase());
    const matchSearch = !searchTerm || 
      jurnal.mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jurnal.materiPokok.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jurnal.kegiatanPembelajaran.toLowerCase().includes(searchTerm.toLowerCase());
    return matchKelas && matchMapel && matchSearch;
  });

  const paginatedJurnal = filteredJurnal.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredJurnal.length / itemsPerPage);

  const exportToCSV = () => {
    const headers = ['Tanggal', 'Kelas', 'Mata Pelajaran', 'Materi', 'Metode', 'Hadir', 'Total', 'Guru', 'Sekolah'];
    const rows = filteredJurnal.map(j => [
      j.tanggal,
      j.kelas,
      j.mapel,
      j.materiPokok,
      j.metode.join('; '),
      j.siswaHadir,
      j.jumlahSiswa,
      identitasData.namaGuru || '-',
      identitasData.namaSekolah || '-'
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jurnal-mengajar-${identitasData.namaSekolah || 'sekolah'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getRekapData = () => {
    let filtered = [...jurnalList];
    const today = new Date();
    
    if (rekapPeriode === 'minggu') {
      const targetDate = new Date(rekapFilter.minggu);
      const startOfWeek = new Date(targetDate);
      startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      filtered = filtered.filter(j => {
        const jDate = new Date(j.tanggal);
        return jDate >= startOfWeek && jDate <= endOfWeek;
      });
    } else if (rekapPeriode === 'bulan') {
      filtered = filtered.filter(j => j.tanggal.startsWith(rekapFilter.bulan));
    } else if (rekapPeriode === 'semester') {
      const semester = parseInt(rekapFilter.semester);
      const tahun = parseInt(rekapFilter.tahunAjaran);
      
      filtered = filtered.filter(j => {
        const jDate = new Date(j.tanggal);
        const jYear = jDate.getFullYear();
        const jMonth = jDate.getMonth() + 1;
        
        if (semester === 1) {
          return (jYear === tahun && jMonth >= 7) || (jYear === tahun + 1 && jMonth <= 12);
        } else {
          return jYear === tahun + 1 && jMonth >= 1 && jMonth <= 6;
        }
      });
    }
    
    const siswaMap = new Map();
    
    filtered.forEach(jurnal => {
      ['sakit', 'izin', 'alpa'].forEach(kategori => {
        if (jurnal.detailKehadiran?.[kategori]) {
          jurnal.detailKehadiran[kategori].forEach(siswa => {
            const key = siswa.nama.toLowerCase().trim();
            if (!siswaMap.has(key)) {
              siswaMap.set(key, {
                nama: siswa.nama,
                sakit: 0,
                izin: 0,
                alpa: 0,
                total: 0,
                kelas: jurnal.kelas,
                details: []
              });
            }
            const data = siswaMap.get(key);
            data[kategori]++;
            data.total++;
            data.details.push({
              tanggal: jurnal.tanggal,
              kategori,
              alasan: siswa.alasan,
              mapel: jurnal.mapel
            });
          });
        }
      });
    });
    
    const totalPertemuan = filtered.length;
    const totalHadir = filtered.reduce((sum, j) => sum + parseInt(j.siswaHadir || 0), 0);
    const totalSakit = filtered.reduce((sum, j) => sum + (j.detailKehadiran?.sakit?.length || 0), 0);
    const totalIzin = filtered.reduce((sum, j) => sum + (j.detailKehadiran?.izin?.length || 0), 0);
    const totalAlpa = filtered.reduce((sum, j) => sum + (j.detailKehadiran?.alpa?.length || 0), 0);
    
    return {
      siswaList: Array.from(siswaMap.values()).sort((a, b) => b.total - a.total),
      summary: {
        totalPertemuan,
        totalHadir,
        totalSakit,
        totalIzin,
        totalAlpa,
        persentaseKehadiran: totalPertemuan > 0 ? ((totalHadir / (totalHadir + totalSakit + totalIzin + totalAlpa)) * 100).toFixed(2) : 0
      },
      periode: rekapPeriode,
      filter: rekapFilter
    };
  };

  const exportRekapToExcel = () => {
    const rekap = getRekapData();
    const periodeTeks = rekapPeriode === 'minggu' ? `Minggu ${rekapFilter.minggu}` :
                        rekapPeriode === 'bulan' ? `Bulan ${rekapFilter.bulan}` :
                        `Semester ${rekapFilter.semester} TA ${rekapFilter.tahunAjaran}/${parseInt(rekapFilter.tahunAjaran) + 1}`;
    
    let csv = `REKAP KEHADIRAN SISWA\n`;
    csv += `Sekolah: ${identitasData.namaSekolah || '-'}\n`;
    csv += `Guru: ${identitasData.namaGuru || '-'}\n`;
    csv += `Mata Pelajaran: ${identitasData.mapelDiampu || '-'}\n`;
    csv += `Periode: ${periodeTeks}\n`;
    csv += `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}\n\n`;
    
    csv += `RINGKASAN\n`;
    csv += `Total Pertemuan,${rekap.summary.totalPertemuan}\n`;
    csv += `Total Kehadiran,${rekap.summary.totalHadir}\n`;
    csv += `Total Sakit,${rekap.summary.totalSakit}\n`;
    csv += `Total Izin,${rekap.summary.totalIzin}\n`;
    csv += `Total Alpa,${rekap.summary.totalAlpa}\n`;
    csv += `Persentase Kehadiran,${rekap.summary.persentaseKehadiran}%\n\n`;
    
    csv += `DETAIL PER SISWA\n`;
    csv += `No,Nama Siswa,Kelas,Sakit,Izin,Alpa,Total Tidak Hadir\n`;
    rekap.siswaList.forEach((siswa, idx) => {
      csv += `${idx + 1},${siswa.nama},${siswa.kelas},${siswa.sakit},${siswa.izin},${siswa.alpa},${siswa.total}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap-kehadiran-${periodeTeks.replace(/ /g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportRekapToPDF = () => {
    const rekap = getRekapData();
    const periodeTeks = rekapPeriode === 'minggu' ? `Minggu ${rekapFilter.minggu}` :
                        rekapPeriode === 'bulan' ? `Bulan ${rekapFilter.bulan}` :
                        `Semester ${rekapFilter.semester} TA ${rekapFilter.tahunAjaran}/${parseInt(rekapFilter.tahunAjaran) + 1}`;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rekap Kehadiran - ${periodeTeks}</title>
        <style>
          @media print {
            body { margin: 0; }
            @page { margin: 1cm; }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 210mm;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 3px solid #333;
            padding-bottom: 15px;
          }
          .header h1 {
            margin: 5px 0;
            font-size: 18px;
            text-transform: uppercase;
          }
          .header h2 {
            margin: 5px 0;
            font-size: 16px;
          }
          .info-table {
            width: 100%;
            margin-bottom: 20px;
            font-size: 12px;
          }
          .info-table td {
            padding: 3px 0;
          }
          .info-table td:first-child {
            width: 150px;
            font-weight: bold;
          }
          .summary-box {
            background: #f0f0f0;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .summary-box h3 {
            margin-top: 0;
            font-size: 14px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            font-size: 12px;
          }
          .summary-item {
            background: white;
            padding: 10px;
            border-radius: 3px;
            text-align: center;
          }
          .summary-item .label {
            font-size: 11px;
            color: #666;
          }
          .summary-item .value {
            font-size: 18px;
            font-weight: bold;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 11px;
          }
          th, td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #333;
            color: white;
            font-weight: bold;
            text-align: center;
          }
          td:nth-child(1) { text-align: center; width: 40px; }
          td:nth-child(3) { text-align: center; width: 60px; }
          td:nth-child(4), td:nth-child(5), td:nth-child(6), td:nth-child(7) {
            text-align: center;
            width: 60px;
          }
          .footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
          }
          .signature {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            margin-top: 60px;
            border-top: 1px solid #333;
            padding-top: 5px;
          }
          .highlight { background-color: #ffeb3b; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${identitasData.namaSekolah || 'NAMA SEKOLAH'}</h1>
          <h2>REKAP KEHADIRAN SISWA</h2>
          <p style="margin: 5px 0; font-size: 14px;">${periodeTeks}</p>
        </div>
        
        <table class="info-table">
          <tr>
            <td>Guru Mata Pelajaran</td>
            <td>: ${identitasData.namaGuru || '-'}</td>
          </tr>
          <tr>
            <td>NIP</td>
            <td>: ${identitasData.nip || '-'}</td>
          </tr>
          <tr>
            <td>Mata Pelajaran</td>
            <td>: ${identitasData.mapelDiampu || '-'}</td>
          </tr>
          <tr>
            <td>Periode Rekap</td>
            <td>: ${periodeTeks}</td>
          </tr>
          <tr>
            <td>Tanggal Cetak</td>
            <td>: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
        </table>
        
        <div class="summary-box">
          <h3>RINGKASAN DATA</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="label">Total Pertemuan</div>
              <div class="value">${rekap.summary.totalPertemuan}</div>
            </div>
            <div class="summary-item">
              <div class="label">Persentase Kehadiran</div>
              <div class="value" style="color: #4caf50;">${rekap.summary.persentaseKehadiran}%</div>
            </div>
            <div class="summary-item">
              <div class="label">Total Kehadiran</div>
              <div class="value" style="color: #4caf50;">${rekap.summary.totalHadir}</div>
            </div>
            <div class="summary-item">
              <div class="label">Total Sakit</div>
              <div class="value" style="color: #f44336;">${rekap.summary.totalSakit}</div>
            </div>
            <div class="summary-item">
              <div class="label">Total Izin</div>
              <div class="value" style="color: #ff9800;">${rekap.summary.totalIzin}</div>
            </div>
            <div class="summary-item">
              <div class="label">Total Alpa</div>
              <div class="value" style="color: #9e9e9e;">${rekap.summary.totalAlpa}</div>
            </div>
          </div>
        </div>
        
        <h3 style="font-size: 14px; margin: 20px 0 10px 0;">DETAIL KETIDAKHADIRAN PER SISWA</h3>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Siswa</th>
              <th>Kelas</th>
              <th>Sakit</th>
              <th>Izin</th>
              <th>Alpa</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${rekap.siswaList.length === 0 ? 
              '<tr><td colspan="7" style="text-align: center; padding: 20px;">Tidak ada data ketidakhadiran dalam periode ini</td></tr>' :
              rekap.siswaList.map((siswa, idx) => `
                <tr ${siswa.total >= 3 ? 'class="highlight"' : ''}>
                  <td>${idx + 1}</td>
                  <td>${siswa.nama}</td>
                  <td>${siswa.kelas}</td>
                  <td>${siswa.sakit}</td>
                  <td>${siswa.izin}</td>
                  <td>${siswa.alpa}</td>
                  <td><strong>${siswa.total}</strong></td>
                </tr>
              `).join('')
            }
          </tbody>
        </table>
        
        ${rekap.siswaList.some(s => s.total >= 3) ? 
          '<p style="font-size: 11px; margin-top: 10px;"><span style="background: #ffeb3b; padding: 2px 5px;">■</span> Siswa dengan ketidakhadiran ≥ 3 kali perlu perhatian khusus</p>' : 
          ''
        }
        
        <div class="footer">
          <div class="signature">
            <p>Mengetahui,<br>Kepala Sekolah</p>
            <div class="signature-line">
              <strong>(.............................)</strong>
            </div>
          </div>
          <div class="signature">
            <p>${identitasData.kabupaten || '...................'}, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br>Guru Mata Pelajaran</p>
            <div class="signature-line">
              <strong>${identitasData.namaGuru || '(.............................)'}</strong><br>
              ${identitasData.nip ? `NIP. ${identitasData.nip}` : ''}
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Jurnal Harian Mengajar</h1>
                <p className="text-gray-600">Kurikulum Merdeka - Kementerian Pendidikan</p>
                {identitasData.namaSekolah && (
                  <div className="mt-2 text-sm">
                    <p className="text-indigo-700 font-semibold">{identitasData.namaSekolah}</p>
                    <p className="text-gray-600">{identitasData.namaGuru} - {identitasData.mapelDiampu}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDataMaster(!showDataMaster)}
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors shadow-md"
              >
                <Database className="w-5 h-5" />
                Data Master
              </button>
              <button
                onClick={() => setShowRekapKehadiran(!showRekapKehadiran)}
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-md"
              >
                <BarChart3 className="w-5 h-5" />
                Rekap Kehadiran
              </button>
              <button
                onClick={() => setShowIdentitasForm(!showIdentitasForm)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                {identitasData.namaSekolah ? <Edit2 className="w-5 h-5" /> : <School className="w-5 h-5" />}
                {identitasData.namaSekolah ? 'Edit Identitas' : 'Atur Identitas'}
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
              >
                {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {showForm ? 'Tutup Form' : 'Tambah Jurnal'}
              </button>
            </div>
          </div>
        </div>

        {/* Form Identitas */}
        {showIdentitasForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <School className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">Identitas Sekolah & Guru</h2>
            </div>
            
            <div className="space-y-6">
              {/* Data Sekolah */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                  <School className="w-5 h-5 text-green-600" />
                  Data Sekolah
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Sekolah *
                    </label>
                    <input
                      type="text"
                      value={identitasData.namaSekolah}
                      onChange={(e) => setIdentitasData({...identitasData, namaSekolah: e.target.value})}
                      placeholder="Contoh: SMA Negeri 1 Bandung"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NPSN
                    </label>
                    <input
                      type="text"
                      value={identitasData.npsn}
                      onChange={(e) => setIdentitasData({...identitasData, npsn: e.target.value})}
                      placeholder="Nomor Pokok Sekolah Nasional"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Sekolah
                    </label>
                    <input
                      type="text"
                      value={identitasData.alamatSekolah}
                      onChange={(e) => setIdentitasData({...identitasData, alamatSekolah: e.target.value})}
                      placeholder="Jalan, Nomor, Kelurahan"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kecamatan
                    </label>
                    <input
                      type="text"
                      value={identitasData.kecamatan}
                      onChange={(e) => setIdentitasData({...identitasData, kecamatan: e.target.value})}
                      placeholder="Nama Kecamatan"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kabupaten/Kota
                    </label>
                    <input
                      type="text"
                      value={identitasData.kabupaten}
                      onChange={(e) => setIdentitasData({...identitasData, kabupaten: e.target.value})}
                      placeholder="Nama Kabupaten/Kota"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      value={identitasData.provinsi}
                      onChange={(e) => setIdentitasData({...identitasData, provinsi: e.target.value})}
                      placeholder="Nama Provinsi"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Data Guru */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-green-600" />
                  Data Guru
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={identitasData.namaGuru}
                      onChange={(e) => setIdentitasData({...identitasData, namaGuru: e.target.value})}
                      placeholder="Nama lengkap guru"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIP
                    </label>
                    <input
                      type="text"
                      value={identitasData.nip}
                      onChange={(e) => setIdentitasData({...identitasData, nip: e.target.value})}
                      placeholder="Nomor Induk Pegawai"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mata Pelajaran Diampu *
                    </label>
                    <input
                      type="text"
                      value={identitasData.mapelDiampu}
                      onChange={(e) => setIdentitasData({...identitasData, mapelDiampu: e.target.value})}
                      placeholder="Contoh: Matematika"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={identitasData.email}
                      onChange={(e) => setIdentitasData({...identitasData, email: e.target.value})}
                      placeholder="email@sekolah.sch.id"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No. Telepon
                    </label>
                    <input
                      type="tel"
                      value={identitasData.noTelepon}
                      onChange={(e) => setIdentitasData({...identitasData, noTelepon: e.target.value})}
                      placeholder="08xx xxxx xxxx"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowIdentitasForm(false)}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Batal
                </button>
                <button
                  type="button"
                  onClick={saveIdentitas}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                  <Save className="w-5 h-5" />
                  Simpan Identitas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Master */}
        {showDataMaster && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-teal-600" />
                <h2 className="text-2xl font-bold text-gray-800">Data Master</h2>
              </div>
              <button
                onClick={() => setShowDataMaster(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => { setMasterTab('kelas'); resetFormMaster(); }}
                className={`px-4 py-2 font-medium transition-colors ${masterTab === 'kelas' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <School className="w-4 h-4 inline mr-2" />
                Kelas
              </button>
              <button
                onClick={() => { setMasterTab('siswa'); resetFormMaster(); }}
                className={`px-4 py-2 font-medium transition-colors ${masterTab === 'siswa' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <GraduationCap className="w-4 h-4 inline mr-2" />
                Siswa
              </button>
              <button
                onClick={() => { setMasterTab('mapel'); resetFormMaster(); }}
                className={`px-4 py-2 font-medium transition-colors ${masterTab === 'mapel' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <BookOpenCheck className="w-4 h-4 inline mr-2" />
                Mata Pelajaran
              </button>
              <button
                onClick={() => { setMasterTab('jadwal'); resetFormMaster(); }}
                className={`px-4 py-2 font-medium transition-colors ${masterTab === 'jadwal' ? 'border-b-2 border-teal-600 text-teal-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <ClipboardList className="w-4 h-4 inline mr-2" />
                Jadwal Mengajar
              </button>
            </div>

            {/* Button Tambah */}
            {!showFormMaster && (
              <button
                onClick={() => setShowFormMaster(true)}
                className="mb-4 flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Tambah {masterTab === 'kelas' ? 'Kelas' : masterTab === 'siswa' ? 'Siswa' : masterTab === 'mapel' ? 'Mata Pelajaran' : 'Jadwal'}
              </button>
            )}

            {/* Form Input */}
            {showFormMaster && (
              <div className="bg-teal-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-4">
                  {editingMasterId ? 'Edit' : 'Tambah'} Data {masterTab === 'kelas' ? 'Kelas' : masterTab === 'siswa' ? 'Siswa' : masterTab === 'mapel' ? 'Mata Pelajaran' : 'Jadwal'}
                </h3>

                {/* Form Kelas */}
                {masterTab === 'kelas' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Kelas *</label>
                      <input
                        type="text"
                        value={formMaster.namaKelas}
                        onChange={(e) => setFormMaster({...formMaster, namaKelas: e.target.value})}
                        placeholder="Contoh: X IPA 1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat *</label>
                      <select
                        value={formMaster.tingkat}
                        onChange={(e) => setFormMaster({...formMaster, tingkat: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Pilih Tingkat</option>
                        <option value="VII">VII</option>
                        <option value="VIII">VIII</option>
                        <option value="IX">IX</option>
                        <option value="X">X</option>
                        <option value="XI">XI</option>
                        <option value="XII">XII</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jurusan</label>
                      <input
                        type="text"
                        value={formMaster.jurusan}
                        onChange={(e) => setFormMaster({...formMaster, jurusan: e.target.value})}
                        placeholder="IPA, IPS, atau kosongkan"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Wali Kelas</label>
                      <input
                        type="text"
                        value={formMaster.waliKelas}
                        onChange={(e) => setFormMaster({...formMaster, waliKelas: e.target.value})}
                        placeholder="Nama wali kelas"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}

                {/* Form Siswa */}
                {masterTab === 'siswa' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">NIS</label>
                      <input
                        type="text"
                        value={formMaster.nis}
                        onChange={(e) => setFormMaster({...formMaster, nis: e.target.value})}
                        placeholder="Nomor Induk Siswa"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Siswa *</label>
                      <input
                        type="text"
                        value={formMaster.namaSiswa}
                        onChange={(e) => setFormMaster({...formMaster, namaSiswa: e.target.value})}
                        placeholder="Nama lengkap siswa"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kelas *</label>
                      <select
                        value={formMaster.kelasId}
                        onChange={(e) => setFormMaster({...formMaster, kelasId: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Pilih Kelas</option>
                        {dataKelas.map(k => (
                          <option key={k.id} value={k.id}>{k.namaKelas}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                      <select
                        value={formMaster.jenisKelamin}
                        onChange={(e) => setFormMaster({...formMaster, jenisKelamin: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Pilih</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tempat Lahir</label>
                      <input
                        type="text"
                        value={formMaster.tempatLahir}
                        onChange={(e) => setFormMaster({...formMaster, tempatLahir: e.target.value})}
                        placeholder="Kota tempat lahir"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Lahir</label>
                      <input
                        type="date"
                        value={formMaster.tanggalLahir}
                        onChange={(e) => setFormMaster({...formMaster, tanggalLahir: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}

                {/* Form Mapel */}
                {masterTab === 'mapel' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kode Mapel</label>
                      <input
                        type="text"
                        value={formMaster.kodeMapel}
                        onChange={(e) => setFormMaster({...formMaster, kodeMapel: e.target.value})}
                        placeholder="Contoh: MAT"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Mata Pelajaran *</label>
                      <input
                        type="text"
                        value={formMaster.namaMapel}
                        onChange={(e) => setFormMaster({...formMaster, namaMapel: e.target.value})}
                        placeholder="Contoh: Matematika"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kelompok</label>
                      <select
                        value={formMaster.kelompok}
                        onChange={(e) => setFormMaster({...formMaster, kelompok: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Pilih Kelompok</option>
                        <option value="A">A - Umum</option>
                        <option value="B">B - IPTEK</option>
                        <option value="C">C - Peminatan</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Form Jadwal */}
                {masterTab === 'jadwal' && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hari *</label>
                      <select
                        value={formMaster.hari}
                        onChange={(e) => setFormMaster({...formMaster, hari: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Pilih Hari</option>
                        <option value="Senin">Senin</option>
                        <option value="Selasa">Selasa</option>
                        <option value="Rabu">Rabu</option>
                        <option value="Kamis">Kamis</option>
                        <option value="Jumat">Jumat</option>
                        <option value="Sabtu">Sabtu</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kelas *</label>
                      <select
                        value={formMaster.kelasIdJadwal}
                        onChange={(e) => setFormMaster({...formMaster, kelasIdJadwal: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Pilih Kelas</option>
                        {dataKelas.map(k => (
                          <option key={k.id} value={k.id}>{k.namaKelas}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mata Pelajaran *</label>
                      <select
                        value={formMaster.mapelIdJadwal}
                        onChange={(e) => setFormMaster({...formMaster, mapelIdJadwal: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Pilih Mapel</option>
                        {dataMapel.map(m => (
                          <option key={m.id} value={m.id}>{m.namaMapel}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ruangan</label>
                      <input
                        type="text"
                        value={formMaster.ruangan}
                        onChange={(e) => setFormMaster({...formMaster, ruangan: e.target.value})}
                        placeholder="Contoh: Lab Komputer"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jam Mulai</label>
                      <input
                        type="time"
                        value={formMaster.jamMulaiJadwal}
                        onChange={(e) => setFormMaster({...formMaster, jamMulaiJadwal: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Jam Selesai</label>
                      <input
                        type="time"
                        value={formMaster.jamSelesaiJadwal}
                        onChange={(e) => setFormMaster({...formMaster, jamSelesaiJadwal: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 justify-end mt-4">
                  <button
                    onClick={resetFormMaster}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleAddMaster}
                    className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
                  >
                    <Save className="w-4 h-4" />
                    {editingMasterId ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </div>
            )}

            {/* Tabel Data */}
            <div className="overflow-x-auto">
              {/* Tabel Kelas */}
              {masterTab === 'kelas' && (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-teal-600 text-white">
                      <th className="border border-teal-700 px-4 py-2">No</th>
                      <th className="border border-teal-700 px-4 py-2">Nama Kelas</th>
                      <th className="border border-teal-700 px-4 py-2">Tingkat</th>
                      <th className="border border-teal-700 px-4 py-2">Jurusan</th>
                      <th className="border border-teal-700 px-4 py-2">Wali Kelas</th>
                      <th className="border border-teal-700 px-4 py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataKelas.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-8 text-gray-500">Belum ada data kelas</td></tr>
                    ) : (
                      dataKelas.map((k, idx) => (
                        <tr key={k.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-center">{idx + 1}</td>
                          <td className="border border-gray-300 px-4 py-2 font-semibold">{k.namaKelas}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{k.tingkat}</td>
                          <td className="border border-gray-300 px-4 py-2">{k.jurusan || '-'}</td>
                          <td className="border border-gray-300 px-4 py-2">{k.waliKelas || '-'}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex gap-2 justify-center">
                              <button onClick={() => handleEditMaster(k)} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteMaster(k.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* Tabel Siswa */}
              {masterTab === 'siswa' && (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-teal-600 text-white">
                      <th className="border border-teal-700 px-4 py-2">No</th>
                      <th className="border border-teal-700 px-4 py-2">NIS</th>
                      <th className="border border-teal-700 px-4 py-2">Nama Siswa</th>
                      <th className="border border-teal-700 px-4 py-2">Kelas</th>
                      <th className="border border-teal-700 px-4 py-2">L/P</th>
                      <th className="border border-teal-700 px-4 py-2">TTL</th>
                      <th className="border border-teal-700 px-4 py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataSiswa.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-8 text-gray-500">Belum ada data siswa</td></tr>
                    ) : (
                      dataSiswa.map((s, idx) => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-center">{idx + 1}</td>
                          <td className="border border-gray-300 px-4 py-2">{s.nis || '-'}</td>
                          <td className="border border-gray-300 px-4 py-2 font-semibold">{s.namaSiswa}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{getKelasName(s.kelasId)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{s.jenisKelamin || '-'}</td>
                          <td className="border border-gray-300 px-4 py-2">{s.tempatLahir && s.tanggalLahir ? `${s.tempatLahir}, ${s.tanggalLahir}` : '-'}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex gap-2 justify-center">
                              <button onClick={() => handleEditMaster(s)} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteMaster(s.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* Tabel Mapel */}
              {masterTab === 'mapel' && (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-teal-600 text-white">
                      <th className="border border-teal-700 px-4 py-2">No</th>
                      <th className="border border-teal-700 px-4 py-2">Kode</th>
                      <th className="border border-teal-700 px-4 py-2">Nama Mata Pelajaran</th>
                      <th className="border border-teal-700 px-4 py-2">Kelompok</th>
                      <th className="border border-teal-700 px-4 py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataMapel.length === 0 ? (
                      <tr><td colSpan="5" className="text-center py-8 text-gray-500">Belum ada data mata pelajaran</td></tr>
                    ) : (
                      dataMapel.map((m, idx) => (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-center">{idx + 1}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-mono">{m.kodeMapel || '-'}</td>
                          <td className="border border-gray-300 px-4 py-2 font-semibold">{m.namaMapel}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{m.kelompok || '-'}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex gap-2 justify-center">
                              <button onClick={() => handleEditMaster(m)} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteMaster(m.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* Tabel Jadwal */}
              {masterTab === 'jadwal' && (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-teal-600 text-white">
                      <th className="border border-teal-700 px-4 py-2">No</th>
                      <th className="border border-teal-700 px-4 py-2">Hari</th>
                      <th className="border border-teal-700 px-4 py-2">Jam</th>
                      <th className="border border-teal-700 px-4 py-2">Kelas</th>
                      <th className="border border-teal-700 px-4 py-2">Mata Pelajaran</th>
                      <th className="border border-teal-700 px-4 py-2">Ruangan</th>
                      <th className="border border-teal-700 px-4 py-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataJadwal.length === 0 ? (
                      <tr><td colSpan="7" className="text-center py-8 text-gray-500">Belum ada data jadwal</td></tr>
                    ) : (
                      dataJadwal.map((j, idx) => (
                        <tr key={j.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-center">{idx + 1}</td>
                          <td className="border border-gray-300 px-4 py-2 font-semibold">{j.hari}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{j.jamMulaiJadwal && j.jamSelesaiJadwal ? `${j.jamMulaiJadwal} - ${j.jamSelesaiJadwal}` : '-'}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{getKelasName(j.kelasId)}</td>
                          <td className="border border-gray-300 px-4 py-2">{getMapelName(j.mapelId)}</td>
                          <td className="border border-gray-300 px-4 py-2">{j.ruangan || '-'}</td>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="flex gap-2 justify-center">
                              <button onClick={() => handleEditMaster(j)} className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteMaster(j.id)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
        {showRekapKehadiran && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">Rekap Kehadiran Siswa</h2>
              </div>
              <button
                onClick={() => setShowRekapKehadiran(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filter Periode */}
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Periode Rekap
                  </label>
                  <select
                    value={rekapPeriode}
                    onChange={(e) => setRekapPeriode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="minggu">Per Minggu</option>
                    <option value="bulan">Per Bulan</option>
                    <option value="semester">Per Semester</option>
                  </select>
                </div>

                {rekapPeriode === 'minggu' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Tanggal dalam Minggu
                    </label>
                    <input
                      type="date"
                      value={rekapFilter.minggu}
                      onChange={(e) => setRekapFilter({...rekapFilter, minggu: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {rekapPeriode === 'bulan' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Bulan
                    </label>
                    <input
                      type="month"
                      value={rekapFilter.bulan}
                      onChange={(e) => setRekapFilter({...rekapFilter, bulan: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                {rekapPeriode === 'semester' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Semester
                      </label>
                      <select
                        value={rekapFilter.semester}
                        onChange={(e) => setRekapFilter({...rekapFilter, semester: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="1">Semester 1 (Ganjil)</option>
                        <option value="2">Semester 2 (Genap)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tahun Ajaran
                      </label>
                      <input
                        type="number"
                        value={rekapFilter.tahunAjaran}
                        onChange={(e) => setRekapFilter({...rekapFilter, tahunAjaran: e.target.value})}
                        placeholder="2024"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-end gap-2">
                  <button
                    onClick={exportRekapToExcel}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FileSpreadsheet className="w-5 h-5" />
                    Excel
                  </button>
                  <button
                    onClick={exportRekapToPDF}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FileText className="w-5 h-5" />
                    PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Tampilan Rekap */}
            {(() => {
              const rekap = getRekapData();
              return (
                <>
                  {/* Summary Cards */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow">
                      <p className="text-sm opacity-90">Total Pertemuan</p>
                      <p className="text-3xl font-bold mt-1">{rekap.summary.totalPertemuan}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow">
                      <p className="text-sm opacity-90">Persentase Hadir</p>
                      <p className="text-3xl font-bold mt-1">{rekap.summary.persentaseKehadiran}%</p>
                    </div>
                    <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white p-4 rounded-lg shadow">
                      <p className="text-sm opacity-90">Total Hadir</p>
                      <p className="text-3xl font-bold mt-1">{rekap.summary.totalHadir}</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-lg shadow">
                      <p className="text-sm opacity-90">Total Sakit</p>
                      <p className="text-3xl font-bold mt-1">{rekap.summary.totalSakit}</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-4 rounded-lg shadow">
                      <p className="text-sm opacity-90">Total Izin</p>
                      <p className="text-3xl font-bold mt-1">{rekap.summary.totalIzin}</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-4 rounded-lg shadow">
                      <p className="text-sm opacity-90">Total Alpa</p>
                      <p className="text-3xl font-bold mt-1">{rekap.summary.totalAlpa}</p>
                    </div>
                  </div>

                  {/* Detail Table */}
                  <div className="overflow-x-auto">
                    <h3 className="font-semibold text-gray-800 mb-3">Detail Ketidakhadiran Per Siswa</h3>
                    {rekap.siswaList.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Tidak ada data ketidakhadiran dalam periode ini</p>
                      </div>
                    ) : (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-purple-600 text-white">
                            <th className="border border-purple-700 px-4 py-3 text-left">No</th>
                            <th className="border border-purple-700 px-4 py-3 text-left">Nama Siswa</th>
                            <th className="border border-purple-700 px-4 py-3 text-center">Kelas</th>
                            <th className="border border-purple-700 px-4 py-3 text-center">Sakit</th>
                            <th className="border border-purple-700 px-4 py-3 text-center">Izin</th>
                            <th className="border border-purple-700 px-4 py-3 text-center">Alpa</th>
                            <th className="border border-purple-700 px-4 py-3 text-center">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rekap.siswaList.map((siswa, idx) => (
                            <tr key={idx} className={`${siswa.total >= 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                              <td className="border border-gray-300 px-4 py-2">{idx + 1}</td>
                              <td className="border border-gray-300 px-4 py-2 font-medium">{siswa.nama}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center">{siswa.kelas}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center text-red-600 font-semibold">{siswa.sakit}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center text-yellow-600 font-semibold">{siswa.izin}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center text-gray-600 font-semibold">{siswa.alpa}</td>
                              <td className="border border-gray-300 px-4 py-2 text-center font-bold">{siswa.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {rekap.siswaList.some(s => s.total >= 3) && (
                      <p className="text-sm text-gray-600 mt-3">
                        <span className="bg-yellow-100 px-2 py-1 rounded">⚠️</span> Siswa dengan ketidakhadiran ≥ 3 kali ditandai dan perlu perhatian khusus
                      </p>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <School className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-800">Identitas Sekolah & Guru</h2>
            </div>
            
            <div className="space-y-6">
              {/* Data Sekolah */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                  <School className="w-5 h-5 text-green-600" />
                  Data Sekolah
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Sekolah *
                    </label>
                    <input
                      type="text"
                      value={identitasData.namaSekolah}
                      onChange={(e) => setIdentitasData({...identitasData, namaSekolah: e.target.value})}
                      placeholder="Contoh: SMA Negeri 1 Bandung"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NPSN
                    </label>
                    <input
                      type="text"
                      value={identitasData.npsn}
                      onChange={(e) => setIdentitasData({...identitasData, npsn: e.target.value})}
                      placeholder="Nomor Pokok Sekolah Nasional"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Sekolah
                    </label>
                    <input
                      type="text"
                      value={identitasData.alamatSekolah}
                      onChange={(e) => setIdentitasData({...identitasData, alamatSekolah: e.target.value})}
                      placeholder="Jalan, Nomor, Kelurahan"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kecamatan
                    </label>
                    <input
                      type="text"
                      value={identitasData.kecamatan}
                      onChange={(e) => setIdentitasData({...identitasData, kecamatan: e.target.value})}
                      placeholder="Nama Kecamatan"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kabupaten/Kota
                    </label>
                    <input
                      type="text"
                      value={identitasData.kabupaten}
                      onChange={(e) => setIdentitasData({...identitasData, kabupaten: e.target.value})}
                      placeholder="Nama Kabupaten/Kota"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      value={identitasData.provinsi}
                      onChange={(e) => setIdentitasData({...identitasData, provinsi: e.target.value})}
                      placeholder="Nama Provinsi"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Data Guru */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-green-600" />
                  Data Guru
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={identitasData.namaGuru}
                      onChange={(e) => setIdentitasData({...identitasData, namaGuru: e.target.value})}
                      placeholder="Nama lengkap guru"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIP
                    </label>
                    <input
                      type="text"
                      value={identitasData.nip}
                      onChange={(e) => setIdentitasData({...identitasData, nip: e.target.value})}
                      placeholder="Nomor Induk Pegawai"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mata Pelajaran Diampu *
                    </label>
                    <input
                      type="text"
                      value={identitasData.mapelDiampu}
                      onChange={(e) => setIdentitasData({...identitasData, mapelDiampu: e.target.value})}
                      placeholder="Contoh: Matematika"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={identitasData.email}
                      onChange={(e) => setIdentitasData({...identitasData, email: e.target.value})}
                      placeholder="email@sekolah.sch.id"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      No. Telepon
                    </label>
                    <input
                      type="tel"
                      value={identitasData.noTelepon}
                      onChange={(e) => setIdentitasData({...identitasData, noTelepon: e.target.value})}
                      placeholder="08xx xxxx xxxx"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowIdentitasForm(false)}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Batal
                </button>
                <button
                  type="button"
                  onClick={saveIdentitas}
                  className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                  <Save className="w-5 h-5" />
                  Simpan Identitas
                </button>
              </div>
            </div>
          </div>
        

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingId ? 'Edit Jurnal' : 'Tambah Jurnal Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informasi Dasar */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kelas *
                  </label>
                  <select
                    name="kelas"
                    value={formData.kelas}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Pilih Kelas</option>
                    {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mata Pelajaran *
                  </label>
                  <input
                    type="text"
                    name="mapel"
                    value={formData.mapel}
                    onChange={handleInputChange}
                    required
                    placeholder="Contoh: Matematika"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fase *
                  </label>
                  <select
                    name="fase"
                    value={formData.fase}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Pilih Fase</option>
                    {faseList.map(f => <option key={f} value={f}>Fase {f}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Jam Mulai *
                  </label>
                  <input
                    type="time"
                    name="jamMulai"
                    value={formData.jamMulai}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Jam Selesai *
                  </label>
                  <input
                    type="time"
                    name="jamSelesai"
                    value={formData.jamSelesai}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Elemen dan Capaian */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Elemen Kurikulum Merdeka *
                </label>
                <input
                  type="text"
                  name="elemen"
                  value={formData.elemen}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: Bilangan, Aljabar"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capaian Pembelajaran (CP) *
                </label>
                <textarea
                  name="capaianPembelajaran"
                  value={formData.capaianPembelajaran}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Tuliskan Capaian Pembelajaran sesuai fase"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tujuan Pembelajaran *
                </label>
                <textarea
                  name="tujuanPembelajaran"
                  value={formData.tujuanPembelajaran}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Tuliskan tujuan pembelajaran yang ingin dicapai"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Materi Pokok *
                </label>
                <input
                  type="text"
                  name="materiPokok"
                  value={formData.materiPokok}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: Persamaan Linear Satu Variabel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kegiatan Pembelajaran *
                </label>
                <textarea
                  name="kegiatanPembelajaran"
                  value={formData.kegiatanPembelajaran}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Deskripsikan kegiatan pembelajaran (Pendahuluan, Inti, Penutup)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Metode Pembelajaran */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metode Pembelajaran * (Pilih minimal 1)
                </label>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {metodeList.map(metode => (
                    <label key={metode} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.metode.includes(metode)}
                        onChange={() => handleMetodeChange(metode)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="text-sm">{metode}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media Pembelajaran *
                </label>
                <input
                  type="text"
                  name="mediaPembelajaran"
                  value={formData.mediaPembelajaran}
                  onChange={handleInputChange}
                  required
                  placeholder="Contoh: PPT, Video, LKS, Manipulatif"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Asesmen *
                </label>
                <select
                  name="asesmen"
                  value={formData.asesmen}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Pilih Asesmen</option>
                  {asesmenList.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {/* Kehadiran Siswa */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Data Kehadiran Siswa
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowKehadiranDetail(!showKehadiranDetail)}
                    className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {showKehadiranDetail ? 'Sembunyikan Detail' : 'Kelola Detail'}
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah Siswa *
                    </label>
                    <input
                      type="number"
                      name="jumlahSiswa"
                      value={formData.jumlahSiswa}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hadir *
                    </label>
                    <input
                      type="number"
                      name="siswaHadir"
                      value={formData.siswaHadir}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sakit ({siswaList.sakit.length})
                    </label>
                    <input
                      type="number"
                      name="siswaSakit"
                      value={formData.siswaSakit || siswaList.sakit.length}
                      onChange={handleInputChange}
                      min="0"
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Izin ({siswaList.izin.length})
                    </label>
                    <input
                      type="number"
                      name="siswaIzin"
                      value={formData.siswaIzin || siswaList.izin.length}
                      onChange={handleInputChange}
                      min="0"
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alpa ({siswaList.alpa.length})
                    </label>
                    <input
                      type="number"
                      name="siswaAlfa"
                      value={formData.siswaAlfa || siswaList.alpa.length}
                      onChange={handleInputChange}
                      min="0"
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Detail Kehadiran */}
                {showKehadiranDetail && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Kelola Detail Siswa Tidak Hadir</h4>
                    
                    {/* Form Input */}
                    <div className="grid md:grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Kategori
                        </label>
                        <select
                          value={siswaTempData.kategori}
                          onChange={(e) => setSiswaTempData({...siswaTempData, kategori: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="sakit">Sakit</option>
                          <option value="izin">Izin</option>
                          <option value="alpa">Alpa</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nama Siswa
                        </label>
                        <input
                          type="text"
                          value={siswaTempData.nama}
                          onChange={(e) => setSiswaTempData({...siswaTempData, nama: e.target.value})}
                          placeholder="Nama lengkap siswa"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Alasan/Keterangan
                        </label>
                        <input
                          type="text"
                          value={siswaTempData.alasan}
                          onChange={(e) => setSiswaTempData({...siswaTempData, alasan: e.target.value})}
                          placeholder="Demam, urusan keluarga, dll"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      
                      <div className="md:col-span-3 flex justify-end">
                        <button
                          type="button"
                          onClick={addSiswaDetail}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Tambah Siswa
                        </button>
                      </div>
                    </div>

                    {/* List Siswa */}
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Sakit */}
                      <div>
                        <h5 className="font-semibold text-red-700 mb-2 text-sm flex items-center gap-1">
                          🤒 Sakit ({siswaList.sakit.length})
                        </h5>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {siswaList.sakit.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">Tidak ada siswa sakit</p>
                          ) : (
                            siswaList.sakit.map((siswa) => (
                              <div key={siswa.id} className="bg-red-50 p-2 rounded border border-red-200">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-800">{siswa.nama}</p>
                                    {siswa.alasan && (
                                      <p className="text-xs text-gray-600 mt-1">{siswa.alasan}</p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => deleteSiswaDetail('sakit', siswa.id)}
                                    className="text-red-600 hover:bg-red-100 p-1 rounded"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Izin */}
                      <div>
                        <h5 className="font-semibold text-yellow-700 mb-2 text-sm flex items-center gap-1">
                          📝 Izin ({siswaList.izin.length})
                        </h5>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {siswaList.izin.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">Tidak ada siswa izin</p>
                          ) : (
                            siswaList.izin.map((siswa) => (
                              <div key={siswa.id} className="bg-yellow-50 p-2 rounded border border-yellow-200">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-800">{siswa.nama}</p>
                                    {siswa.alasan && (
                                      <p className="text-xs text-gray-600 mt-1">{siswa.alasan}</p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => deleteSiswaDetail('izin', siswa.id)}
                                    className="text-yellow-600 hover:bg-yellow-100 p-1 rounded"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Alpa */}
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2 text-sm flex items-center gap-1">
                          ❌ Alpa ({siswaList.alpa.length})
                        </h5>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {siswaList.alpa.length === 0 ? (
                            <p className="text-xs text-gray-500 italic">Tidak ada siswa alpa</p>
                          ) : (
                            siswaList.alpa.map((siswa) => (
                              <div key={siswa.id} className="bg-gray-50 p-2 rounded border border-gray-300">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-800">{siswa.nama}</p>
                                    {siswa.alasan && (
                                      <p className="text-xs text-gray-600 mt-1">{siswa.alasan}</p>
                                    )}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => deleteSiswaDetail('alpa', siswa.id)}
                                    className="text-gray-600 hover:bg-gray-200 p-1 rounded"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Refleksi dan Tindak Lanjut */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Catatan Khusus
                  </label>
                  <button
                    type="button"
                    onClick={() => generateAIContent('catatan')}
                    disabled={aiLoading}
                    className="flex items-center gap-1 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    {aiLoading && aiField === 'catatan' ? 'Generating...' : 'AI Bantu'}
                  </button>
                </div>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Catatan khusus tentang pembelajaran hari ini"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">💡 Klik "AI Bantu" untuk mendapatkan saran catatan dari AI</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Refleksi Pembelajaran *
                  </label>
                  <button
                    type="button"
                    onClick={() => generateAIContent('refleksi')}
                    disabled={aiLoading}
                    className="flex items-center gap-1 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    {aiLoading && aiField === 'refleksi' ? 'Generating...' : 'AI Bantu'}
                  </button>
                </div>
                <textarea
                  name="refleksi"
                  value={formData.refleksi}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="Refleksi terhadap proses pembelajaran yang telah dilakukan"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">💡 AI akan menganalisis data pembelajaran Anda dan memberikan refleksi profesional</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tindak Lanjut *
                  </label>
                  <button
                    type="button"
                    onClick={() => generateAIContent('tindakLanjut')}
                    disabled={aiLoading}
                    className="flex items-center gap-1 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    {aiLoading && aiField === 'tindakLanjut' ? 'Generating...' : 'AI Bantu'}
                  </button>
                </div>
                <textarea
                  name="tindakLanjut"
                  value={formData.tindakLanjut}
                  onChange={handleInputChange}
                  required
                  rows="2"
                  placeholder="Rencana tindak lanjut untuk pembelajaran berikutnya"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">💡 AI akan menyarankan tindak lanjut yang konkret dan actionable</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                >
                  <Save className="w-5 h-5" />
                  {editingId ? 'Update Jurnal' : 'Simpan Jurnal'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter dan Search */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Cari
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari materi atau kegiatan..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-1" />
                Filter Kelas
              </label>
              <select
                value={filterKelas}
                onChange={(e) => setFilterKelas(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Semua Kelas</option>
                {kelasList.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Mapel
              </label>
              <input
                type="text"
                value={filterMapel}
                onChange={(e) => setFilterMapel(e.target.value)}
                placeholder="Filter mata pelajaran..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={exportToCSV}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Daftar Jurnal */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Daftar Jurnal ({filteredJurnal.length} entri)
          </h2>

          {paginatedJurnal.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Belum ada jurnal yang tersimpan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedJurnal.map((jurnal) => (
                <div key={jurnal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {jurnal.tanggal}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          Kelas {jurnal.kelas}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                          Fase {jurnal.fase}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">{jurnal.mapel}</h3>
                      <p className="text-gray-600 mt-1">{jurnal.materiPokok}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(jurnal)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(jurnal.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Waktu:</span>
                      <p className="text-gray-600">{jurnal.jamMulai} - {jurnal.jamSelesai}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Metode:</span>
                      <p className="text-gray-600">{jurnal.metode.join(', ')}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Kehadiran:</span>
                      <p className="text-gray-600">{jurnal.siswaHadir}/{jurnal.jumlahSiswa} siswa</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Asesmen:</span>
                      <p className="text-gray-600">{jurnal.asesmen}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="mb-2">
                      <span className="font-semibold text-gray-700">Tujuan Pembelajaran:</span>
                      <p className="text-gray-600 text-sm">{jurnal.tujuanPembelajaran}</p>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold text-gray-700">Kegiatan:</span>
                      <p className="text-gray-600 text-sm">{jurnal.kegiatanPembelajaran}</p>
                    </div>
                    
                    {/* Detail Kehadiran Siswa */}
                    {jurnal.detailKehadiran && (jurnal.detailKehadiran.sakit?.length > 0 || jurnal.detailKehadiran.izin?.length > 0 || jurnal.detailKehadiran.alpa?.length > 0) && (
                      <div className="mb-2 p-3 bg-gray-50 rounded-lg">
                        <span className="font-semibold text-gray-700 block mb-2">Detail Ketidakhadiran:</span>
                        <div className="grid md:grid-cols-3 gap-3 text-sm">
                          {jurnal.detailKehadiran.sakit?.length > 0 && (
                            <div>
                              <p className="font-medium text-red-700 mb-1">🤒 Sakit ({jurnal.detailKehadiran.sakit.length})</p>
                              <ul className="space-y-1">
                                {jurnal.detailKehadiran.sakit.map((s, idx) => (
                                  <li key={idx} className="text-gray-600">
                                    • {s.nama} {s.alasan && `- ${s.alasan}`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {jurnal.detailKehadiran.izin?.length > 0 && (
                            <div>
                              <p className="font-medium text-yellow-700 mb-1">📝 Izin ({jurnal.detailKehadiran.izin.length})</p>
                              <ul className="space-y-1">
                                {jurnal.detailKehadiran.izin.map((s, idx) => (
                                  <li key={idx} className="text-gray-600">
                                    • {s.nama} {s.alasan && `- ${s.alasan}`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {jurnal.detailKehadiran.alpa?.length > 0 && (
                            <div>
                              <p className="font-medium text-gray-700 mb-1">❌ Alpa ({jurnal.detailKehadiran.alpa.length})</p>
                              <ul className="space-y-1">
                                {jurnal.detailKehadiran.alpa.map((s, idx) => (
                                  <li key={idx} className="text-gray-600">
                                    • {s.nama} {s.alasan && `- ${s.alasan}`}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-2">
                      <span className="font-semibold text-gray-700">Refleksi:</span>
                      <p className="text-gray-600 text-sm">{jurnal.refleksi}</p>
                    </div>
                    {jurnal.catatan && (
                      <div>
                        <span className="font-semibold text-gray-700">Catatan:</span>
                        <p className="text-gray-600 text-sm">{jurnal.catatan}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
