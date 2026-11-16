// Flow contract: a controller expands Members to create/manage members and expands an individual Invitation to access only that invitation's host-supplied actions; disclosure never grants authority or performs I/O.
import {cleanup, render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, expect, it, vi} from 'vitest'
import {OrganizationWorkforceAdministration, type WorkforceInvitation} from '../src/index.js'

afterEach(cleanup)

const copy = {
  title:'Workforce', description:'Manage organization members.', totalLicenses:'Total', usedLicenses:'Used', freeLicenses:'Free',
  employeesTitle:'Members', invitationsTitle:'Invitations', inviteTitle:'Invite a member', emailLabel:'Email', roleLabel:'Role',
  unlockSecretLabel:'PIN', invite:'Create invitation', inviting:'Creating', noFreeLicenses:'No capacity', noEmployees:'No members',
  noInvitations:'No invitations', licenseColumn:'License', employeeColumn:'Member', roleColumn:'Role', statusColumn:'Status',
  devicesColumn:'Devices', actionsColumn:'Actions', active:'Active', inactive:'Inactive', pending:'Pending', accepted:'Accepted',
  cancelled:'Cancelled', disable:'Disable', reactivate:'Reactivate', purge:'Delete', confirmDisable:'Disable?',
  confirmReactivate:'Reactivate?', confirmPurge:'Delete?', devicesLater:'No devices',
}
function props() {
  return {copy, summary:{total:4, used:0, free:4}, employees:[], invitations:[] as WorkforceInvitation[],
    roles:[{value:'member', label:'Member'}], email:'member@example.test', role:'member', unlockSecret:'', unlockSecretRequired:false,
    onEmailChange:vi.fn(), onRoleChange:vi.fn(), onUnlockSecretChange:vi.fn(), onInvite:vi.fn(),
    onDisable:vi.fn(), onReactivate:vi.fn(), onPurge:vi.fn(), createMemberLabel:'Create a new employee', onBeginMemberCreation:vi.fn()}
}

it('keeps member creation inside keyboard-focusable Members disclosure', async () => {
  const controlled=props()
  render(<OrganizationWorkforceAdministration {...controlled}/>)
  const members=screen.getByRole('heading',{name:'Members'}).closest('details')
  expect(members).not.toBeNull()
  expect(members).toContainElement(screen.getByRole('combobox',{name:'Role'}))
  expect(members).toContainElement(screen.getByRole('button',{name:'Create a new employee'}))
  const summary=members!.querySelector('summary')!
  summary.focus()
  expect(summary).toHaveFocus()
  await userEvent.click(summary)
  expect(members).not.toHaveAttribute('open')
  await userEvent.click(summary)
  expect(members).toHaveAttribute('open')
  await userEvent.click(screen.getByRole('button',{name:'Create a new employee'}))
  expect(controlled.onBeginMemberCreation).toHaveBeenCalledExactlyOnceWith()
  expect(screen.getByRole('textbox',{name:'Email'})).toHaveFocus()
})

it('keeps each host-supplied invitation action in its own disclosure', async () => {
  const rows:WorkforceInvitation[]=[
    {id:'grant-a',email:'member@example.test',role:'Role A',status:'pending'},
    {id:'grant-b',email:'member@example.test',role:'Role B',status:'pending'},
  ]
  const copyCode=vi.fn()
  const renderInvitationDetails=vi.fn((invitation:WorkforceInvitation)=><button type="button" onClick={()=>copyCode(invitation.id)}>Copy {invitation.id}</button>)
  render(<OrganizationWorkforceAdministration {...props()} invitations={rows} renderInvitationDetails={renderInvitationDetails}/>)
  const invitations=screen.getByRole('heading',{name:'Invitations'}).closest('details')
  const first=screen.getByText('Role A').closest('details')
  const second=screen.getByText('Role B').closest('details')
  expect(invitations).not.toBeNull()
  expect(first).not.toBeNull()
  expect(second).not.toBeNull()
  expect(invitations).toContainElement(first)
  expect(invitations).toContainElement(second)
  expect(first).toContainElement(screen.getByRole('button',{name:'Copy grant-a'}))
  expect(within(first!).queryByRole('button',{name:'Copy grant-b'})).toBeNull()
  await userEvent.click(within(first!).getByRole('button',{name:'Copy grant-a'}))
  expect(copyCode).toHaveBeenCalledExactlyOnceWith('grant-a')
  expect(renderInvitationDetails).toHaveBeenCalledWith(rows[0])
  expect(renderInvitationDetails).toHaveBeenCalledWith(rows[1])
})
