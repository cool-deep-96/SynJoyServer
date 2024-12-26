import mongoose from "mongoose";
import logger from "../logging/logger";

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL as string);
        //logger.info('DB connected successfully')
    } catch (error) {
        logger.error('DB connection failed', error)
    }
}

export {
    dbConnect,
};




