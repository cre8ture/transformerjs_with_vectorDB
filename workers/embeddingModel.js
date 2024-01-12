import { pipeline } from "@xenova/transformers";
import { VectorStorage } from "./vectorDB";

// Create an instance of VectorStorage
const vectorStorage = new VectorStorage();

self.onmessage = async function (event) {
  let sentences = [];

  console.log("event!!!", event);

  // try {
  const pipe = await pipeline("feature-extraction", "Supabase/gte-small");
  // } catch (error) {
  //     console.error('Error initializing pipeline:', error);
  //     return;
  // }

  if (event.data.type === "text") {
    console.log("event.data.text", event.data.text);
    // Check if the text is a string
    if (typeof event.data.text === "string") {
      // Split the text into sentences
      sentences = event.data.text.split(". ");
      // Rest of the code...
    } else {
      console.error("event.data.text is not a string:", event.data.text);
    }

    // Generate an embedding for each sentence
    const embeddings = await Promise.all(
      sentences.map((sentence) =>
        pipe(sentence, {
          pooling: "mean",
          normalize: true,
        })
      )
    );

    // Store the sentences and their corresponding embeddings
    self.sentences = sentences;
    self.embeddings = embeddings.map((output) => Array.from(output.data));

    // Save each sentence and its embedding to the vector storage
    self.sentences.forEach((sentence, index) => {
      vectorStorage.addVector(
        sentence,
        self.embeddings[index],
        "embeddingModel"
      );
    });

    // console.log("self.sentences", self.sentences);
    // console.log("self.embeddings", self.embeddings);
  } else if (event.data.type === "query") {
    // Generate an embedding for the query string
    const queryEmbedding = Array.from(
      (
        await pipe(event.data.query, {
          pooling: "mean",
          normalize: true,
        })
      ).data
    );

    // Find the embedding that's most similar to the query embedding
    // const index = self.embeddings.reduce((bestIndex, embedding, index) => {
    //   const similarity = cosineSimilarity(embedding, queryEmbedding);
    //   return similarity >
    //     cosineSimilarity(self.embeddings[bestIndex], queryEmbedding)
    //     ? index
    //     : bestIndex;
    // }, 0);

    // // Return the corresponding sentence
    // postMessage(self.sentences[index]);
    // Set the number of similar sentences to return
    const numSimilarSentences = 5;

    // Calculate the cosine similarity for each sentence
    const similarities = self.embeddings.map((embedding) =>
      cosineSimilarity(embedding, queryEmbedding)
    );

    // Create an array of indices sorted by their corresponding sentence's similarity to the query string
    const sortedIndices = Array.from(
      { length: similarities.length },
      (_, i) => i
    ).sort((a, b) => similarities[b] - similarities[a]);

    // Return the top n sentences
    postMessage(
      sortedIndices
        .slice(0, numSimilarSentences)
        .map((index) => self.sentences[index])
    );
  }
};

function cosineSimilarity(a, b) {
  const dotProduct = a.reduce((sum, a_i, i) => sum + a_i * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, a_i) => sum + a_i * a_i, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, b_i) => sum + b_i * b_i, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
