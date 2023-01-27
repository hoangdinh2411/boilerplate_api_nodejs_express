const mongoose = require('mongoose');
let sequenceSchema, sequence;

sequenceSchema = new mongoose.Schema({
  _id: { type: String },
  nextSeqNum: { type: Number, default: 1 },
});

sequence = mongoose.model('counter', sequenceSchema);

class SequenceModule {
  constructor(_id) {
    this._id = _id;
  }
  async nextVal() {
    let seq = await sequence.findByIdAndUpdate(
      this._id,
      {
        $inc: { nextSeqNum: 1 },
      },
      { new: true },
    );
    if (seq === undefined || seq === null) {
      let newSeq = new sequence({
        _id: this._id,
      });
      seq = await newSeq.save();
    }
    return seq.nextSeqNum;
  }
}

module.exports = SequenceModule;
