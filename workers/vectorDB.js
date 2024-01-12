// Import IndexedDB Promised library for easier IndexedDB usage
import { openDB } from 'idb';

export class VectorStorage {
  constructor() {
    // Open (or create) the database
    this.dbPromise = openDB('vectorStorage', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('vectors')) {
          db.createObjectStore('vectors', { keyPath: 'text' });
        }
      },
    });
  }

  async addVector(text, vector, source) {
    // Open a transaction, get the object store, and add the vector
    const db = await this.dbPromise;
    const tx = db.transaction('vectors', 'readwrite');
    const store = tx.objectStore('vectors');

    // Check if a vector with the same text already exists
    const existingVector = await store.get(text);
    if (existingVector) {
      // If a vector with the same text already exists, ignore the new vector
      console.log(`A vector with the text "${text}" already exists.`);
    } else {
      // Otherwise, add the new vector
      await store.put({ text, vector, source });
    }

    // Wait for the transaction to complete
    await tx.complete;
  }

// Delete a vector
async deleteVector(text) {
  // Open a transaction, get the object store, and delete the vector
  const db = await this.dbPromise;
  const tx = db.transaction('vectors', 'readwrite');
  const store = tx.objectStore('vectors');
  await store.delete(text);

  // Wait for the transaction to complete
  await tx.complete;
}
  // Get a vector by its text
  getVectorByText(text) {
    return this.storage.find(item => item.text === text);
  }

  // Get a vector by its source
  getVectorBySource(source) {
    return this.storage.filter(item => item.source === source);
  }
  
    // Get all vectors
    getAllVectors() {
      return this.storage;
    }
  
    // Calculate cosine similarity
    cosineSimilarity(a, b) {
      const dotProduct = a.reduce((sum, a_i, i) => sum + a_i * b[i], 0);
      const magnitudeA = Math.sqrt(a.reduce((sum, a_i) => sum + a_i * a_i, 0));
      const magnitudeB = Math.sqrt(b.reduce((sum, b_i) => sum + b_i * b_i, 0));
      return dotProduct / (magnitudeA * magnitudeB);
    }
  
    // Search vectors by cosine similarity
    searchByCosineSimilarity(queryVector, k) {
      // Calculate the cosine similarity for each vector
      const similarities = this.storage.map(item => this.cosineSimilarity(item.vector, queryVector));
  
      // Create an array of indices sorted by their corresponding vector's similarity to the query vector
      const sortedIndices = Array.from({length: similarities.length}, (_, i) => i).sort((a, b) => similarities[b] - similarities[a]);
  
      // Return the top k items
      return sortedIndices.slice(0, k).map(index => this.storage[index]);
    }
  }
  
  // Usage
  // const vectorStorage = new VectorStorage();
  // vectorStorage.addVector('text1', [1, 2, 3], 'source1');
  // vectorStorage.addVector('text2', [4, 5, 6], 'source2');
  // console.log(vectorStorage.searchByCosineSimilarity([1, 2, 3], 1));  // Outputs: [ { text: 'text1', vector: [ 1, 2, 3 ], source: 'source1' } ]
  // console.log(vectorStorage.getAllVectors());  
  // vectorStorage.deleteVector('text1');
  // console.log(vectorStorage.getAllVectors());  // Outputs: [ { text: 'text2', vector: [ 4, 5, 6 ], source: 'source2' } ]