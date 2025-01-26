## Workflow: Parallelisation

This example uses a parallelisation workflow: a given product description is checked against multiple criteria in parallel. Keeping each criteria check separate allows for more focused attention on each specific aspect, reducing the likelihood of a single LLM call being overwhelmed and hallucinating.

`npm run test parallelisation`

⚠️ When running parallelisation tests using OpenAI or Anthropic models, keep in mind the usage costs! Smaller models are faster and cheaper, with sufficient accuracy.

## About parallelisation workflows

_Sourced from [Building effective agents \ Anthropic](https://www.anthropic.com/research/building-effective-agents)_

LLMs can sometimes work simultaneously on a task and have their outputs aggregated programmatically. This workflow, parallelisation, manifests in two key variations:

- **Sectioning**: Breaking a task into independent subtasks run in parallel.
- **Voting**: Running the same task multiple times to get diverse outputs.

![Parallelisation workflow](./parallelisation.png)

**When to use this workflow**

Parallelisation is effective when the divided subtasks can be parallelised for speed, or when multiple perspectives or attempts are needed for higher confidence results. For complex tasks with multiple considerations, LLMs generally perform better when each consideration is handled by a separate LLM call, allowing focused attention on each specific aspect.

Examples where parallelisation is useful:

**Sectioning:**

- Implementing guardrails where one model instance processes user queries while another screens them for inappropriate content or requests. This tends to perform better than having the same LLM call handle both guardrails and the core response.
- Automating evals for evaluating LLM performance, where each LLM call evaluates a different aspect of the model’s performance on a given prompt.

**Voting:**

- Reviewing a piece of code for vulnerabilities, where several different prompts review and flag the code if they find a problem.
- Evaluating whether a given piece of content is inappropriate, with multiple prompts evaluating different aspects or requiring different vote thresholds to balance false positives and negatives.
