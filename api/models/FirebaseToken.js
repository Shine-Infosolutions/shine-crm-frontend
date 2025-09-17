import mongoose from "mongoose";

const firebaseTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model("FirebaseToken", firebaseTokenSchema);
