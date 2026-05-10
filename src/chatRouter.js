import express from 'express';
import GeminiProvider from './geminiProvider.js';
import RagProvider from './rag.js';
import OpenaiProvider from './openaiProvider.js';

const router = express.Router();
// sample chat route 
// router.post('/chat', async (req, res) => {
//   const { message } = req.body;

//   if(!message) {
//     return res.status(400).json({ error: 'Message is required' });
//   }

//   console.log(`Received message: ${message}`);

//   try {
//     const gemini = new GeminiProvider(
//       process.env.GEMINI_API_KEY,
//       process.env.GEMINI_MODEL
//     );

//     const rag = new RagProvider();
//     // const prompt = rag.prepareSimpleRagPrompt(message);

//     // for RAG with embedding, we swould first need to 
//     // generae the query embedding
//     const queryEmbedding = await gemini.generateEmbeddings(message);
//     const queryVector = queryEmbedding[0];

//     // Fetch FAQ vectors from faqs.json
//     const faqData = rag.fetchDocumentData('faqs.json');

//     // we will embed the answers because we want to match the user query with the most relevant answer in the FAQ
//     // using questions can make the matching less accurate because the user query might not closely match the wording 
//     // of the question in the FAQ, but it might be semantically similar to the answer. By embedding the answers, we 
//     // can capture the semantic meaning and improve the relevance of the retrieved information.
//     const faqEmbeddings =  await gemini.generateEmbeddings(
//       faqData.map(faq => faq.answer),
//       'RETRIEVAL_DOCUMENT');
    
//     const faqVectors = faqData.map((faq, index) => ({
//       ...faq,
//       vector: faqEmbeddings.embeddings[index].values,
//     }));

//     const prompt = rag.prepareRagProompt(message, queryVector, faqVectors)

//     console.log(`Prepared prompt: ${prompt}`);

//     const response = await gemini.generateResponse(prompt);
//     console.log(`Generated response: ${response}`);

//     res.json({ reply: response });
//   } catch(error) {
//     console.error("Error generating response from Gemini:", error);
//     res.status(500).json({ error: "Failed to get a response from the AI." });
//   }
// });

// DYNAMIC CHAT ROUTE TO SUPPORT MULTIPLE MODELS (GPT AND GEMINI)
router.post('/chat', async (req, res) => {
  const { message, model } = req.body;

  if(!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const modelName = model || 'gpt';
  let llmProvider

  try {
    if(modelName === 'gpt') {
      llmProvider = new OpenaiProvider(
        process.env.OPENAI_API_KEY,
        process.env.OPENAI_MODEL
      );
    } else {
      llmProvider = new GeminiProvider(
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_MODEL
      );
    }

    // for RAG with embedding, we would first need to 
    // generate the query embedding
    const queryEmbedding = await llmProvider.generateEmbeddings(message);
    console.log('Query embedding:', queryEmbedding);
    const queryVector = queryEmbedding[0];
    
    const rag = new RagProvider();

    // Fetch FAQ vectors from faqs.json
    const faqData = rag.fetchDocumentData('faqs.json');


    let faqEmbeddings;


    // we will embed the answers because we want to match the user query with the most relevant answer in the FAQ
    // using questions can make the matching less accurate because the user query might not closely match the wording 
    // of the question in the FAQ, but it might be semantically similar to the answer. By embedding the answers, we 
    // can capture the semantic meaning and improve the relevance of the retrieved information.
    if(llmProvider instanceof GeminiProvider){
      faqEmbeddings =  await llmProvider.generateEmbeddings(
      faqData.map(faq => faq.answer),
      'RETRIEVAL_DOCUMENT');
    } else {
      faqEmbeddings =  await llmProvider.generateEmbeddings(
      faqData.map(faq => faq.answer));
    }
    
    const faqVectors = faqData.map((faq, index) => ({
      ...faq,
      vector: faqEmbeddings[index],
    }));

    const prompt = rag.prepareRagPrompt(message, queryVector, faqVectors)


    // generate response using the selected LLM provider
    const response = await llmProvider.generateResponse(prompt);

    res.json({ reply: response });
  } catch(error) {
    console.error("Error generating response from LLM:", error);
    res.status(500).json({ error: "Failed to get a response from the AI." });
  }
});

export default router;
