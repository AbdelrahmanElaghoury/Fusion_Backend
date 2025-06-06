require("dotenv").config();
const mongoose = require("mongoose");
const NewPipeline = require("../models/newPipelineModel");

const pipelines = [
  {
    label: "Steroids",
    description: "Explore new steroid treatments",
    icon: "/assets/steroids.png",
  },
  {
    label: "Hormones",
    description: "Explore new hormone treatments",
    icon: "/assets/hormones.png",
  },
];

async function seedNewPipelines() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME || "fusion_ecommerce_store",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await NewPipeline.deleteMany({});
  await NewPipeline.insertMany(pipelines);

  console.log(`✅ Seeded ${pipelines.length} new pipelines!`);
  await mongoose.disconnect();
}

seedNewPipelines().catch((err) => {
  console.error(err);
  process.exit(1);
});
