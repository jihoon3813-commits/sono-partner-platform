import { Id } from "../../convex/_generated/dataModel";

export interface SeedProduct {
    brand: string;
    model: string;
    name: string;
    category: string;
    slotCount: number;
    monthlyPayment: number;
    cardDiscountPayment: number;
    image: string;
    isVisible: boolean;
    hasGift: boolean;
}

const sampleProducts: SeedProduct[] = [
  {
    "brand": "애플",
    "name": "맥북 프로 M5 14인치 (스페이스 블랙)",
    "model": "MDE34KH/A",
    "category": "TV / 디지털",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/260320/RDSN49xXjHnjLmU8uYWbN4uqXL5rZM.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "LG",
    "name": "Easy AI TV 75인치",
    "model": "75UT9300KNA",
    "category": "TV / 디지털",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/251203/pExDFEnCteKZ5vsEUpCjc5NG3y4A1y.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "삼성",
    "name": "비스포크 AI 하이브리드 4도어 냉장고 889L (새틴 화이트/새틴 베이지)",
    "model": "RF91DB92V1AP",
    "category": "냉장가전",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/250605/ePP8Zufwcs5CXDgNWUbzmKyZ6G4RWD.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "삼성",
    "name": "비스포크 AI 하이브리드 4도어 냉장고 889L (새틴 화이트)",
    "model": "RF91DB92V1W1",
    "category": "냉장가전",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/250605/51uWPbd9m1u3xJWg1GGnKkVbxawSXZ.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "삼성",
    "name": "비스포크 AI 하이브리드 4도어 냉장고 889L (코타 화이트)",
    "model": "RF91DB92V101",
    "category": "냉장가전",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/250605/KKKhwJcVPGE38ruMRLpc5R2fR7vqZh.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "삼성",
    "name": "비스포크 그랑데 AI 원바디 Top-Fit 세탁기 25kg + 건조기 22kg (그레이지)",
    "model": "WF2522HCEE",
    "category": "세탁가전",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/250616/fq45Wrx9QRM3uGLvCKkfeJZUYL98sF.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "삼성",
    "name": "비스포크 그랑데 AI 원바디 Top-Fit 세탁기 25kg + 건조기 22kg (베이지)",
    "model": "WF2521HCBB",
    "category": "세탁가전",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/240702/RMDfl4Hyb87ktf7MnJk2dsEVYq8s6W.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "LG",
    "name": "트롬 오브제컬렉션 세탁기 25kg (네이처 그린) + 트롬 오브제컬렉션 건조기 20kg (네이처 베이지)",
    "model": "FG25GNS+RG20VNS",
    "category": "세탁가전",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/240319/Gb5JjybKsgC6QQ6tvH2CHx2bBJt1ay.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "LG",
    "name": "트롬 오브제컬렉션 세탁기 25kg (네이처 그린) + 트롬 오브제컬렉션 건조기 20kg (네이처 그린)",
    "model": "FG25GNS+RG20GNS",
    "category": "세탁가전",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/240319/PZarEadz6TlUQBXnVwBd5eAqnUSBzZ.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "LG",
    "name": "트롬 오브제컬렉션 세탁기 25kg (네이처 베이지) + 트롬 오브제컬렉션 건조기 20kg (네이처 그린)",
    "model": "FG25VNS+RG20GNS",
    "category": "세탁가전",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/240319/XHG7H4Dbfuqhq51NXBlRYd2uAmNNM2.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "LG",
    "name": "트롬 오브제컬렉션 세탁기 25kg (네이처 베이지) + 트롬 오브제컬렉션 건조기 20kg (네이처 베이지)",
    "model": "FG25VNS+RG20VNS",
    "category": "세탁가전",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/240319/5PpYYLSpsNWphv4wLd9sRCdETWYPt5.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "삼성",
    "name": "비스포크 AI 세탁기 25kg (화이트) + 비스포크 AI 건조기 20kg (화이트)",
    "model": "WF25B9600KW+DV20B9750KW",
    "category": "세탁가전",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/250819/3pmKdhy44A1CQlefpubaJWYmJc81qw.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "세라젬",
    "name": "안마의자 더 뉴 마스터 V4 (브라운)",
    "model": "CGM MB-1901",
    "category": "건강 / 뷰티",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/231122/HJg6vpfDe9bx56zZa9dhEzsRQBcBaD.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "세라젬",
    "name": "안마의자 더 뉴 마스터 V4 (화이트)",
    "model": "CGM MB-1901",
    "category": "건강 / 뷰티",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/231122/vDF2lbnjZCzgm96QnFhFL8zzAgygVL.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "바디프랜드",
    "name": "안마의자 팔콘S",
    "model": "BFR-7211",
    "category": "건강 / 뷰티",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/240909/5PGZqslM1ZVZlt7SbmnzbQCGl7Ht1m.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "아츠아크",
    "name": "코니 일자형 3.5인용 소파",
    "model": "코니(일자형)",
    "category": "가구 / 침대",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/230811/aJY1hvASwMRNM3f8lLfUdNjJszaw3c.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "아츠아크",
    "name": "스터닝 카우치형 4인용 소파",
    "model": "스터닝(카우치형)_Stunning",
    "category": "가구 / 침대",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/230216/YGtmpMwy4j8bDmgkKhs8aET2cyE5LB.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "소노시즌",
    "name": "어드밴스 미디엄 매트리스 Q + 코지 스위트 프레임 Q/K (웜 그레이) + 경동나비엔 사계절매트 Q + 그래피놀 호텔 베딩 풀세트",
    "model": "어드밴스 미디엄 Q",
    "category": "가구 / 침대",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/251204/1aEWUfda2et445Shd4AHAcDU8LVzf4.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "애플",
    "name": "M4 512GB 맥북 에어 13인치 (미드나잇 블루) + 매직마우스 + 노트북가방",
    "model": "MXCR3KH/A",
    "category": "TV / 디지털",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/260401/tECREaf4xZ1xEZvRq4Ywe3vHwTV6Lv.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "애플",
    "name": "아이패드 프로 M5 WiFi 256GB 11인치 (블랙) + 애플펜슬 프로 + 스마트 폴리오 (블랙)",
    "model": "MVV83KH/A",
    "category": "TV / 디지털",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/260324/WZSdxZ33sNANzATB6ScYdWkwc77yP3.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "삼성",
    "name": "갤럭시 북5 프로 노트북 15인치 (그레이)",
    "model": "NT940XMA-K71AG",
    "category": "TV / 디지털",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/260223/KcEpvkRQWBJL2ryWQWFmNSslZPjZaR.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "LG",
    "name": "그램 노트북 17인치 (스노우 화이트)",
    "model": "17Z90S-GA56K",
    "category": "TV / 디지털",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/251216/aEeQ5KcP3ENVqmu269ry1sTHJrhu9b.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "LG",
    "name": "나노셀 AI TV 86인치",
    "model": "86UT8000KNA",
    "category": "TV / 디지털",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/260115/dz9dwGNGGZnUA1z9JfzMaqPvaMgra3.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "삼성",
    "name": "크리스탈 UHD TV 85인치 + 2.0 채널 사운드바",
    "model": "UC85 DU7000+HW-C400",
    "category": "TV / 디지털",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/251120/A4xuCegT1ty4Wsz5dea5ltT8UtDYKN.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "삼성",
    "name": "비스포크 AI 4도어 냉장고 902L (에센셜 화이트)",
    "model": "RF90DB90E1W1",
    "category": "냉장가전",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/251203/k7gKHKXj1aLVPs3uL9llPW4zZvNPFe.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "LG",
    "name": "디오스 오브제컬렉션 베이직 냉장고 870L (베이지/클레이 브라운)",
    "model": "T874BEE111",
    "category": "냉장가전",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/240905/AsgJygT1QZZnJ2gkEYrKyHbYlEVpzZ.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "삼성",
    "name": "비스포크 AI 4도어 키친핏 냉장고 640L (코타 화이트)",
    "model": "RF60DB90E101",
    "category": "냉장가전",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/250605/HE6RYrZq42yG2JYvTuQhrHe64LgSq2.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "LG",
    "name": "트롬 AI 오브제컬렉션 건조기 25kg (네이처 그린)",
    "model": "RG25GNS",
    "category": "세탁가전",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/251017/W3EGAC51FWlfMmzE9kz15vk7ATagU7.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "LG",
    "name": "휘센 오브제컬렉션 뷰II 1시리즈 2in1 에어컨 18평형+6평형 (에센스 화이트)",
    "model": "FQ18FU1EA2",
    "category": "에어컨",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/251222/NTgnUJRhdyUWERTfKBXp3TqTyNMWCY.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "삼성",
    "name": "비스포크 AI 김치플러스 4도어 김치냉장고 490L (에센셜 화이트)",
    "model": "RQ49DB90E1W1",
    "category": "냉장가전",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/250916/l9LdHFExZ5chBRYhl3dn6cZjlYWExR.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "LG",
    "name": "코드제로 로보킹 AI 올인원 로봇청소기 (카밍 베이지)",
    "model": "B95AWBH",
    "category": "생활가전",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/250423/cEhFJAQvgX2KYvnwgdb7yYV1CeeEDn.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "드리미",
    "name": "올인원 로봇청소기 (화이트) + 습식 및 건식 진공 청소기 (블랙)",
    "model": "Dreame X40U+H12 Pro",
    "category": "생활가전",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/251110/RvymqgFnj5YcqDjZ1jAcek8FNjwu6u.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "세라젬",
    "name": "파우제 M6 S 안마의자",
    "model": "CGM EMCG-2401(S)",
    "category": "건강 / 뷰티",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/251203/t13gmKnmvbPPMeR9Ecx7Vr7lqQnH8C.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "애플",
    "name": "아이패드 에어 M3 WiFi 128GB 11인치 (스페이스 그레이)",
    "model": "MUWC3KH/A",
    "category": "TV / 디지털",
    "slotCount": 2,
    "monthlyPayment": 33000,
    "cardDiscountPayment": 8000,
    "image": "https://storage.bilrigo.com/data/thumbnails/250528/xfuHaRLBcKpActqkrMnkCPw4CgQvYN.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "LG",
    "name": "나노셀 AI TV 55인치",
    "model": "55NANO75KNA",
    "category": "TV / 디지털",
    "slotCount": 2,
    "monthlyPayment": 33000,
    "cardDiscountPayment": 8000,
    "image": "https://storage.bilrigo.com/data/thumbnails/260209/VkhAmhuu1eUxVFucpKfpa7M932lgD2.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "삼성",
    "name": "비스포크 양문형 냉장고 852L (코타 PCM 화이트)",
    "model": "RS84DG5001W1",
    "category": "냉장가전",
    "slotCount": 2,
    "monthlyPayment": 33000,
    "cardDiscountPayment": 8000,
    "image": "https://storage.bilrigo.com/data/thumbnails/250616/qvNCCEYtV9glHmysyxS8DljpSfL6sL.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "로보락",
    "name": "Qrevo Curv 로봇청소기 (화이트)",
    "model": "QRevo Curv",
    "category": "생활가전",
    "slotCount": 2,
    "monthlyPayment": 33000,
    "cardDiscountPayment": 8000,
    "image": "https://storage.bilrigo.com/data/thumbnails/260323/KZFvRfMUtJzfMTqQSHRzeVGsU3pQj6.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "LG",
    "name": "오브제컬렉션 스타일러 대용량 (블랙틴트미러) + 코드제로 오브제컬렉션 A7 Core 청소기 (카밍 베이지)",
    "model": "SC5GMR80S+A730WA",
    "category": "생활가전",
    "slotCount": 6,
    "monthlyPayment": 99000,
    "cardDiscountPayment": 74000,
    "image": "https://storage.bilrigo.com/data/thumbnails/260409/ZSvEHj468eWzpzvXlJ8DuDzWAbQHMz.jpg",
    "hasGift": false,
    "isVisible": true
  },
  {
    "brand": "LG",
    "name": "트롬 오브제컬렉션 세탁기 21kg (릴리 화이트) + 트롬 오브제컬렉션 건조기 19kg (화이트)",
    "model": "FG21WNR+RG19WN",
    "category": "세탁가전",
    "slotCount": 4,
    "monthlyPayment": 66000,
    "cardDiscountPayment": 41000,
    "image": "https://storage.bilrigo.com/data/thumbnails/260402/YlEAydhAlMR9pmVzX6MB4FTfmTGTYM.jpg",
    "hasGift": false,
    "isVisible": true
  }
];

export default sampleProducts;
