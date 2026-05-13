const mongoose = require('mongoose');
const Payment = require('./models/Payment');

async function checkPayments() {
  try {
    await mongoose.connect('mongodb://admin:password123@localhost:27017/pisowifi?authSource=admin');
    
    const allPayments = await Payment.find().sort({ createdAt: -1 }).limit(10);
    
    console.log('Recent payments in database:');
    allPayments.forEach(p => {
      console.log(`  ID: ${p.paymentId}, Status: ${p.status}, UserId: ${p.userId}, Amount: ₱${p.amount}`);
    });
    
    console.log(`\nTotal payments: ${await Payment.countDocuments()}`);
    
    // Check for duplicate payments with same paymentId
    const pipeline = [
      { $group: { _id: '$paymentId', count: { $sum: 1 }, ids: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ];
    
    const duplicates = await Payment.aggregate(pipeline);
    if (duplicates.length > 0) {
      console.log('\n⚠️ Found duplicate payment IDs:');
      duplicates.forEach(dup => {
        console.log(`  PaymentID: ${dup._id}, Count: ${dup.count}, MongoIDs: ${dup.ids.join(', ')}`);
      });
    } else {
      console.log('\n✅ No duplicate payment IDs found');
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkPayments();
