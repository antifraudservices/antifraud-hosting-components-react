// Flow contract: after common entry and sign-in, a controller manages host organizations, workforce and lifecycle through intention callbacks; no hosting component performs network, storage or authority work.
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import {
  HostOrganizationDirectory,
  HostedOrganizationReviewWorkspace,
  OrganizationLifecycleAdministration,
  OrganizationWorkforceAdministration,
} from '../src/index.js'

describe('sector-neutral hosting controller screens', () => {
  it('emits host administration intentions without hidden fetches', async () => {
    const onSearch = vi.fn()
    const onLifecycle = vi.fn()
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    render(<HostOrganizationDirectory copy={{ title: 'Authorized organizations', description: 'Search registrations.', organizationSingular: 'organization', organizationPlural: 'organizations', name: 'Organization name', sector: 'Sector', status: 'Status', allStatuses: 'All', active: 'Active', suspended: 'Suspended', revoked: 'Revoked', search: 'Search', loading: 'Loading…', empty: 'No organizations match.', statusAction: 'View status', suspend: 'Suspend', reactivate: 'Reactivate', purge: 'Permanently delete', next: 'Next page', purgeConfirmation: 'Delete {organization}?' }} allowedSectors={['health-care']} total={1} busy={false} organizations={[{ id: 'org-1', legalName: 'Clinic One', identifierType: 'TAX', identifierValue: 'B123', jurisdiction: 'ES', sector: 'health-care', status: 'active' }]} onSearch={onSearch} onLifecycle={onLifecycle}/>)
    await userEvent.type(screen.getByLabelText('Organization name'), 'Clinic')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(onSearch).toHaveBeenCalledWith({ legalName: 'Clinic', sector: 'health-care', status: '' })
    await userEvent.click(screen.getByRole('button', { name: 'Suspend' }))
    expect(onLifecycle).toHaveBeenCalledWith('_disable', expect.objectContaining({ id: 'org-1' }))
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('keeps workforce authority in the host callback', async () => {
    const onInvite = vi.fn()
    render(<OrganizationWorkforceAdministration copy={{ title: 'Workforce', description: 'Manage employees.', totalLicenses: 'Total', usedLicenses: 'Used', freeLicenses: 'Free', employeesTitle: 'Employees', invitationsTitle: 'Invitations', inviteTitle: 'Invite employee', emailLabel: 'Email', roleLabel: 'Role', unlockSecretLabel: 'PIN', invite: 'Invite', inviting: 'Inviting', noFreeLicenses: 'No capacity', noEmployees: 'No employees', noInvitations: 'No invitations', licenseColumn: 'License', employeeColumn: 'Employee', roleColumn: 'Role', statusColumn: 'Status', devicesColumn: 'Devices', actionsColumn: 'Actions', active: 'Active', inactive: 'Inactive', pending: 'Pending', accepted: 'Accepted', cancelled: 'Cancelled', disable: 'Disable', reactivate: 'Reactivate', purge: 'Delete', confirmDisable: 'Disable?', confirmReactivate: 'Reactivate?', confirmPurge: 'Delete?', devicesLater: 'Later' }} summary={{ total: 2, used: 1, free: 1 }} employees={[]} invitations={[]} roles={[{ value: 'controller', label: 'Controller' }]} email="person@example.test" role="controller" unlockSecret="123456" onEmailChange={vi.fn()} onRoleChange={vi.fn()} onUnlockSecretChange={vi.fn()} onInvite={onInvite} onDisable={vi.fn()} onReactivate={vi.fn()} onPurge={vi.fn()}/>)
    await userEvent.click(screen.getByRole('button', { name: 'Invite' }))
    expect(onInvite).toHaveBeenCalledOnce()
  })

  it('preserves the non-cascading lifecycle screen for embedded legacy controllers', async () => {
    const onAction = vi.fn()
    render(<OrganizationLifecycleAdministration copy={{ eyebrow: 'Lifecycle', title: 'Danger zone', description: 'Host state.', refresh: 'Refresh', unknown: 'Unknown', organizationStatus: 'Status', operationReference: 'Operation', activeEmployees: 'Active employees', activeIndividuals: 'Active individuals', remainingEmployees: 'Remaining employees', remainingIndividuals: 'Remaining individuals', descendantsRemain: 'Remove descendants first.', disable: 'Suspend organization', enable: 'Reactivate organization', purge: 'Delete organization', purgeConfirmation: 'Delete permanently?' }} busy={false} lifecycle={{ status: 'suspended', canDisable: false, canPurge: true, operationReference: 'op-1', descendants: { activeEmployees: 0, activeIndividuals: 0, unpurgedEmployees: 0, unpurgedIndividuals: 0 } }} onRefresh={vi.fn()} onAction={onAction}/>)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await userEvent.click(screen.getByRole('button', { name: 'Delete organization' }))
    expect(onAction).toHaveBeenCalledWith('purge-organization')
  })

  it('renders a controlled hosted-organization review workspace without deriving authority', async () => {
    const onDownloadDraft = vi.fn()
    const onAuthorize = vi.fn()
    const onReject = vi.fn()
    const onIssueVerification = vi.fn()
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const complete = {
      id: 'application-1', title: 'Synthetic clinic', organizationName: 'Clinic One', sector: 'animal-care',
      accessLabel: 'Test Network', participationLabels: ['service provider'], representativeName: 'Alex Example',
      representativeEmail: 'alex@example.test', controllerEmail: 'controller@example.test',
      description: 'Synthetic application.', evidenceComplete: true, primaryAction: 'authorize' as const,
    }
    const incomplete = {
      ...complete, id: 'application-2', title: 'Incomplete clinic', evidenceComplete: false,
      primaryAction: 'issue-verification' as const,
    }
    render(<HostedOrganizationReviewWorkspace
      copy={{ eyebrow: 'Host governance', title: 'Hosted organizations', description: 'Review applications.', empty: 'No applications.', downloadDraft: 'Download draft', authorize: 'Approve', reject: 'Reject', issueVerification: 'Issue verification', incompleteEvidence: 'Evidence incomplete', missingParticipationRoles: 'Participation roles missing', missingRepresentative: 'Representative missing' }}
      busy={false}
      applications={[complete, incomplete]}
      onDownloadDraft={onDownloadDraft}
      onAuthorize={onAuthorize}
      onReject={onReject}
      onIssueVerification={onIssueVerification}
    />)
    const completeCard = screen.getByRole('article', { name: 'Synthetic clinic' })
    await userEvent.click(within(completeCard).getByRole('button', { name: 'Download draft' }))
    await userEvent.click(screen.getByRole('button', { name: 'Approve' }))
    await userEvent.click(within(completeCard).getByRole('button', { name: 'Reject' }))
    expect(screen.getByRole('button', { name: 'Issue verification' })).toBeDisabled()
    expect(onDownloadDraft).toHaveBeenCalledWith(complete)
    expect(onAuthorize).toHaveBeenCalledWith(complete)
    expect(onReject).toHaveBeenCalledWith(complete)
    expect(onIssueVerification).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
