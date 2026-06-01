import { textJson } from '../llmClient.js'
import { modifyDesign } from './designModifyAgent.js'
import { updateResultDesign } from '../jobState.js'
import { PIPELINE_STEPS } from '../pipelineState.js'

const ORCHESTRATOR_SYSTEM = `You are the Orchestrator for Ad Template Studio — the user's single point of contact.
You coordinate:
- Product Analyst (market/competitor analysis)
- Design Strategist (ad concepts)
- Design Creator + Renderer (trees and previews)

You see the current job state and chat history. Be helpful, concise, and proactive.

Output ONLY valid JSON:
{
  "reply": "Markdown message to the user (use **bold**, bullets, friendly tone)",
  "actions": []
}

Optional actions:

Design edits (only when designs exist):
{
  "type": "modify_design",
  "designId": "design_1",
  "instruction": "Clear instruction for the modify agent"
}

Pipeline control (when job failed, interrupted, or user asks to continue/retry/stop):
{
  "type": "resume_pipeline",
  "fromStep": "analysis|strategy|design|render|finalize"
}
{
  "type": "retry_pipeline",
  "fromStep": "design",
  "force": true
}
{
  "type": "stop_pipeline",
  "reason": "short reason shown to user"
}

Pipeline steps in order: prep → analysis → strategy → design → render → finalize.

Rules:
- If PIPELINE STATUS is failed, explain what failed and recommend resume_pipeline from failedStep OR retry_pipeline with force if that step should run again.
- If user says "continue", "resume", "try again", "retry" — emit resume_pipeline (or retry_pipeline to re-run the failed step).
- If user wants to stop or errors are unrecoverable, emit stop_pipeline and explain why.
- Do not emit resume_pipeline if pipeline is complete unless user explicitly wants to re-run a step (use retry_pipeline with fromStep).
- Explain agent progress and findings when asked.
- Reference design ids: design_1, design_2, design_3, design_4.
- For edit requests (color, text, layout, CTA), emit modify_design action(s).
- If no job/designs yet, guide user to submit the brief.
- Keep reply under 300 words unless summarizing analysis.
- No markdown code fences in JSON.
- STRICT content rule: designs must only use user-provided brief fields unless Custom design direction authorizes more.
- modify_design must not add invented marketing claims unless the user explicitly requested them.`

function buildContextBlock(state) {
  const lines = [
    `JOB: ${state.jobId || 'none'}`,
    `PHASE: ${state.phase || 'idle'}`,
  ]

  if (state.pipeline) {
    lines.push(
      `PIPELINE STATUS: ${state.pipeline.status || 'unknown'}` +
        (state.pipeline.failedStep ? ` | failed at: ${state.pipeline.failedStep}` : '') +
        (state.pipeline.error ? ` | error: ${state.pipeline.error}` : '') +
        (state.pipeline.currentStep ? ` | current: ${state.pipeline.currentStep}` : ''),
    )
    lines.push(`COMPLETED STEPS: ${(state.completedSteps || []).join(', ') || 'none'}`)
    lines.push(`CAN RESUME: ${state.canResume ? 'yes' : 'no'}`)
    lines.push(`ALL STEPS: ${PIPELINE_STEPS.join(' → ')}`)
  }

  if (state.brief?.title) {
    lines.push(`PRODUCT: ${state.brief.title}`)
    if (state.brief.category) lines.push(`CATEGORY: ${state.brief.category}`)
  }

  if (state.analysisSummary) {
    lines.push(`\nPRODUCT ANALYST REPORT:\n${state.analysisSummary}`)
  }

  if (state.designStrategySummary) {
    lines.push(`\nDESIGN STRATEGIST PLAN:\n${state.designStrategySummary}`)
  }

  if (state.designs?.length) {
    lines.push(
      `\nDESIGNS (${state.designs.length}):\n` +
        state.designs
          .map(
            (d) =>
              `- ${d.id}: ${d.name} | ${d.concept || ''} | perf=${d.expectedPerformance || '?'}`,
          )
          .join('\n'),
    )
  }

  return lines.join('\n')
}

function formatHistory(messages, limit = 12) {
  return (messages || [])
    .slice(-limit)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n')
}

function parsePipelineAction(action) {
  if (!action?.type) return null
  if (action.type === 'resume_pipeline') {
    return {
      type: 'resume_pipeline',
      fromStep: action.fromStep || null,
      force: false,
    }
  }
  if (action.type === 'retry_pipeline') {
    return {
      type: 'resume_pipeline',
      fromStep: action.fromStep || null,
      force: action.force !== false,
    }
  }
  if (action.type === 'stop_pipeline') {
    return {
      type: 'stop_pipeline',
      reason: action.reason || 'Stopped by orchestrator',
    }
  }
  return null
}

export async function orchestratorChat({
  userMessage,
  jobState,
  jobDir,
  productImagePath,
  llm,
  runsDir,
  jobId,
}) {
  const prompt =
    `CONTEXT:\n${buildContextBlock(jobState)}\n\n` +
    `CHAT HISTORY:\n${formatHistory(jobState.chat)}\n\n` +
    `USER:\n${userMessage}`

  const data = await textJson(prompt, ORCHESTRATOR_SYSTEM, llm, { maxAttempts: 3 })
  const reply = data.reply || 'I am here to help with your ad templates.'
  const actions = Array.isArray(data.actions) ? data.actions : []

  const modifications = []
  let pipelineAction = null

  for (const action of actions) {
    const pipe = parsePipelineAction(action)
    if (pipe && !pipelineAction) {
      pipelineAction = pipe
      continue
    }

    if (action.type !== 'modify_design' || !jobDir) continue
    const designId = action.designId || 'design_1'
    const instruction = action.instruction || userMessage

    try {
      const mod = await modifyDesign({
        jobDir,
        designId,
        instruction,
        llm,
        productImagePath,
      })
      modifications.push(mod)

      if (jobDir && jobId) {
        updateResultDesign(jobDir, designId, {
          previewUrl: mod.previewUrl,
          tree: mod.tree,
        })
      }
    } catch (e) {
      modifications.push({ designId, error: e.message })
    }
  }

  return { reply, actions, modifications, pipelineAction }
}

export const ORCHESTRATOR_WELCOME =
  "Hi! I'm your **Orchestrator**. I coordinate the Product Analyst, Design Strategist, and renderer.\n\n" +
  'Upload your product brief and click **Generate** — I will share live summaries as each agent works. ' +
  'If a step fails, ask me to **continue** or **retry** that step. ' +
  'After designs are ready, ask me to tweak copy, colors, or layout (e.g. *"Make design_2 headline red and bolder"*).'
