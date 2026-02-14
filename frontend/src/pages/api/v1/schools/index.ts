/**
 * Mock API: Schools List and Create
 * 模擬後端 API，提供假資料用於前端測試
 * Feature: 003-student-sports-data
 */

import type { NextApiRequest, NextApiResponse } from 'next';

// 全台灣各縣市代表性學校資料
// 資料來源：教育部統計處學校名錄 https://depart.moe.edu.tw/ed4500/
let mockSchools = [
  // ===== 臺北市 (5所) =====
  { id: 1, name: '臺北市立建國高級中學', code: 'TPE-JK-001', county: '臺北市', district: '中正區', address: '臺北市中正區南海路56號', phone: '02-2303-4381', type: '高中', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 2, name: '臺北市立北一女子高級中學', code: 'TPE-BY-001', county: '臺北市', district: '中正區', address: '臺北市中正區重慶南路一段165號', phone: '02-2382-0484', type: '高中', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 3, name: '臺北市立金華國民中學', code: 'TPE-JH-001', county: '臺北市', district: '大安區', address: '臺北市大安區新生南路二段32號', phone: '02-2391-4865', type: '國中', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 4, name: '臺北市大安區金華國民小學', code: 'TPE-ES-001', county: '臺北市', district: '大安區', address: '臺北市大安區愛國東路79巷11號', phone: '02-2391-7402', type: '國小', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 5, name: '臺北市立師大附中', code: 'TPE-SD-001', county: '臺北市', district: '大安區', address: '臺北市大安區信義路三段143號', phone: '02-2707-5215', type: '高中', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },

  // ===== 新北市 (5所) =====
  { id: 6, name: '新北市立板橋高級中學', code: 'NTP-BQ-001', county: '新北市', district: '板橋區', address: '新北市板橋區文化路一段25號', phone: '02-2960-2500', type: '高中', created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' },
  { id: 7, name: '新北市立三重高級中學', code: 'NTP-SC-001', county: '新北市', district: '三重區', address: '新北市三重區集美街212號', phone: '02-2976-1005', type: '高中', created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' },
  { id: 8, name: '新北市立江翠國民中學', code: 'NTP-JC-001', county: '新北市', district: '板橋區', address: '新北市板橋區松江街63號', phone: '02-2250-2588', type: '國中', created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' },
  { id: 9, name: '新北市板橋區板橋國民小學', code: 'NTP-ES-001', county: '新北市', district: '板橋區', address: '新北市板橋區文化路一段23號', phone: '02-2968-3217', type: '國小', created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' },
  { id: 10, name: '新北市立中和高級中學', code: 'NTP-ZH-001', county: '新北市', district: '中和區', address: '新北市中和區連城路460號', phone: '02-2222-7144', type: '高中', created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' },

  // ===== 桃園市 (4所) =====
  { id: 11, name: '桃園市立武陵高級中等學校', code: 'TYN-WL-001', county: '桃園市', district: '桃園區', address: '桃園市桃園區中山路889號', phone: '03-369-8170', type: '高中', created_at: '2024-01-03T00:00:00Z', updated_at: '2024-01-03T00:00:00Z' },
  { id: 12, name: '桃園市立中壢高級中等學校', code: 'TYN-ZL-001', county: '桃園市', district: '中壢區', address: '桃園市中壢區中央西路二段141號', phone: '03-422-6530', type: '高中', created_at: '2024-01-03T00:00:00Z', updated_at: '2024-01-03T00:00:00Z' },
  { id: 13, name: '桃園市立桃園國民中學', code: 'TYN-JH-001', county: '桃園市', district: '桃園區', address: '桃園市桃園區莒光街2號', phone: '03-334-3771', type: '國中', created_at: '2024-01-03T00:00:00Z', updated_at: '2024-01-03T00:00:00Z' },
  { id: 14, name: '桃園市桃園區桃園國民小學', code: 'TYN-ES-001', county: '桃園市', district: '桃園區', address: '桃園市桃園區民權路69號', phone: '03-335-3362', type: '國小', created_at: '2024-01-03T00:00:00Z', updated_at: '2024-01-03T00:00:00Z' },

  // ===== 臺中市 (4所) =====
  { id: 15, name: '臺中市立臺中第一高級中等學校', code: 'TXG-TC-001', county: '臺中市', district: '北區', address: '臺中市北區育才街2號', phone: '04-2222-6081', type: '高中', created_at: '2024-01-04T00:00:00Z', updated_at: '2024-01-04T00:00:00Z' },
  { id: 16, name: '臺中市立臺中女子高級中等學校', code: 'TXG-TN-001', county: '臺中市', district: '西區', address: '臺中市西區自由路一段95號', phone: '04-2220-5108', type: '高中', created_at: '2024-01-04T00:00:00Z', updated_at: '2024-01-04T00:00:00Z' },
  { id: 17, name: '臺中市立居仁國民中學', code: 'TXG-JR-001', county: '臺中市', district: '西區', address: '臺中市西區自由路一段97號', phone: '04-2222-8832', type: '國中', created_at: '2024-01-04T00:00:00Z', updated_at: '2024-01-04T00:00:00Z' },
  { id: 18, name: '臺中市西區忠孝國民小學', code: 'TXG-ES-001', county: '臺中市', district: '西區', address: '臺中市西區臺灣大道二段556號', phone: '04-2322-3192', type: '國小', created_at: '2024-01-04T00:00:00Z', updated_at: '2024-01-04T00:00:00Z' },

  // ===== 臺南市 (4所) =====
  { id: 19, name: '臺南市立臺南第一高級中學', code: 'TNN-T1-001', county: '臺南市', district: '中西區', address: '臺南市中西區民族路一段1號', phone: '06-221-4125', type: '高中', created_at: '2024-01-05T00:00:00Z', updated_at: '2024-01-05T00:00:00Z' },
  { id: 20, name: '臺南市立臺南女子高級中學', code: 'TNN-TN-001', county: '臺南市', district: '中西區', address: '臺南市中西區大埔街97號', phone: '06-213-1928', type: '高中', created_at: '2024-01-05T00:00:00Z', updated_at: '2024-01-05T00:00:00Z' },
  { id: 21, name: '臺南市立建興國民中學', code: 'TNN-JX-001', county: '臺南市', district: '中西區', address: '臺南市中西區府前路一段239巷19號', phone: '06-213-8175', type: '國中', created_at: '2024-01-05T00:00:00Z', updated_at: '2024-01-05T00:00:00Z' },
  { id: 22, name: '臺南市中西區忠義國民小學', code: 'TNN-ES-001', county: '臺南市', district: '中西區', address: '臺南市中西區忠義路二段2號', phone: '06-222-2768', type: '國小', created_at: '2024-01-05T00:00:00Z', updated_at: '2024-01-05T00:00:00Z' },

  // ===== 高雄市 (4所) =====
  { id: 23, name: '高雄市立高雄高級中學', code: 'KHH-KH-001', county: '高雄市', district: '三民區', address: '高雄市三民區建國三路50號', phone: '07-286-8059', type: '高中', created_at: '2024-01-06T00:00:00Z', updated_at: '2024-01-06T00:00:00Z' },
  { id: 24, name: '高雄市立高雄女子高級中學', code: 'KHH-KN-001', county: '高雄市', district: '前金區', address: '高雄市前金區五福三路122號', phone: '07-211-5015', type: '高中', created_at: '2024-01-06T00:00:00Z', updated_at: '2024-01-06T00:00:00Z' },
  { id: 25, name: '高雄市立五福國民中學', code: 'KHH-WF-001', county: '高雄市', district: '苓雅區', address: '高雄市苓雅區五福一路122號', phone: '07-222-9178', type: '國中', created_at: '2024-01-06T00:00:00Z', updated_at: '2024-01-06T00:00:00Z' },
  { id: 26, name: '高雄市新興區信義國民小學', code: 'KHH-ES-001', county: '高雄市', district: '新興區', address: '高雄市新興區中正三路32號', phone: '07-235-3930', type: '國小', created_at: '2024-01-06T00:00:00Z', updated_at: '2024-01-06T00:00:00Z' },

  // ===== 基隆市 (3所) =====
  { id: 27, name: '基隆市立基隆高級中學', code: 'KEE-JL-001', county: '基隆市', district: '暖暖區', address: '基隆市暖暖區暖暖街350號', phone: '02-2457-1830', type: '高中', created_at: '2024-01-07T00:00:00Z', updated_at: '2024-01-07T00:00:00Z' },
  { id: 28, name: '基隆市立銘傳國民中學', code: 'KEE-MC-001', county: '基隆市', district: '中山區', address: '基隆市中山區文化路162號', phone: '02-2426-4135', type: '國中', created_at: '2024-01-07T00:00:00Z', updated_at: '2024-01-07T00:00:00Z' },
  { id: 29, name: '基隆市中正區中正國民小學', code: 'KEE-ES-001', county: '基隆市', district: '中正區', address: '基隆市中正區中船路36號', phone: '02-2462-3416', type: '國小', created_at: '2024-01-07T00:00:00Z', updated_at: '2024-01-07T00:00:00Z' },

  // ===== 新竹市 (3所) =====
  { id: 30, name: '新竹市立建功高級中學', code: 'HSZ-JG-001', county: '新竹市', district: '東區', address: '新竹市東區建功路58號', phone: '03-571-1384', type: '高中', created_at: '2024-01-08T00:00:00Z', updated_at: '2024-01-08T00:00:00Z' },
  { id: 31, name: '新竹市立培英國民中學', code: 'HSZ-PY-001', county: '新竹市', district: '東區', address: '新竹市東區南大路569號', phone: '03-526-1040', type: '國中', created_at: '2024-01-08T00:00:00Z', updated_at: '2024-01-08T00:00:00Z' },
  { id: 32, name: '新竹市東區東門國民小學', code: 'HSZ-ES-001', county: '新竹市', district: '東區', address: '新竹市東區民族路33號', phone: '03-522-2352', type: '國小', created_at: '2024-01-08T00:00:00Z', updated_at: '2024-01-08T00:00:00Z' },

  // ===== 新竹縣 (3所) =====
  { id: 33, name: '新竹縣立竹北高級中學', code: 'HSQ-ZB-001', county: '新竹縣', district: '竹北市', address: '新竹縣竹北市中正西路154號', phone: '03-551-9178', type: '高中', created_at: '2024-01-09T00:00:00Z', updated_at: '2024-01-09T00:00:00Z' },
  { id: 34, name: '新竹縣立竹北國民中學', code: 'HSQ-ZJ-001', county: '新竹縣', district: '竹北市', address: '新竹縣竹北市中正西路154號', phone: '03-555-2152', type: '國中', created_at: '2024-01-09T00:00:00Z', updated_at: '2024-01-09T00:00:00Z' },
  { id: 35, name: '新竹縣竹北市竹北國民小學', code: 'HSQ-ES-001', county: '新竹縣', district: '竹北市', address: '新竹縣竹北市中央路98號', phone: '03-555-2047', type: '國小', created_at: '2024-01-09T00:00:00Z', updated_at: '2024-01-09T00:00:00Z' },

  // ===== 苗栗縣 (3所) =====
  { id: 36, name: '苗栗縣立苗栗高級中學', code: 'MIA-ML-001', county: '苗栗縣', district: '苗栗市', address: '苗栗縣苗栗市中山路221號', phone: '037-320-072', type: '高中', created_at: '2024-01-10T00:00:00Z', updated_at: '2024-01-10T00:00:00Z' },
  { id: 37, name: '苗栗縣立苗栗國民中學', code: 'MIA-MJ-001', county: '苗栗縣', district: '苗栗市', address: '苗栗縣苗栗市高苗里7鄰福星街8號', phone: '037-320-190', type: '國中', created_at: '2024-01-10T00:00:00Z', updated_at: '2024-01-10T00:00:00Z' },
  { id: 38, name: '苗栗縣苗栗市建功國民小學', code: 'MIA-ES-001', county: '苗栗縣', district: '苗栗市', address: '苗栗縣苗栗市建功里10鄰大同路80號', phone: '037-320-328', type: '國小', created_at: '2024-01-10T00:00:00Z', updated_at: '2024-01-10T00:00:00Z' },

  // ===== 彰化縣 (3所) =====
  { id: 39, name: '彰化縣立彰化高級中學', code: 'CHA-CH-001', county: '彰化縣', district: '彰化市', address: '彰化縣彰化市中興路78號', phone: '04-762-2325', type: '高中', created_at: '2024-01-11T00:00:00Z', updated_at: '2024-01-11T00:00:00Z' },
  { id: 40, name: '彰化縣立彰興國民中學', code: 'CHA-CX-001', county: '彰化縣', district: '彰化市', address: '彰化縣彰化市埔西街97號', phone: '04-751-0082', type: '國中', created_at: '2024-01-11T00:00:00Z', updated_at: '2024-01-11T00:00:00Z' },
  { id: 41, name: '彰化縣彰化市中山國民小學', code: 'CHA-ES-001', county: '彰化縣', district: '彰化市', address: '彰化縣彰化市中山路二段678號', phone: '04-722-2033', type: '國小', created_at: '2024-01-11T00:00:00Z', updated_at: '2024-01-11T00:00:00Z' },

  // ===== 南投縣 (3所) =====
  { id: 42, name: '南投縣立南投高級中學', code: 'NAN-NT-001', county: '南投縣', district: '南投市', address: '南投縣南投市中興路669號', phone: '049-222-2284', type: '高中', created_at: '2024-01-12T00:00:00Z', updated_at: '2024-01-12T00:00:00Z' },
  { id: 43, name: '南投縣立南投國民中學', code: 'NAN-NJ-001', county: '南投縣', district: '南投市', address: '南投縣南投市復興路261號', phone: '049-222-2403', type: '國中', created_at: '2024-01-12T00:00:00Z', updated_at: '2024-01-12T00:00:00Z' },
  { id: 44, name: '南投縣南投市南投國民小學', code: 'NAN-ES-001', county: '南投縣', district: '南投市', address: '南投縣南投市民族路217號', phone: '049-222-2043', type: '國小', created_at: '2024-01-12T00:00:00Z', updated_at: '2024-01-12T00:00:00Z' },

  // ===== 雲林縣 (3所) =====
  { id: 45, name: '雲林縣立斗六高級中學', code: 'YUN-DL-001', county: '雲林縣', district: '斗六市', address: '雲林縣斗六市民生路224號', phone: '05-532-2039', type: '高中', created_at: '2024-01-13T00:00:00Z', updated_at: '2024-01-13T00:00:00Z' },
  { id: 46, name: '雲林縣立斗六國民中學', code: 'YUN-DJ-001', county: '雲林縣', district: '斗六市', address: '雲林縣斗六市仁愛路52號', phone: '05-532-2035', type: '國中', created_at: '2024-01-13T00:00:00Z', updated_at: '2024-01-13T00:00:00Z' },
  { id: 47, name: '雲林縣斗六市斗六國民小學', code: 'YUN-ES-001', county: '雲林縣', district: '斗六市', address: '雲林縣斗六市鎮東路225號', phone: '05-532-2877', type: '國小', created_at: '2024-01-13T00:00:00Z', updated_at: '2024-01-13T00:00:00Z' },

  // ===== 嘉義市 (3所) =====
  { id: 48, name: '嘉義市立嘉義高級中學', code: 'CYI-JY-001', county: '嘉義市', district: '東區', address: '嘉義市東區大雅路二段738號', phone: '05-276-2804', type: '高中', created_at: '2024-01-14T00:00:00Z', updated_at: '2024-01-14T00:00:00Z' },
  { id: 49, name: '嘉義市立北興國民中學', code: 'CYI-BX-001', county: '嘉義市', district: '西區', address: '嘉義市西區北興街182號', phone: '05-233-1960', type: '國中', created_at: '2024-01-14T00:00:00Z', updated_at: '2024-01-14T00:00:00Z' },
  { id: 50, name: '嘉義市東區崇文國民小學', code: 'CYI-ES-001', county: '嘉義市', district: '東區', address: '嘉義市東區垂楊路241號', phone: '05-222-5396', type: '國小', created_at: '2024-01-14T00:00:00Z', updated_at: '2024-01-14T00:00:00Z' },

  // ===== 嘉義縣 (3所) =====
  { id: 51, name: '嘉義縣立民雄高級農工職業學校', code: 'CYQ-MX-001', county: '嘉義縣', district: '民雄鄉', address: '嘉義縣民雄鄉文隆村81號', phone: '05-226-1527', type: '高中', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },
  { id: 52, name: '嘉義縣立民雄國民中學', code: 'CYQ-MJ-001', county: '嘉義縣', district: '民雄鄉', address: '嘉義縣民雄鄉中樂村民族路43號', phone: '05-226-1014', type: '國中', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },
  { id: 53, name: '嘉義縣民雄鄉民雄國民小學', code: 'CYQ-ES-001', county: '嘉義縣', district: '民雄鄉', address: '嘉義縣民雄鄉中樂村民族路15號', phone: '05-226-1014', type: '國小', created_at: '2024-01-15T00:00:00Z', updated_at: '2024-01-15T00:00:00Z' },

  // ===== 屏東縣 (3所) =====
  { id: 54, name: '屏東縣立屏東高級中學', code: 'PIF-PT-001', county: '屏東縣', district: '屏東市', address: '屏東縣屏東市忠孝路231號', phone: '08-732-5174', type: '高中', created_at: '2024-01-16T00:00:00Z', updated_at: '2024-01-16T00:00:00Z' },
  { id: 55, name: '屏東縣立屏東國民中學', code: 'PIF-PJ-001', county: '屏東縣', district: '屏東市', address: '屏東縣屏東市公園路35號', phone: '08-732-2204', type: '國中', created_at: '2024-01-16T00:00:00Z', updated_at: '2024-01-16T00:00:00Z' },
  { id: 56, name: '屏東縣屏東市中正國民小學', code: 'PIF-ES-001', county: '屏東縣', district: '屏東市', address: '屏東縣屏東市中正路188號', phone: '08-732-4204', type: '國小', created_at: '2024-01-16T00:00:00Z', updated_at: '2024-01-16T00:00:00Z' },

  // ===== 宜蘭縣 (3所) =====
  { id: 57, name: '宜蘭縣立宜蘭高級中學', code: 'ILA-YL-001', county: '宜蘭縣', district: '宜蘭市', address: '宜蘭縣宜蘭市復興路二段77號', phone: '03-932-2519', type: '高中', created_at: '2024-01-17T00:00:00Z', updated_at: '2024-01-17T00:00:00Z' },
  { id: 58, name: '宜蘭縣立宜蘭國民中學', code: 'ILA-YJ-001', county: '宜蘭縣', district: '宜蘭市', address: '宜蘭縣宜蘭市復興路一段95號', phone: '03-932-2245', type: '國中', created_at: '2024-01-17T00:00:00Z', updated_at: '2024-01-17T00:00:00Z' },
  { id: 59, name: '宜蘭縣宜蘭市宜蘭國民小學', code: 'ILA-ES-001', county: '宜蘭縣', district: '宜蘭市', address: '宜蘭縣宜蘭市崇聖街2號', phone: '03-932-2210', type: '國小', created_at: '2024-01-17T00:00:00Z', updated_at: '2024-01-17T00:00:00Z' },

  // ===== 花蓮縣 (3所) =====
  { id: 60, name: '花蓮縣立花蓮高級中學', code: 'HUN-HL-001', county: '花蓮縣', district: '花蓮市', address: '花蓮縣花蓮市民權路42號', phone: '03-832-4121', type: '高中', created_at: '2024-01-18T00:00:00Z', updated_at: '2024-01-18T00:00:00Z' },
  { id: 61, name: '花蓮縣立花蓮國民中學', code: 'HUN-HJ-001', county: '花蓮縣', district: '花蓮市', address: '花蓮縣花蓮市公園路40號', phone: '03-832-2106', type: '國中', created_at: '2024-01-18T00:00:00Z', updated_at: '2024-01-18T00:00:00Z' },
  { id: 62, name: '花蓮縣花蓮市明禮國民小學', code: 'HUN-ES-001', county: '花蓮縣', district: '花蓮市', address: '花蓮縣花蓮市明禮路6號', phone: '03-832-2310', type: '國小', created_at: '2024-01-18T00:00:00Z', updated_at: '2024-01-18T00:00:00Z' },

  // ===== 臺東縣 (3所) =====
  { id: 63, name: '臺東縣立臺東高級中學', code: 'TTT-TT-001', county: '臺東縣', district: '臺東市', address: '臺東縣臺東市中華路一段721號', phone: '089-322-047', type: '高中', created_at: '2024-01-19T00:00:00Z', updated_at: '2024-01-19T00:00:00Z' },
  { id: 64, name: '臺東縣立新生國民中學', code: 'TTT-XS-001', county: '臺東縣', district: '臺東市', address: '臺東縣臺東市新生路641巷64號', phone: '089-322-039', type: '國中', created_at: '2024-01-19T00:00:00Z', updated_at: '2024-01-19T00:00:00Z' },
  { id: 65, name: '臺東縣臺東市仁愛國民小學', code: 'TTT-ES-001', county: '臺東縣', district: '臺東市', address: '臺東縣臺東市四維路一段400號', phone: '089-322-071', type: '國小', created_at: '2024-01-19T00:00:00Z', updated_at: '2024-01-19T00:00:00Z' },

  // ===== 澎湖縣 (3所) =====
  { id: 66, name: '澎湖縣立馬公高級中學', code: 'PEN-MG-001', county: '澎湖縣', district: '馬公市', address: '澎湖縣馬公市中華路369號', phone: '06-921-7578', type: '高中', created_at: '2024-01-20T00:00:00Z', updated_at: '2024-01-20T00:00:00Z' },
  { id: 67, name: '澎湖縣立馬公國民中學', code: 'PEN-MJ-001', county: '澎湖縣', district: '馬公市', address: '澎湖縣馬公市西文里180號', phone: '06-921-6350', type: '國中', created_at: '2024-01-20T00:00:00Z', updated_at: '2024-01-20T00:00:00Z' },
  { id: 68, name: '澎湖縣馬公市中正國民小學', code: 'PEN-ES-001', county: '澎湖縣', district: '馬公市', address: '澎湖縣馬公市中正路2號', phone: '06-927-2785', type: '國小', created_at: '2024-01-20T00:00:00Z', updated_at: '2024-01-20T00:00:00Z' },

  // ===== 金門縣 (3所) =====
  { id: 69, name: '金門縣立金門高級中學', code: 'KIN-JM-001', county: '金門縣', district: '金城鎮', address: '金門縣金城鎮民生路93號', phone: '082-325-437', type: '高中', created_at: '2024-01-21T00:00:00Z', updated_at: '2024-01-21T00:00:00Z' },
  { id: 70, name: '金門縣立金城國民中學', code: 'KIN-JJ-001', county: '金門縣', district: '金城鎮', address: '金門縣金城鎮民生路4號', phone: '082-325-444', type: '國中', created_at: '2024-01-21T00:00:00Z', updated_at: '2024-01-21T00:00:00Z' },
  { id: 71, name: '金門縣金城鎮中正國民小學', code: 'KIN-ES-001', county: '金門縣', district: '金城鎮', address: '金門縣金城鎮民生路4號', phone: '082-325-647', type: '國小', created_at: '2024-01-21T00:00:00Z', updated_at: '2024-01-21T00:00:00Z' },

  // ===== 連江縣 (3所) =====
  { id: 72, name: '連江縣立馬祖高級中學', code: 'LIE-MZ-001', county: '連江縣', district: '南竿鄉', address: '連江縣南竿鄉介壽村76號', phone: '0836-22-247', type: '高中', created_at: '2024-01-22T00:00:00Z', updated_at: '2024-01-22T00:00:00Z' },
  { id: 73, name: '連江縣立介壽國民中小學', code: 'LIE-JS-001', county: '連江縣', district: '南竿鄉', address: '連江縣南竿鄉介壽村5號', phone: '0836-22-067', type: '國中小', created_at: '2024-01-22T00:00:00Z', updated_at: '2024-01-22T00:00:00Z' },
  { id: 74, name: '連江縣南竿鄉仁愛國民小學', code: 'LIE-ES-001', county: '連江縣', district: '南竿鄉', address: '連江縣南竿鄉仁愛村53號', phone: '0836-22-756', type: '國小', created_at: '2024-01-22T00:00:00Z', updated_at: '2024-01-22T00:00:00Z' },
];

let nextSchoolId = 75;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      return res.status(405).json({
        error: {
          code: 'METHOD_NOT_ALLOWED',
          message: 'Method not allowed',
          status: 405,
        },
      });
  }
}

function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { page = '1', page_size = '20', county, search } = req.query;
  const pageNum = parseInt(page as string, 10);
  const pageSizeNum = parseInt(page_size as string, 10);

  let filteredSchools = [...mockSchools];

  // Filter by county
  if (county && typeof county === 'string') {
    filteredSchools = filteredSchools.filter((s) => s.county === county);
  }

  // Filter by search term
  if (search && typeof search === 'string') {
    const searchLower = search.toLowerCase();
    filteredSchools = filteredSchools.filter(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.code.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const total = filteredSchools.length;
  const totalPages = Math.ceil(total / pageSizeNum);
  const offset = (pageNum - 1) * pageSizeNum;
  const paginatedSchools = filteredSchools.slice(offset, offset + pageSizeNum);

  res.status(200).json({
    data: {
      schools: paginatedSchools,
      pagination: {
        page: pageNum,
        page_size: pageSizeNum,
        total,
        total_pages: totalPages,
      },
    },
  });
}

function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { name, code, county, district, address, phone } = req.body;

  // Basic validation
  if (!name || !code || !county) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: '學校名稱、代碼和縣市為必填欄位',
        status: 400,
      },
    });
  }

  // Check for duplicate code
  if (mockSchools.some((s) => s.code === code)) {
    return res.status(400).json({
      error: {
        code: 'DUPLICATE_CODE',
        message: '學校代碼已存在',
        status: 400,
      },
    });
  }

  const now = new Date().toISOString();
  // Infer school type from name
  let schoolType = '其他';
  if (name.includes('國小') || name.includes('國民小學')) {
    schoolType = '國小';
  } else if (name.includes('國中') || name.includes('國民中學')) {
    schoolType = '國中';
  } else if (name.includes('高中') || name.includes('高級中學') || name.includes('高級中等學校')) {
    schoolType = '高中';
  }

  const newSchool = {
    id: nextSchoolId++,
    name,
    code,
    county,
    district: district || '',
    address: address || '',
    phone: phone || '',
    type: schoolType,
    created_at: now,
    updated_at: now,
  };

  mockSchools.push(newSchool);

  res.status(201).json({
    data: {
      school: newSchool,
    },
  });
}
