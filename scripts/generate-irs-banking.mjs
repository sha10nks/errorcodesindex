import fs from 'node:fs';
import path from 'node:path';

const ISO_DATE = new Date().toISOString();

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function writeIfMissing(filePath, contents) {
  if (exists(filePath)) return false;
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, contents, 'utf8');
  return true;
}

function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function frontmatter({ industry, code, shortLabel, summary }) {
  return `---\nindustry: "${industry}"\ncode: "${code}"\nshortLabel: "${shortLabel}"\nsummary: "${summary}"\nlastmod: "${ISO_DATE}"\nsource: "manual"\n---\n\n`;
}

function bodyStandard({ section, system, code, titleLabel, summary, meaning, whereSeen, whyAppears, fixSteps, notes, related }) {
  const relatedLines = (related ?? []).map((r) => `<p class="c1"><span class="c0">${esc(r)}</span></p>`).join('\n');
  const whereLines = (whereSeen ?? []).map((r) => `<p class="c1"><span class="c0">${esc(r)}</span></p>`).join('\n');
  const whyLines = (whyAppears ?? []).map((r) => `<p class="c1"><span class="c0">${esc(r)}</span></p>`).join('\n');
  const fixLines = (fixSteps ?? []).map((r) => `<p class="c1"><span class="c0">${esc(r)}</span></p>`).join('\n');

  return `+<div>\n+<p class="c1"><span class="c0">SECTION: ${esc(section)}</span></p>\n+<p class="c1"><span class="c0">SYSTEM: ${esc(system)}</span></p>\n+<p class="c1"><span class="c0">CODE: ${esc(code)}</span></p>\n+<p class="c1"><span class="c0">Title</span></p>\n+<p class="c1"><span class="c0">(${esc(code)} &mdash; ${esc(titleLabel)})</span></p>\n+<p class="c1"><span class="c0">One-sentence summary</span></p>\n+<p class="c1"><span class="c0">${esc(summary)}</span></p>\n+<p class="c1"><span class="c0">What this code means</span></p>\n+<p class="c1"><span class="c0">${esc(meaning)}</span></p>\n+<p class="c1"><span class="c0">Where users usually see this code</span></p>\n+${whereLines}\n+<p class="c1"><span class="c0">Why this code usually appears</span></p>\n+${whyLines}\n+<p class="c1"><span class="c0">Step-by-step troubleshooting/fix</span></p>\n+${fixLines}\n+<p class="c1"><span class="c0">Related error codes</span></p>\n+${relatedLines}\n+<p class="c1"><span class="c0">Notes and edge cases</span></p>\n+<p class="c1"><span class="c0">${esc(notes)}</span></p>\n+</div>\n`;
}

function bankingIsoEntry(code, label, summary, meaning, fixHints) {
  const fileName = `${code}.mdx`;
  const filePath = path.join(process.cwd(), 'src', 'content', 'bankingCodes', fileName);

  const whereSeen = [
    'Merchant payment gateway decline logs',
    'POS terminal receipts or terminal response text',
    'Processor/acquirer dashboards (issuer response codes)',
  ];

  const whyAppears = [
    'Issuer policy/risk rules or account state determined the outcome',
    'Data validation or format checks failed upstream',
    'Network/processor routing conditions influenced the response',
  ];

  const fixSteps = [
    'Confirm the transaction details (amount, currency, merchant descriptor, entry method) before retrying.',
    ...fixHints,
    'If many different cards fail with similar codes at once, treat it as a processor/network incident and escalate with timestamps and logs.',
  ];

  const related = ['05 — Do not honor', '12 — Invalid transaction', '14 — Invalid card number', '51 — Insufficient funds', '54 — Expired card', '91 — Issuer or switch inoperative', '96 — System malfunction'];

  const mdx =
    frontmatter({ industry: 'banking', code, shortLabel: label, summary }) +
    bodyStandard({
      section: 'Banking / Card & Payment Processing',
      system: 'Authorization Response Codes (ISO 8583 / Network Response)',
      code,
      titleLabel: label,
      summary,
      meaning,
      whereSeen,
      whyAppears,
      fixSteps,
      related,
      notes:
        'Response code meaning is broadly standardized, but exact wording and recommended next steps can vary by network and processor. Always pair the code with the response text and the transaction context (entry method, MCC, and location) when troubleshooting.',
    });

  return { filePath, mdx };
}

function irsNoticeEntry(slug, code, label, summary, meaning, fixHints) {
  const fileName = `${slug}.mdx`;
  const filePath = path.join(process.cwd(), 'src', 'content', 'irsTaxCodes', fileName);

  const whereSeen = ['IRS notice letter (mail)', 'IRS online account / notices', 'Transcripts referenced by notice timelines'];
  const whyAppears = [
    'A return processing mismatch, missing information, or a post-filing review flag',
    'Identity verification or fraud screening triggers',
    'Balance due, penalty, or adjustment notifications',
  ];

  const fixSteps = [
    'Read the notice header, tax year, and response deadline first.',
    ...fixHints,
    'Keep copies of everything you submit and proof of delivery/submission.',
  ];

  const related = ['CP05 — Notice of Review', 'CP12 — Changes to Refund', 'CP14 — Balance Due', 'TC 971 — Notice issued', 'TC 570 — Additional account action pending'];

  const mdx =
    frontmatter({ industry: 'irs-tax', code, shortLabel: label, summary }) +
    bodyStandard({
      section: 'IRS / Tax Notices, Letters & Account Actions',
      system: 'IRS Notice Processing (CP/LT/LTR families)',
      code,
      titleLabel: label,
      summary,
      meaning,
      whereSeen,
      whyAppears,
      fixSteps,
      related,
      notes:
        'Notice meaning depends on the tax year and the exact notice text. Use this page as a plain-language map, then follow the instructions printed on your notice using official IRS channels.',
    });

  return { filePath, mdx };
}

const bankingIsoCodes = [
  {
    code: '00',
    label: 'Approved',
    summary: 'Response code 00 indicates the authorization was approved by the issuer and the transaction can proceed.',
    meaning:
      'Response code 00 (Approved) indicates the issuer approved the authorization request. In real payment flows, this means the transaction passed issuer checks at the moment of authorization. Approval does not guarantee final settlement outcomes (e.g., later reversals or chargebacks), but it is the standard “success” result for card authorization.',
    fixHints: ['If customers still report failure after an approval, check whether the payment was later reversed, voided, or failed capture/settlement in your gateway.'],
  },
  {
    code: '01',
    label: 'Refer to card issuer',
    summary: 'Response code 01 indicates the issuer is requesting the merchant contact or refer the cardholder to the issuer.',
    meaning:
      'Response code 01 (Refer to card issuer) is an issuer decision category that indicates the merchant should not complete the transaction as-is. In modern ecommerce, this typically translates to “declined” with a recommendation that the customer contact the issuing bank. The issuer may be applying risk controls, requiring account verification, or blocking the transaction due to unusual activity.',
    fixHints: ['Retry only once after verifying details; if it persists, have the cardholder contact their issuing bank.'],
  },
  {
    code: '02',
    label: 'Refer to card issuer (special condition)',
    summary: 'Response code 02 indicates a referral to the issuer under special conditions; it is treated as a decline.',
    meaning:
      'Response code 02 is a “refer to issuer” category under special conditions. Operationally, treat it as an issuer decline that requires issuer involvement or a different payment method. The underlying reason is not exposed through the response code alone and must be clarified through issuer channels.',
    fixHints: ['Avoid repeated retries; switch payment method or have the cardholder contact the issuer to clear blocks.'],
  },
  {
    code: '03',
    label: 'Invalid merchant',
    summary: 'Response code 03 indicates the merchant or terminal is not recognized or not permitted for this transaction type.',
    meaning:
      'Response code 03 (Invalid merchant) indicates the authorization request could not be processed because the merchant identification or configuration is not accepted for the route. In practice, this can be caused by a misconfigured merchant account, an invalid merchant ID, or attempting a transaction type not enabled for the MID/TID.',
    fixHints: ['Confirm the MID/TID configuration with your processor/acquirer and verify the transaction type is enabled for your account.'],
  },
  {
    code: '04',
    label: 'Pick up card',
    summary: 'Response code 04 indicates the issuer is declining and requesting card capture (historically “pick up card”).',
    meaning:
      'Response code 04 (Pick up card) is a decline category historically used to indicate the issuer wants the card captured. In many modern digital workflows, merchants cannot capture a card, but the code still signals a high-severity issuer decision. Treat it as a hard decline and direct the cardholder to contact the issuer.',
    fixHints: ['Do not retry repeatedly; advise the cardholder to contact their issuer.'],
  },
  {
    code: '06',
    label: 'Error',
    summary: 'Response code 06 indicates a generic error occurred during processing and the transaction was not approved.',
    meaning:
      'Response code 06 (Error) is a generic processing error category. Depending on the processor, it can reflect formatting issues, transient network problems, or an issuer-side processing exception. It is not a specific account-state decline like insufficient funds; it points to a processing failure path.',
    fixHints: ['Retry once after confirming network connectivity; if errors repeat across multiple cards, escalate as a processor/network incident.'],
  },
  {
    code: '07',
    label: 'Pick up card (special condition)',
    summary: 'Response code 07 indicates a high-severity decline where the issuer requests card capture under special conditions.',
    meaning:
      'Response code 07 is the “pick up card” category under special conditions. In practice, treat it as a hard decline that requires issuer action. The code indicates the issuer does not want the transaction completed and wants the cardholder to contact the bank.',
    fixHints: ['Stop retries and advise the cardholder to contact the issuer for next steps.'],
  },
  {
    code: '10',
    label: 'Partial approval',
    summary: 'Response code 10 indicates the issuer approved a partial amount rather than the full requested amount.',
    meaning:
      'Response code 10 (Partial approval) indicates the issuer approved an amount that may be less than the requested amount. This is common in some prepaid or constrained-balance scenarios. Whether partial approvals are supported depends on the merchant and processor configuration.',
    fixHints: ['Confirm whether your gateway supports partial approvals; if not supported, the payment may fail even though the issuer offered a partial approval.'],
  },
  {
    code: '15',
    label: 'No such issuer',
    summary: 'Response code 15 indicates the issuer could not be found for routing based on the PAN/IIN or network route.',
    meaning:
      'Response code 15 (No such issuer) indicates the routing could not locate a valid issuing institution for the request. In real terms, this can happen with invalid card numbers, unsupported card ranges, or routing configuration issues between the processor and network.',
    fixHints: ['Verify the card number entry and BIN/IIN route support; if valid, escalate to processor with full authorization logs.'],
  },
  {
    code: '19',
    label: 'Re-enter transaction',
    summary: 'Response code 19 indicates the transaction could not be completed as submitted and should be re-entered.',
    meaning:
      'Response code 19 (Re-enter transaction) indicates the request could not be processed in its current form and should be re-submitted. It often reflects transient communication or message issues. In ecommerce, treat as a soft decline and retry once after verifying the request is not duplicated.',
    fixHints: ['Retry once with idempotency/duplicate protection to avoid double-charging; if it repeats, escalate with logs.'],
  },
  {
    code: '30',
    label: 'Format error',
    summary: 'Response code 30 indicates the authorization message failed formatting or validation checks.',
    meaning:
      'Response code 30 (Format error) indicates the message was not formatted correctly or failed required validation for the route. This is commonly a configuration or integration issue: invalid field lengths, invalid values, or a mismatch between transaction type and required fields.',
    fixHints: ['Review gateway/processor logs for field-level validation errors and confirm your integration matches the processor’s API requirements.'],
  },
  {
    code: '41',
    label: 'Lost card',
    summary: 'Response code 41 indicates the issuer is declining because the card is reported lost.',
    meaning:
      'Response code 41 (Lost card) indicates the issuer declined because the account is associated with a card reported lost. This is a hard decline category. Merchants should not attempt repeated retries; the cardholder needs a replacement card or issuer resolution.',
    fixHints: ['Use another payment method; the cardholder should contact the issuer for replacement.'],
  },
  {
    code: '43',
    label: 'Stolen card',
    summary: 'Response code 43 indicates the issuer is declining because the card is reported stolen.',
    meaning:
      'Response code 43 (Stolen card) indicates the issuer declined because the card is reported stolen. This is a high-severity hard decline. Treat it as issuer-directed non-approval and do not retry.',
    fixHints: ['Do not retry; advise the cardholder to contact the issuer and use another payment method.'],
  },
  {
    code: '55',
    label: 'Incorrect PIN',
    summary: 'Response code 55 indicates the PIN entered for a PIN-based transaction was incorrect.',
    meaning:
      'Response code 55 (Incorrect PIN) indicates the PIN verification failed for a PIN-based transaction (commonly debit). It is usually resolved by re-entering the correct PIN or using a different entry method depending on merchant setup.',
    fixHints: ['If allowed, retry with correct PIN; otherwise switch to signature/credit routing or another payment method.'],
  },
  {
    code: '59',
    label: 'Suspected fraud',
    summary: 'Response code 59 indicates the issuer declined due to suspected fraud or elevated risk controls.',
    meaning:
      'Response code 59 (Suspected fraud) indicates the issuer declined because the transaction triggered fraud/risk controls. The issuer is signaling a risk-driven decline. The safest next step is issuer verification or using a different payment method.',
    fixHints: ['Avoid repeated retries; have the cardholder contact the issuer to clear risk blocks or use an alternate method.'],
  },
  {
    code: '63',
    label: 'Security violation',
    summary: 'Response code 63 indicates the transaction failed security-related checks.',
    meaning:
      'Response code 63 (Security violation) indicates the transaction was rejected due to security-related validation. This can include invalid security parameters, suspected tampering, or restrictions that prevent the transaction type from being processed as submitted.',
    fixHints: ['Verify entry method and security fields required by your processor; if it persists, escalate to the processor/acquirer.'],
  },
  {
    code: '67',
    label: 'Hard capture (pick up card)',
    summary: 'Response code 67 indicates a “hard capture” instruction; treat as a high-severity issuer decline.',
    meaning:
      'Response code 67 (Hard capture) is a decline category historically used to request card capture. Operationally, treat it as a hard decline. The transaction should not be completed, and the cardholder must contact the issuer.',
    fixHints: ['Stop retries and advise the cardholder to contact the issuer; use another payment method.'],
  },
  {
    code: '68',
    label: 'Response received too late',
    summary: 'Response code 68 indicates the response was received too late to complete the authorization normally.',
    meaning:
      'Response code 68 (Response received too late) indicates a timing/communication problem where the authorization response did not arrive within the allowed window. This is a processing/timing condition rather than a pure issuer decision. It can occur during network congestion or processor latency incidents.',
    fixHints: ['Check whether the transaction later completed; avoid duplicate submissions by using gateway idempotency and reconciliation.'],
  },
  {
    code: '70',
    label: 'Contact card issuer',
    summary: 'Response code 70 indicates the issuer requires the cardholder to contact the issuing bank before approving.',
    meaning:
      'Response code 70 (Contact card issuer) indicates the issuer requires direct contact from the cardholder to resolve the block. It is treated as a hard decline until the issuer clears the account state or risk flag.',
    fixHints: ['Direct the cardholder to contact their issuing bank; do not keep retrying.'],
  },
  {
    code: '90',
    label: 'Cut-off in progress',
    summary: 'Response code 90 indicates the issuer/processor is in cut-off processing and cannot complete the transaction normally.',
    meaning:
      'Response code 90 (Cut-off in progress) is a processing-state response indicating that the system is in a cut-off or settlement processing window and the request could not be handled normally. It can be transient and time-dependent.',
    fixHints: ['Retry once after a short wait and verify processor status; if repeated across many transactions, treat as an incident.'],
  },
  {
    code: '92',
    label: 'Routing error (financial institution not found)',
    summary: 'Response code 92 indicates routing failed because the financial institution or network route could not be found.',
    meaning:
      'Response code 92 indicates a routing issue: the message could not be delivered to the correct financial institution or intermediate network facility. It can be caused by invalid routing configuration, unsupported routes, or temporary network routing problems.',
    fixHints: ['Validate BIN/IIN route support and processor configuration; escalate with trace/log details if it persists.'],
  },
  {
    code: '93',
    label: 'Violation of law',
    summary: 'Response code 93 indicates the transaction cannot be completed due to legal or compliance restrictions.',
    meaning:
      'Response code 93 indicates the transaction cannot be completed due to legal/compliance restrictions. This can include sanctions/compliance screening, prohibited transaction categories, or policy constraints that prevent the transaction from being processed.',
    fixHints: ['Review compliance restrictions, merchant category, and geography; escalate through your acquirer/processor compliance channel if needed.'],
  },
  {
    code: '94',
    label: 'Duplicate transmission',
    summary: 'Response code 94 indicates a duplicate transaction was detected.',
    meaning:
      'Response code 94 (Duplicate transmission) indicates the system detected the transaction as a duplicate of a prior submission. This can happen when retry logic resubmits without idempotency, terminals resend after timeouts, or the same authorization is attempted repeatedly with identical identifiers.',
    fixHints: ['Stop retries and reconcile your gateway/terminal logs to confirm whether the original authorization succeeded.'],
  },
  {
    code: '95',
    label: 'Reconciliation error',
    summary: 'Response code 95 indicates a reconciliation or settlement-related error prevented completion.',
    meaning:
      'Response code 95 indicates a reconciliation/settlement-related error prevented the transaction from completing normally. In practice, it is often treated as a processing error that requires processor support to diagnose, especially if it affects many transactions.',
    fixHints: ['Check processor status and reconcile settlement batches; escalate to processor support with timestamps and trace IDs.'],
  },
];

const irsNoticesAndLetters = [
  {
    slug: 'cp11-notice',
    code: 'CP11',
    label: 'Math error notice (changes to return)',
    summary: 'CP11 is an IRS notice indicating the IRS changed your return due to a math or other processing error, often resulting in a balance due.',
    meaning:
      'CP11 is commonly issued when the IRS adjusts a return due to a math error or processing correction. The notice explains what was changed and whether you now owe additional tax or your refund changed. It is a processing outcome notice—your safest next step is to verify whether you agree with the adjustment and respond through official channels if you disagree.',
    fixHints: ['Compare the notice explanation to your filed return and supporting documents.', 'If you agree, follow the payment instructions by the deadline to reduce penalties/interest.', 'If you disagree, respond with documentation and a clear explanation of the correction.'],
  },
  {
    slug: 'cp2000-notice',
    code: 'CP2000',
    label: 'Underreporter notice (income mismatch)',
    summary: 'CP2000 is an IRS notice proposing changes because IRS records (W-2/1099) do not match what was reported on your return.',
    meaning:
      'CP2000 is an Automated Underreporter (AUR) notice that proposes changes because income, credits, or deductions reported on the return do not match information the IRS received (such as W-2 or 1099 forms). It is typically a proposal, not a final bill, and it includes a response deadline. The safest workflow is to reconcile the mismatch using your documents and respond with agreement or a documented dispute.',
    fixHints: ['Gather the documents referenced (W-2/1099) and compare to what you filed.', 'If you omitted a form, follow the notice instructions to agree and pay or set up a plan.', 'If the IRS data is wrong, respond with proof (corrected forms, statements, etc.).'],
  },
  {
    slug: 'cp501-notice',
    code: 'CP501',
    label: 'Balance due reminder',
    summary: 'CP501 is a balance due reminder notice indicating the IRS believes you have an unpaid amount for a tax year.',
    meaning:
      'CP501 is a reminder notice for an existing balance due on an account. It usually follows earlier balance due communication and is intended to prompt payment or contact. The key actions are to confirm the tax year, verify whether the balance is accurate, and resolve it through payment, a plan, or a documented dispute.',
    fixHints: ['Confirm the tax year and amount in your IRS account or transcript.', 'If paid already, gather proof and contact the IRS through official channels.', 'If you owe, pay or set up an agreement before penalties/interest increase.'],
  },
  {
    slug: 'cp503-notice',
    code: 'CP503',
    label: 'Second balance due reminder',
    summary: 'CP503 is a follow-up balance due reminder indicating the IRS has not received payment for an outstanding amount.',
    meaning:
      'CP503 is a stronger reminder notice than CP501, indicating an outstanding balance remains unresolved. It is still primarily a payment/response prompt, not the most severe enforcement notice, but delaying can increase penalties and escalate to stronger actions. Verify the amount and respond promptly.',
    fixHints: ['Verify the balance and tax year in your account.', 'Pay in full if possible, or set up a payment plan.', 'If you disagree, respond with documentation and a clear dispute basis.'],
  },
  {
    slug: 'cp504-notice',
    code: 'CP504',
    label: 'Final notice of intent to levy (state tax refund)',
    summary: 'CP504 is a final notice that the IRS intends to levy (often state tax refunds) and may file a federal tax lien if a balance is not resolved.',
    meaning:
      'CP504 is commonly a final notice of intent to levy certain assets (often state tax refunds) and may also warn about lien-related actions depending on circumstances. It includes deadlines and appeal rights. Treat CP504 as time-sensitive: confirm the balance, understand the deadline, and take action through official channels.',
    fixHints: ['Do not ignore the deadline; act quickly.', 'If you can pay, pay immediately and keep proof.', 'If you cannot pay, contact the IRS about payment options or collection alternatives.'],
  },
  {
    slug: 'cp90-notice',
    code: 'CP90',
    label: 'Final notice of intent to levy (collection due process)',
    summary: 'CP90 is a final notice of intent to levy and notice of your right to a hearing (collection due process).',
    meaning:
      'CP90 is a final notice of intent to levy and provides information about your right to request a collection due process (CDP) hearing. This is a serious collection-stage notice with strict deadlines. The safest path is to verify the balance, review options (pay, plan, dispute, or hearing request), and respond within the timeframe stated on the notice.',
    fixHints: ['Check the notice deadline and hearing request instructions.', 'If you intend to dispute or request a hearing, submit through official channels before the deadline.', 'If you agree you owe, pay or set up a plan immediately to reduce enforcement risk.'],
  },
  {
    slug: 'lt11-notice',
    code: 'LT11',
    label: 'Final notice of intent to levy',
    summary: 'LT11 is a final notice of intent to levy that also describes your right to a hearing; it is time-sensitive.',
    meaning:
      'LT11 is a final notice of intent to levy. Like other final levy notices, it includes a response deadline and information about your rights. Treat it as urgent: confirm the balance and take action promptly, especially if you plan to dispute or request a hearing.',
    fixHints: ['Verify the tax year and balance in your IRS account or transcript.', 'If you disagree, prepare a documented response and follow the notice instructions.', 'If you owe, pay or arrange a payment plan as soon as possible.'],
  },
  {
    slug: '5071c-letter',
    code: '5071C',
    label: 'Identity verification request',
    summary: 'IRS Letter 5071C requests identity verification before the IRS will continue processing a return or release a refund.',
    meaning:
      'Letter 5071C is an identity verification request. The IRS uses it when it needs to confirm the taxpayer’s identity before continuing processing or releasing a refund. The letter provides instructions for completing verification through official channels. Until verification is completed (or the IRS clears the issue), refunds can be delayed.',
    fixHints: ['Follow only the official verification steps listed on the letter.', 'Have your prior-year return and current-year return available; verification often asks for line items.', 'After verification, monitor account status; updates can take time to reflect.'],
  },
  {
    slug: '4883c-letter',
    code: '4883C',
    label: 'Identity verification request',
    summary: 'IRS Letter 4883C requests identity verification, often requiring a call or official verification workflow before processing continues.',
    meaning:
      'Letter 4883C is an IRS identity verification request. It indicates the IRS needs additional confirmation before proceeding with processing. The letter’s instructions and verification channel matter; follow the letter exactly and use only official IRS contact methods. Verification requests commonly delay refunds until completed.',
    fixHints: ['Use the official contact method listed on the letter and avoid third-party numbers.', 'Collect: return copy, W-2/1099 info, and prior-year filing facts.', 'Do not file a second return “just in case”; duplicates can increase delays.'],
  },
  {
    slug: '4464c-letter',
    code: '4464C',
    label: 'Return selected for review',
    summary: 'IRS Letter 4464C indicates your return was selected for review, which can delay refund processing.',
    meaning:
      'Letter 4464C indicates the IRS selected the return for review. Reviews can be triggered by mismatches, verification needs, or risk screening, and they commonly delay refunds. The letter typically instructs you to wait or provide documentation if requested.',
    fixHints: ['Check whether the letter requests any documents; if not, avoid sending unsolicited paperwork.', 'Monitor your IRS account/transcript for new notices or updates.', 'If additional information is requested later, respond with clear copies and proof of submission.'],
  },
  {
    slug: '12c-letter',
    code: '12C',
    label: 'Missing information request',
    summary: 'IRS Letter 12C requests missing information or documentation to finish processing your return.',
    meaning:
      'Letter 12C is commonly used to request missing information or documents needed to process a return. This often includes unsigned forms, missing schedules, or documentation supporting credits/withholding. Your response quality matters: submit exactly what is requested using the address and instructions on the letter and keep proof.',
    fixHints: ['Identify exactly what the letter is requesting and respond with those items only.', 'Make copies of everything you send and use trackable delivery if mailing.', 'If the requested item is not applicable, respond with a clear written explanation and supporting proof.'],
  },
  {
    slug: '5747c-letter',
    code: '5747C',
    label: 'Identity verification (in-person/appointment)',
    summary: 'IRS Letter 5747C requests identity verification and may require an appointment or additional verification steps.',
    meaning:
      'Letter 5747C is an identity verification letter that may require an in-person appointment or specific verification steps as described in the notice. It is used when the IRS needs higher-confidence verification before continuing. Follow the letter’s instructions closely and use only official IRS channels.',
    fixHints: ['Schedule and attend any required appointment using official IRS methods.', 'Bring documents listed on the letter (photo ID, returns, income forms).', 'After verification, monitor account updates and refund status; processing can take time.'],
  },
];

function main() {
  const created = [];

  for (const c of bankingIsoCodes) {
    const { filePath, mdx } = bankingIsoEntry(c.code, c.label, c.summary, c.meaning, c.fixHints);
    if (writeIfMissing(filePath, mdx)) created.push(path.relative(process.cwd(), filePath));
  }

  for (const n of irsNoticesAndLetters) {
    const { filePath, mdx } = irsNoticeEntry(n.slug, n.code, n.label, n.summary, n.meaning, n.fixHints);
    if (writeIfMissing(filePath, mdx)) created.push(path.relative(process.cwd(), filePath));
  }

  const createdCount = created.length;
  process.stdout.write(`Generated ${createdCount} new page(s).\n`);
  if (createdCount > 0) process.stdout.write(created.map((p) => `- ${p}`).join('\n') + '\n');
}

main();

