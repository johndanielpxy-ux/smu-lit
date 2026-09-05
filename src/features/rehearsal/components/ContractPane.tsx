import type { ContractClause, ContractScenario } from "../../../domain/mattershift";

export function ContractPane({ scenario, selectedClause, onOpenClause }: { scenario: ContractScenario; selectedClause?: ContractClause; onOpenClause: (id: string) => void }) {
  return <section className="matter__contract"><header><span className="matter__eyebrow">Submitted agreement</span><h2>{scenario.contractName}</h2><p>{scenario.counterparty} · SGD {scenario.contractValue.toLocaleString("en-SG")}</p></header>
    <div className="matter__clause-list">{scenario.clauses.map((clause) => <button key={clause.id} type="button" className={clause.materiallyChanged ? "is-changed" : ""} onClick={() => onOpenClause(clause.id)} aria-label={clause.id.includes("liability") ? "Compare liability clause" : `Compare ${clause.heading} clause`}><span>{clause.heading}</span><small>{clause.materiallyChanged ? "Change detected" : "Matches template"}</small></button>)}</div>
    {selectedClause && <div className="matter__comparison"><div><span>Approved standard</span><p>{selectedClause.standardText}</p></div><div className={selectedClause.materiallyChanged ? "is-risk" : ""}><span>Submitted version</span><p>{selectedClause.submittedText}</p></div></div>}
  </section>;
}
