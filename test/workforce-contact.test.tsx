// Flow contract: a controlled phone contact creates only a canonical contact intention; phone members and each pending invitation keep their own licence/device/code details inside the existing Members/Invitations disclosures. Legacy email props remain unchanged.
import {useState} from 'react'
import {cleanup,render,screen,within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach,expect,it,vi} from 'vitest'
import type {ActorContactInput} from 'antifraud-data-utils-ts/organization-identity'
import {OrganizationWorkforceAdministration} from '../src/index.js'
afterEach(cleanup)
const copy={title:'Workforce',description:'Manage members.',totalLicenses:'Total',usedLicenses:'Used',freeLicenses:'Free',employeesTitle:'Members',invitationsTitle:'Invitations',inviteTitle:'Invite member',emailLabel:'Email',roleLabel:'Role',unlockSecretLabel:'PIN',invite:'Create invitation',inviting:'Creating',noFreeLicenses:'No capacity',noEmployees:'No members',noInvitations:'No invitations',licenseColumn:'Licence',employeeColumn:'Member',roleColumn:'Role',statusColumn:'Status',devicesColumn:'Devices',actionsColumn:'Actions',active:'Active',inactive:'Inactive',pending:'Pending',accepted:'Accepted',cancelled:'Cancelled',disable:'Disable',reactivate:'Reactivate',purge:'Delete',confirmDisable:'Disable?',confirmReactivate:'Reactivate?',confirmPurge:'Delete?',devicesLater:'No devices'}
const contactCopy={methodLabel:'Contact method',emailOption:'Email',telephoneOption:'Telephone',telephoneLabel:'Telephone'}
function props(){return{copy,summary:{total:4,used:0,free:4},employees:[],invitations:[],roles:[{value:'member',label:'Member'}],email:'',role:'member',unlockSecret:'',unlockSecretRequired:false,onEmailChange:vi.fn(),onRoleChange:vi.fn(),onUnlockSecretChange:vi.fn(),onInvite:vi.fn(),onDisable:vi.fn(),onReactivate:vi.fn(),onPurge:vi.fn()}}
it('renders an E.164 telephone control and emits the canonical phone contact without using legacy email callbacks',async()=>{
 const legacy=props(),invite=vi.fn()
 function Controlled(){const[value,onChange]=useState<ActorContactInput>({contactKind:'phone',contact:''});return <OrganizationWorkforceAdministration {...legacy} contactEntry={{value,onChange,onInvite:invite,copy:contactCopy}}/>}
 render(<Controlled/>);const phone=screen.getByRole('textbox',{name:'Telephone'});expect(phone).toHaveAttribute('type','tel');expect(phone).toHaveAttribute('inputmode','tel');expect(screen.queryByRole('textbox',{name:'Email'})).toBeNull()
 await userEvent.type(phone,'+12025550123');await userEvent.click(screen.getByRole('button',{name:'Create invitation'}));expect(invite).toHaveBeenCalledExactlyOnceWith({contactKind:'phone',contact:'+12025550123'});expect(legacy.onInvite).not.toHaveBeenCalled();expect(legacy.onEmailChange).not.toHaveBeenCalled()
 await userEvent.selectOptions(screen.getByRole('combobox',{name:'Contact method'}),'email');expect(screen.getByRole('textbox',{name:'Email'})).toHaveAttribute('type','email');expect(screen.getByRole('textbox',{name:'Email'})).toHaveValue('')
})
it('keeps phone invitation activation actions inside their exact pending row',()=>{
 render(<OrganizationWorkforceAdministration {...props()} contactInvitations={[{id:'phone-a',contactKind:'phone',contact:'+12025550123',role:'Role A',status:'pending'},{id:'phone-b',contactKind:'phone',contact:'+12025550124',role:'Role B',status:'pending'}]} renderContactInvitationDetails={row=><button type="button">Copy {row.id}</button>}/>);
 const section=screen.getByRole('heading',{name:'Invitations'}).closest('details')!,first=screen.getByText('Role A').closest('details')!,second=screen.getByText('Role B').closest('details')!;expect(section).toContainElement(first);expect(section).toContainElement(second);expect(first).toContainElement(screen.getByRole('button',{name:'Copy phone-a'}));expect(within(first).queryByRole('button',{name:'Copy phone-b'})).toBeNull();expect(first).toHaveAttribute('open');expect(first).toHaveTextContent('+12025550123')
})
it('shows a phone member licence, devices and host details in Members without an email field',()=>{
 render(<OrganizationWorkforceAdministration {...props()} contactEmployees={[{id:'member-phone',licenseId:'licence-phone',contactKind:'phone',contact:'+12025550123',role:'Member',status:'active',deviceCount:2}]} renderContactEmployeeDetails={row=><span>Details {row.licenseId}</span>}/>);
 const members=screen.getByRole('heading',{name:'Members'}).closest('details')!,row=screen.getByText('+12025550123').closest('tr')!;expect(members).toContainElement(row);expect(row).toHaveTextContent('licence-phone');expect(row).toHaveTextContent('2');expect(row).toHaveTextContent('Details licence-phone');expect(within(row).getByRole('button',{name:'Disable'})).toBeEnabled()
})
