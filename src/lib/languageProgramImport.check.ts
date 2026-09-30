/**
 * Self-check for language-program CSV merge.
 * Run: npx tsx src/lib/languageProgramImport.check.ts
 */
import {
  buildLanguageAdmission,
  mergeLanguageAdmission,
  parseAgeRange,
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

const merged = mergeLanguageAdmission(
  {
    admission: {
      chinese_language_program_available: false,
      programs: [{ level: "bachelor", name: "Licence", language: "zh" }],
      fees: { tuition: { bachelor: { min: 14000, max: 20000 } } },
    },
  },
  admission,
);
const programs = (merged.admission as { programs: Array<{ level: string }> }).programs;
assert(programs.some((p) => p.level === "bachelor"), "keep bachelor");
assert(programs.filter((p) => p.level === "language").length === 1, "one language");
const tuitionFees = (
  merged.admission as unknown as {
    fees: { tuition: { bachelor: { min: number }; language: { min: number } } };
  }
).fees.tuition;
assert(tuitionFees.bachelor.min === 14000, "keep bachelor tuition");
assert(tuitionFees.language.min === 7000, "add language tuition");
assert(
  (merged.admission as { chinese_language_program_available: boolean }).chinese_language_program_available === true,
  "language flag on",
);

console.log("languageProgramImport check ok");
