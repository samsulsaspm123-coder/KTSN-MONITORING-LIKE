import { InventoryItem, InventoryReportMeta } from '../types';

export const DEFAULT_INVENTORY_META: InventoryReportMeta = {
  sourceDate: '05/08/2026',
  storeName: 'MEGA ELEKTRONIK GADGET AND HANDPHONE KERTOSONO',
  lastUpdated: '05/08/2026 12:59:41 PM (AMELIA)',
  totalItems: 385,
};

export const RAW_INVENTORY_ITEMS: InventoryItem[] = [
  // ==========================================
  // === PHILIPS (SETRIKA, BLENDER, MAGIC COM, CHOPPER, MIXER, AIR FRYER, LAMPU LED, AKSESORIS) ===
  // ==========================================
  { id: 'ph-1', merek: 'PHILIPS', kode: 'PS00023', nama: 'PHILIPS SETRIKA HD 1172 CLASSIC ABU-ABU', tipeModel: 'SETRIKA HD 1172 CLASSIC ABU-ABU', saldo: 14.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Setrika' },
  { id: 'ph-2', merek: 'PHILIPS', kode: 'PS00018', nama: 'PHILIPS SETRIKA HD 1173 CLASSIC HITAM', tipeModel: 'SETRIKA HD 1173 CLASSIC HITAM', saldo: 17.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Setrika' },
  { id: 'ph-3', merek: 'PHILIPS', kode: 'PS00108', nama: 'PHILIPS SETRIKA DST 0510 /70 DRY IRON', tipeModel: 'SETRIKA DST 0510 /70 DRY IRON', saldo: 17.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Setrika' },
  { id: 'ph-4', merek: 'PHILIPS', kode: 'PS00045', nama: 'PHILIPS SETRIKA GC 122 /37 UNGU', tipeModel: 'SETRIKA GC 122 /37 NON-STICK', saldo: 8.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Setrika' },
  { id: 'ph-5', merek: 'PHILIPS', kode: 'PS00046', nama: 'PHILIPS SETRIKA GC 122 /77 HIJAU', tipeModel: 'SETRIKA GC 122 /77 NON-STICK', saldo: 1.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Setrika' },
  { id: 'ph-6', merek: 'PHILIPS', kode: 'PS00092', nama: 'PHILIPS SETRIKA UAP GC 1418 FEATHERLIGHT PLUS', tipeModel: 'SETRIKA UAP GC 1418 FEATHERLIGHT PLUS', saldo: 3.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Setrika' },
  { id: 'ph-7', merek: 'PHILIPS', kode: 'PB00012', nama: 'PHILIPS BLENDER HR 2221 /00 2L PLASTIK LAVENDER', tipeModel: 'BLENDER HR 2221 /00 SERI 5000 2L', saldo: 12.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Blender' },
  { id: 'ph-8', merek: 'PHILIPS', kode: 'PB00015', nama: 'PHILIPS BLENDER HR 2221 /40 2L PLASTIK HIJAU', tipeModel: 'BLENDER HR 2221 /40 SERI 5000 2L', saldo: 9.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Blender' },
  { id: 'ph-9', merek: 'PHILIPS', kode: 'PB00018', nama: 'PHILIPS BLENDER HR 2222 /00 KACA 2L TABUNG GLASS', tipeModel: 'BLENDER HR 2222 /00 KACA 2L', saldo: 5.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Blender' },
  { id: 'ph-10', merek: 'PHILIPS', kode: 'PB00003', nama: 'PHILIPS BLENDER HR 2115 /00 TANGO 2L MIKA', tipeModel: 'BLENDER HR 2115 /00 TANGO 2L', saldo: 1.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Blender' },
  { id: 'ph-11', merek: 'PHILIPS', kode: 'PB00007', nama: 'PHILIPS BLENDER DAILY HR 2056 /03 PLASTIK 1.25L', tipeModel: 'BLENDER DAILY HR 2056 /03 1.25L', saldo: 6.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Blender' },
  { id: 'ph-12', merek: 'PHILIPS', kode: 'PC00010', nama: 'PHILIPS CHOPPER HR 1393 PENGGILING DAGING', tipeModel: 'CHOPPER HR 1393 MULTIFUNGSI', saldo: 4.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Blender' },
  { id: 'ph-13', merek: 'PHILIPS', kode: 'PM00150', nama: 'PHILIPS MAGIC COM HD 3003 BAKUHANSEKI 2L', tipeModel: 'MAGIC COM HD 3003 BAKUHANSEKI 2L', saldo: 12.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Magic Com' },
  { id: 'ph-14', merek: 'PHILIPS', kode: 'PM00152', nama: 'PHILIPS MAGIC COM HD 3119 /30 HIJAU 2L', tipeModel: 'MAGIC COM HD 3119 /30 BAKUHANSEKI', saldo: 8.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Magic Com' },
  { id: 'ph-15', merek: 'PHILIPS', kode: 'PM00153', nama: 'PHILIPS MAGIC COM HD 3119 /31 MERAH 2L', tipeModel: 'MAGIC COM HD 3119 /31 BAKUHANSEKI', saldo: 1.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Magic Com' },
  { id: 'ph-16', merek: 'PHILIPS', kode: 'PM00158', nama: 'PHILIPS MAGIC COM HD 3128 /33 STAINLESS STEEL 2L', tipeModel: 'MAGIC COM HD 3128 /33 STAINLESS', saldo: 4.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Magic Com' },
  { id: 'ph-17', merek: 'PHILIPS', kode: 'PM00160', nama: 'PHILIPS MAGIC COM DIGITAL HD 4515 /33 SMART 3D 1.8L', tipeModel: 'MAGIC COM DIGITAL HD 4515 SMART 3D', saldo: 3.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Magic Com' },
  { id: 'ph-18', merek: 'PHILIPS', kode: 'PX00010', nama: 'PHILIPS STAND MIXER HR 1559 DENGAN MANGKOK', tipeModel: 'STAND MIXER HR 1559', saldo: 3.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Peralatan Dapur' },
  { id: 'ph-19', merek: 'PHILIPS', kode: 'PX00012', nama: 'PHILIPS HAND MIXER HR 1552 PENGADUK ADONAN', tipeModel: 'HAND MIXER HR 1552', saldo: 5.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Peralatan Dapur' },
  { id: 'ph-20', merek: 'PHILIPS', kode: 'PA00088', nama: 'PHILIPS AIR FRYER HD 9200 /90 LOW WATT 4.1L', tipeModel: 'AIR FRYER HD 9200 /90 RAPID AIR', saldo: 2.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Peralatan Dapur' },
  { id: 'ph-21', merek: 'PHILIPS', kode: 'PH00040', nama: 'PHILIPS HAIR DRYER HP 8108 /02 COMPACT 400W', tipeModel: 'HAIR DRYER HP 8108 /02 COMPACT', saldo: 7.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Peralatan Rumah Tangga' },
  { id: 'ph-22', merek: 'PHILIPS', kode: 'PL00006', nama: 'PHILIPS LAMPU LED BULB MYCARE 6W PUTIH (COOL DAYLIGHT)', tipeModel: 'LAMPU LED BULB MYCARE 6W E27', saldo: 45.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'ph-23', merek: 'PHILIPS', kode: 'PL00008', nama: 'PHILIPS LAMPU LED BULB MYCARE 8W PUTIH (COOL DAYLIGHT)', tipeModel: 'LAMPU LED BULB MYCARE 8W E27', saldo: 60.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'ph-24', merek: 'PHILIPS', kode: 'PL00010', nama: 'PHILIPS LAMPU LED BULB MYCARE 10W PUTIH (COOL DAYLIGHT)', tipeModel: 'LAMPU LED BULB MYCARE 10W E27', saldo: 55.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'ph-25', merek: 'PHILIPS', kode: 'PL00012', nama: 'PHILIPS LAMPU LED BULB MYCARE 12W PUTIH (COOL DAYLIGHT)', tipeModel: 'LAMPU LED BULB MYCARE 12W E27', saldo: 40.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'ph-26', merek: 'PHILIPS', kode: 'PL00014', nama: 'PHILIPS LAMPU LED BULB MYCARE 14.5W PUTIH (COOL DAYLIGHT)', tipeModel: 'LAMPU LED BULB MYCARE 14.5W E27', saldo: 25.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'ph-27', merek: 'PHILIPS', kode: 'PL00019', nama: 'PHILIPS LAMPU LED BULB MYCARE 19W JUMBO PUTIH', tipeModel: 'LAMPU LED BULB MYCARE 19W JUMBO', saldo: 15.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'ph-28', merek: 'PHILIPS', kode: 'PL00030', nama: 'PHILIPS LAMPU LED SMART WIFI WIZ 9W COLOR & TUNABLE', tipeModel: 'LAMPU LED SMART WIFI WIZ 9W RGB', saldo: 4.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Alat Listrik & Lampu' },

  // ==========================================
  // === KOMPOR GAS & REGULATOR / SELANG (RINNAI, QUANTUM, WINN GAS, NIKO, STAR CAM, DESTEC) ===
  // ==========================================
  { id: 'rn-1', merek: 'RINNAI', kode: 'RK00007', nama: 'RINNAI KOMPOR GAS RI-522 C 2 TUNGKU HITAM', tipeModel: 'KOMPOR GAS RI-522 C 2 TUNGKU', saldo: 48.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kompor Gas' },
  { id: 'rn-2', merek: 'RINNAI', kode: 'RK00008', nama: 'RINNAI KOMPOR GAS RI-522 E 2 TUNGKU STAINLESS STEEL', tipeModel: 'KOMPOR GAS RI-522 E 2 TUNGKU STAINLESS', saldo: 61.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kompor Gas' },
  { id: 'rn-3', merek: 'RINNAI', kode: 'RK00009', nama: 'RINNAI KOMPOR GAS RI-522 S 2 TUNGKU SUN BURNER', tipeModel: 'KOMPOR GAS RI-522 S 2 TUNGKU SUN BURNER', saldo: 18.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kompor Gas' },
  { id: 'rn-4', merek: 'RINNAI', kode: 'RK00010', nama: 'RINNAI KOMPOR GAS RI-522 AT 2 TUNGKU DENGAN TIMER', tipeModel: 'KOMPOR GAS RI-522 AT 2 TUNGKU TIMER', saldo: 26.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kompor Gas' },
  { id: 'rn-5', merek: 'RINNAI', kode: 'RK00015', nama: 'RINNAI KOMPOR GAS RI-602 BGX 2 TUNGKU TORNADO KUNINGAN', tipeModel: 'KOMPOR GAS RI-602 BGX 2 TUNGKU TORNADO', saldo: 14.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kompor Gas' },
  { id: 'rn-6', merek: 'RINNAI', kode: 'RK00019', nama: 'RINNAI KOMPOR GAS RI-712 T 2 TUNGKU GRANDE SERIES', tipeModel: 'KOMPOR GAS RI-712 T 2 TUNGKU GRANDE', saldo: 9.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kompor Gas' },
  { id: 'rn-7', merek: 'RINNAI', kode: 'RK00001', nama: 'RINNAI KOMPOR GAS 1 TUNGKU RI-511 E STAINLESS', tipeModel: 'KOMPOR GAS RI-511 E 1 TUNGKU', saldo: 12.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kompor Gas' },
  { id: 'rn-8', merek: 'RINNAI', kode: 'RK00002', nama: 'RINNAI KOMPOR GAS 1 TUNGKU RI-511 C HITAM', tipeModel: 'KOMPOR GAS RI-511 C 1 TUNGKU', saldo: 8.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kompor Gas' },
  { id: 'rn-9', merek: 'RINNAI', kode: 'RK00004', nama: 'RINNAI KOMPOR GAS 1 TUNGKU RI-514 E + GRILL PANGGANGAN', tipeModel: 'KOMPOR GAS RI-514 E DENGAN GRILL', saldo: 1.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Kompor Gas' },
  { id: 'rn-10', merek: 'RINNAI', kode: 'RK00030', nama: 'RINNAI KOMPOR TANAM KACA RB-712 N (GB) BUILT-IN HOB 2 TUNGKU', tipeModel: 'KOMPOR TANAM RB-712 N (GB) TEMPERED GLASS', saldo: 2.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Kompor Gas' },
  { id: 'qt-1', merek: 'QUANTUM', kode: 'QK00001', nama: 'QUANTUM KOMPOR GAS QGC-201 DMPC 2 TUNGKU PEMATIK MEKANIK', tipeModel: 'KOMPOR GAS QGC-201 DMPC 2 TUNGKU', saldo: 22.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kompor Gas' },
  { id: 'qt-2', merek: 'QUANTUM', kode: 'QK00003', nama: 'QUANTUM KOMPOR GAS QGC-201 DMPB 2 TUNGKU PUTIH', tipeModel: 'KOMPOR GAS QGC-201 DMPB 2 TUNGKU', saldo: 15.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kompor Gas' },
  { id: 'qt-3', merek: 'QUANTUM', kode: 'QK00007', nama: 'QUANTUM KOMPOR GAS QGC-101 R 1 TUNGKU', tipeModel: 'KOMPOR GAS QGC-101 R 1 TUNGKU', saldo: 9.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kompor Gas' },
  { id: 'qt-4', merek: 'QUANTUM', kode: 'QR00001', nama: 'QUANTUM REGULATOR METER QRL-03 + SELANG GAS SPIRAL FLEKSIBEL', tipeModel: 'REGULATOR METER QRL-03 + SELANG GAS', saldo: 20.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Aksesoris & Gas' },
  { id: 'wg-1', merek: 'WINN GAS', kode: 'WK00001', nama: 'WINN GAS KOMPOR KACA W-888 TEMPERED GLASS 2 TUNGKU', tipeModel: 'KOMPOR KACA W-888 2 TUNGKU', saldo: 8.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kompor Gas' },
  { id: 'wg-2', merek: 'WINN GAS', kode: 'WK00002', nama: 'WINN GAS KOMPOR W-288 STAINLESS 2 TUNGKU API BIRU', tipeModel: 'KOMPOR GAS W-288 2 TUNGKU', saldo: 11.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kompor Gas' },
  { id: 'wg-3', merek: 'WINN GAS', kode: 'WK00005', nama: 'WINN GAS KOMPOR W-688 2 TUNGKU TEFLON ANTI LENGKET', tipeModel: 'KOMPOR GAS W-688 2 TUNGKU', saldo: 1.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Kompor Gas' },
  { id: 'wg-4', merek: 'WINN GAS', kode: 'WK00009', nama: 'WINN GAS KOMPOR PORTABEL W-2S / W-1B DUAL GAS KALENG & LPG', tipeModel: 'KOMPOR PORTABEL W-2S DUAL GAS', saldo: 6.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Kompor Gas' },
  { id: 'wg-5', merek: 'WINN GAS', kode: 'WR00010', nama: 'WINN GAS REGULATOR METER W-900 M PENGUNCI GANDA SAFETY LOCK', tipeModel: 'REGULATOR METER W-900 M DOUBLE LOCK', saldo: 25.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Aksesoris & Gas' },
  { id: 'wg-6', merek: 'WINN GAS', kode: 'WR00012', nama: 'WINN GAS REGULATOR METER W-26 M + SELANG GAS SPIRAL 1.8M', tipeModel: 'REGULATOR SET W-26 M + SELANG SPIRAL', saldo: 30.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Aksesoris & Gas' },
  { id: 'sc-1', merek: 'STAR CAM', kode: 'SR00001', nama: 'STAR CAM REGULATOR GAS TEKANAN RENDAH SC-23 METER (DESTEC JINJING)', tipeModel: 'REGULATOR SC-23 M DENGAN METER', saldo: 18.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Aksesoris & Gas' },
  { id: 'sc-2', merek: 'STAR CAM', kode: 'SR00002', nama: 'STAR CAM REGULATOR GAS NON METER SC-23 S SISTEM PUTAR JINJING', tipeModel: 'REGULATOR SC-23 S NON METER', saldo: 12.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Aksesoris & Gas' },
  { id: 'nk-1', merek: 'NIKO', kode: 'NK00001', nama: 'NIKO KOMPOR KACA REFLECTION BLACK 2 TUNGKU TEMPERED GLASS', tipeModel: 'KOMPOR KACA REFLECTION 2 TUNGKU', saldo: 7.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kompor Gas' },
  { id: 'nk-2', merek: 'NIKO', kode: 'NK00003', nama: 'NIKO KOMPOR GAS NK-777 2 TUNGKU STAINLESS', tipeModel: 'KOMPOR GAS NK-777 2 TUNGKU', saldo: 5.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kompor Gas' },

  // ==========================================
  // === ALAT LISTRIK, LAMPU, STOP KONTAK, KABEL (BROCO, UTICON, HANNOCHS, LUBY) ===
  // ==========================================
  { id: 'hn-1', merek: 'HANNOCHS', kode: 'HL00009', nama: 'HANNOCHS LAMPU LED PREMIER 9W PUTIH (COOL DAYLIGHT)', tipeModel: 'LAMPU LED PREMIER 9W', saldo: 40.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'hn-2', merek: 'HANNOCHS', kode: 'HL00012', nama: 'HANNOCHS LAMPU LED PREMIER 12W PUTIH (COOL DAYLIGHT)', tipeModel: 'LAMPU LED PREMIER 12W', saldo: 35.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'hn-3', merek: 'HANNOCHS', kode: 'HL00015', nama: 'HANNOCHS LAMPU LED VARIO 18W PUTIH TERANG', tipeModel: 'LAMPU LED VARIO 18W', saldo: 20.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'hn-4', merek: 'HANNOCHS', kode: 'HL00020', nama: 'HANNOCHS LAMPU LED GENIUS EMERGENCY 10W BISA MENYALA SAAT MATI LAMPU', tipeModel: 'LAMPU EMERGENCY LED GENIUS 10W AC/DC', saldo: 15.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'hn-5', merek: 'HANNOCHS', kode: 'HL00025', nama: 'HANNOCHS LAMPU LED GENIUS EMERGENCY 15W BISA MENYALA SAAT MATI LAMPU', tipeModel: 'LAMPU EMERGENCY LED GENIUS 15W AC/DC', saldo: 1.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Alat Listrik & Lampu' },
  { id: 'lb-1', merek: 'LUBY', kode: 'LL00001', nama: 'LUBY RAKET NYAMUK CAS RL-5612 PLUS SENTER LED COB', tipeModel: 'RAKET NYAMUK RECHARGEABLE RL-5612', saldo: 24.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Aksesoris & Listrik' },
  { id: 'lb-2', merek: 'LUBY', kode: 'LL00005', nama: 'LUBY SENTER KEPALA LED CAS 10W WATERPROOF L-2882', tipeModel: 'SENTER KEPALA LED 10W L-2882', saldo: 16.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Aksesoris & Listrik' },
  { id: 'lb-3', merek: 'LUBY', kode: 'LL00010', nama: 'LUBY LAMPU EMERGENCY SURYA / LUBY LED MEJA GANTUNG 24 SMD', tipeModel: 'LAMPU EMERGENCY MEJA 24 SMD', saldo: 8.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Aksesoris & Listrik' },
  { id: 'br-1', merek: 'BROCO', kode: 'BS00001', nama: 'BROCO STOP KONTAK 3 LUBANG KABEL 3 METER ARDE (SERI GALLEO)', tipeModel: 'STOP KONTAK 3 LUBANG 3M ARDE', saldo: 18.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'br-2', merek: 'BROCO', kode: 'BS00002', nama: 'BROCO STOP KONTAK 4 LUBANG KABEL 5 METER ARDE SWITCH ON-OFF', tipeModel: 'STOP KONTAK 4 LUBANG 5M SWITCH', saldo: 12.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'br-3', merek: 'BROCO', kode: 'BS00003', nama: 'BROCO STOP KONTAK 5 LUBANG KABEL 5 METER ARDE', tipeModel: 'STOP KONTAK 5 LUBANG 5M ARDE', saldo: 10.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'br-4', merek: 'BROCO', kode: 'BS00004', nama: 'BROCO STEKER ARDE BENGKOK / LURUS PUTIH 13310', tipeModel: 'STEKER ARDE 16A 250V', saldo: 50.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'br-5', merek: 'BROCO', kode: 'BS00005', nama: 'BROCO STEKER T MULTI 3 ARAH ARDE 13830', tipeModel: 'STEKER T CABANG 3 ARDE', saldo: 35.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'br-6', merek: 'BROCO', kode: 'BS00006', nama: 'BROCO SAKLAR TUNGGAL ENGKEL TEMPEL / TANAM NEW GEE', tipeModel: 'SAKLAR TUNGGAL NEW GEE', saldo: 40.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'br-7', merek: 'BROCO', kode: 'BS00007', nama: 'BROCO SAKLAR SERI DOUBLE GANDA NEW GEE', tipeModel: 'SAKLAR DOUBLE SERI NEW GEE', saldo: 30.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'br-8', merek: 'BROCO', kode: 'BS00008', nama: 'BROCO FITTING LAMPU PLAFON HITAM / PUTIH SEGI E27', tipeModel: 'FITTING PLAFON E27 BROCO', saldo: 60.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'ut-1', merek: 'UTICON', kode: 'US00001', nama: 'UTICON KABEL ROLL 10 METER STOP KONTAK GULUNG CR-2810', tipeModel: 'KABEL ROLL 10 METER CR-2810', saldo: 8.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },
  { id: 'ut-2', merek: 'UTICON', kode: 'US00002', nama: 'UTICON KABEL ROLL 15 METER STOP KONTAK GULUNG CR-2815', tipeModel: 'KABEL ROLL 15 METER CR-2815', saldo: 1.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Alat Listrik & Lampu' },
  { id: 'ut-3', merek: 'UTICON', kode: 'US00003', nama: 'UTICON STEKER T-ARDE 3 WAY MULTI PLUG SC-382', tipeModel: 'STEKER T-ARDE SC-382', saldo: 28.0, gudang: 'GL001 [ LISTRIK ]', gudangCode: 'GL001', category: 'Alat Listrik & Lampu' },

  // ==========================================
  // === AKSESORIS TV & AUDIO (BRAKET TV, ANTENA DIGITAL, REMOTE, KABEL HDMI, KABEL AUDIO) ===
  // ==========================================
  { id: 'ak-1', merek: 'AQUA', kode: 'AB00010', nama: 'AQUA BRAKET TV LED 17-43 INCH UNIVERSAL TILT', tipeModel: 'BRAKET TV LED 17-43"', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Aksesoris & Bracket TV' },
  { id: 'ak-2', merek: 'AQUA', kode: 'AB00011', nama: 'AQUA BRAKET TV LED 44-75 INCH UNIVERSAL TILT HEAVY DUTY', tipeModel: 'BRAKET TV LED 44-75"', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Aksesoris & Bracket TV' },
  { id: 'ak-3', merek: 'UNIVERSAL', kode: 'UB00012', nama: 'UNIVERSAL BRAKET TV SWIVEL FLEKSIBEL BELOK 14-43 INCH', tipeModel: 'BRAKET TV SWIVEL BELOK 14-43"', saldo: 6.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris & Bracket TV' },
  { id: 'ak-4', merek: 'SANEX', kode: 'SA00001', nama: 'SANEX ANTENA TV DIGITAL OUTDOOR / INDOOR SN-779 WITH BOOSTER & KABEL 10M', tipeModel: 'ANTENA DIGITAL SN-779 + BOOSTER', saldo: 14.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris TV & Antena' },
  { id: 'ak-5', merek: 'TANAKA', kode: 'TA00001', nama: 'TANAKA ANTENA DIGITAL OUTDOOR ALUMINIUM T2 HIGH GAIN', tipeModel: 'ANTENA DIGITAL OUTDOOR T2', saldo: 10.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris TV & Antena' },
  { id: 'ak-6', merek: 'TOYOSAKI', kode: 'TA00002', nama: 'TOYOSAKI ANTENA TV DIGITAL OUTDOOR BOOSTER SMART AIO-220', tipeModel: 'ANTENA SMART BOOSTER AIO-220', saldo: 8.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris TV & Antena' },
  { id: 'ak-7', merek: 'UNIVERSAL', kode: 'UK00001', nama: 'KABEL HDMI KE HDMI HIGH SPEED 4K PANJANG 1.5 METER', tipeModel: 'KABEL HDMI 1.5 METER 4K', saldo: 25.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris TV & Kabel' },
  { id: 'ak-8', merek: 'UNIVERSAL', kode: 'UK00002', nama: 'KABEL HDMI KE HDMI HIGH SPEED 4K PANJANG 3 METER', tipeModel: 'KABEL HDMI 3 METER 4K', saldo: 15.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris TV & Kabel' },
  { id: 'ak-9', merek: 'UNIVERSAL', kode: 'UK00003', nama: 'KABEL AUDIO AUX JACK 3.5MM TO RCA 2 PIN STEREO 1.5M', tipeModel: 'KABEL AUDIO AUX 3.5MM TO RCA 1.5M', saldo: 30.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris Audio' },
  { id: 'ak-10', merek: 'CHUNGHOP', kode: 'CR00001', nama: 'CHUNGHOP REMOTE TV UNIVERSAL LCD / LED TABUNG L-1080', tipeModel: 'REMOTE TV UNIVERSAL L-1080', saldo: 18.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris TV & Remote' },
  { id: 'ak-11', merek: 'JOKER', kode: 'JR00001', nama: 'JOKER REMOTE TV MULTI DIGITAL RECEIVER / SET TOP BOX DVB-T2', tipeModel: 'REMOTE SET TOP BOX DVB-T2 JOKER', saldo: 12.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris TV & Remote' },
  { id: 'ak-12', merek: 'ABC', kode: 'AB00001', nama: 'ABC BATERAI ALKALINE AA ISI 2 PCS (BATERAI JAM & REMOTE)', tipeModel: 'BATERAI ALKALINE AA 2S', saldo: 80.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Baterai & Aksesoris' },
  { id: 'ak-13', merek: 'ABC', kode: 'AB00002', nama: 'ABC BATERAI ALKALINE AAA ISI 2 PCS (BATERAI REMOTE TV / AC)', tipeModel: 'BATERAI ALKALINE AAA 2S', saldo: 95.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Baterai & Aksesoris' },

  // ==========================================
  // === AKSESORIS GADGET, HP & KOMPUTER (ROBOT, V-GEN, SANDISK, OASE, ADVAN) ===
  // ==========================================
  { id: 'rb-1', merek: 'ROBOT', kode: 'RP00001', nama: 'ROBOT POWERBANK RT180 10.000 MAH DUAL OUTPUT FAST CHARGE', tipeModel: 'POWERBANK RT180 10000MAH', saldo: 14.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris HP & Gadget' },
  { id: 'rb-2', merek: 'ROBOT', kode: 'RP00002', nama: 'ROBOT POWERBANK RT190 10.000 MAH SLIM DESIGN LED INDICATOR', tipeModel: 'POWERBANK RT190 10000MAH SLIM', saldo: 8.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris HP & Gadget' },
  { id: 'rb-3', merek: 'ROBOT', kode: 'RT00001', nama: 'ROBOT TWS AIRBUDS T10 HEADSET BLUETOOTH WIRELESS EARPHONE', tipeModel: 'TWS AIRBUDS T10 BLUETOOTH', saldo: 12.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris HP & Gadget' },
  { id: 'rb-4', merek: 'ROBOT', kode: 'RT00002', nama: 'ROBOT TWS AIRBUDS T20 BLUETOOTH 5.3 WATERPROOF BASS EARPHONE', tipeModel: 'TWS AIRBUDS T20 IPX4', saldo: 9.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris HP & Gadget' },
  { id: 'rb-5', merek: 'ROBOT', kode: 'RK00001', nama: 'ROBOT KABEL DATA FAST CHARGING TYPE C TO USB RT-CH100 1M', tipeModel: 'KABEL TYPE-C RT-CH100 1 METER', saldo: 35.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris HP & Kabel' },
  { id: 'rb-6', merek: 'ROBOT', kode: 'RK00002', nama: 'ROBOT KABEL DATA MICRO USB FAST CHARGE RT-M100 1M', tipeModel: 'KABEL MICRO USB RT-M100 1 METER', saldo: 40.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris HP & Kabel' },
  { id: 'rb-7', merek: 'ROBOT', kode: 'RK00003', nama: 'ROBOT KABEL DATA TYPE C TO TYPE C PD 60W RT-CC100', tipeModel: 'KABEL TYPE-C TO TYPE-C 60W', saldo: 15.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris HP & Kabel' },
  { id: 'rb-8', merek: 'ROBOT', kode: 'RC00001', nama: 'ROBOT CHARGER ADAPTOR + KABEL TYPE C RT-K4 2.4A FAST CHARGING', tipeModel: 'CHARGER SET RT-K4 TYPE-C', saldo: 20.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris HP & Gadget' },
  { id: 'vg-1', merek: 'V-GEN', kode: 'VM00032', nama: 'V-GEN MEMORY CARD MICROSD HYPER SERIES CLASS 10 32GB', tipeModel: 'MICROSD HYPER 32GB CLASS 10', saldo: 25.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris & Memory' },
  { id: 'vg-2', merek: 'V-GEN', kode: 'VM00064', nama: 'V-GEN MEMORY CARD MICROSD TURBO SERIES CLASS 10 64GB U3', tipeModel: 'MICROSD TURBO 64GB CLASS 10 U3', saldo: 18.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris & Memory' },
  { id: 'vg-3', merek: 'V-GEN', kode: 'VF00032', nama: 'V-GEN FLASHDISK ASTRO USB 2.0 / 3.0 KAPASITAS 32GB', tipeModel: 'FLASHDISK ASTRO 32GB', saldo: 20.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris & Memory' },
  { id: 'vg-4', merek: 'V-GEN', kode: 'VF00064', nama: 'V-GEN FLASHDISK ATOM USB 3.0 KAPASITAS 64GB', tipeModel: 'FLASHDISK ATOM 64GB USB 3.0', saldo: 1.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris & Memory' },
  { id: 'sd-1', merek: 'SANDISK', kode: 'SF00032', nama: 'SANDISK FLASHDISK CRUZER BLADE CZ50 32GB ORIGINAL', tipeModel: 'FLASHDISK CRUZER BLADE 32GB', saldo: 30.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris & Memory' },
  { id: 'sd-2', merek: 'SANDISK', kode: 'SF00064', nama: 'SANDISK FLASHDISK ULTRA DUAL DRIVE TYPE-C OTG 64GB USB 3.1', tipeModel: 'FLASHDISK DUAL TYPE-C OTG 64GB', saldo: 10.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris & Memory' },
  { id: 'oa-1', merek: 'OASE', kode: 'OH00001', nama: 'OASE TRIPOD BLUETOOTH SELFIE STICK TONGSIS DENGAN WIRELESS REMOTE', tipeModel: 'TONGSIS TRIPOD WIRELESS BLUETOOTH', saldo: 7.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris HP & Gadget' },
  { id: 'oa-2', merek: 'OASE', kode: 'OH00002', nama: 'OASE PHONE HOLDER MOTOR WATERPROOF ANTI HUJAN & GUNCANGAN', tipeModel: 'HOLDER HP MOTOR WATERPROOF', saldo: 11.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Aksesoris HP & Gadget' },

  // ==========================================
  // === KULKAS (AQUA, SHARP, POLYTRON, LG, SAMSUNG) ===
  // ==========================================
  { id: 'inv-10', merek: 'AQUA', kode: 'AK00113', nama: 'AQUA KULKAS AQR-D185 MBE 1 PINTU', tipeModel: 'KULKAS AQR-D185 MBE 1 PINTU', saldo: 4.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-11', merek: 'AQUA', kode: 'AK00115', nama: 'AQUA KULKAS AQR-D185 MME 1 PINTU', tipeModel: 'KULKAS AQR-D185 MME 1 PINTU', saldo: 4.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-12', merek: 'AQUA', kode: 'AK00061', nama: 'AQUA KULKAS AQR-D205 MDS 1 PINTU', tipeModel: 'KULKAS AQR-D205 MDS 1 PINTU', saldo: 4.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-13', merek: 'AQUA', kode: 'AK00058', nama: 'AQUA KULKAS AQR-D225 MDS 2 PINTU', tipeModel: 'KULKAS AQR-D225 MDS 2 PINTU', saldo: 6.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-14', merek: 'AQUA', kode: 'AK00114', nama: 'AQUA KULKAS AQR-D225 MME 2 PINTU', tipeModel: 'KULKAS AQR-D225 MME 2 PINTU', saldo: 4.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-15', merek: 'AQUA', kode: 'AK00108', nama: 'AQUA KULKAS AQR-D225 MPE 2 PINTU', tipeModel: 'KULKAS AQR-D225 MPE 2 PINTU', saldo: 4.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-16', merek: 'AQUA', kode: 'AK00120', nama: 'AQUA KULKAS AQR-DTM 248 CB 2 PINTU', tipeModel: 'KULKAS AQR-DTM 248 CB 2 PINTU', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-17', merek: 'AQUA', kode: 'AK00122', nama: 'AQUA KULKAS AQR-DTM 288 CB 2 PINTU', tipeModel: 'KULKAS AQR-DTM 288 CB 2 PINTU', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-76', merek: 'POLYTRON', kode: 'PK00189', nama: 'POLYTRON KULKAS PRA 15 CRX / CMS 1 PINTU', tipeModel: 'KULKAS PRA 15 CRX / CMS 1 PINTU', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-77', merek: 'POLYTRON', kode: 'PK00201', nama: 'POLYTRON KULKAS PRA 17 CRX / CMS 1 PINTU', tipeModel: 'KULKAS PRA 17 CRX / CMS 1 PINTU', saldo: 3.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-78', merek: 'POLYTRON', kode: 'PK00215', nama: 'POLYTRON KULKAS PRA 17 DMY 1 PINTU', tipeModel: 'KULKAS PRA 17 DMY 1 PINTU', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-79', merek: 'POLYTRON', kode: 'PK00262', nama: 'POLYTRON KULKAS PRA 18 DRD 1 PINTU', tipeModel: 'KULKAS PRA 18 DRD 1 PINTU', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-80', merek: 'POLYTRON', kode: 'PK00113', nama: 'POLYTRON KULKAS PRA 18 MNX 1 PINTU METALLIC', tipeModel: 'KULKAS PRA 18 MNX 1 PINTU METALLIC', saldo: 4.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-81', merek: 'POLYTRON', kode: 'PK00141', nama: 'POLYTRON KULKAS PRB 157 PR/LB 1 PINTU BELLEZA', tipeModel: 'KULKAS PRB 157 PR/LB 1 PINTU BELLEZA', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-84', merek: 'POLYTRON', kode: 'PK00140', nama: 'POLYTRON KULKAS PRB 187 PR/LB 1 PINTU BELLEZA', tipeModel: 'KULKAS PRB 187 PR/LB 1 PINTU BELLEZA', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-85', merek: 'POLYTRON', kode: 'PK00150', nama: 'POLYTRON KULKAS PRB 237 PR/LB 2 PINTU BELLEZA', tipeModel: 'KULKAS PRB 237 PR/LB 2 PINTU BELLEZA', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-86', merek: 'POLYTRON', kode: 'PK00100', nama: 'POLYTRON KULKAS MINI PORTABLE PRH 51 W/R (MEJA)', tipeModel: 'KULKAS MINI PORTABLE PRH 51 W/R', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-88', merek: 'POLYTRON', kode: 'PK00112', nama: 'POLYTRON KULKAS PRW 23 VX 2 PINTU INVERTER', tipeModel: 'KULKAS PRW 23 VX 2 PINTU INVERTER', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-89', merek: 'POLYTRON', kode: 'PK00149', nama: 'POLYTRON KULKAS PRW 29 MOB 2 PINTU INVERTER', tipeModel: 'KULKAS PRW 29 MOB 2 PINTU INVERTER', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-122', merek: 'SHARP', kode: 'SK00191', nama: 'SHARP KULKAS SJN 183 NHS 1 PINTU KIREI', tipeModel: 'KULKAS SJN 183 NHS 1 PINTU KIREI', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-123', merek: 'SHARP', kode: 'SK00192', nama: 'SHARP KULKAS SJX 168 MG 1 PINTU SHINE SERIES', tipeModel: 'KULKAS SJX 168 MG 1 PINTU SHINE SERIES', saldo: 4.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-52', merek: 'LG', kode: 'LK00077', nama: 'LG KULKAS 202 SFIF 2 PINTU SMART INVERTER', tipeModel: 'KULKAS 202 SFIF 2 PINTU INVERTER', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-55', merek: 'LG', kode: 'LK00075', nama: 'LG KULKAS GNY 201 CLS 1 PINTU DIRECT COOLING', tipeModel: 'KULKAS GNY 201 CLS 1 PINTU', saldo: 3.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },
  { id: 'inv-101', merek: 'SAMSUNG', kode: 'SK00065', nama: 'SAMSUNG KULKAS 19M 300BGSSE 1 PINTU COOL PACK', tipeModel: 'KULKAS 19M 300BGSSE 1 PINTU', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kulkas' },

  // ==========================================
  // === MESIN CUCI (AQUA, SHARP, POLYTRON, LG, SANKEN, PANASONIC) ===
  // ==========================================
  { id: 'inv-18', merek: 'AQUA', kode: 'AM00032', nama: 'AQUA MESIN CUCI AQW 77 DH 1 TABUNG TOP LOADING 7KG', tipeModel: 'MESIN CUCI AQW 77 DH 1 TABUNG TOP LOADING', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-19', merek: 'AQUA', kode: 'AM00098', nama: 'AQUA MESIN CUCI QW 7011 HT 2 TABUNG 7KG', tipeModel: 'MESIN CUCI QW 7011 HT 2 TABUNG', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-20', merek: 'AQUA', kode: 'AM00092', nama: 'AQUA MESIN CUCI QW 8031 HT 2 TABUNG 8KG', tipeModel: 'MESIN CUCI QW 8031 HT 2 TABUNG', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-22', merek: 'AQUA', kode: 'AM00093', nama: 'AQUA MESIN CUCI QW 9031 HT 2 TABUNG 9KG', tipeModel: 'MESIN CUCI QW 9031 HT 2 TABUNG', saldo: 3.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-56', merek: 'LG', kode: 'LM00059', nama: 'LG MESIN CUCI 2109 NBTM 1 TABUNG TOP LOADING SMART INVERTER 9KG', tipeModel: 'MESIN CUCI 2109 NBTM 1 TABUNG 9KG', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-58', merek: 'LG', kode: 'LM00054', nama: 'LG MESIN CUCI FB 1207 S 6 W FRONT LOADING 7KG', tipeModel: 'MESIN CUCI FB 1207 S 6 W FRONT LOADING', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-59', merek: 'LG', kode: 'LM00026', nama: 'LG MESIN CUCI P 7000 N 2 TABUNG 7KG', tipeModel: 'MESIN CUCI P 7000 N 2 TABUNG 7KG', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-60', merek: 'LG', kode: 'LM00023', nama: 'LG MESIN CUCI P 9050 RTB 2 TABUNG ROLLER JET 9KG', tipeModel: 'MESIN CUCI P 9050 RTB 2 TABUNG 9KG', saldo: 3.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-90', merek: 'POLYTRON', kode: 'PM00118', nama: 'POLYTRON MESIN CUCI 7073 2 TABUNG 7KG PRIMA', tipeModel: 'MESIN CUCI 7073 2 TABUNG 7KG PRIMA', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-91', merek: 'POLYTRON', kode: 'PM00142', nama: 'POLYTRON MESIN CUCI 8029 Y/TE 2 TABUNG 8KG', tipeModel: 'MESIN CUCI 8029 Y/TE 2 TABUNG 8KG', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-92', merek: 'POLYTRON', kode: 'PM00163', nama: 'POLYTRON MESIN CUCI PWM 1081 2 TABUNG 10KG', tipeModel: 'MESIN CUCI PWM 1081 2 TABUNG 10KG', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-106', merek: 'SANKEN', kode: 'SM00048', nama: 'SANKEN MESIN CUCI TW 1125 CF 2 TABUNG 10KG', tipeModel: 'MESIN CUCI TW 1125 CF 2 TABUNG 10KG', saldo: 5.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-107', merek: 'SANKEN', kode: 'SM00038', nama: 'SANKEN MESIN CUCI TW 1127 GSL 2 TABUNG 10KG', tipeModel: 'MESIN CUCI TW 1127 GSL 2 TABUNG 10KG', saldo: 3.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-111', merek: 'SANKEN', kode: 'SM00035', nama: 'SANKEN MESIN CUCI TW 8827 EGY 2 TABUNG 8KG', tipeModel: 'MESIN CUCI TW 8827 EGY 2 TABUNG 8KG', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-124', merek: 'SHARP', kode: 'SM00087', nama: 'SHARP MESIN CUCI 65 NT 2 TABUNG 6.5KG', tipeModel: 'MESIN CUCI 65 NT 2 TABUNG 6.5KG', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-125', merek: 'SHARP', kode: 'SM00133', nama: 'SHARP MESIN CUCI 70MW 2 TABUNG 7KG AQUAMAGIC', tipeModel: 'MESIN CUCI 70MW 2 TABUNG 7KG AQUAMAGIC', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-126', merek: 'SHARP', kode: 'SM00051', nama: 'SHARP MESIN CUCI 75 NT 2 TABUNG 7.5KG', tipeModel: 'MESIN CUCI 75 NT 2 TABUNG 7.5KG', saldo: 4.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-127', merek: 'SHARP', kode: 'SM00098', nama: 'SHARP MESIN CUCI 8000T 1 TABUNG TOP LOADING 8KG', tipeModel: 'MESIN CUCI 8000T 1 TABUNG TOP LOADING 8KG', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },

  // ==========================================
  // === TV LED & SMART TV (POLYTRON, XIAOMI, TCL, AQUA, LG, SAMSUNG) ===
  // ==========================================
  { id: 'inv-23', merek: 'AQUA', kode: 'AT00057', nama: 'AQUA TV LED AQT 32A80GX GOOGLE TV 32 INCH', tipeModel: 'TV LED AQT 32A80GX GOOGLE TV 32"', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'TV' },
  { id: 'inv-24', merek: 'AQUA', kode: 'AT00053', nama: 'AQUA TV LED AQT 43K85FUX 4K UHD GOOGLE TV 43 INCH', tipeModel: 'TV LED AQT 43K85FUX 43" 4K', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'TV' },
  { id: 'inv-63', merek: 'LG', kode: 'LT00077', nama: 'LG TV LED 32LB 655 BPSA 32 INCH SMART TV', tipeModel: 'TV LED 32LB 655 BPSA 32" SMART', saldo: 4.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'TV' },
  { id: 'inv-97', merek: 'POLYTRON', kode: 'PT00124', nama: 'POLYTRON TV LED 24V1853 DIGITAL 24 INCH', tipeModel: 'TV LED 24V1853 DIGITAL 24"', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'TV' },
  { id: 'inv-98', merek: 'POLYTRON', kode: 'PT00189', nama: 'POLYTRON TV LED 32TC1865 DIGITAL CINEMAX TOWER SPEAKER 32 INCH', tipeModel: 'TV LED 32TC1865 CINEMAX 32"', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'TV' },
  { id: 'inv-99', merek: 'POLYTRON', kode: 'PT00190', nama: 'POLYTRON TV LED 43TG5055 GOOGLE TV + SPEAKER TOWER 43 INCH', tipeModel: 'TV LED 43TG5055 GOOGLE TV 43"', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'TV' },
  { id: 'inv-100', merek: 'POLYTRON', kode: 'PT00198', nama: 'POLYTRON TV LED 50BUG3058 4K GOOGLE TV 50 INCH + SUBWOOFER', tipeModel: 'TV LED 50BUG3058 GOOGLE TV 50"', saldo: 3.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'TV' },
  { id: 'inv-102', merek: 'SAMSUNG', kode: 'ST00208', nama: 'SAMSUNG TV LED UA 32 H 5000 DIGITAL CLEAN VIEW 32 INCH', tipeModel: 'TV LED UA 32 H 5000 DIGITAL 32"', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'TV' },
  { id: 'inv-132', merek: 'TCL', kode: 'TT00096', nama: 'TCL TV LED 32S 5K QLED GOOGLE TV 32 INCH BEZEL-LESS', tipeModel: 'TV LED 32S 5K QLED GOOGLE TV 32"', saldo: 16.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'TV' },
  { id: 'inv-134', merek: 'TCL', kode: 'TT00098', nama: 'TCL TV LED 40S5K QLED GOOGLE TV FULL HD 40 INCH', tipeModel: 'TV LED 40S5K QLED GOOGLE TV 40"', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'TV' },
  { id: 'inv-135', merek: 'TCL', kode: 'TT00097', nama: 'TCL TV LED 43S 5K QLED 4K GOOGLE TV 43 INCH', tipeModel: 'TV LED 43S 5K QLED GOOGLE TV 43"', saldo: 3.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'TV' },
  { id: 'inv-136', merek: 'XIAOMI', kode: 'XT00055', nama: 'XIAOMI TV LED 32 A PRO 2026 QLED GOOGLE TV 32 INCH', tipeModel: 'TV LED 32 A PRO 2026 QLED 32"', saldo: 11.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'TV' },

  // ==========================================
  // === AC / AIR CONDITIONER (DAIKIN, GREE, SHARP, PANASONIC, LG, POLYTRON, TCL, FLIFE) ===
  // ==========================================
  { id: 'inv-5', merek: 'AQUA', kode: 'AA00033', nama: 'AQUA AC AQA-KCR 9 FQAL/FQAL2 1PK STANDART R32', tipeModel: 'AC AQA-KCR 9 FQAL 1PK', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'AC' },
  { id: 'inv-26', merek: 'DAIKIN', kode: 'DA00047', nama: 'DAIKIN AC STC 15YV14 0.5PK STANDART R32 THAILAND', tipeModel: 'AC STC 15YV14 0,5PK STANDART', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'AC' },
  { id: 'inv-27', merek: 'DAIKIN', kode: 'DA00041', nama: 'DAIKIN AC STC 25YV14 1PK STANDART R32 THAILAND', tipeModel: 'AC STC 25YV14 1PK STANDART', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'AC' },
  { id: 'inv-29', merek: 'DAIKIN', kode: 'DA00045', nama: 'DAIKIN AC STKE 25YV 1PK INVERTER FLASH INVERTER', tipeModel: 'AC STKE 25YV 1PK INVERTER', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'AC' },
  { id: 'inv-39', merek: 'GREE', kode: 'GA00002', nama: 'GREE AC 05C3E/S 0.5PK LOW WATT MOO5 STANDART R32', tipeModel: 'AC 05C3E/S LOW 0,5PK R32', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'AC' },
  { id: 'inv-40', merek: 'GREE', kode: 'GA00034', nama: 'GREE AC 05F5S 0.5PK INVERTER F5S SERIES', tipeModel: 'AC 05F5S INVERTER 0,5PK', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'AC' },
  { id: 'inv-41', merek: 'GREE', kode: 'GA00044', nama: 'GREE AC 05N1A STANDART 0.5PK FAST COOLING', tipeModel: 'AC 05N1A STANDART 0,5PK', saldo: 3.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'AC' },
  { id: 'inv-44', merek: 'GREE', kode: 'GA00026', nama: 'GREE AC PORTABLE 09P1 1PK PORTABLE AC', tipeModel: 'AC 09P1 PORTABLE 1PK', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'AC' },
  { id: 'inv-66', merek: 'PANASONIC', kode: 'PA00060', nama: 'PANASONIC AC CS-DN9 CKJ S 1PK INVERTER SI-BIRU', tipeModel: 'AC CS-DN9 CKJ S 1PK INVERTER', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'AC' },
  { id: 'inv-73', merek: 'POLYTRON', kode: 'PA00030', nama: 'POLYTRON AC 05 VH 0.5PK NEUVA ICE FAST COOL', tipeModel: 'AC 05 VH 0,5PK NEUVA ICE', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'AC' },
  { id: 'inv-118', merek: 'SHARP', kode: 'SA00067', nama: 'SHARP AC 05 BEY / BEY2 0.5PK TURBO COOL STANDART', tipeModel: 'AC 05 BEY / BEY2 STD 0,5PK', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'AC' },
  { id: 'inv-120', merek: 'SHARP', kode: 'SA00085', nama: 'SHARP AC AH AP5 BMY2 PLASMACLUSTER 0.5PK UDARA BERSIH', tipeModel: 'AC AH AP5 BMY2 PLASMACLUSTER 0,5PK', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'AC' },
  { id: 'inv-121', merek: 'SHARP', kode: 'SA00078', nama: 'SHARP AC AH X10 BEY J-TECH INVERTER 1PK ECO INVERTER', tipeModel: 'AC AH X10 BEY INVERTER 1PK', saldo: 4.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'AC' },
  { id: 'inv-129', merek: 'TCL', kode: 'TA00019', nama: 'TCL AC 05CSD XS2/XSS 0.5PK FAST COOL STANDART', tipeModel: 'AC 05CSD XS2/XSS 0,5PK', saldo: 3.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'AC' },

  // ==========================================
  // === FREEZER & SHOWCASE (RSA, GEA, TCL, AQUA) ===
  // ==========================================
  { id: 'inv-rsa-1', merek: 'RSA', kode: 'RF00009', nama: 'RSA FREEZER BOX CF 110', tipeModel: 'FREEZER BOX CF 110 100L', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Freezer / Showcase' },
  { id: 'inv-rsa-2', merek: 'RSA', kode: 'RF00008', nama: 'RSA FREEZER BOX CF 1200', tipeModel: 'FREEZER BOX CF 1200 JUMBO', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Freezer / Showcase' },
  { id: 'inv-rsa-3', merek: 'RSA', kode: 'RF00010', nama: 'RSA FREEZER BOX CF 210', tipeModel: 'FREEZER BOX CF 210 200L', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Freezer / Showcase' },
  { id: 'inv-rsa-4', merek: 'RSA', kode: 'RF00011', nama: 'RSA FREEZER BOX CF 310', tipeModel: 'FREEZER BOX CF 310 300L', saldo: 3.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Freezer / Showcase' },
  { id: 'inv-rsa-5', merek: 'RSA', kode: 'RJ00001', nama: 'RSA JUICER HAND WM-1078', tipeModel: 'JUICER HAND WM-1078', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Blender & Chopper' },
  { id: 'inv-rsa-6', merek: 'RSA', kode: 'RM00039', nama: 'RSA MESIN CUCI WM TT-100', tipeModel: 'MESIN CUCI WM TT-100 2 TABUNG', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Mesin Cuci' },
  { id: 'inv-9', merek: 'AQUA', kode: 'AF00042', nama: 'AQUA FREEZER AQF 260 DS 200 LITER CHEST FREEZER', tipeModel: 'FREEZER AQF 260 DS 200L', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Freezer / Showcase' },
  { id: 'inv-32', merek: 'GEA', kode: 'GF00018', nama: 'GEA FREEZER BOX AB 108 R 100 LITER', tipeModel: 'FREEZER BOX AB 108 R 100L', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Freezer / Showcase' },
  { id: 'inv-33', merek: 'GEA', kode: 'GF00004', nama: 'GEA FREEZER BOX AB 1200 JUMBO 1000 LITER 2 PINTU', tipeModel: 'FREEZER BOX AB 1200 JUMBO', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Freezer / Showcase' },
  { id: 'inv-34', merek: 'GEA', kode: 'GF00013', nama: 'GEA FREEZER BOX AB 208 R 200 LITER', tipeModel: 'FREEZER BOX AB 208 R 200L', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Freezer / Showcase' },
  { id: 'inv-35', merek: 'GEA', kode: 'GF00027', nama: 'GEA FREEZER BOX AB 318 R 300 LITER', tipeModel: 'FREEZER BOX AB 318 R 300L', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Freezer / Showcase' },
  { id: 'inv-37', merek: 'GEA', kode: 'GS00027', nama: 'GEA SHOWCASE EXPO 26FC/FR DISPLAY PENDINGIN MINUMAN', tipeModel: 'SHOWCASE EXPO 26FC/FR', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Freezer / Showcase' },
  { id: 'inv-38', merek: 'GEA', kode: 'GS00026', nama: 'GEA SHOWCASE EXPO 30FC/FR 4 RAK KACA ANTI EMBUN', tipeModel: 'SHOWCASE EXPO 30FC/FR', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Freezer / Showcase' },
  { id: 'inv-131', merek: 'TCL', kode: 'TF00012', nama: 'TCL FREEZER TCF-100 ZID 100 LITER WHITE', tipeModel: 'FREEZER TCF-100 ZID 100L', saldo: 3.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Freezer / Showcase' },

  // ==========================================
  // === SEPEDA LISTRIK & HELM (GODA, PACIFIC, UWINFLY, AGATHOS, YADEA) ===
  // ==========================================
  { id: 'inv-3', merek: 'MEGA', kode: 'MH00038', nama: 'MEGA HELM SEPEDA LISTRIK SNI ALL SIZE', tipeModel: 'HELM SEPEDA LISTRIK SNI', saldo: 5.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Sepeda Listrik' },
  { id: 'inv-137', merek: 'GODA', kode: 'GS00055', nama: 'GODA SEPEDA LISTRIK GD001 LEMON BATTERY 48V 12AH', tipeModel: 'SEPEDA LISTRIK GD001 LEMON', saldo: 6.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Sepeda Listrik' },
  { id: 'inv-138', merek: 'GODA', kode: 'GS00068', nama: 'GODA SEPEDA LISTRIK GD005S TRY DIGITAL SPEEDOMETER', tipeModel: 'SEPEDA LISTRIK GD005S TRY', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Sepeda Listrik' },
  { id: 'inv-139', merek: 'GODA', kode: 'GS00067', nama: 'GODA SEPEDA LISTRIK GD008 AURA ELEGANT DESIGN', tipeModel: 'SEPEDA LISTRIK GD008 AURA', saldo: 3.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Sepeda Listrik' },
  { id: 'inv-140', merek: 'PASIFIC', kode: 'AS00043', nama: 'PASIFIC SEPEDA LISTRIK AVIATOR AT200', tipeModel: 'SEPEDA LISTRIK AVIATOR AT200', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Sepeda Listrik' },
  { id: 'inv-141', merek: 'PASIFIC', kode: 'PS00172', nama: 'PASIFIC SEPEDA LISTRIK VENTURA M5 NEW MOTOR 500W', tipeModel: 'SEPEDA LISTRIK VENTURA M5', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Sepeda Listrik' },
  { id: 'inv-143', merek: 'AGATHOS', kode: 'AS00045', nama: 'AGATHOS SEPEDA LISTRIK AE 310 SMART REMOTE ALARM', tipeModel: 'SEPEDA LISTRIK AE 310', saldo: 1.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Sepeda Listrik' },
  { id: 'inv-144', merek: 'UWINFLY', kode: 'US00043', nama: 'UWINFLY SEPEDA LISTRIK D66I 01 DRUM BRAKE', tipeModel: 'SEPEDA LISTRIK D66I 01', saldo: 1.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Sepeda Listrik' },
  { id: 'inv-145', merek: 'YADEA', kode: 'YS00008', nama: 'YADEA SEPEDA LISTRIK MIA PREMIUM SUSPENSION', tipeModel: 'SEPEDA LISTRIK MIA', saldo: 1.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Sepeda Listrik' },

  // ==========================================
  // === SMARTPHONE & GADGET (OPPO, REALME, VIVO, SAMSUNG, XIAOMI, IPHONE) ===
  // ==========================================
  { id: 'inv-146', merek: 'OPPO', kode: 'OH00289', nama: 'OPPO HP A6 6/128 PINK', tipeModel: 'HP A6 6/128 PINK', saldo: 12.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'HP / Gadget' },
  { id: 'inv-147', merek: 'OPPO', kode: 'OH00286', nama: 'OPPO HP A6 6/256 BLUE', tipeModel: 'HP A6 6/256 BLUE', saldo: 1.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'HP / Gadget' },
  { id: 'inv-148', merek: 'OPPO', kode: 'OH00287', nama: 'OPPO HP A6 6/256 PINK', tipeModel: 'HP A6 6/256 PINK', saldo: 4.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'HP / Gadget' },
  { id: 'inv-150', merek: 'OPPO', kode: 'OH00288', nama: 'OPPO HP A6 X 6/256 BLUE', tipeModel: 'HP A6 X 6/256 BLUE', saldo: 8.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'HP / Gadget' },
  { id: 'inv-152', merek: 'OPPO', kode: 'OH00294', nama: 'OPPO HP RENO 15 5G 8/256 BLUE', tipeModel: 'HP RENO 15 5G 8/256 BLUE', saldo: 1.0, gudang: 'GD001 [ DEMO LIVE ]', gudangCode: 'GD001', category: 'HP / Gadget' },
  { id: 'inv-155', merek: 'REALME', kode: 'RH00344', nama: 'REALME HP C100I 4/128 PURPLE', tipeModel: 'HP C100I 4/128 PURPLE', saldo: 3.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'HP / Gadget' },
  { id: 'inv-158', merek: 'REALME', kode: 'RH00324', nama: 'REALME HP C85 8/256 BLACK', tipeModel: 'HP C85 8/256 BLACK', saldo: 4.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'HP / Gadget' },
  { id: 'inv-160', merek: 'VIVO', kode: 'VH00363', nama: 'VIVO HP Y05 4/128 BLACK', tipeModel: 'HP Y05 4/128 BLACK', saldo: 4.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'HP / Gadget' },
  { id: 'inv-161', merek: 'VIVO', kode: 'VH00391', nama: 'VIVO HP Y05E 4/64 BLUE', tipeModel: 'HP Y05E 4/64 BLUE', saldo: 4.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'HP / Gadget' },
  { id: 'inv-163', merek: 'SAMSUNG', kode: 'SH00606', nama: 'SAMSUNG HP A07 6/128 GREEN', tipeModel: 'HP A07 6/128 GREEN', saldo: 5.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'HP / Gadget' },
  { id: 'inv-164', merek: 'SAMSUNG', kode: 'SH00645', nama: 'SAMSUNG HP A17 4G 4/128 BLACK', tipeModel: 'HP A17 4G 4/128 BLACK', saldo: 3.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'HP / Gadget' },
  { id: 'inv-165', merek: 'XIAOMI', kode: 'XH00579', nama: 'XIAOMI HP REDMI A7 PRO 4/128 GREEN', tipeModel: 'HP REDMI A7 PRO 4/128 GREEN', saldo: 3.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'HP / Gadget' },
  { id: 'inv-168', merek: 'IPHONE', kode: 'IH00320', nama: 'IPHONE HP 15 128GB PINK GARANSI RESMI', tipeModel: 'HP 15 128GB PINK', saldo: 1.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'HP / Gadget' },

  // ==========================================
  // === SDA / ELEKTRONIK DAPUR (COSMOS, MIYAKO, MASPION, YONGMA, TURBO) ===
  // ==========================================
  { id: 'inv-169', merek: 'COSMOS', kode: 'CB00003', nama: 'COSMOS BLENDER CB 180F PLASTIK 1.25L', tipeModel: 'BLENDER CB 180F PLASTIK', saldo: 11.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Blender' },
  { id: 'inv-171', merek: 'COSMOS', kode: 'CB00009', nama: 'COSMOS BLENDER CB 171 P MIKA ANTI PECAH', tipeModel: 'BLENDER CB 171 P MIKA', saldo: 11.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Blender' },
  { id: 'inv-172', merek: 'COSMOS', kode: 'CD00002', nama: 'COSMOS DISPENSER CWD 1150 P MEJA HOT & NORMAL', tipeModel: 'DISPENSER CWD 1150 P', saldo: 11.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Dispenser' },
  { id: 'inv-173', merek: 'COSMOS', kode: 'CM00002', nama: 'COSMOS MAGIC COM CRJ-3301 N 1.8L NON STICK', tipeModel: 'MAGIC COM CRJ-3301 N 1.8L', saldo: 40.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Magic Com' },
  { id: 'inv-174', merek: 'COSMOS', kode: 'CM00028', nama: 'COSMOS MAGIC COM CRJ-323 1.8L HARMOND ANTI GORES', tipeModel: 'MAGIC COM CRJ-323 1.8L', saldo: 41.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Magic Com' },
  { id: 'inv-176', merek: 'COSMOS', kode: 'CS00008', nama: 'COSMOS SETRIKA CIS 418 NON STICK STAINLESS', tipeModel: 'SETRIKA CIS 418 OTOMATIS', saldo: 12.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Setrika' },
  { id: 'inv-177', merek: 'COSMOS', kode: 'CS00002', nama: 'COSMOS SETRIKA CIS 428 AUTO SHUT OFF', tipeModel: 'SETRIKA CIS 428 OTOMATIS', saldo: 16.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Setrika' },
  { id: 'inv-178', merek: 'MASPION', kode: 'MK00038', nama: 'MASPION KIPAS DINDING MWF 232 16 INCH TALI TARIK', tipeModel: 'KIPAS DINDING 232 16"', saldo: 12.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kipas Angin' },
  { id: 'inv-179', merek: 'MASPION', kode: 'MK00040', nama: 'MASPION KIPAS DINDING MWF 3001RC DENGAN REMOTE CONTROL', tipeModel: 'KIPAS DINDING 3001RC REMOTE', saldo: 13.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kipas Angin' },
  { id: 'inv-180', merek: 'MASPION', kode: 'MK00055', nama: 'MASPION KIPAS STAND EX 172 BERDIRI 16 INCH', tipeModel: 'KIPAS STAND EX 172 16"', saldo: 15.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kipas Angin' },
  { id: 'inv-181', merek: 'MASPION', kode: 'MM00027', nama: 'MASPION MAGIC COM MRJ 1808 SS/MS STAINLESS 1.8L', tipeModel: 'MAGIC COM 1808 SS 1.8L', saldo: 32.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Magic Com' },
  { id: 'inv-182', merek: 'MASPION', kode: 'MS00028', nama: 'MASPION SETRIKA DRY IRON EX-1000 CLASSIC', tipeModel: 'SETRIKA EX-1000 DRY IRON', saldo: 47.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Setrika' },
  { id: 'inv-183', merek: 'MASPION', kode: 'MS00059', nama: 'MASPION SETRIKA HA-130 NON STICK TEFLON COATING', tipeModel: 'SETRIKA HA-130 NON STICK', saldo: 51.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Setrika' },
  { id: 'inv-184', merek: 'MASPION', kode: 'MS00018', nama: 'MASPION SETRIKA HA-40 HEAVY DUTY', tipeModel: 'SETRIKA HA-40 DRY IRON', saldo: 39.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Setrika' },
  { id: 'inv-185', merek: 'MIYAKO', kode: 'MB00001', nama: 'MIYAKO BLENDER BL-101PL MIKA PLASTIK 1L 3IN1', tipeModel: 'BLENDER BL-101PL MIKA', saldo: 16.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Blender' },
  { id: 'inv-186', merek: 'MIYAKO', kode: 'MD00002', nama: 'MIYAKO DISPENSER WD-186 HOT & NORMAL PORTABLE', tipeModel: 'DISPENSER WD-186 HOT/NORMAL', saldo: 15.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Dispenser' },
  { id: 'inv-187', merek: 'MIYAKO', kode: 'MM00005', nama: 'MIYAKO MAGIC COM MCM-508 GREEN LINE 1.8L', tipeModel: 'MAGIC COM MCM-508 1.8L', saldo: 29.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Magic Com' },
  { id: 'inv-188', merek: 'MIYAKO', kode: 'MM00004', nama: 'MIYAKO MAGIC COM MCM-528 MOTIF BATIK 1.8L', tipeModel: 'MAGIC COM MCM-528 BATIK 1.8L', saldo: 29.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Magic Com' },
  { id: 'inv-189', merek: 'MIYAKO', kode: 'MM00007', nama: 'MIYAKO MAGIC COM MCM-638 1.8L STAINLESS POT', tipeModel: 'MAGIC COM MCM-638 1.8L', saldo: 37.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Magic Com' },
  { id: 'inv-190', merek: 'MIYAKO', kode: 'MM00008', nama: 'MIYAKO MAGIC COM MCM-838 JUMBO 2.2L', tipeModel: 'MAGIC COM MCM-838 2.2L', saldo: 35.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Magic Com' },
  { id: 'inv-201', merek: 'YONGMA', kode: 'YM00004', nama: 'YONGMA MAGIC COM DIGITAL SMC 5061 1L ECO CERAMIC', tipeModel: 'MAGIC COM SMC 5061 DIGITAL 1L', saldo: 12.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Magic Com' },
  { id: 'inv-202', merek: 'YONGMA', kode: 'YM00060', nama: 'YONGMA MAGIC COM DIGITAL SMC 7073 2L WOK POT', tipeModel: 'MAGIC COM SMC 7073 DIGITAL 2L', saldo: 6.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Magic Com' },
  { id: 'inv-203', merek: 'YONGMA', kode: 'YM00064', nama: 'YONGMA MAGIC COM DIGITAL SMC 8045 SMART TOUCH 2L', tipeModel: 'MAGIC COM SMC 8045 DIGITAL 2L', saldo: 6.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Magic Com' },
  { id: 'inv-205', merek: 'TURBO', kode: 'TK00004', nama: 'TURBO KIPAS ANGIN BERDIRI CFR 3086 16 INCH', tipeModel: 'KIPAS STAND TURBO 3086', saldo: 15.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Kipas Angin' },
  { id: 'inv-207', merek: 'TURBO', kode: 'TM00038', nama: 'TURBO MAGIC COM CRL 1000 1.8L 3D HEATING', tipeModel: 'MAGIC COM TURBO 1000 1.8L', saldo: 10.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Magic Com' },
  { id: 'inv-208', merek: 'TURBO', kode: 'TS00010', nama: 'TURBO SETRIKA DRY IRON EHL 3019 NON STICK', tipeModel: 'SETRIKA TURBO 3019 NON STICK', saldo: 11.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Setrika' },

  // ==========================================
  // === POMPA AIR (SHIMIZU) ===
  // ==========================================
  { id: 'inv-198', merek: 'SHIMIZU', kode: 'SP00021', nama: 'SHIMIZU POMPA AIR SEMI JET JET-100 BIT DAYA HISAP KUAT', tipeModel: 'POMPA AIR JET-100 BIT', saldo: 9.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Pompa Air' },
  { id: 'inv-199', merek: 'SHIMIZU', kode: 'SP00023', nama: 'SHIMIZU POMPA AIR SUMUR DANGKAL OTOMATIS PS-103 BIT', tipeModel: 'POMPA AIR PS-103 BIT OTOMATIS', saldo: 4.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Pompa Air' },
  { id: 'inv-200', merek: 'SHIMIZU', kode: 'SP00019', nama: 'SHIMIZU POMPA AIR SUMUR DANGKAL OTOMATIS PS-135 BIT 125W', tipeModel: 'POMPA AIR PS-135 BIT OTOMATIS', saldo: 4.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Pompa Air' },

  // ==========================================
  // === SPEAKER & AUDIO (POLYTRON, ADVAN, GMC) ===
  // ==========================================
  { id: 'inv-4', merek: 'ADVAN', kode: 'AS00037', nama: 'ADVAN SPIKER BLUETOOTH M60 BT V.3 PORTABLE WIRELESS', tipeModel: 'SPIKER M60 BT V.3', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Speaker' },
  { id: 'inv-94', merek: 'POLYTRON', kode: 'PS00094', nama: 'POLYTRON SPEAKER AKTIF PAS 10DF22 DUAL WOOFER BLUETOOTH', tipeModel: 'SPEAKER PAS 10DF22 DUAL WOOFER', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Speaker' },
  { id: 'inv-95', merek: 'POLYTRON', kode: 'PS00091', nama: 'POLYTRON SPIKER AKTIF PAS 8 FF22 SINGLE WOOFER', tipeModel: 'SPIKER AKTIF PAS 8 FF22', saldo: 1.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Speaker' },
  { id: 'inv-96', merek: 'POLYTRON', kode: 'PS00102', nama: 'POLYTRON SPIKER MULTIMEDIA PMA 9525 AMBIENT LIGHT', tipeModel: 'SPIKER PMA 9525 MULTIMEDIA', saldo: 2.0, gudang: 'GB001 [ BELAKANG ]', gudangCode: 'GB001', category: 'Speaker' },

  // ==========================================
  // === LAPTOP & PRINTER (ASUS, EPSON, LENOVO) ===
  // ==========================================
  { id: 'inv-209', merek: 'ASUS', kode: 'AL00489', nama: 'ASUS LAPTOP VIVABOOK A1404VA CORE I3 8/512GB SSD FHD', tipeModel: 'LAPTOP VIVABOOK A1404VA CORE I3', saldo: 1.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Laptop' },
  { id: 'inv-210', merek: 'ASUS', kode: 'AL00513', nama: 'ASUS LAPTOP VIVABOOK GO 14 E1404TA 8/256GB SSD', tipeModel: 'LAPTOP VIVABOOK GO 14 E1404TA', saldo: 2.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Laptop' },
  { id: 'inv-211', merek: 'EPSON', kode: 'EP00022', nama: 'EPSON PRINTER ALL-IN-ONE ECOTANK L3211 PRINT SCAN COPY', tipeModel: 'PRINTER ALL IN ONE ECOTANK L3211', saldo: 3.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Printer' },
  { id: 'inv-212', merek: 'LENOVO', kode: 'LL00246', nama: 'LENOVO LAPTOP V14 G5 IRL CORE I5 8/512GB SSD', tipeModel: 'LAPTOP V14 G5 IRL CORE I5', saldo: 2.0, gudang: 'GT001 [ TOKO ]', gudangCode: 'GT001', category: 'Laptop' },

  // ==========================================
  // === GALON & LPG ===
  // ==========================================
  { id: 'inv-1', merek: 'GALON', kode: 'GA00040', nama: 'GALON AQUA 19 LITER ASLI', tipeModel: 'GALON AQUA 19L', saldo: 30.0, gudang: 'GA001 [ ATAS BELAKANG ]', gudangCode: 'GA001', category: 'Lainnya' },
  { id: 'inv-2', merek: 'LPG', kode: 'LT00020', nama: 'LPG TABUNG 3 KG GAS SUBSIDI', tipeModel: 'TABUNG 3 KG', saldo: 10.0, gudang: 'GA001 [ ATAS BELAKANG ]', gudangCode: 'GA001', category: 'Lainnya' },
];

/**
 * Helper to determine category automatically from name
 */
export function detectCategory(text: string): string {
  const upper = text.toUpperCase();
  if (upper.includes('FREEZER') || upper.includes('SHOWCASE') || upper.includes('CHEST FREEZER')) return 'Freezer / Showcase';
  if (upper.includes('KULKAS') || upper.includes('REFRIGERATOR')) return 'Kulkas';
  if (upper.includes('MESIN CUCI') || upper.includes('WASHING')) return 'Mesin Cuci';
  if (upper.includes('TV') || upper.includes('TELEVISI') || upper.includes('QLED') || upper.includes('LED') || upper.includes('BRAKET') || upper.includes('BRACKET') || upper.includes('ANTENA')) return 'TV & Bracket';
  if (upper.includes('SEPEDA LISTRIK') || upper.includes('E-BIKE') || upper.includes('GODA') || upper.includes('PASIFIC') || upper.includes('UWINFLY') || upper.includes('YADEA') || upper.includes('AGATHOS') || upper.includes('HELM')) return 'Sepeda Listrik';
  if (upper.includes('AC ') || upper.includes('AIR CONDITIONER') || upper.includes('0,5PK') || upper.includes('0.5PK') || upper.includes('1PK') || upper.includes('INVERTER')) return 'AC';
  if (upper.includes('MAGIC COM') || upper.includes('RICE COOKER') || upper.includes('MAGIC JAR') || upper.includes('MCM') || upper.includes('CRJ')) return 'Magic Com';
  if (upper.includes('BLENDER') || upper.includes('CHOPPER') || upper.includes('JUICER')) return 'Blender & Chopper';
  if (upper.includes('KIPAS') || upper.includes('FAN') || upper.includes('STANDFAN') || upper.includes('ORBITFAN')) return 'Kipas Angin';
  if (upper.includes('SETRIKA') || upper.includes('IRON') || upper.includes('HA-130') || upper.includes('HD 1172') || upper.includes('DST') || upper.includes('GC 122')) return 'Setrika';
  if (upper.includes('DISPENSER') || upper.includes('WATER DISPENSER')) return 'Dispenser';
  if (upper.includes('HP ') || upper.includes('RENO') || upper.includes('REDMI') || upper.includes('VIVO') || upper.includes('OPPO') || upper.includes('REALME') || upper.includes('IPHONE') || upper.includes('SMARTPHONE')) return 'HP / Gadget';
  if (upper.includes('KOMPOR') || upper.includes('RINNAI') || upper.includes('QUANTUM') || upper.includes('WINN GAS') || upper.includes('NIKO') || upper.includes('GAS COOKER') || upper.includes('PORTABEL') || upper.includes('REGULATOR') || upper.includes('STAR CAM') || upper.includes('DESTEC') || upper.includes('SELANG')) return 'Kompor Gas & Aksesoris';
  if (upper.includes('LAMPU') || upper.includes('KABEL') || upper.includes('STOP KONTAK') || upper.includes('STEKER') || upper.includes('BROCO') || upper.includes('UTICON') || upper.includes('HANNOCHS') || upper.includes('LUBY') || upper.includes('SAKLAR') || upper.includes('FITTING') || upper.includes('BATERAI')) return 'Alat Listrik & Aksesoris';
  if (upper.includes('SPEAKER') || upper.includes('SPIKER') || upper.includes('AUDIO') || upper.includes('SOUND') || upper.includes('TWS') || upper.includes('EARPHONE') || upper.includes('POWERBANK') || upper.includes('FLASHDISK') || upper.includes('MEMORY') || upper.includes('MICROSD') || upper.includes('ROBOT') || upper.includes('V-GEN') || upper.includes('SANDISK')) return 'Audio & Aksesoris Gadget';
  if (upper.includes('POMPA AIR') || upper.includes('SHIMIZU') || upper.includes('WATER HEATER')) return 'Pompa Air';
  if (upper.includes('LAPTOP') || upper.includes('PRINTER') || upper.includes('KOMPUTER')) return 'Laptop & Printer';
  return 'Lainnya';
}

/**
 * Robust Brand Detection Helper
 */
export function detectBrand(text: string, prefixRaw?: string, code?: string): string {
  const upper = text.toUpperCase();
  const prefixUpper = (prefixRaw || '').toUpperCase();
  const codeUpper = (code || '').toUpperCase();

  if (upper.includes('PHILIPS') || prefixUpper.includes('PHILIPS') || codeUpper.startsWith('PH') || codeUpper.startsWith('PS') || codeUpper.startsWith('PB') || codeUpper.startsWith('PM') || codeUpper.startsWith('PL') || codeUpper.startsWith('PC') || codeUpper.startsWith('PX')) return 'PHILIPS';
  if (upper.includes('RINNAI') || upper.includes('RINAI') || prefixUpper.includes('RINNAI') || codeUpper.startsWith('RK')) return 'RINNAI';
  if (upper.includes('QUANTUM') || prefixUpper.includes('QUANTUM') || codeUpper.startsWith('QK') || codeUpper.startsWith('QR')) return 'QUANTUM';
  if (upper.includes('WINN GAS') || upper.includes('WINNGAS') || prefixUpper.includes('WINN') || codeUpper.startsWith('WK') || codeUpper.startsWith('WR')) return 'WINN GAS';
  if (upper.includes('POLYTRON') || prefixUpper.includes('POLYTRON') || codeUpper.startsWith('PT') || codeUpper.startsWith('PK') || codeUpper.startsWith('PM') && upper.includes('POLYTRON')) return 'POLYTRON';
  if (upper.includes('RSA') || prefixUpper.includes('RSA') || codeUpper.startsWith('RF') || codeUpper.startsWith('RJ') || (codeUpper.startsWith('RM') && upper.includes('RSA'))) return 'RSA';
  if (upper.includes('SHARP') || prefixUpper.includes('SHARP') || codeUpper.startsWith('SK') || (codeUpper.startsWith('SM') && upper.includes('SHARP')) || codeUpper.startsWith('SA')) return 'SHARP';
  if (upper.includes('AQUA') || prefixUpper.includes('AQUA') || codeUpper.startsWith('AK') || codeUpper.startsWith('AB') || codeUpper.startsWith('AM') || codeUpper.startsWith('AT') || codeUpper.startsWith('AA') || codeUpper.startsWith('AF')) return 'AQUA';
  if (upper.includes('COSMOS') || prefixUpper.includes('COSMOS') || codeUpper.startsWith('CK') || codeUpper.startsWith('CM') || codeUpper.startsWith('CB') || codeUpper.startsWith('CD') || codeUpper.startsWith('CS')) return 'COSMOS';
  if (upper.includes('MASPION') || prefixUpper.includes('MASPION') || codeUpper.startsWith('MS') || codeUpper.startsWith('MK') || (codeUpper.startsWith('MM') && upper.includes('MASPION'))) return 'MASPION';
  if (upper.includes('MIYAKO') || prefixUpper.includes('MIYAKO') || codeUpper.startsWith('MB') || codeUpper.startsWith('MD') || (codeUpper.startsWith('MM') && upper.includes('MIYAKO'))) return 'MIYAKO';
  if (upper.includes('STAR CAM') || upper.includes('STARCAM') || upper.includes('DESTEC') || prefixUpper.includes('STAR') || codeUpper.startsWith('SR')) return 'STAR CAM';
  if (upper.includes('NIKO') || prefixUpper.includes('NIKO') || codeUpper.startsWith('NK')) return 'NIKO';
  if (upper.includes('HANNOCHS') || prefixUpper.includes('HANNOCHS') || codeUpper.startsWith('HL')) return 'HANNOCHS';
  if (upper.includes('LUBY') || prefixUpper.includes('LUBY') || codeUpper.startsWith('LL')) return 'LUBY';
  if (upper.includes('BROCO') || prefixUpper.includes('BROCO') || codeUpper.startsWith('BS')) return 'BROCO';
  if (upper.includes('UTICON') || prefixUpper.includes('UTICON') || codeUpper.startsWith('US')) return 'UTICON';
  if (upper.includes('ROBOT') || prefixUpper.includes('ROBOT') || codeUpper.startsWith('RP') || codeUpper.startsWith('RT')) return 'ROBOT';
  if (upper.includes('SANEX') || prefixUpper.includes('SANEX') || codeUpper.startsWith('SA')) return 'SANEX';
  if (upper.includes('TANAKA') || prefixUpper.includes('TANAKA') || codeUpper.startsWith('TA')) return 'TANAKA';
  if (upper.includes('TOYOSAKI') || prefixUpper.includes('TOYOSAKI')) return 'TOYOSAKI';
  if (upper.includes('CHUNGHOP') || prefixUpper.includes('CHUNGHOP') || codeUpper.startsWith('CR')) return 'CHUNGHOP';
  if (upper.includes('JOKER') || prefixUpper.includes('JOKER') || codeUpper.startsWith('JR')) return 'JOKER';
  if (upper.includes('ABC') || prefixUpper.includes('ABC')) return 'ABC';
  if (upper.includes('GODA') || prefixUpper.includes('GODA')) return 'GODA';
  if (upper.includes('PASIFIC') || upper.includes('PACIFIC')) return 'PASIFIC';
  if (upper.includes('UWINFLY')) return 'UWINFLY';
  if (upper.includes('YADEA')) return 'YADEA';
  if (upper.includes('AGATHOS')) return 'AGATHOS';
  if (upper.includes('SAMSUNG')) return 'SAMSUNG';
  if (upper.includes('OPPO')) return 'OPPO';
  if (upper.includes('VIVO')) return 'VIVO';
  if (upper.includes('REALME')) return 'REALME';
  if (upper.includes('XIAOMI') || upper.includes('REDMI')) return 'XIAOMI / REDMI';
  if (upper.includes('INFINIX')) return 'INFINIX';
  if (upper.includes('TECNO')) return 'TECNO';
  if (upper.includes('PANASONIC')) return 'PANASONIC';
  if (upper.includes('TOSHIBA')) return 'TOSHIBA';
  if (upper.includes('LG')) return 'LG';
  if (upper.includes('DAIKIN')) return 'DAIKIN';
  if (upper.includes('GREE')) return 'GREE';
  if (upper.includes('CHANGHONG')) return 'CHANGHONG';
  if (upper.includes('TCL')) return 'TCL';
  if (upper.includes('HISENSE')) return 'HISENSE';
  if (upper.includes('COOCAA')) return 'COOCAA';
  if (upper.includes('SANKEN')) return 'SANKEN';
  if (upper.includes('TURBO')) return 'TURBO';
  if (upper.includes('OXONE')) return 'OXONE';
  if (upper.includes('KIRIN')) return 'KIRIN';
  if (upper.includes('DENPOO')) return 'DENPOO';
  if (upper.includes('MODENA')) return 'MODENA';
  if (upper.includes('ELECTROLUX')) return 'ELECTROLUX';
  if (upper.includes('SHIMIZU')) return 'SHIMIZU';
  if (upper.includes('WASSER')) return 'WASSER';
  if (upper.includes('SEKAI')) return 'SEKAI';
  if (upper.includes('YONG MA') || upper.includes('YONGMA')) return 'YONG MA';
  if (upper.includes('GEA')) return 'GEA';
  if (upper.includes('SANDEN')) return 'SANDEN';
  if (upper.includes('MITO') || upper.includes('MITOCHIBA')) return 'MITO';

  if (prefixRaw && prefixRaw.trim().length > 1 && !prefixRaw.match(/^\d+$/) && !prefixRaw.match(/^[A-Z]{2}\d{5}$/)) {
    return prefixRaw.trim();
  }

  return 'LAINNYA';
}

/**
 * Helper to split and normalize product brand, code, and clean name
 */
export function parseProductIdentity(rawPrefix: string): {
  merek: string;
  kode: string;
  nama: string;
} {
  const trimmed = rawPrefix.trim();

  // Check for Bracket format: e.g. "POLYTRON [PT00189]POLYTRON TV LED 32TC1865 + SPK"
  // or "RSA [RF00009]RSA FREEZER BOX CF 110"
  // or "PH00150 [ PM00150 ] PHILIPS MAGIC COM 3003"
  // or "[PT00189] POLYTRON TV LED 32TC1865 + SPK"
  const bracketMatch = trimmed.match(/^([A-Z0-9\-\.\s]*?)\s*\[\s*([A-Z0-9\-_]+)\s*\]\s*(.*)$/i);

  if (bracketMatch) {
    const rawBrandOrPrefix = bracketMatch[1].trim();
    const rawKode = bracketMatch[2].trim();
    const rawSuffix = bracketMatch[3].trim();

    let fullProductName = rawSuffix;
    if (!fullProductName) {
      fullProductName = rawBrandOrPrefix;
    } else if (
      rawBrandOrPrefix &&
      !rawSuffix.toUpperCase().startsWith(rawBrandOrPrefix.toUpperCase()) &&
      rawBrandOrPrefix.length > 2 &&
      !rawBrandOrPrefix.match(/^\d+$/) &&
      !rawBrandOrPrefix.match(/^[A-Z]{2}\d{5}$/)
    ) {
      fullProductName = `${rawBrandOrPrefix} ${rawSuffix}`;
    }

    const detectedMerek = detectBrand(fullProductName, rawBrandOrPrefix, rawKode);

    // If product name doesn't start with brand name, prepend brand for clarity
    if (
      detectedMerek !== 'LAINNYA' &&
      !fullProductName.toUpperCase().startsWith(detectedMerek.toUpperCase())
    ) {
      fullProductName = `${detectedMerek} ${fullProductName}`;
    }

    return {
      merek: detectedMerek,
      kode: rawKode,
      nama: fullProductName,
    };
  }

  // Format without brackets: e.g. "RSA RF00009 RSA FREEZER BOX CF 110"
  const tokens = trimmed.split(/\s+/);
  if (tokens.length >= 3 && tokens[1].match(/^[A-Z0-9]{4,10}$/i)) {
    const rawBrand = tokens[0];
    const rawKode = tokens[1];
    const restName = tokens.slice(2).join(' ');
    const fullProductName = restName.toUpperCase().startsWith(rawBrand.toUpperCase())
      ? restName
      : `${rawBrand} ${restName}`;
    const detectedMerek = detectBrand(fullProductName, rawBrand, rawKode);

    return {
      merek: detectedMerek,
      kode: rawKode,
      nama: fullProductName,
    };
  }

  // Fallback
  const detectedMerek = detectBrand(trimmed);
  return {
    merek: detectedMerek,
    kode: 'KD-' + Math.abs(simpleHash(trimmed)).toString().slice(0, 6),
    nama: trimmed,
  };
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

/**
 * Universal PDF Text Parser for Indonesian Store Inventory
 * Specifically uses regular expressions to separate decimal stock values at the end (e.g. '1.00', '2.00', '12.00')
 * from multi-word product names (preserving embedded models & numbers like CF 110, CF 1200, 32TC1865).
 */
export function parseInventoryPdfText(
  rawText: string,
  fallbackDate: string = '05/08/2026',
  fallbackStore: string = 'MEGA ELEKTRONIK GADGET AND HANDPHONE KERTOSONO'
): { items: InventoryItem[]; meta: InventoryReportMeta } {
  const lines = rawText.split(/\r?\n/);
  const parsedItems: InventoryItem[] = [];
  let autoId = 1;

  let foundDate = fallbackDate;
  let foundStore = fallbackStore;
  let currentWarehouse = 'GB001 [ BELAKANG ]';
  let currentWarehouseCode = 'GB001';

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    // 1. Check for Date headers (e.g. "Tanggal : 05/08/2026", "Per Tgl 05/08/2026")
    const dateMatch =
      trimmed.match(/(?:Tanggal|Tgl|Per Tgl\.?|Periode)\s*[:\s]\s*(\d{2}[/\-]\d{2}[/\-]\d{4})/i) ||
      trimmed.match(/\b(\d{2}[/\-]\d{2}[/\-]\d{4})\b/);
    if (
      dateMatch &&
      !trimmed.match(/^(?:PH|RK|PT|RF|AK|US|BS|SA|TA|CR|JR|RP|RT|UK|AB|UB|NK|WK|SR|HL|LL|POLYTRON|RSA|PHILIPS|RINNAI|SHARP|AQUA|COSMOS|MASPION|MIYAKO)/i)
    ) {
      foundDate = dateMatch[1];
    }

    // 2. Check for Store / Branch (e.g. KERTOSONO, MEGA KERTOSONO)
    if (
      trimmed.toUpperCase().includes('KERTOSONO') ||
      trimmed.toUpperCase().includes('MEGA ELEKTRONIK')
    ) {
      if (trimmed.length < 80 && !trimmed.includes('[') && !trimmed.match(/\d+\.\d{2}/)) {
        foundStore = trimmed.toUpperCase().includes('MEGA')
          ? trimmed
          : `MEGA ELEKTRONIK GADGET AND HANDPHONE ${trimmed}`;
      }
    }

    // 3. Check for Warehouse Section Header (e.g. "Gudang : GB001 [ BELAKANG ]", "Gudang : GT001 [ TOKO ]")
    const whHeaderMatch = trimmed.match(/^Gudang\s*:\s*(.+)$/i) || trimmed.match(/^Lokasi\s*:\s*(.+)$/i);
    if (whHeaderMatch) {
      const whRaw = whHeaderMatch[1].trim();
      currentWarehouse = whRaw;
      const codeMatch = whRaw.match(/^([A-Z0-9]+)/i);
      currentWarehouseCode = codeMatch ? codeMatch[1] : 'GB001';
      continue;
    }

    // 4. Skip generic report table headers / dividers / footers
    if (
      trimmed.match(/^(?:Saldo\s+Persediaan|Laporan\s+Saldo|Posisi\s+Saldo|Merek\s+Kode|Kode\s+Barang|Hal\s*:|Halaman\s*:|Grand\s+Total|Sub\s*Total|Total\s+Saldo|Dicetak\s*:)/i) ||
      trimmed.startsWith('==') ||
      trimmed.startsWith('--') ||
      trimmed.startsWith('**') ||
      trimmed === 'Merek Kode / Nama Saldo'
    ) {
      continue;
    }

    // 5. REGEX PARSING TO SEPARATE MULTI-WORD PRODUCT NAME FROM NUMERIC/DECIMAL STOCK VALUE
    let itemParsed: {
      merek: string;
      kode: string;
      nama: string;
      saldo: number;
      gudang: string;
      gudangCode?: string;
    } | null = null;

    // Pattern 1: Multi-word Product Description + Ending Decimal Stock + Inline Warehouse
    // Example: "PH00150 [ PM00150 ] PHILIPS MAGIC COM 3003 12.00 GB001 [ BELAKANG ]"
    const inlineWhRegex = /^(.*?)\s+([\-0-9]+(?:[\.,][0-9]{1,4})?)\s+([A-Z0-9]{2,6}(?:\s*\[[^\]]*\])?|\[\s*[A-Z\s]+\s*\])$/i;
    const inlineWhMatch = trimmed.match(inlineWhRegex);

    if (inlineWhMatch) {
      const prefixPart = inlineWhMatch[1].trim();
      const saldoStr = inlineWhMatch[2].replace(/,/g, '.');
      const saldo = parseFloat(saldoStr) || 0;
      const inlineWh = inlineWhMatch[3].trim();
      const whCodeMatch = inlineWh.match(/^([A-Z0-9]+)/i);
      const whCode = whCodeMatch ? whCodeMatch[1] : currentWarehouseCode;

      const { merek, kode, nama } = parseProductIdentity(prefixPart);
      if (nama) {
        itemParsed = {
          merek,
          kode,
          nama,
          saldo,
          gudang: inlineWh,
          gudangCode: whCode,
        };
      }
    }

    // Pattern 2: Multi-word Product Description + Ending Decimal Stock (e.g. '1.00', '2.00', '12.00', '0.00', '1,00')
    // Specifically separates numeric/decimal suffix from product description (preserving models like CF 110, CF 1200, 32TC1865)
    // Examples:
    // "POLYTRON [PT00189]POLYTRON TV LED 32TC1865 + SPK 2.00" -> Name: "POLYTRON TV LED 32TC1865 + SPK", Stock: 2.00
    // "RSA [RF00009]RSA FREEZER BOX CF 110 1.00" -> Name: "RSA FREEZER BOX CF 110", Stock: 1.00
    // "RSA [RF00008]RSA FREEZER BOX CF 1200 1.00" -> Name: "RSA FREEZER BOX CF 1200", Stock: 1.00
    if (!itemParsed) {
      const endDecimalRegex = /^(.*?)\s+([\-0-9]+(?:[\.,][0-9]{1,4}))$/;
      const endDecimalMatch = trimmed.match(endDecimalRegex);

      if (endDecimalMatch) {
        const prefixPart = endDecimalMatch[1].trim();
        const saldoStr = endDecimalMatch[2].replace(/,/g, '.');
        const saldo = parseFloat(saldoStr) || 0;

        const { merek, kode, nama } = parseProductIdentity(prefixPart);
        if (nama) {
          itemParsed = {
            merek,
            kode,
            nama,
            saldo,
            gudang: currentWarehouse,
            gudangCode: currentWarehouseCode,
          };
        }
      }
    }

    // Pattern 3: Fallback for integer stock at end of line (e.g. ' 1', ' 2', ' 14')
    if (!itemParsed) {
      const endIntegerRegex = /^(.*?)\s+([\-0-9]+)$/;
      const endIntegerMatch = trimmed.match(endIntegerRegex);

      if (endIntegerMatch) {
        const prefixPart = endIntegerMatch[1].trim();
        const saldoStr = endIntegerMatch[2];
        const saldo = parseFloat(saldoStr) || 0;

        const { merek, kode, nama } = parseProductIdentity(prefixPart);
        if (nama) {
          itemParsed = {
            merek,
            kode,
            nama,
            saldo,
            gudang: currentWarehouse,
            gudangCode: currentWarehouseCode,
          };
        }
      }
    }

    // Pattern 4: Tab-separated or multi-space columns
    if (!itemParsed) {
      const parts = trimmed.split(/\t+|\s{2,}/);
      if (parts.length >= 2) {
        const pLast = parts[parts.length - 1].trim();
        const pSecondLast = parts[parts.length - 2]?.trim();

        let saldo = 0;
        let gudang = currentWarehouse;
        let nameTokens: string[] = [];

        if (pLast.match(/^[\-0-9]+(?:[\.,][0-9]+)?$/)) {
          saldo = parseFloat(pLast.replace(/,/g, '.')) || 0;
          nameTokens = parts.slice(0, parts.length - 1);
        } else if (pSecondLast && pSecondLast.match(/^[\-0-9]+(?:[\.,][0-9]+)?$/)) {
          saldo = parseFloat(pSecondLast.replace(/,/g, '.')) || 0;
          gudang = pLast;
          nameTokens = parts.slice(0, parts.length - 2);
        }

        if (nameTokens.length > 0) {
          const combinedPrefix = nameTokens.join(' ');
          const { merek, kode, nama } = parseProductIdentity(combinedPrefix);
          if (nama) {
            itemParsed = {
              merek,
              kode,
              nama,
              saldo,
              gudang,
              gudangCode: currentWarehouseCode,
            };
          }
        }
      }
    }

    if (itemParsed) {
      parsedItems.push({
        id: `inv-imp-${autoId++}`,
        merek: itemParsed.merek,
        kode: itemParsed.kode,
        nama: itemParsed.nama,
        tipeModel: itemParsed.nama,
        saldo: itemParsed.saldo,
        gudang: itemParsed.gudang,
        gudangCode: itemParsed.gudangCode,
        category: detectCategory(itemParsed.nama),
      });
    }
  }

  return {
    items: parsedItems,
    meta: {
      sourceDate: foundDate,
      storeName: foundStore,
      lastUpdated: new Date().toLocaleTimeString('id-ID'),
      totalItems: parsedItems.length,
    },
  };
}

/**
 * Determine Stock Status
 * > 1 => AMAN
 * === 1 => KRITIS (1 UNIT)
 * <= 0 => KOSONG
 */
export function getStockStatusInfo(saldo: number): {
  status: 'AMAN' | 'KRITIS' | 'KOSONG';
  badgeLabel: string;
  badgeClass: string;
  dotColor: string;
  rowHighlight: string;
} {
  if (saldo > 1) {
    return {
      status: 'AMAN',
      badgeLabel: `✅ Stok Aman (${saldo.toFixed(0)} Unit)`,
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
      dotColor: 'bg-emerald-500',
      rowHighlight: 'hover:bg-emerald-50/40',
    };
  }
  if (saldo === 1) {
    return {
      status: 'KRITIS',
      badgeLabel: '⚠️ 1 Unit (Kritis)',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-400 font-black ring-1 ring-amber-300',
      dotColor: 'bg-amber-500',
      rowHighlight: 'bg-amber-50/50 hover:bg-amber-100/50 border-l-4 border-l-amber-500',
    };
  }
  return {
    status: 'KOSONG',
    badgeLabel: '❌ Kosong (0 Unit)',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    dotColor: 'bg-rose-500',
    rowHighlight: 'opacity-70 bg-slate-50/60 hover:bg-slate-100/60',
  };
}

