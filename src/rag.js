import fs from 'node:fs';
import path from 'node:path';
import cosineSimilarity from 'compute-cosine-similarity'


class RagProvider{
    prepareSimpleRagPrompt(query){
        const kbDta = fetchDocumentData('knowledgeBase.json');

        const context = kbDta.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n');
        
        const prompt = `You are a helpful assistant. Use the following knowledge base to answer the question:\n\n${context}\n\nBased on the above knowledge, answer the following user qustion:\n\nUser: ${query}\nAnswer in one short paragraph`;

        return prompt;
    }

    fetchDocumentData(fileName){
        const filePath = path.join(process.cwd(), 'data', fileName);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return data;
    }

    prepareRagPrompt(query, queryVector, faqVectors){
        const ranked = faqVectors.map(item => ({
            ...item,
            score: cosineSimilarity(queryVector, item.vector)
        }))
        .sort((a,b) => b.score - a.score)
        .slice(0,2); // get top 2 most relevant FAQs

        const context = ranked.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n');
        
        // const prompt = `You are a helpful assistant. Use the following knowledge base to answer the question:\n\n${context}\n\nBased on the above knowledge, answer the following user qustion:\n\nUser: ${query}\nAnswer in one short paragraph
        // If the answer isn't there, say "I don't know"
        // `;

        const prompt = `
        Use the context below to answer. If the answer isn't there, say "It's not available in the documentation, but I wll try too help you as best as I can."
        and try to help based on your genral knowledge.
    
        Context:
        ${context}        
        
        User: ${query}
        `.trim();

        //Trim is important because extra space adds to the cost of tokens

        return prompt;

    }
}

export default RagProvider;