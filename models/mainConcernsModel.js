const mongoose = require("mongoose");

const SubConcernSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
  },
  { _id: false }
);

const MainConcernsSchema = new mongoose.Schema({
  main_concern_name: { type: String, required: true, unique: true },
  subConcerns: { type: [SubConcernSchema], default: [] },
});

const MainConcerns = mongoose.model(
  "MainConcerns",
  MainConcernsSchema,
  "mainconcerns"
);

module.exports = MainConcerns;
