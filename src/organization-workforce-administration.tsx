import {useRef, type FormEvent, type ReactNode} from 'react'
import type {ActorContactInput} from 'antifraud-data-utils-ts/organization-identity'

export type WorkforceLicenseSummary = Readonly<{ total: number; used: number; free: number }>
export type WorkforceEmployee = Readonly<{ id: string; licenseId: string; email: string; role: string; status: 'active' | 'inactive'; deviceCount?: number }>
export type WorkforceInvitation = Readonly<{ id: string; email: string; role: string; status: 'pending' | 'accepted' | 'cancelled'; sentAt?: string }>
export type WorkforceContactInvitation = Readonly<Omit<WorkforceInvitation,'email'> & ActorContactInput>
export type WorkforceContactEmployee = Readonly<Omit<WorkforceEmployee,'email'> & ActorContactInput>
export type WorkforceContactEntry = Readonly<{
  value: ActorContactInput;
  copy: Readonly<{methodLabel:string;emailOption:string;telephoneOption:string;telephoneLabel:string}>;
  onChange(value: ActorContactInput): void;
  onInvite(value: ActorContactInput): void | Promise<void>;
}>
export type WorkforceRoleOption = Readonly<{ value: string; label: string }>
export type OrganizationWorkforceCopy = Readonly<{ title: string; description: string; totalLicenses: string; usedLicenses: string; freeLicenses: string; employeesTitle: string; invitationsTitle: string; inviteTitle: string; emailLabel: string; roleLabel: string; unlockSecretLabel: string; invite: string; inviting: string; noFreeLicenses: string; noEmployees: string; noInvitations: string; licenseColumn: string; employeeColumn: string; roleColumn: string; statusColumn: string; devicesColumn: string; actionsColumn: string; active: string; inactive: string; pending: string; accepted: string; cancelled: string; disable: string; reactivate: string; purge: string; confirmDisable: string; confirmReactivate: string; confirmPurge: string; devicesLater: string }>
export type OrganizationWorkforceAdministrationProps = Readonly<{
  copy: OrganizationWorkforceCopy; summary: WorkforceLicenseSummary; employees: readonly WorkforceEmployee[]; invitations: readonly WorkforceInvitation[];
  roles: readonly WorkforceRoleOption[]; email: string; role: string; unlockSecret: string; unlockSecretRequired?: boolean; busyAction?: string; error?: string;
  createMemberLabel?: string;
  /** Presentation intent for clearing or preparing the host's controlled creation form. */
  onBeginMemberCreation?: () => void;
  /** The host supplies authorized details for this exact invitation, including protected codes or recovery actions. */
  renderInvitationDetails?: (invitation: WorkforceInvitation) => ReactNode;
  /** Additive canonical contact controls; legacy email props/callbacks remain unchanged. */
  contactEntry?: WorkforceContactEntry;
  contactInvitations?: readonly WorkforceContactInvitation[];
  contactEmployees?: readonly WorkforceContactEmployee[];
  renderContactInvitationDetails?: (invitation: WorkforceContactInvitation) => ReactNode;
  renderContactEmployeeDetails?: (employee: WorkforceContactEmployee) => ReactNode;
  onEmailChange(value: string): void; onRoleChange(value: string): void; onUnlockSecretChange(value: string): void;
  onInvite(): void | Promise<void>; onDisable(employeeId: string): void | Promise<void>; onReactivate(employeeId: string): void | Promise<void>; onPurge(employeeId: string): void | Promise<void>;
}>

/** Controlled workforce screen. The host owns authorization, persistence and lifecycle commands. */
export function OrganizationWorkforceAdministration(props: OrganizationWorkforceAdministrationProps) {
  const {copy, summary, employees, invitations, roles, email, role, unlockSecret, busyAction, error} = props
  const creation = useRef<HTMLDetailsElement>(null)
  const emailInput = useRef<HTMLInputElement>(null)
  const noCapacity = summary.free < 1
  const inviting = busyAction === 'invite'
  const contactEntry=props.contactEntry
  const canInvite = !noCapacity && !inviting && Boolean((contactEntry?.value.contact??email).trim() && role && (props.unlockSecretRequired === false || unlockSecret))
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (canInvite) { if(contactEntry) void contactEntry.onInvite(contactEntry.value); else void props.onInvite() } }
  function confirm(message: string, action: () => void | Promise<void>) { if (window.confirm(message)) void action() }
  function openCreation() { props.onBeginMemberCreation?.(); if (creation.current) creation.current.open = true; emailInput.current?.focus() }
  return <section className="afpc-workforce" aria-labelledby="afpc-workforce-title">
    <header><div><h1 id="afpc-workforce-title">{copy.title}</h1><p>{copy.description}</p></div><dl className="afpc-license-summary"><div><dt>{copy.totalLicenses}</dt><dd>{summary.total}</dd></div><div><dt>{copy.usedLicenses}</dt><dd>{summary.used}</dd></div><div><dt>{copy.freeLicenses}</dt><dd>{summary.free}</dd></div></dl></header>
    <details className="afpc-workforce-panel" open>
      <summary><h2>{copy.employeesTitle}</h2></summary>
      <div className="afpc-member-actions"><button type="button" onClick={openCreation}>{props.createMemberLabel ?? copy.inviteTitle}</button></div>
      <details ref={creation} className="afpc-member-creation" open>
        <summary><h3>{copy.inviteTitle}</h3></summary>
        {noCapacity ? <p role="status" className="afpc-workforce-warning">{copy.noFreeLicenses}</p> : null}
        <form onSubmit={submit}>
          {contactEntry?<div className="afpc-workforce-contact-fields">
            <label><span>{contactEntry.copy.methodLabel}</span><select value={contactEntry.value.contactKind} onChange={event=>contactEntry.onChange({contactKind:event.currentTarget.value as ActorContactInput['contactKind'],contact:''})}><option value="email">{contactEntry.copy.emailOption}</option><option value="phone">{contactEntry.copy.telephoneOption}</option></select></label>
            <label><span>{contactEntry.value.contactKind==='phone'?contactEntry.copy.telephoneLabel:copy.emailLabel}</span><input ref={emailInput} type={contactEntry.value.contactKind==='phone'?'tel':'email'} inputMode={contactEntry.value.contactKind==='phone'?'tel':'email'} pattern={contactEntry.value.contactKind==='phone'?'[+][1-9][0-9]{1,14}':undefined} required value={contactEntry.value.contact} onChange={event=>contactEntry.onChange({...contactEntry.value,contact:event.currentTarget.value})}/></label>
          </div>:<label><span>{copy.emailLabel}</span><input ref={emailInput} type="email" required value={email} onChange={event => props.onEmailChange(event.currentTarget.value)}/></label>}
          <label><span>{copy.roleLabel}</span><select required value={role} onChange={event => props.onRoleChange(event.currentTarget.value)}><option value=""/>{roles.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          {props.unlockSecretRequired !== false ? <label><span>{copy.unlockSecretLabel}</span><input type="password" required value={unlockSecret} onChange={event => props.onUnlockSecretChange(event.currentTarget.value)}/></label> : null}
          <button type="submit" disabled={!canInvite}>{inviting ? copy.inviting : copy.invite}</button>
        </form>
      </details>
      {employees.length === 0 && !props.contactEmployees?.length ? <p>{copy.noEmployees}</p> : <div className="afpc-table-scroll"><table><thead><tr><th>{copy.licenseColumn}</th><th>{copy.employeeColumn}</th><th>{copy.roleColumn}</th><th>{copy.statusColumn}</th><th>{copy.devicesColumn}</th><th>{copy.actionsColumn}</th></tr></thead><tbody>{[...employees.map(employee=>({employee,label:employee.email,details:undefined as ReactNode})),...(props.contactEmployees??[]).map(employee=>({employee,label:employee.contact,details:props.renderContactEmployeeDetails?.(employee)}))].map(({employee,label,details}) => <tr key={employee.id}><td><code>{employee.licenseId}</code></td><td>{details?<details><summary>{label}</summary>{details}</details>:label}</td><td>{employee.role}</td><td><span className={`afpc-status afpc-status-${employee.status}`}>{employee.status === 'active' ? copy.active : copy.inactive}</span></td><td>{employee.deviceCount === undefined ? copy.devicesLater : employee.deviceCount}</td><td className="afpc-row-actions">{employee.status === 'active' ? <button type="button" className="afpc-warning-action" disabled={busyAction === employee.id} onClick={() => confirm(copy.confirmDisable, () => props.onDisable(employee.id))}>{copy.disable}</button> : <><button type="button" className="afpc-primary-action" disabled={busyAction === employee.id} onClick={() => confirm(copy.confirmReactivate, () => props.onReactivate(employee.id))}>{copy.reactivate}</button><button type="button" className="afpc-danger" disabled={busyAction === employee.id} onClick={() => confirm(copy.confirmPurge, () => props.onPurge(employee.id))}>{copy.purge}</button></>}</td></tr>)}</tbody></table></div>}
    </details>
    <details className="afpc-workforce-panel" open>
      <summary><h2>{copy.invitationsTitle}</h2></summary>
      {invitations.length === 0 && !props.contactInvitations?.length ? <p>{copy.noInvitations}</p> : <ul className="afpc-invitation-list">{invitations.map(invitation => <li key={invitation.id}>
        <details className="afpc-invitation" open={invitation.status === 'pending'}>
          <summary><span><strong>{invitation.email}</strong><small>{invitation.role}</small></span><span className={`afpc-status afpc-status-${invitation.status}`}>{copy[invitation.status]}</span></summary>
          {props.renderInvitationDetails ? <div className="afpc-invitation-details">{props.renderInvitationDetails(invitation)}</div> : null}
        </details>
      </li>)}{(props.contactInvitations??[]).map(invitation=><li key={invitation.id}>
        <details className="afpc-invitation" open={invitation.status==='pending'}>
          <summary><span><strong>{invitation.contact}</strong><small>{invitation.role}</small></span><span className={`afpc-status afpc-status-${invitation.status}`}>{copy[invitation.status]}</span></summary>
          {props.renderContactInvitationDetails?<div className="afpc-invitation-details">{props.renderContactInvitationDetails(invitation)}</div>:null}
        </details>
      </li>)}</ul>}
    </details>
    {error ? <p role="alert" className="afpc-error">{error}</p> : null}
  </section>
}
