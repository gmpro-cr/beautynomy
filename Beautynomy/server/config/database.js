import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beautynomy';

    const conn = await mongoose.connect(MONGODB_URI, {
      // No need for useNewUrlParser and useUnifiedTopology in Mongoose 6+
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('\n💡 HINT: Make sure you have:');
    console.log('   1. Created a MongoDB Atlas account');
    console.log('   2. Created a cluster');
    console.log('   3. Added MONGODB_URI to your .env file');
    console.log('   4. Whitelisted your IP address in Atlas\n');
    process.exit(1);
  }
};

export default connectDB;
