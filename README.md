
# Lightweight Browser-based NLP with Hugging Face Transformers

This project uses Hugging Face's Transformers library in a browser environment to perform Natural Language Processing (NLP) tasks. Specifically, we use it to embed text and find similar sentences.

## Webpack Configuration

We use Webpack to bundle our JavaScript code, including the Transformer.js library, into a single file that can be run in the browser. Our Webpack configuration includes settings for handling JavaScript files and other assets.

To build the project, run the following command:

```bash
npm run build
```

This command will use Webpack to bundle the code according to the configuration specified in `webpack.config.js`.

Here's a basic overview of our Webpack configuration:

```javascript
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
};
```

This configuration tells Webpack to start bundling from `src/index.js`, to output the bundled file as `dist/main.js`, and to use Babel to transpile our JavaScript code.

## Using Transformer.js for Text Embedding

We use the `pipeline` function from the Transformer.js library to generate embeddings for text. An embedding is a way of representing text in a high-dimensional space that captures semantic meaning. It's often used in natural language processing (NLP) tasks.

Here's an example of how we use Transformer.js to generate embeddings:

```javascript
const pipe = await pipeline('feature-extraction', 'Supabase/gte-small');

// Generate an embedding for each sentence
const embeddings = await Promise.all(
  sentences.map((sentence) =>
    pipe(sentence, {
      pooling: 'mean',
      normalize: true,
    })
  )
);
```

## Storing Text and Embeddings

We use IndexedDB, a low-level API for client-side storage of significant amounts of structured data, to store the text and its corresponding embedding. We have created a custom `VectorStorage` class that handles the storage and retrieval of vectors in IndexedDB.

## Finding Similar Sentences

Once we have the embeddings, we can use them to find sentences that are similar to a given query. We do this by calculating the cosine similarity between the query's embedding and the embeddings of each sentence. The sentence with the highest cosine similarity to the query is considered the most similar sentence.

```javascript
// Generate an embedding for the query string
const queryEmbedding = Array.from(
  (
    await pipe(event.data.query, {
      pooling: 'mean',
      normalize: true,
    })
  ).data
);

// Find the embedding that's most similar to the query embedding
const index = self.embeddings.reduce((bestIndex, embedding, index) => {
  const similarity = cosineSimilarity(embedding, queryEmbedding);
  return similarity > cosineSimilarity(self.embeddings[bestIndex], queryEmbedding)
    ? index
    : bestIndex;
}, 0);

// Return the corresponding sentence
postMessage(self.sentences[index]);
```

This project is a demonstration of how powerful NLP tools like Hugging Face's Transformers library can be used in a lightweight, browser-based application.

## Source
https://huggingface.co/Supabase/gte-small