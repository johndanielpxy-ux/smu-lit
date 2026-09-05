import {
  GenerationContractError,
  validateGeneratedModule,
  validateGenerationRequest,
  type GenerationModuleRequest,
} from "../_lib/generationContract";
import { errorResponse, jsonResponse, readProtectedJson } from "../_lib/http";
import {
  generateModuleWithOpenAI,
  OpenAIProviderError,
} from "../_lib/openaiProvider";

type GenerateModule = (input: GenerationModuleRequest) => Promise<unknown>;

const providerStatuses: Record<OpenAIProviderError["code"], number> = {
  GENERATION_NOT_CONFIGURED: 503,
  PROVIDER_RATE_LIMITED: 429,
  PROVIDER_REFUSAL: 422,
  PROVIDER_TIMEOUT: 504,
  PROVIDER_UNAVAILABLE: 503,
};

function publicFailure(status: number, code: string, message: string) {
  return jsonResponse(status, { error: { code, message } });
}

export function createModuleHandler(options: {
  studioToken?: string;
  generate: GenerateModule;
}) {
  return async function moduleHandler(request: Request) {
    let input: GenerationModuleRequest;
    try {
      const body = await readProtectedJson(request, { secret: options.studioToken });
      input = validateGenerationRequest(body);
    } catch (error) {
      if (error instanceof GenerationContractError) {
        return publicFailure(422, "INVALID_GENERATION_REQUEST", "The generation request did not pass validation.");
      }
      return errorResponse(error);
    }

    try {
      const generated = await options.generate(input);
      const sourceIds = new Set(input.sources.map((source) => source.id));
      const playbookSourceId = input.sources.find((source) => source.role === "playbook")!.id;
      const draft = validateGeneratedModule(generated, sourceIds, playbookSourceId);
      return jsonResponse(200, { draft });
    } catch (error) {
      if (error instanceof GenerationContractError) {
        return publicFailure(422, "UNSAFE_GENERATED_OUTPUT", "The generated draft did not pass source verification.");
      }
      if (error instanceof OpenAIProviderError) {
        return publicFailure(
          providerStatuses[error.code],
          error.code,
          error.code === "GENERATION_NOT_CONFIGURED"
            ? "Generation is not configured for this deployment."
            : "The generation provider could not produce a safe draft.",
        );
      }
      return errorResponse(error);
    }
  };
}

export default createModuleHandler({
  studioToken: process.env.LAWFLO_STUDIO_TOKEN,
  generate: (input) => generateModuleWithOpenAI(input, {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_TEXT_MODEL ?? "gpt-4o-mini",
  }),
});
