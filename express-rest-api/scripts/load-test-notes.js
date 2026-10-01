require("dotenv").config();

const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

const Note = require("../src/models/Note");

const TOTAL_NOTES = 10000;
const BENCHMARK_RUNS = 10;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/notes-api";

const dropIndexIfExists = async (indexName) => {
  try {
    await Note.collection.dropIndex(indexName);
    console.log(`Dropped index: ${indexName}`);
  } catch (error) {
    // ignore when index does not exist
  }
};

const measureAverage = async (queryFn, runs = BENCHMARK_RUNS) => {
  const values = [];

  for (let index = 0; index < runs; index += 1) {
    const start = process.hrtime.bigint();
    const result = await queryFn();
    const end = process.hrtime.bigint();
    const elapsedMs = Number((end - start) / BigInt(1_000_000));
    values.push(Number(elapsedMs.toFixed(2)));
  }

  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;

  return {
    runs,
    averageMs: Number(avg.toFixed(2)),
    minMs: Math.min(...values),
    maxMs: Math.max(...values),
    values,
  };
};

const findIndexName = (plan) => {
  if (!plan) return "N/A";

  if (plan.indexName) return plan.indexName;

  if (plan.inputStage) return findIndexName(plan.inputStage);

  if (plan.inputStage?.inputStage) return findIndexName(plan.inputStage.inputStage);

  return "N/A";
};

const buildTitle = (index) => {
  const shouldContainFoo = index % 7 === 0;

  if (shouldContainFoo) {
    return `foo ${faker.commerce.productAdjective()} ${faker.animal.type()}`;
  }

  return `${faker.commerce.productMaterial()} ${faker.company.buzzNoun()} ${faker.word.noun()}`;
};

const generateNote = (index) => ({
  owner: new mongoose.Types.ObjectId(),
  title: buildTitle(index),
  content: faker.lorem.paragraph({ min: 2, max: 4 }),
  category: faker.helpers.arrayElement(["work", "personal", "study", "ideas", "travel"]),
  tags: faker.helpers.arrayElements(
    ["work", "bug", "feature", "team", "urgent", "travel", "notes", "idea"],
    { min: 1, max: 4 }
  ),
  createdAt: faker.date.recent({ days: 20 }),
});

const runBenchmark = async () => {
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  console.log(`Connected to MongoDB: ${mongoUri}`);

  try {
    await Note.deleteMany({});

    const docs = Array.from({ length: TOTAL_NOTES }, (_, index) => generateNote(index));
    await Note.insertMany(docs, { ordered: false });
    console.log(`Inserted ${TOTAL_NOTES} notes.`);

    await dropIndexIfExists("title_text");
    await dropIndexIfExists("owner_1_createdAt_-1");

    const baselineQuery = () => Note.find({ title: /foo/ }).limit(20).lean().exec();
    await baselineQuery();
    const baselineTime = await measureAverage(baselineQuery, BENCHMARK_RUNS);
    const baselineExplain = await Note.find({ title: /foo/ }).limit(20).explain("executionStats");

    console.log("\n=== Before indexing ===");
    console.log(JSON.stringify({
      label: "regex without index",
      runs: baselineTime.runs,
      averageMs: baselineTime.averageMs,
      minMs: baselineTime.minMs,
      maxMs: baselineTime.maxMs,
      matches: (await baselineQuery()).length,
      executionTimeMillis: baselineExplain.executionStats.executionTimeMillis,
      totalDocsExamined: baselineExplain.executionStats.totalDocsExamined,
      totalKeysExamined: baselineExplain.executionStats.totalKeysExamined,
      winningPlan: baselineExplain.queryPlanner.winningPlan,
    }, null, 2));

    await Note.collection.createIndex({ title: "text" });

    const textQuery = () => Note.find({ $text: { $search: "foo" } }).limit(20).lean().exec();
    await textQuery();
    const textTime = await measureAverage(textQuery, BENCHMARK_RUNS);
    const textExplain = await Note.find({ $text: { $search: "foo" } }).limit(20).explain("executionStats");

    console.log("\n=== After text index ===");
    console.log(JSON.stringify({
      label: "text search with index",
      runs: textTime.runs,
      averageMs: textTime.averageMs,
      minMs: textTime.minMs,
      maxMs: textTime.maxMs,
      matches: (await textQuery()).length,
      executionTimeMillis: textExplain.executionStats.executionTimeMillis,
      totalDocsExamined: textExplain.executionStats.totalDocsExamined,
      totalKeysExamined: textExplain.executionStats.totalKeysExamined,
      winningPlan: textExplain.queryPlanner.winningPlan,
    }, null, 2));

    await Note.collection.createIndex({ owner: 1, createdAt: -1 });

    const sampleOwner = (await Note.findOne({}).lean())?.owner;
    const recentQuery = () => Note.find({ owner: sampleOwner }).sort({ createdAt: -1 }).limit(10).lean().exec();
    await recentQuery();
    const recentExplain = await Note.find({ owner: sampleOwner }).sort({ createdAt: -1 }).limit(10).explain("executionStats");

    console.log("\n=== Compound index explain ===");
    console.log(JSON.stringify({
      query: "find({ owner: sampleOwner }).sort({ createdAt: -1 }).limit(10)",
      executionTimeMillis: recentExplain.executionStats.executionTimeMillis,
      totalDocsExamined: recentExplain.executionStats.totalDocsExamined,
      totalKeysExamined: recentExplain.executionStats.totalKeysExamined,
      indexUsed: findIndexName(recentExplain.queryPlanner.winningPlan),
      winningPlan: recentExplain.queryPlanner.winningPlan,
    }, null, 2));

    console.log("\nSummary:");
    console.log(`Regex without index average: ${baselineTime.averageMs} ms`);
    console.log(`Text search with index average: ${textTime.averageMs} ms`);
    console.log(`Recent notes index explain executionTimeMillis: ${recentExplain.executionStats.executionTimeMillis} ms`);
  } finally {
    await mongoose.disconnect();
  }
};

runBenchmark().catch((error) => {
  console.error("Benchmark failed:", error);
  process.exit(1);
});
