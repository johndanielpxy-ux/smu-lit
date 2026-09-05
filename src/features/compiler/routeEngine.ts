import type {
  PlaybookFacts,
  PlaybookRule,
  Route,
  UseCase,
} from "../../domain/mattershift";

export interface RouteDecision {
  route: Route;
  reasonCode:
    | "PLAYBOOK_MATCH"
    | "UNVERIFIED_MATERIAL_AI_FINDING"
    | "AMBIGUOUS_FACTS";
  matchedRuleIds: string[];
  sourceRefIds: string[];
  explanation: string;
}

export interface EvaluateRouteInput {
  useCase: UseCase;
  verifiedFacts: Partial<PlaybookFacts>;
  unresolvedMaterialFindingIds: string[];
}

const factFields: Array<keyof PlaybookFacts> = [
  "contractValue",
  "templateVersion",
  "materialRedline",
  "personalData",
  "governingLaw",
];

function matchesRule(
  rule: PlaybookRule,
  facts: PlaybookFacts,
): boolean {
  const actual = facts[rule.field];
  switch (rule.operator) {
    case "lt":
      return facts.contractValue < rule.value;
    case "eq":
      return actual === rule.value;
    case "neq":
      return actual !== rule.value;
    case "present":
      return actual !== undefined && actual !== null && actual !== "";
    default: {
      const exhaustive: never = rule;
      return exhaustive;
    }
  }
}

function sourceIdsForFallback(useCase: UseCase): string[] {
  const preferred = ["ai-verification-policy", "renewal-routing-playbook"];
  const available = new Set(useCase.sources.map((source) => source.id));
  return preferred.filter((sourceId) => available.has(sourceId));
}

export function evaluateRoute({
  useCase,
  verifiedFacts,
  unresolvedMaterialFindingIds,
}: EvaluateRouteInput): RouteDecision {
  if (unresolvedMaterialFindingIds.length > 0) {
    return {
      route: "legal_review",
      reasonCode: "UNVERIFIED_MATERIAL_AI_FINDING",
      matchedRuleIds: [],
      sourceRefIds: sourceIdsForFallback(useCase),
      explanation:
        "Legal review is required until every material AI finding has been verified.",
    };
  }

  const missingFields = factFields.filter(
    (field) => verifiedFacts[field] === undefined || verifiedFacts[field] === null,
  );
  if (missingFields.length > 0) {
    return {
      route: "legal_review",
      reasonCode: "AMBIGUOUS_FACTS",
      matchedRuleIds: [],
      sourceRefIds: sourceIdsForFallback(useCase),
      explanation: `Legal review is required because ${missingFields.join(", ")} is not verified.`,
    };
  }

  const facts = verifiedFacts as PlaybookFacts;
  const routeRank: Record<Route, number> = {
    legal_review: 3,
    business_approval: 2,
    signature: 1,
  };
  const matches = useCase.playbookRules
    .filter((rule) => matchesRule(rule, facts))
    .sort(
      (left, right) =>
        right.priority - left.priority ||
        routeRank[right.route] - routeRank[left.route] ||
        left.id.localeCompare(right.id),
    );

  const winner = matches[0];
  if (!winner) {
    return {
      route: "legal_review",
      reasonCode: "AMBIGUOUS_FACTS",
      matchedRuleIds: [],
      sourceRefIds: sourceIdsForFallback(useCase),
      explanation: "No approved playbook rule resolves the verified facts.",
    };
  }

  return {
    route: winner.route,
    reasonCode: "PLAYBOOK_MATCH",
    matchedRuleIds: [winner.id],
    sourceRefIds: [...winner.sourceRefIds],
    explanation: winner.explanation,
  };
}
