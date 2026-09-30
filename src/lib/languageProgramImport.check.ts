/**
 * Self-check for language-program CSV merge.
 * Run: npx tsx src/lib/languageProgramImport.check.ts
 */
import { languageFeeLines } from "./matching/chinese";
import { resolveLanguageTuition } from "./matching/university";
import {
  buildLanguageAdmission,
  mergeLanguageAdmission,
  parseAgeRange,
  parseDocumentLines,
  parseTuitionCny,
  dedupeLanguageRecords,
} from "./languageProgramImport";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

const tuition = parseTuitionCny("5800元/学期\n10000元/学年");
assert(tuition.min === 5800, "semester min");
assert(tuition.max === 10000, "year max");

const swu = parseTuitionCny("8000 CNY/semester\n15000 CNY/year");
assert(swu.min === 8000 && swu.max === 15000, "cny semester/year");

assert(parseAgeRange("18-30").min === 18 && parseAgeRange("18-30").max === 30, "age range");
assert(parseAgeRange(">16").min === 16 && parseAgeRange(">16").max === null, "age gt");

const capDocs = parseDocumentLines(`(1) 国际学生入学申请表（中文或英文）
(2) 最高学历证明
(3) 最高学历阶段的正式成绩单
(4) 推荐信
(5) 护照复印件（个人信息页）
(6) 健康证明
(7) 无犯罪记录证明
(8) 白底电子证件照
(9) HSK 4级证书（学历教育项目要求）`);
assert(capDocs.length === 9, `cap docs ${capDocs.length}`);
assert(capDocs[0].includes("入学申请表"), "keep application form");
assert(capDocs[2].includes("成绩单"), "keep transcript distinct from diploma");
assert(capDocs[8].includes("HSK"), "keep HSK line");

const wrapped = parseDocumentLines(`④ 《外国人体格检查记录表》PDF扫描件，需盖公立医院的公章。体检报告应附有 X 光透视胸片及霍乱、
黄热、鼠疫、麻风。
⑤ 申请人近期免冠白底两寸照片。
03 招生信息
3.申请流程
① 联系工作人员获取正确招生信息。`);
assert(wrapped.length === 2, `wrapped docs ${wrapped.length}`);
assert(wrapped[0].includes("黄热"), "join csv wrap into same document");
assert(!wrapped.join("").includes("联系工作人员"), "stop at application process");

const gzuWrap = parseDocumentLines(`（五）资金资助证明（银行资金证明，提供至少人民币
2 万元/年或等额资金证明）或提交《经济担保证明》。
（六）无犯罪记录证明。`);
assert(gzuWrap.length === 2, `gzu wrap ${gzuWrap.length}`);
assert(gzuWrap[0].includes("2 万元"), "join amount wrap not new item");

const rows = dedupeLanguageRecords([
  {
    name_zh: "成都大学",
    city_raw: "成都",
    project: "汉语言进修",
    tuition: "7000元/学期，14000元/年",
    age: "16-59",
    foundation: "可0基础",
    dormitory: "2500元/学期/四人间",
    deadline: "automne",
    apply_website: "https://admissions.cdu.edu.cn/",
    contact: "cdlxzs@cdu.edu.cn",
    pathway: "HSK4",
    documents: "1. 护照复印件",
    note: "premier",
    scholarship: "✅",
  },
  {
    name_zh: "成都大学",
    city_raw: "成都",
    project: "汉语言进修",
    tuition: "？",
    age: ">16",
    foundation: "高中及以上学历",
    dormitory: "？",
    deadline: "11月1日",
    apply_website: "https://admissions.cdu.edu.cn",
    contact: "cdlxzs@cdu.edu.cn",
    pathway: "HSK4",
    documents: "1. 护照复印件",
    note: "second",
    scholarship: "？",
  },
]);
assert(rows.length === 1, "dedupe chengdu");
assert(rows[0].tuition.includes("7000"), "keep numbered tuition");

const admission = buildLanguageAdmission(rows[0]);
assert(admission.chinese_language_program_available === true, "flag");
assert(admission.programs[0].level === "language", "program level");
assert(admission.fees.tuition.language.min === 7000, "language tuition");
assert(admission.language_session.documents[0].includes("护照"), "session keeps full doc line");

const merged = mergeLanguageAdmission(
  {
    admission: {
      chinese_language_program_available: false,
      programs: [{ level: "bachelor", name: "Licence", language: "zh" }],
      fees: { tuition: { bachelor: { min: 14000, max: 20000 } } },
      documents: [{ type: "Passeport diplôme" }],
    },
  },
  admission,
);
const programs = (merged.admission as { programs: Array<{ level: string }> }).programs;
assert(programs.some((p) => p.level === "bachelor"), "keep bachelor");
assert(programs.filter((p) => p.level === "language").length === 1, "one language");
const session = (
  merged.admission as unknown as { language_session: { documents: string[] } }
).language_session;
assert(session.documents.length >= 1, "language session on existing uni");
const degreeDocs = (
  merged.admission as unknown as { documents: Array<{ type: string }> }
).documents;
assert(degreeDocs?.[0]?.type === "Passeport diplôme", "do not overwrite degree documents");

const split = resolveLanguageTuition({ text: "10500元/学期\n21000元/学年" });
assert(split.semester === 10500 && split.year === 21000 && split.period === "both", "keep semester and year");
const annual = languageFeeLines({
  semester: split.semester,
  year: split.year,
  period: split.period,
  living: 35000,
  livingDefault: true,
});
assert(annual[0].includes("semestre") && annual[0].includes("21"), "year tuition is the annual figure");
assert(!annual.some((line) => line.includes("45")), "semester price is not added to a full year of living");

const stored = resolveLanguageTuition({ min: 5800, max: 10000 });
assert(stored.semester === 5800 && stored.year === 10000, "min/max pair is semester then year");

const unknown = resolveLanguageTuition({ min: 10500, max: 10500 });
assert(unknown.period === "unknown" && unknown.year == null, "lone figure is not a year");
const unknownLines = languageFeeLines({
  amount: 10500,
  period: "unknown",
  living: 35000,
  livingDefault: true,
});
assert(
  !unknownLines.some((line) => /total indicatif/i.test(line)),
  "unknown period does not invent an annual total",
);

console.log("languageProgramImport check ok");
