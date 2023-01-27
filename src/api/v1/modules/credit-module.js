class CreditModule {
  async process({ toId, toName, fromId, fromName }, point) {
    let fromStatus = 'new';
    let toStatus = 'new';

    if (fromId && fromName) {
      const fromModule = require(`@v1/models/${fromName}`);
      const fromSession = await fromModule.startSession();
      fromSession.startTransaction();
      let from = await fromModule.finOne({ _id: fromId });
      try {
        if (from.point > point) {
          await fromModule.findOneAndUpdate(
            {
              _id: fromId,
            },
            {
              point: from.point - point,
            },
            { session: fromSession },
          );
          await fromSession.commitTransaction();
          fromStatus = 'success';
        } else fromStatus = 'point_not_enough';
      } catch (error) {
        console.log('from_process');
        fromStatus = 'from_process_error';
        await fromSession.abortTransaction();
      } finally {
        await fromSession.endSession();
      }
    }

    if (toId && toName && ['new', 'success'].includes(fromStatus)) {
      const toModule = require(`@v1/models/${toName}`);
      const to = await toModule.findOne({ _id: toId });
      try {
        await toModule.findOneAndUpdate(
          {
            _id: toId,
          },
          {
            point: to.point + point,
          },
        );
        toStatus = 'success';
      } catch (error) {
        console.log(error);
        toStatus = 'to_process_error';
      }
    }

    return {
      fromStatus,
      toStatus,
    };
  }
}

module.exports = new CreditModule();
