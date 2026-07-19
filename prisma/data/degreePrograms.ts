/**
 * 學習與媒材設計學系｜大學部／碩班課程種子資料
 * 來源：handbook-undergrad.txt（113）、handbook-master.txt（114）
 * 已排除手冊註明「113學年度刪除」或併入其他科目之課程
 */

export type DegreeCourse = {
  code: string;
  name: string;
  credits: number;
  group: string;
  notes?: string;
};

export type DegreeProgramSeed = {
  code: string;
  name: string;
  type: string;
  shortLabel: string;
  description: string;
  totalCredits: number;
  sortOrder: number;
  groups: {
    code: string;
    name: string;
    blockName?: string;
    minCredits: number;
    description?: string;
  }[];
  courses: DegreeCourse[];
  prereqs?: { course: string; requires: string; note?: string }[];
  nonCredits?: { code: string; name: string; description: string }[];
};

/** 大學部｜學習與媒材設計學系（畢業至少 128 學分） */
export const UNDERGRAD: DegreeProgramSeed = {
  code: "UNDERGRAD",
  name: "大學部｜學習與媒材設計學系",
  type: "undergraduate",
  shortLabel: "大學部",
    description:
      "依《113學習與媒材設計學系大學部課程手冊》：畢業至少128學分＝校共同科目中通識教育課程28（共同必修10＋分類選修16＋共同選修2）＋系專門至少85（必修31／甲類26／乙類28）＋自由選修至少15。同時修教育學程時自由選修免修。系專門分教育、社會與文化、科技與設計三區塊，每區塊選修至少8學分；總學分128以內需含第二外語4學分。",
  totalCredits: 128,
  sortOrder: 1,
  groups: [
    // 校共同科目｜通識教育課程（28）
    {
      code: "GE_CORE",
      name: "共同必修（國文／英文）",
      blockName: "校共同科目｜通識教育",
      minCredits: 10,
      description: "國文4＋英文6；通識教育課程28學分之一",
    },
    {
      code: "GE_ART",
      name: "分類選修｜藝術與美感",
      blockName: "校共同科目｜通識教育",
      minCredits: 4,
      description: "分類選修四領域各至少4學分（共16）",
    },
    {
      code: "GE_CIVIC",
      name: "分類選修｜公民素養與社會探索",
      blockName: "校共同科目｜通識教育",
      minCredits: 4,
      description: "分類選修四領域各至少4學分（共16）",
    },
    {
      code: "GE_HUMAN",
      name: "分類選修｜人文與文化思考",
      blockName: "校共同科目｜通識教育",
      minCredits: 4,
      description: "分類選修四領域各至少4學分（共16）",
    },
    {
      code: "GE_NATURE",
      name: "分類選修｜自然、生命與科技",
      blockName: "校共同科目｜通識教育",
      minCredits: 4,
      description: "分類選修四領域各至少4學分（共16）",
    },
    {
      code: "GE_ELECTIVE",
      name: "共同選修",
      blockName: "校共同科目｜通識教育",
      minCredits: 2,
      description: "通識共同選修至少2學分",
    },
    // 校共同科目｜體育／服務學習／全民國防（0學分）
    {
      code: "GE_PE",
      name: "體育課程",
      blockName: "校共同科目｜體育",
      minCredits: 0,
      description: "大一、大二必修；須修滿4門不同科目名稱（0學分）；體院／舞蹈系／體育系免修",
    },
    {
      code: "MAJOR_REQ",
      name: "系專業必修",
      blockName: "系專門課程",
      minCredits: 31,
      description: "系專業必修31學分",
    },
    {
      code: "ELECTIVE_A",
      name: "甲類選修",
      blockName: "系專門課程",
      minCredits: 26,
      description: "甲類選修基礎科目至少26學分；三區塊選修各至少8學分",
    },
    {
      code: "ELECTIVE_B",
      name: "乙類選修",
      blockName: "系專門課程",
      minCredits: 28,
      description: "乙類選修進階科目至少28學分",
    },
    {
      code: "FREE",
      name: "自由選修",
      blockName: "自由選修",
      minCredits: 15,
      description:
        "至少15學分；不含通識、體育。同時修教育學程時免修；114起入學之教育基礎／方法課程可採認為自由選修至多15學分",
    },
  ],
  courses: [
    // 校共同｜通識｜共同必修（10）
    { code: "GE-CN1", name: "國文(I)：閱讀與思辯", credits: 2, group: "GE_CORE", notes: "通識共同必修｜大一" },
    { code: "GE-CN2", name: "國文(II)：寫作表達", credits: 2, group: "GE_CORE", notes: "通識共同必修｜大一" },
    { code: "GE-EN1", name: "英文(I)", credits: 2, group: "GE_CORE", notes: "通識共同必修｜大一" },
    { code: "GE-EN2", name: "英文(II)", credits: 2, group: "GE_CORE", notes: "通識共同必修｜大一" },
    { code: "GE-EN3", name: "英文(III)", credits: 2, group: "GE_CORE", notes: "通識共同必修｜大二" },
    // 校共同｜通識｜共同選修（分類選修請手動歸類四領域）
    {
      code: "GE-LIFE",
      name: "大學生活學習與輔導",
      credits: 0,
      group: "GE_ELECTIVE",
      notes: "大一至大四；0學分（綜合輔導）",
    },
    // 校共同｜體育（請以實際體育課名手動新增，須4門不同名稱）
    {
      code: "GE-PE1",
      name: "體育（請改為實際科目名稱）",
      credits: 0,
      group: "GE_PE",
      notes: "大一／大二；須修滿4門不同科目名稱",
    },

    // 系專業必修｜教育
    { code: "EDU101", name: "教育概論", credits: 2, group: "MAJOR_REQ", notes: "教育區塊" },
    { code: "EDU102", name: "學習心理學", credits: 2, group: "MAJOR_REQ", notes: "教育區塊" },
    { code: "EDU201", name: "認知心理學", credits: 2, group: "MAJOR_REQ", notes: "教育區塊" },
    { code: "EDU301", name: "學習媒材與評鑑", credits: 2, group: "MAJOR_REQ", notes: "教育區塊" },
    { code: "EDU302", name: "教科書設計與實作", credits: 3, group: "MAJOR_REQ", notes: "教育區塊" },

    // 系專業必修｜社會與文化
    { code: "DES201", name: "設計美學", credits: 2, group: "MAJOR_REQ", notes: "社會與文化區塊" },
    { code: "EDU202", name: "教育思潮與文案設計", credits: 2, group: "MAJOR_REQ", notes: "社會與文化區塊" },
    { code: "CAP301", name: "文教產業專題實習", credits: 2, group: "MAJOR_REQ", notes: "社會與文化區塊｜總整課程" },
    { code: "CAP401", name: "媒材設計專題研究I", credits: 2, group: "MAJOR_REQ", notes: "社會與文化區塊｜總整課程" },
    { code: "CAP402", name: "媒材設計專題研究II", credits: 2, group: "MAJOR_REQ", notes: "社會與文化區塊｜總整課程" },

    // 系專業必修｜科技與設計
    { code: "LAB101", name: "媒材實作I", credits: 1, group: "MAJOR_REQ", notes: "科技與設計區塊" },
    { code: "DES203", name: "數位動畫原理與製作", credits: 2, group: "MAJOR_REQ", notes: "科技與設計區塊" },
    { code: "DES202", name: "視覺傳達設計", credits: 2, group: "MAJOR_REQ", notes: "科技與設計區塊" },
    { code: "DES204", name: "多媒體處理技術與應用", credits: 2, group: "MAJOR_REQ", notes: "科技與設計區塊" },
    { code: "DES205", name: "數位編輯與出版", credits: 3, group: "MAJOR_REQ", notes: "科技與設計區塊" },
    { code: "LAB301", name: "媒材實作III", credits: 0, group: "MAJOR_REQ", notes: "科技與設計區塊｜0學分" },
    { code: "LAB302", name: "媒材實作IV", credits: 0, group: "MAJOR_REQ", notes: "科技與設計區塊｜0學分" },

    // 甲類選修｜教育
    { code: "A-ED1", name: "教材教具與遊戲式學習", credits: 2, group: "ELECTIVE_A", notes: "教育區塊" },
    { code: "A-ED2", name: "注音符號學習設計", credits: 2, group: "ELECTIVE_A", notes: "教育區塊" },
    { code: "A-ED3", name: "課程原理與媒材設計", credits: 3, group: "ELECTIVE_A", notes: "教育區塊" },
    { code: "A-ED4", name: "寫作學習設計", credits: 2, group: "ELECTIVE_A", notes: "教育區塊" },
    { code: "A-ED5", name: "學習設計與實作", credits: 3, group: "ELECTIVE_A", notes: "教育區塊" },
    { code: "A-ED6", name: "數學學習心理學", credits: 2, group: "ELECTIVE_A", notes: "教育區塊" },
    { code: "A-ED7", name: "學習與空間規劃", credits: 2, group: "ELECTIVE_A", notes: "教育區塊" },

    // 甲類選修｜社會與文化
    { code: "A-SO1", name: "媒體素養", credits: 2, group: "ELECTIVE_A", notes: "社會與文化區塊｜113新增" },
    { code: "A-SO2", name: "社會科學研究法", credits: 2, group: "ELECTIVE_A", notes: "社會與文化區塊" },
    {
      code: "A-SO3",
      name: "文教產業與智慧財產權相關法規",
      credits: 2,
      group: "ELECTIVE_A",
      notes: "社會與文化區塊",
    },
    {
      code: "A-SO4",
      name: "文教創意產業管理與行銷",
      credits: 2,
      group: "ELECTIVE_A",
      notes: "社會與文化區塊｜113調整為大三",
    },
    { code: "A-SO5", name: "簡報製作與表達", credits: 2, group: "ELECTIVE_A", notes: "社會與文化區塊｜113新增" },

    // 甲類選修｜科技與設計
    { code: "A-TD1", name: "設計概論", credits: 2, group: "ELECTIVE_A", notes: "科技與設計區塊" },
    { code: "A-TD2", name: "設計素描", credits: 2, group: "ELECTIVE_A", notes: "科技與設計區塊" },
    { code: "A-TD3", name: "數位科技概論", credits: 2, group: "ELECTIVE_A", notes: "科技與設計區塊" },
    { code: "A-TD4", name: "電腦繪圖", credits: 2, group: "ELECTIVE_A", notes: "科技與設計區塊" },
    { code: "A-TD5", name: "色彩學", credits: 2, group: "ELECTIVE_A", notes: "科技與設計區塊" },
    { code: "A-TD6", name: "網際網路概論", credits: 2, group: "ELECTIVE_A", notes: "科技與設計區塊" },
    { code: "A-TD7", name: "基礎攝影", credits: 2, group: "ELECTIVE_A", notes: "科技與設計區塊" },
    { code: "A-TD8", name: "設計思考", credits: 2, group: "ELECTIVE_A", notes: "科技與設計區塊｜UCAN職涯徑路｜113新增" },
    { code: "A-TD9", name: "媒材實作II", credits: 1, group: "ELECTIVE_A", notes: "科技與設計區塊" },
    {
      code: "A-TD10",
      name: "使用者經驗設計",
      credits: 2,
      group: "ELECTIVE_A",
      notes: "科技與設計區塊｜UCAN職涯徑路｜113新增",
    },
    {
      code: "A-TD11",
      name: "網站設計與經營",
      credits: 2,
      group: "ELECTIVE_A",
      notes: "科技與設計區塊｜UCAN職涯徑路｜113新增",
    },

    // 乙類選修｜教育
    { code: "B-ED1", name: "情境學習理論", credits: 2, group: "ELECTIVE_B", notes: "教育區塊" },
    { code: "B-ED2", name: "創造心理學", credits: 2, group: "ELECTIVE_B", notes: "教育區塊" },
    { code: "B-ED3", name: "繪本與學習媒材", credits: 2, group: "ELECTIVE_B", notes: "教育區塊" },
    { code: "B-ED4", name: "閱讀理解與兒童發展", credits: 2, group: "ELECTIVE_B", notes: "教育區塊" },
    { code: "B-ED5", name: "識字與寫字學習設計", credits: 2, group: "ELECTIVE_B", notes: "教育區塊" },
    { code: "B-ED6", name: "社會領域學習設計", credits: 2, group: "ELECTIVE_B", notes: "教育區塊" },
    { code: "B-ED7", name: "環境教育學習設計", credits: 2, group: "ELECTIVE_B", notes: "教育區塊" },
    { code: "B-ED8", name: "健康與體育學習設計", credits: 2, group: "ELECTIVE_B", notes: "教育區塊" },
    { code: "B-ED9", name: "閱讀學習設計", credits: 2, group: "ELECTIVE_B", notes: "教育區塊" },
    { code: "B-ED10", name: "綜合活動領域學習設計", credits: 2, group: "ELECTIVE_B", notes: "教育區塊" },
    { code: "B-ED11", name: "自然領域學習設計", credits: 2, group: "ELECTIVE_B", notes: "教育區塊" },
    { code: "B-ED12", name: "數學領域學習設計", credits: 2, group: "ELECTIVE_B", notes: "教育區塊" },
    {
      code: "B-ED13",
      name: "語文領域學習設計",
      credits: 2,
      group: "ELECTIVE_B",
      notes: "教育區塊｜113由華語文／英語文學習設計合併",
    },
    {
      code: "B-ED14",
      name: "生命與品德教育學習設計",
      credits: 2,
      group: "ELECTIVE_B",
      notes: "教育區塊｜113調整為大三下",
    },
    {
      code: "B-ED15",
      name: "重大議題學習設計",
      credits: 2,
      group: "ELECTIVE_B",
      notes: "教育區塊｜含原性別平等教育學習設計",
    },
    { code: "B-ED16", name: "藝術與人文領域學習設計", credits: 2, group: "ELECTIVE_B", notes: "教育區塊" },
    { code: "B-ED17", name: "學習環境設計", credits: 2, group: "ELECTIVE_B", notes: "教育區塊" },

    // 乙類選修｜社會與文化
    { code: "B-SO1", name: "多元文化教育", credits: 2, group: "ELECTIVE_B", notes: "社會與文化區塊" },
    { code: "B-SO2", name: "都市社會學", credits: 2, group: "ELECTIVE_B", notes: "社會與文化區塊" },
    { code: "B-SO3", name: "劇本寫作", credits: 2, group: "ELECTIVE_B", notes: "社會與文化區塊" },
    {
      code: "B-SO4",
      name: "童書德文-初級德文I",
      credits: 2,
      group: "ELECTIVE_B",
      notes: "社會與文化區塊｜113更名；可計第二外語",
    },
    {
      code: "B-SO5",
      name: "童書德文-初級德文II",
      credits: 2,
      group: "ELECTIVE_B",
      notes: "社會與文化區塊｜113更名；可計第二外語",
    },
    { code: "B-SO6", name: "兒童讀物企畫與經營", credits: 2, group: "ELECTIVE_B", notes: "社會與文化區塊" },
    { code: "B-SO7", name: "互動式電子書企劃與設計", credits: 2, group: "ELECTIVE_B", notes: "社會與文化區塊" },
    {
      code: "B-SO8",
      name: "童書德文-初級德文III",
      credits: 2,
      group: "ELECTIVE_B",
      notes: "社會與文化區塊｜113更名；可計第二外語",
    },
    { code: "B-SO9", name: "教科書審查與評鑑", credits: 2, group: "ELECTIVE_B", notes: "社會與文化區塊" },
    {
      code: "B-SO10",
      name: "童書德文-初級德文IV",
      credits: 2,
      group: "ELECTIVE_B",
      notes: "社會與文化區塊｜113更名；可計第二外語",
    },
    { code: "B-SO11", name: "科技趨勢與教育", credits: 2, group: "ELECTIVE_B", notes: "社會與文化區塊" },
    { code: "B-SO12", name: "數位教材規範與品質認證", credits: 2, group: "ELECTIVE_B", notes: "社會與文化區塊" },
    { code: "B-SO13", name: "數位創意產業之經營與行銷", credits: 3, group: "ELECTIVE_B", notes: "社會與文化區塊" },
    {
      code: "B-SO14",
      name: "數位學習課程製作",
      credits: 2,
      group: "ELECTIVE_B",
      notes: "社會與文化區塊｜113更名",
    },

    // 乙類選修｜科技與設計
    { code: "B-TD1", name: "數位影像創作", credits: 3, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD2", name: "基礎設計實作", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD3", name: "數位影片剪輯", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD4", name: "圖表與版式設計", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD5", name: "音樂與視覺藝術", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD6", name: "遊戲企劃與應用", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD7", name: "多媒體設計", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD8", name: "網頁設計", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊｜UCAN職涯徑路｜113新增" },
    { code: "B-TD9", name: "人機介面", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD10", name: "當代藝術思潮與設計實作", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD11", name: "數位遊戲設計", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD12", name: "數位互動式教具設計", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    {
      code: "B-TD13",
      name: "書法藝術與應用設計",
      credits: 2,
      group: "ELECTIVE_B",
      notes: "科技與設計區塊｜111更名；113改為三上",
    },
    { code: "B-TD14", name: "多媒體教材設計與製作", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD15", name: "電腦化測驗與評量", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    {
      code: "B-TD16",
      name: "字體設計與創意應用",
      credits: 2,
      group: "ELECTIVE_B",
      notes: "科技與設計區塊｜111更名；113改為三下",
    },
    { code: "B-TD17", name: "材料與造型", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD18", name: "教科書周邊產品設計", credits: 3, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD19", name: "數位內容設計", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD20", name: "影像美學與創作", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD21", name: "創意開發設計", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD22", name: "展示規劃與設計", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD23", name: "教具研發與試用", credits: 2, group: "ELECTIVE_B", notes: "科技與設計區塊" },
    { code: "B-TD24", name: "行動技術與教材設計", credits: 3, group: "ELECTIVE_B", notes: "科技與設計區塊" },
  ],
  nonCredits: [
    {
      code: "SECOND_LANG",
      name: "第二外語",
      description: "畢業總學分128以內需含第二外語（英語以外）4學分",
    },
    {
      code: "BLOCK8",
      name: "三區塊選修門檻",
      description: "教育、社會與文化、科技與設計三區塊，每區塊選修至少8學分",
    },
    {
      code: "GE28",
      name: "通識教育課程28學分",
      description: "校共同科目｜通識教育＝共同必修10＋分類選修16（四領域各4）＋共同選修2",
    },
    {
      code: "PE4",
      name: "體育4門不同科目",
      description: "大一、大二體育課程，須修滿4門不同科目名稱（0學分）",
    },
  ],
};

/** 碩班｜課程與教學日碩班（畢業至少 34 學分） */
export const MASTER: DegreeProgramSeed = {
  code: "MASTER",
  name: "碩士班｜課程與教學日碩班",
  type: "master",
  shortLabel: "碩班",
  description:
    "依《114年學習與媒材設計學系課程與教學日碩班課程架構》：畢業至少34學分＝必修16學分（核心課程10＋學位論文6）＋選修18學分（共同選修至少6＋專精選修至少6）。共同選修中，基礎理論｜課程領域與教學領域各至少2學分。另須通過論文計畫發表與學位考試，並完成學術研究倫理教育課程。",
  totalCredits: 34,
  sortOrder: 2,
  groups: [
    {
      code: "M_CORE",
      name: "核心必修",
      blockName: "必修課程",
      minCredits: 10,
      description: "核心課程（共同必修）10學分",
    },
    {
      code: "M_THESIS",
      name: "學位論文",
      blockName: "必修課程",
      minCredits: 6,
      description: "碩士論文4學分＋獨立研究2學分",
    },
    {
      code: "M_COMMON",
      name: "共同選修",
      blockName: "選修課程",
      minCredits: 6,
      description: "共同選修至少6學分（課程領域至少2＋教學領域至少2）",
    },
    {
      code: "M_ADV",
      name: "專精選修",
      blockName: "選修課程",
      minCredits: 6,
      description: "專精選修至少6學分；選修合計至少18學分",
    },
  ],
  courses: [
    // 核心必修（10）— 手冊「四、必修科目」
    { code: "GS-C1", name: "當代課程與教學議題研討", credits: 2, group: "M_CORE", notes: "必修｜一年級" },
    { code: "GS-C2", name: "都會區課程與教學議題研究", credits: 2, group: "M_CORE", notes: "必修｜一年級" },
    { code: "GS-C3", name: "教育研究法：課程與教學取向", credits: 2, group: "M_CORE", notes: "必修｜一年級" },
    { code: "GS-C4", name: "教育統計學", credits: 2, group: "M_CORE", notes: "必修｜一年級" },
    {
      code: "GS-C5",
      name: "課程與教學質性研究(Ⅰ)",
      credits: 2,
      group: "M_CORE",
      notes: "必修｜一年級",
    },

    // 學位論文（6）
    {
      code: "GS-T1",
      name: "碩士論文",
      credits: 4,
      group: "M_THESIS",
      notes: "必修｜第二學年開放；更換指導教授時先前所修不得列畢業學分",
    },
    {
      code: "GS-T2",
      name: "獨立研究",
      credits: 2,
      group: "M_THESIS",
      notes: "必修｜第二學年開放；更換指導教授須重修；選課前須指導教授同意之修課計畫表",
    },

    // 共同選修｜研究方法論
    {
      code: "GS-E1",
      name: "課程與教學實驗設計與研究",
      credits: 2,
      group: "M_COMMON",
      notes: "研究方法論",
    },
    { code: "GS-E2", name: "電腦資料分析", credits: 2, group: "M_COMMON", notes: "研究方法論" },
    {
      code: "GS-E3",
      name: "課程與教學質性研究（Ⅱ）",
      credits: 2,
      group: "M_COMMON",
      notes: "研究方法論",
    },

    // 共同選修｜基礎理論｜課程領域（至少2）
    {
      code: "GS-E4",
      name: "課程設計與發展研究：理論與實作",
      credits: 2,
      group: "M_COMMON",
      notes: "基礎理論｜課程領域",
    },
    { code: "GS-E5", name: "課程社會學研究", credits: 2, group: "M_COMMON", notes: "基礎理論｜課程領域" },
    { code: "GS-E6", name: "課程評鑑與領導研究", credits: 2, group: "M_COMMON", notes: "基礎理論｜課程領域" },

    // 共同選修｜基礎理論｜教學領域（至少2）
    { code: "GS-E7", name: "教學社會學研究", credits: 2, group: "M_COMMON", notes: "基礎理論｜教學領域" },
    {
      code: "GS-E8",
      name: "教學理論與學習設計研究",
      credits: 2,
      group: "M_COMMON",
      notes: "基礎理論｜教學領域",
    },
    { code: "GS-E9", name: "認知科學與教學研究", credits: 2, group: "M_COMMON", notes: "基礎理論｜教學領域" },

    // 專精選修｜課程與教學
    { code: "GS-A1", name: "教學策略創新與設計研究", credits: 2, group: "M_ADV", notes: "課程與教學" },
    { code: "GS-A2", name: "情意與道德課程研究", credits: 2, group: "M_ADV", notes: "課程與教學" },
    { code: "GS-A3", name: "素養導向領域課程與教學研究", credits: 2, group: "M_ADV", notes: "課程與教學" },
    { code: "GS-A4", name: "學習環境規劃", credits: 2, group: "M_ADV", notes: "課程與教學" },
    { code: "GS-A5", name: "多元文化教育研究", credits: 2, group: "M_ADV", notes: "課程與教學" },
    { code: "GS-A6", name: "藝術教育課程研究", credits: 2, group: "M_ADV", notes: "課程與教學" },
    { code: "GS-A7", name: "數學領域課程與教學研究", credits: 2, group: "M_ADV", notes: "課程與教學" },
    { code: "GS-A8", name: "實驗教育與另類學校研究", credits: 2, group: "M_ADV", notes: "課程與教學" },
    {
      code: "GS-A9",
      name: "美感教育課程與教學研究",
      credits: 2,
      group: "M_ADV",
      notes: "課程與教學｜114新增",
    },

    // 專精選修｜學習媒材與數位科技
    { code: "GS-A10", name: "新媒體美學課程研究", credits: 2, group: "M_ADV", notes: "學習媒材與數位科技" },
    { code: "GS-A11", name: "數位學習研究", credits: 2, group: "M_ADV", notes: "學習媒材與數位科技" },
    { code: "GS-A12", name: "數位教學媒材製作研究", credits: 2, group: "M_ADV", notes: "學習媒材與數位科技" },
    { code: "GS-A13", name: "教科書研究", credits: 2, group: "M_ADV", notes: "學習媒材與數位科技" },
    { code: "GS-A14", name: "繪本分析與教學應用", credits: 2, group: "M_ADV", notes: "學習媒材與數位科技" },
    { code: "GS-A15", name: "資訊科技融入教學研究", credits: 2, group: "M_ADV", notes: "學習媒材與數位科技" },
    { code: "GS-A16", name: "人工智慧的應用與教育", credits: 2, group: "M_ADV", notes: "學習媒材與數位科技" },
    {
      code: "GS-A17",
      name: "國語文教學與人工智慧運用",
      credits: 2,
      group: "M_ADV",
      notes: "學習媒材與數位科技",
    },
    {
      code: "GS-A18",
      name: "人工智慧與美感跨域課程研究",
      credits: 2,
      group: "M_ADV",
      notes: "學習媒材與數位科技｜114新增",
    },
  ],
  prereqs: [
    {
      course: "GS-T1",
      requires: "GS-C3",
      note: "建議完成研究方法相關核心課程後再修習；手冊規定第二學年開放",
    },
  ],
  nonCredits: [
    {
      code: "PROPOSAL",
      name: "論文計畫發表",
      description: "論文計畫發表與學位考試須於不同學期申辦",
    },
    {
      code: "DEFENSE",
      name: "學位論文考試",
      description: "正式學位論文考試通過始得畢業",
    },
    {
      code: "ETHICS",
      name: "學術研究倫理教育課程",
      description: "申請學位考試前須上網自學並通過線上課程測驗，取得修課證明",
    },
  ],
};

export const DEGREE_PROGRAMS = [UNDERGRAD, MASTER];
