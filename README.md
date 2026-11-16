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

`HostedOrganizationReviewWorkspace` presents review items and emits download,
authorization, verification and rejection intentions to the host.
