const express = require("express");
var lem = require("wink-lemmatizer");

const PORT = process.env.PORT || 3001;

const app = express();

const lemmatize = (word) => {
    const possible_roots = [
        lem.adjective(word),
        lem.verb(word),
        lem.noun(word)
    ]
    const result = []
    possible_roots.forEach(root => {
        if(root !== word) result.push(root)
    })
    return result
}

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
  var test_msg = "scares"
  console.log(lemmatize(test_msg))
});