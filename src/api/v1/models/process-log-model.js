const mongoose = require('mongoose');

const ProcessLogSchema = new mongoose.Schema({
  status: {
    type: Number,
    default: 1,
    required: false,
  },
  type: {
    type: String,
    default: 'email-verify',
    required: false,
  },
  targetId: String,
  targetName: String,
  createdTime: {
    type: Number,
    default: Math.round(new Date().getTime() / 1000),
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
});

// ProcessLogSchema.pre("save", async function(done) {
//   this.createdTime = Math.round(new Date().getTime() / 1000);
//   done();
// });

module.exports = mongoose.model('process_log', ProcessLogSchema, 'process_log');
