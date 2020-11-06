"use-strict";
// const servers = [
//   "nats://127.0.0.1:14222",
//   "nats://127.0.0.1:24222",
//   "nats://127.0.0.1:34222",
// ];
const isEmpty = require("lodash/isEmpty");
const { TaskIndexes } = require("./onLineState/models");

const servers = process.env.NATS_SERVER_HOSTS.split(',');
const stan = require("node-nats-streaming").connect("nats-streaming", "test", {
  servers,
});

stan.on("connect", function () {
  const getIndexItem = (item) => {
    if (isEmpty(item)) {
      const indexItem = new TaskIndexes({ id: "foo", sequence: 0 });
      indexItem.save();
      return indexItem;
    }
    return item;
  };

  TaskIndexes.findOne({ where: { id: "foo" } }, (error, item) => {
    const indexItem = getIndexItem(item);

    const opts = stan.subscriptionOptions().setDeliverAllAvailable();
    opts.setManualAckMode(true);
    opts.setAckWait(60 * 1000); // 60s
    opts.setStartAtSequence(indexItem.sequence);

    const subscription = stan.subscribe("foo", "foo.workers", opts);
    
    subscription.on("message", function (msg) {
      indexItem.sequence = indexItem.sequence + 1;
      indexItem.save();
      msg.ack();
    });
  });
});

// stan.on("close", function () {
//   process.exit();
// });
