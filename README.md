# Antifraud Hosting Components React

Sector-neutral controlled React screens for organization controllers and host
operators. The package owns presentation only. Applications retain
authentication, authorization, tenant resolution, network selection, BFF
calls, persistence and signing.

`OrganizationWorkforceAdministration` groups the creation form and directory
under Members. Invitations has its own disclosure, with a disclosure for each
invitation. `createMemberLabel` labels the action that opens and focuses the
creation form.
Use `onBeginMemberCreation` to clear the previous role or prepare the host's
controlled form before it receives focus.

Use `renderInvitationDetails(invitation)` to place an authorized activation
code, delivery result or recovery action inside the matching invitation. The
host supplies the content and handles its actions.

To invite by email or telephone, supply controlled `contactEntry` using
`ActorContactInput` from `antifraud-data-utils-ts/organization-identity`.
Its `value`, `onChange` and `onInvite` use `{contactKind, contact}`; the host
supplies the contact-method and telephone labels through `contactEntry.copy`.
Telephone input uses international E.164 format. The existing email form and
callbacks continue to work when `contactEntry` is omitted.

Pass canonical contact rows through `contactInvitations` and `contactEmployees`.
`renderContactInvitationDetails` keeps each activation code or delivery result
inside its invitation; `renderContactEmployeeDetails` keeps member details in
that member's disclosure. Phone rows carry `contactKind: 'phone'` and `contact`,
without an email field. Applications retain contact verification and all
invitation, licence and device actions.

`HostedOrganizationReviewWorkspace` presents review items and emits download,
authorization, verification and rejection intentions to the host.
