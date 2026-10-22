'use client'

export type HostedOrganizationPrimaryAction = 'authorize' | 'issue-verification'

export type HostedOrganizationReviewItem = Readonly<{
  id: string
  title: string
  organizationName: string
  sector: string
  accessLabel: string
  participationLabels: readonly string[]
  representativeName?: string
  representativeEmail?: string
  controllerEmail: string
  description: string
  evidenceComplete: boolean
  primaryAction: HostedOrganizationPrimaryAction
}>

export type HostedOrganizationReviewCopy = Readonly<{
  eyebrow: string
  title: string
  description: string
  empty: string
  downloadDraft: string
  authorize: string
  reject: string
  issueVerification: string
  incompleteEvidence: string
  missingParticipationRoles: string
  missingRepresentative: string
}>

export type HostedOrganizationReviewWorkspaceProps = Readonly<{
  copy: HostedOrganizationReviewCopy
  applications: readonly HostedOrganizationReviewItem[]
  busy: boolean
  onDownloadDraft(application: HostedOrganizationReviewItem): void | Promise<void>
  onAuthorize(application: HostedOrganizationReviewItem): void | Promise<void>
  onReject(application: HostedOrganizationReviewItem): void | Promise<void>
  onIssueVerification(application: HostedOrganizationReviewItem): void | Promise<void>
}>

/** Controlled review screen. Its host application owns authority, I/O, signing and persistence. */
export function HostedOrganizationReviewWorkspace({ copy, applications, busy, onDownloadDraft, onAuthorize, onReject, onIssueVerification }: HostedOrganizationReviewWorkspaceProps) {
  return <section className="afhc-panel afhc-hosted-organizations" aria-labelledby="afhc-hosted-organizations-title">
    <header><div><div className="afhc-eyebrow">{copy.eyebrow}</div><h1 id="afhc-hosted-organizations-title">{copy.title}</h1><p>{copy.description}</p></div></header>
    {applications.length === 0 ? <p className="afhc-muted">{copy.empty}</p> : <div className="afhc-hosted-organization-grid">{applications.map(application =>
      <article key={application.id} aria-label={application.title} className="afhc-hosted-organization-card">
        <h2>{application.title}</h2>
        <p><strong>{application.organizationName}</strong> · {application.sector}</p>
        <p>{application.accessLabel} · {application.participationLabels.length > 0 ? application.participationLabels.join(', ') : copy.missingParticipationRoles}</p>
        <p>{application.representativeName || copy.missingRepresentative} · {application.representativeEmail || '—'}</p>
        <p>{application.controllerEmail}</p>
        <p className="afhc-muted">{application.description}</p>
        {!application.evidenceComplete ? <p role="alert" className="afhc-review-warning">{copy.incompleteEvidence}</p> : null}
        <div className="afhc-review-actions">
          <button type="button" data-portal-action="download-review-draft" className="afhc-secondary" disabled={busy} onClick={() => void onDownloadDraft(application)}>{copy.downloadDraft}</button>
          {application.primaryAction === 'authorize'
            ? <button type="button" data-portal-action="authorize-organization" disabled={!application.evidenceComplete || busy} onClick={() => void onAuthorize(application)}>{copy.authorize}</button>
            : <button type="button" data-portal-action="issue-postal-verification" disabled={!application.evidenceComplete || busy} onClick={() => void onIssueVerification(application)}>{copy.issueVerification}</button>}
          <button type="button" data-portal-action="reject-organization" className="afhc-danger" disabled={busy} onClick={() => void onReject(application)}>{copy.reject}</button>
        </div>
      </article>)}</div>}
  </section>
}
