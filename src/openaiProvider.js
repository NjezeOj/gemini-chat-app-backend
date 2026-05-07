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
    }
}