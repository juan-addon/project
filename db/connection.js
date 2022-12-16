const { mongoose } = require("mongoose");

const password = "vztrBQ2IMx14nDEg";
const uri =`mongodb+srv://juanadon03:${password}@juancluster.0tvd1wf.mongodb.net/?retryWrites=true&w=majority`;

const connection = () => {
  mongoose.connect(
    uri,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    },
    (error) => {
      if (error) {
        console.log(error);
        console.log("Failed connection to MongoDB.");
      } else {
        console.log("This application is connected with MongoDB.");
      }
    }
  );
};

module.exports = connection;
