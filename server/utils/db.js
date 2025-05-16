import mongoose from "mongoose";

export const con2db = async () => {
    const {MONGO_USER, MONGO_PASS, MONGO_DB, MONGO_URI} = process.env;
    if (!MONGO_USER || !MONGO_PASS || !MONGO_DB || !MONGO_URI)
      throw new Error("Missing required MongoDB environment variables.");

    const DB_URI = MONGO_URI
        .replace("<db_username>", MONGO_USER)
        .replace("<db_password>", MONGO_PASS)
        .replace("/?", `/${MONGO_DB}?`);

    try {
      mongoose.connection.on("connected", () =>
        console.log("✅ DB Connection Established."));
      
      mongoose.connection.on("error", (err) => 
        console.error(`❌ ${err.message}`));

      mongoose.connection.on("disconnected", () => {
        console.warn("⚠️ DB Connection Disconnected.");
        setTimeout(()=> mongoose.connect(DB_URI), 5000)
      }); 

      // connect to db
      await mongoose.connect(DB_URI);

    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
};
