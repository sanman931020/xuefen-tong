/**
 * 113學年度師資生手冊｜玖、各師資類科教育專業科目及學分表
 * 來源：handbook-teacher.txt（不得隨意刪減科目）
 */

export type TeacherCourse = {
  code: string;
  name: string;
  credits: number;
  group: string;
  notes?: string;
};

export type TeacherProgramSeed = {
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
  courses: TeacherCourse[];
  prereqs?: { course: string; requires: string; note?: string }[];
  nonCredits?: { code: string; name: string; description: string }[];
};

const req = (note = "必修*") => note;

/** 一、國民小學師資類科（46學分） */
export const EDU_ELEM: TeacherProgramSeed = {
  code: "EDU_ELEM",
  name: "教育學程｜國民小學",
  type: "education",
  shortLabel: "小教",
  description:
    "依《113學年度師資生手冊》：至少46學分＝教育專業36（基礎≥4／方法≥16／實踐≥16）＋專門課程≥4領域10學分。大學部另須通識分類選修10學分。7個領域教材教法至少修4領域；實地學習≥72小時。",
  totalCredits: 46,
  sortOrder: 3,
  groups: [
    {
      code: "ED_FOUND",
      name: "教育基礎課程",
      blockName: "教育專業課程",
      minCredits: 4,
      description: "手冊：應至少修習4學分。",
    },
    {
      code: "ED_METHOD",
      name: "教育方法課程",
      blockName: "教育專業課程",
      minCredits: 16,
      description:
        "手冊：應至少修習16學分。教學原理、特殊教育導論為必修。公費生須自「學習扶助」及「適性教學」中至少修習2學分。",
    },
    {
      code: "ED_PRACTICE",
      name: "教育實踐課程",
      blockName: "教育專業課程",
      minCredits: 16,
      description:
        "手冊：應至少修習16學分。7個領域教材教法至少修4領域；國語教材教法、數學教材教法、國民小學教學實習、教育議題專題、技職教育與生涯規劃為必修。自然科學教材教法為地球環境暨生物資源學系須修；健康與體育教材教法為體育學院與體育學系須修；各科教材教法實習為非教育學系公費生須修。",
    },
    {
      code: "ED_SPECIAL",
      name: "專門課程（教學基本學科）",
      blockName: "專門課程",
      minCredits: 10,
      description:
        "手冊：應至少修習4個領域10學分。國音及說話、普通數學為必修。已取得教育部「國民小學師資類科學科知能評量」證明書達精熟級，且尚未修習普通數學／自然科學概論／社會學習領域概論者，得依規定申請該等科目學分抵免。",
    },
  ],
  courses: [
    // 教育基礎
    { code: "TE-F01", name: "教育概論", credits: 2, group: "ED_FOUND" },
    { code: "TE-F02", name: "教育心理學", credits: 2, group: "ED_FOUND" },
    { code: "TE-F03", name: "教育行政", credits: 2, group: "ED_FOUND" },
    { code: "TE-F04", name: "教育社會學", credits: 2, group: "ED_FOUND" },
    { code: "TE-F05", name: "教育哲學", credits: 2, group: "ED_FOUND" },
    { code: "TE-F06", name: "教育理論應用", credits: 2, group: "ED_FOUND" },
    // 教育方法
    { code: "TE-M01", name: "教學原理", credits: 2, group: "ED_METHOD", notes: req() },
    {
      code: "TE-M02",
      name: "特殊教育導論(特殊需求學生教育)",
      credits: 3,
      group: "ED_METHOD",
      notes: req(),
    },
    { code: "TE-M03", name: "課程發展與設計", credits: 2, group: "ED_METHOD" },
    { code: "TE-M04", name: "輔導原理與實務", credits: 2, group: "ED_METHOD" },
    { code: "TE-M05", name: "學習評量", credits: 2, group: "ED_METHOD" },
    { code: "TE-M06", name: "班級經營", credits: 2, group: "ED_METHOD" },
    { code: "TE-M07", name: "教學媒體與應用", credits: 2, group: "ED_METHOD" },
    { code: "TE-M08", name: "創新教學", credits: 2, group: "ED_METHOD" },
    {
      code: "TE-M09",
      name: "學習扶助",
      credits: 2,
      group: "ED_METHOD",
      notes: "公費生須自學習扶助及適性教學中至少修習2學分",
    },
    {
      code: "TE-M10",
      name: "適性教學(含分組合作學習、差異化教學)",
      credits: 2,
      group: "ED_METHOD",
      notes: "公費生須自學習扶助及適性教學中至少修習2學分",
    },
    { code: "TE-M11", name: "教育統計學", credits: 2, group: "ED_METHOD" },
    { code: "TE-M12", name: "心理與教育測驗", credits: 2, group: "ED_METHOD" },
    { code: "TE-M13", name: "發展心理學", credits: 2, group: "ED_METHOD" },
    { code: "TE-M14", name: "兒童心理學", credits: 2, group: "ED_METHOD" },
    { code: "TE-M15", name: "應用行為分析", credits: 2, group: "ED_METHOD" },
    { code: "TE-M16", name: "教育研究法", credits: 2, group: "ED_METHOD" },
    { code: "TE-M17", name: "資訊科技教學實務應用", credits: 2, group: "ED_METHOD" },
    { code: "TE-M18", name: "國小資訊管理實務應用", credits: 2, group: "ED_METHOD" },
    // 教育實踐
    { code: "TE-P01", name: "國民小學教學實習", credits: 2, group: "ED_PRACTICE", notes: req() },
    {
      code: "TE-P02",
      name: "國民小學語文教材教法-國語教材教法",
      credits: 2,
      group: "ED_PRACTICE",
      notes: "必修*；語文領域；7領域教材教法至少修4領域",
    },
    {
      code: "TE-P03",
      name: "國民小學語文教材教法-本土語文教材教法",
      credits: 2,
      group: "ED_PRACTICE",
      notes: "語文領域；7領域教材教法至少修4領域",
    },
    {
      code: "TE-P04",
      name: "國民小學語文教材教法-英語教材教法",
      credits: 2,
      group: "ED_PRACTICE",
      notes: "語文領域；7領域教材教法至少修4領域",
    },
    {
      code: "TE-P05",
      name: "國民小學數學教材教法",
      credits: 2,
      group: "ED_PRACTICE",
      notes: "必修*；數學領域；7領域教材教法至少修4領域",
    },
    {
      code: "TE-P06",
      name: "國民小學自然科學教材教法",
      credits: 2,
      group: "ED_PRACTICE",
      notes: "自然科學領域；僅地球環境暨生物資源學系須修；7領域至少修4領域",
    },
    {
      code: "TE-P07",
      name: "國民小學社會教材教法",
      credits: 2,
      group: "ED_PRACTICE",
      notes: "社會領域；7領域教材教法至少修4領域",
    },
    {
      code: "TE-P08",
      name: "國民小學藝術教材教法",
      credits: 2,
      group: "ED_PRACTICE",
      notes: "藝術領域；7領域教材教法至少修4領域",
    },
    {
      code: "TE-P09",
      name: "國民小學健康與體育教材教法",
      credits: 2,
      group: "ED_PRACTICE",
      notes: "健康與體育領域；僅體育學院與體育學系須修；7領域至少修4領域",
    },
    {
      code: "TE-P10",
      name: "國民小學綜合活動教材教法",
      credits: 2,
      group: "ED_PRACTICE",
      notes: "綜合活動領域；7領域教材教法至少修4領域",
    },
    {
      code: "TE-P11",
      name: "教育議題專題",
      credits: 2,
      group: "ED_PRACTICE",
      notes:
        "必修*；含藝術與美感、性別、人權、勞動、法治、生命、品德、家政、家庭、海洋、多元文化、新移民、原住民、媒體素養、生涯發展、環境、藥物、性教育、國際、安全與防災、理財、消費者保護、觀光休閒、另類、生活教育等議題，依教育趨勢調整",
    },
    {
      code: "TE-P12",
      name: "技職教育與生涯規劃",
      credits: 1,
      group: "ED_PRACTICE",
      notes: "必修*；依教育部107年8月24日臺教師(二)字第1070143152號函",
    },
    { code: "TE-P13", name: "實驗教育", credits: 2, group: "ED_PRACTICE" },
    {
      code: "TE-P14",
      name: "國民小學各科教材教法實習",
      credits: 2,
      group: "ED_PRACTICE",
      notes: "僅非教育學系公費生須修",
    },
    { code: "TE-P15", name: "臺灣原住民文化與教育", credits: 2, group: "ED_PRACTICE" },
    {
      code: "TE-P16",
      name: "教師專業發展(含教師專業倫理)",
      credits: 2,
      group: "ED_PRACTICE",
    },
    { code: "TE-P17", name: "學校行政(實務)", credits: 2, group: "ED_PRACTICE" },
    { code: "TE-P18", name: "閱讀教育", credits: 2, group: "ED_PRACTICE" },
    { code: "TE-P19", name: "親職教育", credits: 2, group: "ED_PRACTICE" },
    { code: "TE-P20", name: "現代教育思潮", credits: 2, group: "ED_PRACTICE" },
    { code: "TE-P21", name: "文教事業經營與管理", credits: 2, group: "ED_PRACTICE" },
    { code: "TE-P22", name: "資訊教育", credits: 2, group: "ED_PRACTICE" },
    { code: "TE-P23", name: "科學教育", credits: 2, group: "ED_PRACTICE" },
    { code: "TE-P24", name: "比較教育", credits: 2, group: "ED_PRACTICE" },
    { code: "TE-P25", name: "多元文化教育", credits: 2, group: "ED_PRACTICE" },
    { code: "TE-P26", name: "教育史", credits: 2, group: "ED_PRACTICE" },
    { code: "TE-P27", name: "人際關係與溝通", credits: 2, group: "ED_PRACTICE" },
    { code: "TE-P28", name: "教育法規(實務)", credits: 2, group: "ED_PRACTICE" },
    { code: "TE-P29", name: "環境科學與教育", credits: 2, group: "ED_PRACTICE" },
    // 專門課程｜語文
    {
      code: "TE-S01",
      name: "國音及說話",
      credits: 2,
      group: "ED_SPECIAL",
      notes: "必修*；語文領域",
    },
    { code: "TE-S02", name: "寫字及書法", credits: 2, group: "ED_SPECIAL", notes: "語文領域" },
    { code: "TE-S03", name: "寫作", credits: 2, group: "ED_SPECIAL", notes: "語文領域" },
    { code: "TE-S04", name: "兒童英語", credits: 2, group: "ED_SPECIAL", notes: "語文領域" },
    { code: "TE-S05", name: "兒童文學", credits: 2, group: "ED_SPECIAL", notes: "語文領域" },
    { code: "TE-S06", name: "本土語言", credits: 2, group: "ED_SPECIAL", notes: "語文領域" },
    // 專門｜數學
    {
      code: "TE-S07",
      name: "普通數學",
      credits: 2,
      group: "ED_SPECIAL",
      notes: "必修*；數學領域；學科知能評量精熟級得依規定申請抵免",
    },
    {
      code: "TE-S08",
      name: "數學解題與應用",
      credits: 2,
      group: "ED_SPECIAL",
      notes: "數學領域",
    },
    // 專門｜自然
    {
      code: "TE-S09",
      name: "自然科學概論",
      credits: 2,
      group: "ED_SPECIAL",
      notes: "自然科學領域；學科知能評量精熟級得依規定申請抵免",
    },
    {
      code: "TE-S10",
      name: "生活科技概論",
      credits: 2,
      group: "ED_SPECIAL",
      notes: "自然科學領域",
    },
    // 專門｜社會
    {
      code: "TE-S11",
      name: "社會學習領域概論",
      credits: 2,
      group: "ED_SPECIAL",
      notes: "社會領域；學科知能評量精熟級得依規定申請抵免",
    },
    // 專門｜健康與體育
    {
      code: "TE-S12",
      name: "健康與體育",
      credits: 2,
      group: "ED_SPECIAL",
      notes: "健康與體育領域",
    },
    {
      code: "TE-S13",
      name: "健康教育",
      credits: 2,
      group: "ED_SPECIAL",
      notes: "健康與體育領域",
    },
    {
      code: "TE-S14",
      name: "民俗體育",
      credits: 2,
      group: "ED_SPECIAL",
      notes: "健康與體育領域",
    },
    // 專門｜藝術
    { code: "TE-S15", name: "藝術概論", credits: 2, group: "ED_SPECIAL", notes: "藝術領域" },
    { code: "TE-S16", name: "表演藝術", credits: 2, group: "ED_SPECIAL", notes: "藝術領域" },
    { code: "TE-S17", name: "音樂", credits: 2, group: "ED_SPECIAL", notes: "藝術領域" },
    { code: "TE-S18", name: "鍵盤樂", credits: 2, group: "ED_SPECIAL", notes: "藝術領域" },
    { code: "TE-S19", name: "美勞", credits: 2, group: "ED_SPECIAL", notes: "藝術領域" },
    {
      code: "TE-S20",
      name: "藝術領域教學研究",
      credits: 2,
      group: "ED_SPECIAL",
      notes: "藝術領域",
    },
    { code: "TE-S21", name: "兒童戲劇", credits: 2, group: "ED_SPECIAL", notes: "藝術領域" },
    // 專門｜綜合活動
    { code: "TE-S22", name: "童軍", credits: 2, group: "ED_SPECIAL", notes: "綜合活動領域" },
    {
      code: "TE-S23",
      name: "綜合活動領域概論",
      credits: 2,
      group: "ED_SPECIAL",
      notes: "綜合活動領域",
    },
    // 專門｜跨領域
    {
      code: "TE-S24",
      name: "跨領域課程與教學",
      credits: 2,
      group: "ED_SPECIAL",
      notes: "跨領域",
    },
  ],
  prereqs: [
    { course: "TE-P02", requires: "TE-M01", note: "各領域教材教法需先修教學原理" },
    { course: "TE-P02", requires: "TE-S01", note: "國語教材教法需教學原理及國音及說話" },
    { course: "TE-P03", requires: "TE-M01", note: "各領域教材教法需先修教學原理" },
    { course: "TE-P04", requires: "TE-M01", note: "各領域教材教法需先修教學原理" },
    { course: "TE-P05", requires: "TE-M01", note: "數學教材教法需教學原理及普通數學" },
    { course: "TE-P05", requires: "TE-S07", note: "數學教材教法需普通數學" },
    { course: "TE-P06", requires: "TE-M01", note: "各領域教材教法需先修教學原理" },
    { course: "TE-P07", requires: "TE-M01", note: "各領域教材教法需先修教學原理" },
    { course: "TE-P08", requires: "TE-M01", note: "各領域教材教法需先修教學原理" },
    { course: "TE-P09", requires: "TE-M01", note: "各領域教材教法需先修教學原理" },
    { course: "TE-P10", requires: "TE-M01", note: "各領域教材教法需先修教學原理" },
    { course: "TE-P01", requires: "TE-P02", note: "教學實習需國語與數學教材教法" },
    { course: "TE-P01", requires: "TE-P05", note: "教學實習需國語與數學教材教法" },
  ],
  nonCredits: [
    {
      code: "FIELD72",
      name: "實地學習至少72小時",
      description:
        "至國民小學進行見習、試教、實習、學習扶助（補救教學）、課業輔導或服務學習等至少72小時，並經本校認定其內容符合教育專業知能。",
    },
    { code: "YELLOW", name: "小黃卡檢核", description: "師資生教育知能檢核機制（小黃卡）。" },
    {
      code: "GE_CLASSIFY",
      name: "普通課程（通識分類選修）",
      description:
        "本校大學部師資生須修習通識分類選修共10學分，其中藝術與美感、人文與文化思考、公民素養與社會探索、自然生命與科技每一領域至少各2學分（含資訊應用與設計類課群至少2學分）。",
    },
  ],
};

/** 三、特殊教育師資類科（國民小學教育階段—身心障礙類）（48學分） */
export const EDU_SPED: TeacherProgramSeed = {
  code: "EDU_SPED",
  name: "教育學程｜特殊教育（國小身心障礙）",
  type: "education",
  shortLabel: "特教",
  description:
    "依師資生手冊：至少48學分＝小教一般教育專業≥10＋特殊教育專業≥28（基礎≥8／方法≥8／實踐≥10）＋特殊需求領域與領域調整教學知識≥10。發展心理學、應用行為分析於一般與特教專業僅能擇一採認。加註次專長另修國小專門課程10學分。",
  totalCredits: 48,
  sortOrder: 4,
  groups: [
    { code: "SP_GEN", name: "小教一般教育專業課程", blockName: "一般教育專業課程", minCredits: 10 },
    { code: "SP_FOUND", name: "教育基礎課程", blockName: "特殊教育專業課程", minCredits: 8 },
    { code: "SP_METHOD", name: "教育方法課程", blockName: "特殊教育專業課程", minCredits: 8 },
    { code: "SP_PRACTICE", name: "教育實踐課程", blockName: "特殊教育專業課程", minCredits: 10 },
    {
      code: "SP_NEED",
      name: "特需領域與領域調整教學知識",
      blockName: "特殊需求領域",
      minCredits: 10,
    },
    {
      code: "SP_ELEM_SPECIAL",
      name: "國小專門課程（加註次專長用）",
      blockName: "專門課程",
      minCredits: 0,
      description: "欲加註學科／領域專長另修至少10學分",
    },
  ],
  courses: [
    // 一般教育專業
    { code: "SP-G01", name: "教育概論", credits: 2, group: "SP_GEN" },
    { code: "SP-G02", name: "教育心理學", credits: 2, group: "SP_GEN" },
    { code: "SP-G03", name: "教育行政", credits: 2, group: "SP_GEN" },
    { code: "SP-G04", name: "教育社會學", credits: 2, group: "SP_GEN" },
    { code: "SP-G05", name: "教育哲學", credits: 2, group: "SP_GEN" },
    {
      code: "SP-G06",
      name: "技職教育與生涯規劃",
      credits: 1,
      group: "SP_GEN",
      notes: req(),
    },
    { code: "SP-G07", name: "教學原理", credits: 2, group: "SP_GEN" },
    { code: "SP-G08", name: "課程發展與設計", credits: 2, group: "SP_GEN" },
    { code: "SP-G09", name: "輔導原理與實務", credits: 2, group: "SP_GEN" },
    { code: "SP-G10", name: "學習評量", credits: 2, group: "SP_GEN" },
    { code: "SP-G11", name: "班級經營", credits: 2, group: "SP_GEN" },
    { code: "SP-G12", name: "教學媒體與應用", credits: 2, group: "SP_GEN" },
    {
      code: "SP-G13",
      name: "發展心理學",
      credits: 2,
      group: "SP_GEN",
      notes: "與特教專業僅能擇一採認",
    },
    { code: "SP-G14", name: "兒童心理學", credits: 2, group: "SP_GEN" },
    { code: "SP-G15", name: "教育統計學", credits: 2, group: "SP_GEN" },
    { code: "SP-G16", name: "心理與教育測驗", credits: 2, group: "SP_GEN" },
    {
      code: "SP-G17",
      name: "應用行為分析",
      credits: 2,
      group: "SP_GEN",
      notes: "與特教專業僅能擇一採認",
    },
    { code: "SP-G18", name: "教育研究法", credits: 2, group: "SP_GEN" },
    { code: "SP-G19", name: "學習扶助", credits: 2, group: "SP_GEN" },
    {
      code: "SP-G20",
      name: "適性教學(含分組合作學習、差異化教學)",
      credits: 2,
      group: "SP_GEN",
    },
    { code: "SP-G21", name: "教育理論應用", credits: 2, group: "SP_GEN" },
    // 特教基礎
    { code: "SP-F01", name: "特殊教育導論", credits: 3, group: "SP_FOUND", notes: req() },
    { code: "SP-F02", name: "特殊教育行政與法規", credits: 2, group: "SP_FOUND" },
    { code: "SP-F03", name: "學習障礙", credits: 2, group: "SP_FOUND" },
    { code: "SP-F04", name: "溝通障礙", credits: 2, group: "SP_FOUND" },
    { code: "SP-F05", name: "智能障礙", credits: 2, group: "SP_FOUND" },
    { code: "SP-F06", name: "情緒行為障礙", credits: 2, group: "SP_FOUND" },
    { code: "SP-F07", name: "自閉症", credits: 2, group: "SP_FOUND" },
    { code: "SP-F08", name: "注意力缺陷過動症", credits: 2, group: "SP_FOUND" },
    { code: "SP-F09", name: "重度與多重障礙", credits: 2, group: "SP_FOUND" },
    { code: "SP-F10", name: "適應體育", credits: 2, group: "SP_FOUND" },
    { code: "SP-F11", name: "視覺障礙", credits: 2, group: "SP_FOUND" },
    { code: "SP-F12", name: "聽覺障礙", credits: 2, group: "SP_FOUND" },
    { code: "SP-F13", name: "早期介入概論", credits: 2, group: "SP_FOUND" },
    { code: "SP-F14", name: "身體病弱", credits: 2, group: "SP_FOUND" },
    {
      code: "SP-F15",
      name: "發展心理學",
      credits: 2,
      group: "SP_FOUND",
      notes: "與一般教育專業僅能擇一採認",
    },
    { code: "SP-F16", name: "特殊教育論題與趨勢", credits: 2, group: "SP_FOUND" },
    { code: "SP-F17", name: "兒童認知與學習概論", credits: 2, group: "SP_FOUND" },
    { code: "SP-F18", name: "閱讀障礙", credits: 2, group: "SP_FOUND" },
    { code: "SP-F19", name: "語言發展與矯治", credits: 2, group: "SP_FOUND" },
    { code: "SP-F20", name: "特殊兒童發展", credits: 2, group: "SP_FOUND" },
    // 特教方法
    {
      code: "SP-M01",
      name: "特殊教育學生評量",
      credits: 3,
      group: "SP_METHOD",
      notes: req(),
    },
    {
      code: "SP-M02",
      name: "應用行為分析",
      credits: 2,
      group: "SP_METHOD",
      notes: "與一般教育專業僅能擇一採認",
    },
    {
      code: "SP-M03",
      name: "個別化教育計畫的理念與實施",
      credits: 2,
      group: "SP_METHOD",
      notes: req(),
    },
    { code: "SP-M04", name: "資源教室方案與經營", credits: 2, group: "SP_METHOD" },
    { code: "SP-M05", name: "行為改變技術", credits: 2, group: "SP_METHOD" },
    { code: "SP-M06", name: "自閉症學生教學策略", credits: 2, group: "SP_METHOD" },
    { code: "SP-M07", name: "諮商原理與實務", credits: 2, group: "SP_METHOD" },
    { code: "SP-M08", name: "音樂治療", credits: 2, group: "SP_METHOD" },
    // 特教實踐
    {
      code: "SP-P01",
      name: "身心障礙教材教法",
      credits: 4,
      group: "SP_PRACTICE",
      notes: req(),
    },
    {
      code: "SP-P02",
      name: "特殊教育教學實習",
      credits: 4,
      group: "SP_PRACTICE",
      notes: req(),
    },
    { code: "SP-P03", name: "學前特教教材教法", credits: 2, group: "SP_PRACTICE" },
    { code: "SP-P04", name: "融合教育理論與實務", credits: 2, group: "SP_PRACTICE" },
    { code: "SP-P05", name: "嚴重問題行為處理", credits: 2, group: "SP_PRACTICE" },
    { code: "SP-P06", name: "特殊教育班級實務", credits: 2, group: "SP_PRACTICE" },
    { code: "SP-P07", name: "親師合作與家庭支援", credits: 2, group: "SP_PRACTICE" },
    { code: "SP-P08", name: "專業合作與溝通", credits: 2, group: "SP_PRACTICE" },
    { code: "SP-P09", name: "個別化學習輔具設計", credits: 2, group: "SP_PRACTICE" },
    // 特需領域
    { code: "SP-N01", name: "生活管理", credits: 2, group: "SP_NEED", notes: "特殊需求領域" },
    { code: "SP-N02", name: "社會技巧", credits: 2, group: "SP_NEED", notes: "特殊需求領域" },
    { code: "SP-N03", name: "學習策略", credits: 2, group: "SP_NEED", notes: "特殊需求領域" },
    { code: "SP-N04", name: "溝通訓練", credits: 2, group: "SP_NEED", notes: "特殊需求領域" },
    {
      code: "SP-N05",
      name: "功能性動作訓練",
      credits: 2,
      group: "SP_NEED",
      notes: "特殊需求領域",
    },
    {
      code: "SP-N06",
      name: "輔助科技應用",
      credits: 2,
      group: "SP_NEED",
      notes: "特殊需求領域",
    },
    {
      code: "SP-N07",
      name: "溝通輔具應用",
      credits: 2,
      group: "SP_NEED",
      notes: "特殊需求領域",
    },
    {
      code: "SP-N08",
      name: "學習功能輕微缺損課程調整與教學設計",
      credits: 2,
      group: "SP_NEED",
      notes: "領域調整教學知識",
    },
    {
      code: "SP-N09",
      name: "學習功能嚴重缺損課程調整與教學設計",
      credits: 2,
      group: "SP_NEED",
      notes: "領域調整教學知識",
    },
    // 國小專門（加註用）
    { code: "SP-ES01", name: "國音及說話", credits: 2, group: "SP_ELEM_SPECIAL", notes: "語文領域" },
    { code: "SP-ES02", name: "寫字及書法", credits: 2, group: "SP_ELEM_SPECIAL", notes: "語文領域" },
    { code: "SP-ES03", name: "寫作", credits: 2, group: "SP_ELEM_SPECIAL", notes: "語文領域" },
    { code: "SP-ES04", name: "兒童英語", credits: 2, group: "SP_ELEM_SPECIAL", notes: "語文領域" },
    { code: "SP-ES05", name: "兒童文學", credits: 2, group: "SP_ELEM_SPECIAL", notes: "語文領域" },
    { code: "SP-ES06", name: "本土語言", credits: 2, group: "SP_ELEM_SPECIAL", notes: "語文領域" },
    { code: "SP-ES07", name: "普通數學", credits: 2, group: "SP_ELEM_SPECIAL", notes: "數學領域" },
    {
      code: "SP-ES08",
      name: "數學解題與應用",
      credits: 2,
      group: "SP_ELEM_SPECIAL",
      notes: "數學領域",
    },
    {
      code: "SP-ES09",
      name: "自然科學概論",
      credits: 2,
      group: "SP_ELEM_SPECIAL",
      notes: "自然科學領域",
    },
    {
      code: "SP-ES10",
      name: "生活科技概論",
      credits: 2,
      group: "SP_ELEM_SPECIAL",
      notes: "自然科學領域",
    },
    {
      code: "SP-ES11",
      name: "社會學習領域概論",
      credits: 2,
      group: "SP_ELEM_SPECIAL",
      notes: "社會領域",
    },
    {
      code: "SP-ES12",
      name: "健康與體育",
      credits: 2,
      group: "SP_ELEM_SPECIAL",
      notes: "健康與體育領域",
    },
    {
      code: "SP-ES13",
      name: "健康教育",
      credits: 2,
      group: "SP_ELEM_SPECIAL",
      notes: "健康與體育領域",
    },
    {
      code: "SP-ES14",
      name: "民俗體育",
      credits: 2,
      group: "SP_ELEM_SPECIAL",
      notes: "健康與體育領域",
    },
    { code: "SP-ES15", name: "藝術概論", credits: 2, group: "SP_ELEM_SPECIAL", notes: "藝術領域" },
    { code: "SP-ES16", name: "表演藝術", credits: 2, group: "SP_ELEM_SPECIAL", notes: "藝術領域" },
    { code: "SP-ES17", name: "音樂", credits: 2, group: "SP_ELEM_SPECIAL", notes: "藝術領域" },
    { code: "SP-ES18", name: "鍵盤樂", credits: 2, group: "SP_ELEM_SPECIAL", notes: "藝術領域" },
    { code: "SP-ES19", name: "美勞", credits: 2, group: "SP_ELEM_SPECIAL", notes: "藝術領域" },
    { code: "SP-ES20", name: "童軍", credits: 2, group: "SP_ELEM_SPECIAL", notes: "綜合活動領域" },
    {
      code: "SP-ES21",
      name: "綜合活動領域概論",
      credits: 2,
      group: "SP_ELEM_SPECIAL",
      notes: "綜合活動領域",
    },
  ],
  prereqs: [
    { course: "SP-M01", requires: "SP-F01", note: "特殊教育學生評量需先修特殊教育導論" },
    { course: "SP-M03", requires: "SP-F01", note: "IEP 需特殊教育導論" },
    { course: "SP-M03", requires: "SP-M01", note: "IEP 需特殊教育學生評量" },
    { course: "SP-P02", requires: "SP-P01", note: "教學實習前須先修畢身心障礙教材教法" },
  ],
  nonCredits: [
    {
      code: "FIELD_SPED",
      name: "實地學習",
      description: "修習教育專業課程期間至特殊教育學校（班）進行實地學習，時數依手冊規定。",
    },
    { code: "YELLOW", name: "小黃卡檢核", description: "師資生教育知能檢核機制（小黃卡）。" },
  ],
};

/** 六、幼兒園師資類科（54學分） */
export const EDU_ECE: TeacherProgramSeed = {
  code: "EDU_ECE",
  name: "教育學程｜幼兒園",
  type: "education",
  shortLabel: "幼教",
  description:
    "依師資生手冊：至少54學分＝教育專業50（基礎≥16／方法≥18／實踐≥16）＋專門課程≥4。實地學習≥120小時。教材教法、教保實習、教學實習為學年課須依序修習。",
  totalCredits: 54,
  sortOrder: 5,
  groups: [
    { code: "ECE_FOUND", name: "教育基礎課程", blockName: "教育專業課程", minCredits: 16 },
    { code: "ECE_METHOD", name: "教育方法課程", blockName: "教育專業課程", minCredits: 18 },
    { code: "ECE_PRACTICE", name: "教育實踐課程", blockName: "教育專業課程", minCredits: 16 },
    { code: "ECE_SPECIAL", name: "專門課程", blockName: "專門課程", minCredits: 4 },
  ],
  courses: [
    // 基礎
    {
      code: "EC-F01",
      name: "幼兒教保概論",
      credits: 3,
      group: "ECE_FOUND",
      notes: "必修；教保專業課程",
    },
    {
      code: "EC-F02",
      name: "幼兒發展",
      credits: 3,
      group: "ECE_FOUND",
      notes: "必修；教保專業課程",
    },
    {
      code: "EC-F03",
      name: "幼兒健康與安全",
      credits: 3,
      group: "ECE_FOUND",
      notes: "必修；教保專業課程",
    },
    {
      code: "EC-F04",
      name: "教育社會學",
      credits: 2,
      group: "ECE_FOUND",
      notes: "必修；含多元文化、機會均等、弱勢教育、教育哲學",
    },
    {
      code: "EC-F05",
      name: "特殊幼兒教育",
      credits: 3,
      group: "ECE_FOUND",
      notes: "必修；教保專業課程",
    },
    {
      code: "EC-F06",
      name: "幼兒園、家庭與社區",
      credits: 2,
      group: "ECE_FOUND",
      notes: "必修；教保課程",
    },
    {
      code: "EC-F07",
      name: "教育哲學",
      credits: 2,
      group: "ECE_FOUND",
      notes: "選修；限定幼兒園在職人員專班",
    },
    // 方法
    {
      code: "EC-M01",
      name: "幼兒觀察",
      credits: 3,
      group: "ECE_METHOD",
      notes: "必修；教保專業課程",
    },
    {
      code: "EC-M02",
      name: "幼兒園教保活動課程設計",
      credits: 3,
      group: "ECE_METHOD",
      notes: "必修；教保專業課程",
    },
    {
      code: "EC-M03",
      name: "幼兒遊戲",
      credits: 2,
      group: "ECE_METHOD",
      notes: "必修；教保專業課程",
    },
    {
      code: "EC-M04",
      name: "幼兒園課室經營",
      credits: 2,
      group: "ECE_METHOD",
      notes: "必修；教保專業課程",
    },
    { code: "EC-M05", name: "幼兒輔導", credits: 2, group: "ECE_METHOD", notes: "必修" },
    {
      code: "EC-M06",
      name: "幼兒學習環境設計",
      credits: 2,
      group: "ECE_METHOD",
      notes: "必修；含政策法規實務",
    },
    {
      code: "EC-M07",
      name: "幼兒學習評量",
      credits: 2,
      group: "ECE_METHOD",
      notes: "必修；教保專業課程",
    },
    {
      code: "EC-M08",
      name: "學前教育模式",
      credits: 2,
      group: "ECE_METHOD",
      notes: "必修；含幼兒教育思潮",
    },
    // 實踐
    {
      code: "EC-P01",
      name: "幼兒園教材教法(I)",
      credits: 3,
      group: "ECE_PRACTICE",
      notes: "必修；學年課應依序修習",
    },
    {
      code: "EC-P02",
      name: "幼兒園教材教法(II)",
      credits: 3,
      group: "ECE_PRACTICE",
      notes: "必修；學年課應依序修習",
    },
    {
      code: "EC-P03",
      name: "幼兒園教保實習(I)",
      credits: 2,
      group: "ECE_PRACTICE",
      notes: "必修；學年課應依序修習",
    },
    {
      code: "EC-P04",
      name: "幼兒園教保實習(II)",
      credits: 2,
      group: "ECE_PRACTICE",
      notes: "必修；學年課應依序修習",
    },
    {
      code: "EC-P05",
      name: "幼兒園教學實習(I)",
      credits: 2,
      group: "ECE_PRACTICE",
      notes: "必修；學年課；先修教材教法與教保實習",
    },
    {
      code: "EC-P06",
      name: "幼兒園教學實習(II)",
      credits: 2,
      group: "ECE_PRACTICE",
      notes: "必修；學年課；先修教材教法與教保實習",
    },
    {
      code: "EC-P07",
      name: "教保專業倫理",
      credits: 2,
      group: "ECE_PRACTICE",
      notes: "必修；教保專業課程",
    },
    // 專門
    { code: "EC-S01", name: "幼兒文學", credits: 2, group: "ECE_SPECIAL" },
    { code: "EC-S02", name: "幼兒藝術", credits: 2, group: "ECE_SPECIAL" },
    {
      code: "EC-S03",
      name: "幼兒戲劇",
      credits: 4,
      group: "ECE_SPECIAL",
      notes: "學年課，應依序修習",
    },
    {
      code: "EC-S04",
      name: "幼兒社會探究與情緒表達",
      credits: 2,
      group: "ECE_SPECIAL",
    },
    { code: "EC-S05", name: "幼兒體能與律動", credits: 2, group: "ECE_SPECIAL" },
    { code: "EC-S06", name: "幼兒音樂", credits: 2, group: "ECE_SPECIAL" },
    {
      code: "EC-S07",
      name: "幼兒數學與科學之探索與遊戲",
      credits: 2,
      group: "ECE_SPECIAL",
    },
    {
      code: "EC-S08",
      name: "幼兒語文發展與學習",
      credits: 2,
      group: "ECE_SPECIAL",
    },
  ],
  prereqs: [
    { course: "EC-P02", requires: "EC-P01", note: "教材教法為學年課應依序修習" },
    { course: "EC-P04", requires: "EC-P03", note: "教保實習為學年課應依序修習" },
    { course: "EC-P05", requires: "EC-P01", note: "教學實習先修教材教法(I)(II)" },
    { course: "EC-P05", requires: "EC-P02", note: "教學實習先修教材教法(I)(II)" },
    { course: "EC-P05", requires: "EC-P03", note: "教學實習先修教保實習(I)(II)" },
    { course: "EC-P05", requires: "EC-P04", note: "教學實習先修教保實習(I)(II)" },
    { course: "EC-P06", requires: "EC-P05", note: "教學實習為學年課應依序修習" },
  ],
  nonCredits: [
    {
      code: "FIELD120",
      name: "實地學習至少120小時",
      description: "至幼兒園進行見習、試教、實習、服務學習等至少120小時。",
    },
    { code: "YELLOW", name: "小黃卡檢核", description: "師資生教育知能檢核機制（小黃卡）。" },
  ],
};

export const TEACHER_PROGRAMS: TeacherProgramSeed[] = [EDU_ELEM, EDU_SPED, EDU_ECE];
