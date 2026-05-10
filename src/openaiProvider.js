import OpenAI from "openai";


class OpenaiProvider {
    constructor(apiKey, modelName){
        this.apiKey = apiKey;
        this.modelName = modelName;

        if(!this.apiKey){
            throw new Error("OpenAI API key is required");
        }

        if(!this.modelName){
            throw new Error("OpenAI model name is required");
        }

        this.openai = new OpenAI({apiKey: this.apiKey});
    }

    async generateResponse(prompt){
        try {
             const response = await this.openai.responses.create({
            model: this.modelName,
            input: prompt
            });

            return response.output_text || "No response generated";
        } catch (error) {
            console.error("Error generating response from OpenAI provider:", error);
            throw new Error("Failed to generate response from OpenAI provider", error.message);
        }
    }

    async generateEmbeddings(data){
        try {
            const response = await this.openai.embeddings.create({
                model: "text-embedding-3-small",
                input: data,
                encoding_format: "float"
            });
            
            const embeddings = response.data.map((e) => e.embedding);
            return embeddings;

        } catch (error) {
            console.error("Error generating embeddings from OpenAI provider:", error);
            throw new Error("Failed to generate embeddings from OpenAI provider", error.message);
        }
    }
}

export default OpenaiProvider;